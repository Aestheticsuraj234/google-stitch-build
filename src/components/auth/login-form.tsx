import { Button } from '../ui/button'
import { authClient } from '@/lib/auth-client'

import { useNavigate } from '@tanstack/react-router'
import { GithubIcon } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'

export function LoginForm() {
    const navigate = useNavigate()
    const [isSubmitting , setIsSubmitting] = useState(false);



  const handleLogin = async() => {
    setIsSubmitting(true)
    try {
        await authClient.signIn.social({
            provider:"github",
            fetchOptions:{
                onSuccess:()=>{
                    toast.success("Logged in successfully")
                    navigate({
                        to:"/"
                    })
                },
                onError:({error})=>{
                    toast.error(error.message || "Failed to login. Please try again")
                }
            }
        })
    } catch (error) {
         toast.error((error as Error).message)
        console.log(error)
    }
    finally{
        setIsSubmitting(false)
    }
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Click below to login with your GitHub account
        </p>
      </div>

      <div className="grid gap-6">
        <Button onClick={handleLogin} variant={'default'} className="w-full" disabled={isSubmitting}>
          {
            isSubmitting ? <Spinner/> : <GithubIcon className="mr-2 size-4" />
          }
          
          Login with Github
        </Button>

         <div className="text-center text-sm text-muted-foreground">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
}
