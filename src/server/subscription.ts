import { prisma } from "@/db";
import { polarClient } from "@/lib/auth";
import { authFnMiddleware } from "@/middleware/auth";
import { createServerFn } from "@tanstack/react-start";


export const activateProSubscription  = createServerFn({method:"POST"})
.middleware([authFnMiddleware])
.inputValidator((checkoutId:string | undefined)=>checkoutId)
.handler(async({context , data:checkoutId})=>{
    const userId = context?.session?.user.id;

    if(!userId){
        return {
            success:false,
            error:"Not authenticated"
        }
    }

      if (!checkoutId) {
      return {
        success: false,
        error: "Checkout ID is required",
      };
    }

    try {
         const checkout = await polarClient.checkouts.get({
        id: checkoutId,
      });

       if (!checkout) {
        return {
          success: false,
          error: "Checkout not found",
        };
      }

        const customerId = checkout.customerId;

         if (!customerId) {
        return {
          success: false,
          error: "Customer ID not found in checkout",
        };
      }

       const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          polarCustomerId: true,
          email: true,
          name: true,
        },
      });

      if(!user){
           return {
          success: false,
          error: "User not found",
        };
      }

       const updateData: any = {
        polarCustomerId: customerId,
      };

      const subscriptionsIterator = await polarClient.subscriptions.list({
        customerId: customerId,
      });

         const firstPage = subscriptionsIterator;
      const subscriptions = firstPage.result?.items || [];
      const activeSubscription = subscriptions.find(
        (sub: any) => sub.status === "active" || sub.status === "trialing"
      );

      if(activeSubscription){
         const newStatus = activeSubscription.status;
        const isActive = newStatus === "active" || newStatus === "trialing";

        updateData.plan = isActive ? "pro" : "free";
        updateData.subscriptionStatus = newStatus;
        updateData.subscriptionId = activeSubscription.id;
      }
      else{
        updateData.plan = "pro";
        updateData.subscriptionStatus = "active";
        if ((checkout as any).subscription_id) {
          updateData.subscriptionId = (checkout as any).subscription_id;
        }
      }

      await prisma.user.update({
         where: { id: userId },
        data: updateData,
      })

      
      return {
        success: true,
        plan: updateData.plan,
        subscriptionStatus: updateData.subscriptionStatus,
      };

    } catch (error:any) {
              console.error("Error activating subscription:", error);
      return {
        success: false,
        error: error.message || "Failed to activate subscription",
      };
    }
})


export const syncSubscriptionStatus = createServerFn({ method: "POST" })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        polarCustomerId: true,
        subscriptionId: true,
        plan: true,
        subscriptionStatus: true,
      },
    });

    if (!user || !user.polarCustomerId) {
      return {
        success: true,
        plan: user?.plan || "free",
        subscriptionStatus: user?.subscriptionStatus || null,
      };
    }

    // Fetch subscriptions from Polar
    // subscriptions.list() returns a PageIterator<SubscriptionsListResponse>
    // The first page contains result.items with the subscriptions
    const subscriptionsIterator = await polarClient.subscriptions.list({
      customerId: user.polarCustomerId,
    });

    // Get the first page from the iterator
    const firstPage = subscriptionsIterator;
    const subscriptions = firstPage.result?.items || [];
    const activeSubscription = subscriptions.find(
      (sub: any) => sub.status === "active" || sub.status === "trialing"
    );

    if (activeSubscription) {
      const newStatus = activeSubscription.status;
      const isActive = newStatus === "active" || newStatus === "trialing";

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: isActive ? "pro" : "free",
          subscriptionStatus: newStatus,
          subscriptionId: activeSubscription.id,
        },
      });

      return {
        success: true,
        plan: isActive ? "pro" : "free",
        subscriptionStatus: newStatus,
      };
    } else {
      // No active subscription - downgrade to free
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: "free",
          subscriptionStatus: null,
          subscriptionId: null,
        },
      });

      return {
        success: true,
        plan: "free",
        subscriptionStatus: null,
      };
    }
  });