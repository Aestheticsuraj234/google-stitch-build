import Header from '@/components/Header'
import { BackgroundPattern } from '@/components/home/background-pattern'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { FREE_TIER_CREDITS, getUserCredits } from '@/server/credits'
import { activateProSubscription } from '@/server/subscription'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Check, Crown, Infinity, Rocket, Sparkles, Truck, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { success, z } from 'zod'

const upgradeSearchSchema = z.object({
  success: z.union([z.boolean(), z.string()]).optional(),
  checkout_id: z.string().optional(),
})

export const Route = createFileRoute('/upgrade')({
    validateSearch:(search)=>upgradeSearchSchema.parse(search),
  component: RouteComponent,
  loaderDeps:({search:{success , checkout_id}})=>({success , checkout_id}),
  loader:async({deps:{success , checkout_id}})=>{
    let activationResult = null;
    const isSuccess = success === true || success === "true";

    if(isSuccess){
        activationResult = await activateProSubscription({data:checkout_id});
    }

    const credits = await getUserCredits()

    return {credits , activationResult}
  }
})

function RouteComponent() {
    const {credits , activationResult} = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
     if(activationResult){
      if(activationResult.success){
          toast.success("🎉 Welcome to Pro! Your subscription is now active.", {
          duration: 5000,
        });
      }
      else{
         toast.error(`Activation failed: ${activationResult.error || "Unknown error"}`);
      }
    }
  },[activationResult])

 
  const isPro = credits?.plan === "pro"

    const handleManageSubscription = async() => {
    try {
      await authClient.customer.portal();
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Failed to open customer portal. Please try again.");
    }
  }



  const handleUpgrade = async()=>{
    if(!session){
        navigate({to:"/login"})
        return;
    }
    try {
        setIsLoading(true);
        await authClient.checkout({
            slug:"pro"
        })

    } catch (error) {
         console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <BackgroundPattern />
      <Header />

      <main className="relative flex flex-col items-center px-4 pt-24 mb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Unlock Your Full Potential
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Start free and upgrade when you need more. No credit card required
            to get started.
          </p>
        </div>


        
          {credits && !isPro && (
          <div className="w-full max-w-3xl mb-8 p-4 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800">
                  <Zap className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Your Current Usage
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {credits.creditsUsed} of {FREE_TIER_CREDITS} generations used this month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (credits.creditsUsed / FREE_TIER_CREDITS) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {Math.max(0, FREE_TIER_CREDITS - credits.creditsUsed)} left
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="relative p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Free
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                  $0
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">/month</span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Perfect for trying out Sketch AI
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <FeatureItem>
                {FREE_TIER_CREDITS} generations per month
              </FeatureItem>
              <FeatureItem>All UI libraries supported</FeatureItem>
              <FeatureItem>Desktop & mobile mockups</FeatureItem>
              <FeatureItem>Export to code</FeatureItem>
              <FeatureItem>Basic AI models</FeatureItem>
            </ul>

            <Button variant="outline" className="w-full h-11" disabled={!isPro}>
              {isPro ? 'Downgrade' : 'Current Plan'}
            </Button>
          </div>


           <div className="relative p-8 rounded-2xl bg-linear-to-br from-orange-500/10 via-transparent to-orange-500/5 border-2 border-orange-500/50 shadow-xl shadow-orange-500/10">
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white text-sm font-medium shadow-lg">
                <Crown className="w-3.5 h-3.5" />
                Most Popular
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                Pro
                <Sparkles className="w-5 h-5 text-orange-500" />
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                  $20
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">/month</span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                For professionals and teams
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <FeatureItem highlight>
                <span className="flex items-center gap-1.5">
                  <Infinity className="w-4 h-4" />
                  Unlimited generations
                </span>
              </FeatureItem>
              <FeatureItem highlight>Priority AI processing</FeatureItem>
              <FeatureItem highlight>Advanced AI models</FeatureItem>
              <FeatureItem>All UI libraries supported</FeatureItem>
              <FeatureItem>Desktop & mobile mockups</FeatureItem>
              <FeatureItem>Export to code</FeatureItem>
              <FeatureItem>Priority support</FeatureItem>
            </ul>

            {isPro ? (
              <Button
                onClick={handleManageSubscription}
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white group"
              >
                {isLoading ? (
                  'Redirecting...'
                ) : (
                  <>
                    Upgrade to Pro
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>


 <div className="mt-16 w-full max-w-3xl">
          <h2 className="text-2xl font-semibold text-center text-zinc-900 dark:text-zinc-100 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4">
            <FAQItem
              question="What counts as a generation?"
              answer="Each time you create a new mockup or edit an existing one using AI, it counts as one generation. Multiple variations from a single prompt count as one generation."
            />
            <FAQItem
              question="When do my free credits reset?"
              answer="Free tier credits reset every 30 days from your account creation date. You'll always have fresh credits at the start of each billing cycle."
            />
            <FAQItem
              question="Can I cancel my Pro subscription anytime?"
              answer="Yes! You can cancel your subscription at any time. You'll continue to have Pro access until the end of your current billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, debit cards, and many local payment methods through our secure payment provider, Polar."
            />
          </div>
        </div>

        {!isPro && (
  <div className="mt-16 text-center mb-10">
            <div className="inline-flex items-center gap-3 p-6 rounded-2xl bg-linear-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <Rocket className="w-8 h-8 text-orange-500" />
              <div className="text-left">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Ready to supercharge your workflow?
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Join thousands of designers using Sketch AI Pro
                </p>
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="ml-4 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Get Pro Now
              </Button>
            </div>
          </div>

        )}

      </main>
    </div>
  )
}

function FeatureItem({
  children,
  highlight = false,
}: {
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          highlight
            ? 'bg-orange-500 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
        }`}
      >
        <Check className="w-3 h-3" />
      </div>
      <span
        className={`text-sm ${
          highlight
            ? 'text-zinc-900 dark:text-zinc-100 font-medium'
            : 'text-zinc-600 dark:text-zinc-400'
        }`}
      >
        {children}
      </span>
    </li>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        {question}
      </h4>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{answer}</p>
    </div>
  )
}
