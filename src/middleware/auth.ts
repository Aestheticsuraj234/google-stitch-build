import { auth } from "@/lib/auth";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'


const PUBLIC_PATHS = [
"/login",
"/api/auth",
"/api/inngest"
]


export const authMiddleware = createMiddleware({type:"request"}).server(
    async({request , next})=>{
        const {pathname} = new URL(request.url);

        const headers = getRequestHeaders();

        const session = await auth.api.getSession({headers});

        if(pathname.startsWith("/login") && session){
            throw redirect({to:"/"})
        }

        if(PUBLIC_PATHS.some((p)=>pathname.startsWith(p))){
            return next()
        }

        if(!session){
            throw redirect({to:"/login"})
        }

        return next({context:{session}})
    }
)