import { prisma } from '@/db'
import { authFnMiddleware, authMiddleware } from '@/middleware/auth'
import { createServerFn } from '@tanstack/react-start'

export const FREE_TIER_CREDITS = 5
export const CREDITS_RESET_INTERVAL_DAYS = 30

export type UserCreditsInfo = {
  plan: string
  creditsUsed: number
  creditsRemaining: number
  creditsTotal: number
  isUnlimited: boolean
  canGenerate: boolean
  resetDate: Date | null
  subscriptionStatus: string | null
}

function shouldResetCredits(resetAt: Date): boolean {
  const now = new Date()
  const diffTime = now.getTime() - resetAt.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays >= CREDITS_RESET_INTERVAL_DAYS
}

export const getUserCredits = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }): Promise<UserCreditsInfo | null> => {
    try {
      const userId = context.session.user.id

      if (!userId) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          plan: true,
          creditsUsed: true,
          creditsResetAt: true,
          subscriptionStatus: true,
          polarCustomerId: true,
          updatedAt: true,
        },
      })

      if (!user) {
        return null
      }

      const resetAt = new Date(user.creditsResetAt)

      if (user.plan === 'free' && shouldResetCredits(resetAt)) {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            creditsUsed: 0,
            creditsResetAt: new Date(),
          },
        })
        user.creditsUsed = 0
      }

      const isPro = user.plan === 'pro'
      const isUnlimited = isPro
      const creditsTotal = isPro ? Infinity : FREE_TIER_CREDITS
      const creditsRemaining = isPro
        ? Infinity
        : Math.max(0, FREE_TIER_CREDITS - user.creditsUsed)
      const canGenerate = isPro || user.creditsUsed < FREE_TIER_CREDITS

      const nextResetDate = new Date(resetAt)
      nextResetDate.setDate(
        nextResetDate.getDate() + CREDITS_RESET_INTERVAL_DAYS,
      )

      return {
        plan: user.plan,
        creditsUsed: user.creditsUsed,
        creditsRemaining: creditsRemaining === Infinity ? -1 : creditsRemaining,
        creditsTotal: creditsTotal === Infinity ? -1 : creditsTotal,
        isUnlimited,
        canGenerate,
        resetDate: isPro ? null : nextResetDate,
        subscriptionStatus: user.subscriptionStatus,
      }
    } catch (error) {
      console.error('Error fetching user credits:', error)
      return null
    }
  })

export const canUserGenerate = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .handler(
    async ({ context }): Promise<{ canGenerate: boolean; reason?: string }> => {
      try {
        const userId = context.session.user.id

        if (!userId) {
          return { canGenerate: false, reason: 'User ID not found' }
        }
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            plan: true,
            creditsUsed: true,
            creditsResetAt: true,
          },
        })

        if (!user) {
          return { canGenerate: false, reason: 'User not found' }
        }

        if (user.plan === 'pro') {
          return { canGenerate: true }
        }

        const resetAt = new Date(user.creditsResetAt)

        if (shouldResetCredits(resetAt)) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              creditsUsed: 0,
              creditsResetAt: new Date(),
            },
          })
          return { canGenerate: true }
        }

        if (user.creditsUsed >= FREE_TIER_CREDITS) {
          return {
            canGenerate: false,
            reason: `You've used all ${FREE_TIER_CREDITS} free generations this month. Upgrade to Pro for unlimited generations!`,
          }
        }

        return { canGenerate: true }
      } catch (error) {
        console.error('Error checking user generation eligibility:', error)
        return { canGenerate: false, reason: 'Error checking credits' }
      }
    },
  )

  export const incrementCreditsUsed = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = context.session.user.id

      if (!userId) {
        console.error('Error incrementing credits: User ID not found')
        return
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      })

      if (user?.plan === 'free') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            creditsUsed: { increment: 1 },
          },
        })
      }
    } catch (error) {
      console.error('Error incrementing credits:', error)
    }
  })
