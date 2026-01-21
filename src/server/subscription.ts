import { prisma } from "@/db";
import { polarClient } from "@/lib/auth";
import { authFnMiddleware } from "@/middleware/auth";
import { createServerFn } from "@tanstack/react-start";


export const activateProSubscription  = createServerFn({method:"POST"})
.middleware([authFnMiddleware])
.handler(async({context})=>{
    const userId = context?.session?.user.id;

    if(!userId){
        return {
            success:false,
            error:"Not authenticated"
        }
    }

      const user = await prisma.user.findUnique({
        where:{id:userId},
        select:{
            polarCustomerId:true
        }
    });

    
    if(user?.polarCustomerId){
        await prisma.user.update({
            where:{id:userId},
            data:{
                plan:"pro",
                subscriptionStatus:"active"
            }
        })
    }

    await prisma.user.update({
         where:{id:userId},
            data:{
                plan:"pro",
                subscriptionStatus:"active"
            }
    })

    return {success:true}
})


export const syncSubscriptionStatus = createServerFn({method:"POST"})
.inputValidator((userId:string)=>userId)
.handler(async ({data:userId})=>{

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

    const subscriptions = await polarClient.subscriptions.list({
        customerId:user.polarCustomerId
    })

    const activeSubscription = subscriptions.items?.find(
          (sub: any) => sub.status === "active" || sub.status === "trialing"
    )

    if(activeSubscription){
        const newStatus = activeSubscription?.status;
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
    }
    else{
        await prisma.user.update({
            where:{id:userId},
            data:{
                  plan: "free",
          subscriptionStatus: null,
          subscriptionId: null,
            }
        });

        return {
              success: true,
        plan: "free",
        subscriptionStatus: null,
        }
    }
})