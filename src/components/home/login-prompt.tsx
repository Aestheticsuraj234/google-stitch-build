import { Link } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LoginPrompt() {
  return (
    <div className="w-full max-w-2xl">
      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-hidden shadow-sm dark:shadow-none">
        {/* Blurred fake input background */}
        <div className="px-4 pt-4 pb-14 blur-[2px] select-none pointer-events-none">
          <div className="text-base text-zinc-400 dark:text-zinc-600">Ask Sketch AI to build...</div>
        </div>

        {/* Login overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[1px]">
          <div className="text-center">
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to start creating with Sketch AI
            </p>
            <Button asChild className="gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white">
              <Link to="/login">
                <LogIn className="size-4" />
                Sign in to continue
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom toolbar (blurred) */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 border-t border-zinc-200/50 dark:border-zinc-800/50 blur-[2px] pointer-events-none">
          <div className="flex items-center gap-1">
            <div className="size-8 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="size-8 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
