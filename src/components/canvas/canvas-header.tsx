
import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'
import { Link } from '@tanstack/react-router'
import { Download, Home, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/provider/theme-provider'

interface CanvasHeaderProps {
  title: string
}

const CanvasHeader = ({title}:CanvasHeaderProps) => {
    const {theme, setTheme} = useTheme();

    const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'light' : 'dark')
    }
  }

    const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);


  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none">
      <div className="pointer-events-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm shadow-lg border-border/50 hover:bg-background"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Go Home</p>
          </TooltipContent>
        </Tooltip>
</div>
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 rounded-lg px-4 py-2">
            <h1 className="text-sm font-medium text-foreground truncate max-w-50 sm:max-w-75">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="bg-background/80 backdrop-blur-sm shadow-lg border-border/50 hover:bg-background"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-background/80 backdrop-blur-sm shadow-lg border-border/50 hover:bg-background gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Export mockup</p>
            </TooltipContent>
          </Tooltip>
        </div>
      
    </header>
  )
}

export default CanvasHeader