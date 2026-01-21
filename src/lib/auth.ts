import { prisma } from "@/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Polar } from "@polar-sh/sdk";
import { polar, checkout, portal} from "@polar-sh/better-auth";

export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server:"sandbox"
});


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID as string, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    }, 
    
  },
  plugins:[
     polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "b9ac4e0a-d88c-4da9-8a69-04008446d411",
                            slug: "pro" 
                        }
                    ],
                    successUrl: '/upgrade?success=true&checkout_id={CHECKOUT_ID}',
                    authenticatedUsersOnly: true
                }),
                portal()
            ],
        }),
    tanstackStartCookies()
  ] 
});