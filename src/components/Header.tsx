import { Link } from '@tanstack/react-router'
import React from 'react'
import { ThemeToggle } from './theme-toggle'
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from '@/lib/auth-client'
import UserMenu from './auth/user-menu'
import LoginButton from './auth/login-button'

const Header = () => {
  const {data , isPending} = authClient.useSession();
  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4">
      <nav className="mx-auto max-w-7xl flex h-14 items-center justify-between rounded-2xl border border-zinc-200/80 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl supports-backdrop-filter:bg-white/70 dark:supports-backdrop-filter:bg-zinc-900/60 px-6 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/20 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
        <Link to={'/'} className="flex items-center space-x-2">
          <img src="/logo.svg" className="size-7" />
          <span className="text-xl font-bold bg-linear-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
            Google-Stitch
          </span>
        </Link>

        <div className='flex items-center gap-3'>
        <ThemeToggle/>
        {isPending ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          ) : data ? (
            <UserMenu session={data} />
          ) : (
            <LoginButton />
          )}
          
        </div>
      </nav>
    </header>
  )
}

export default Header
