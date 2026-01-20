import { Link } from '@tanstack/react-router'
import { Monitor, Smartphone, Tablet, LayoutGrid, Clock, CheckCircle2, Loader2, XCircle, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockupWithProject, DeviceType, MockupStatus, UILibrary } from '@/server/mockup'

type MockupCardProps = {
  mockup: MockupWithProject
}

const deviceIcons: Record<DeviceType, React.ReactNode> = {
  DESKTOP: <Monitor className="size-3.5" />,
  MOBILE: <Smartphone className="size-3.5" />,
  TABLET: <Tablet className="size-3.5" />,
  BOTH: <LayoutGrid className="size-3.5" />,
}

const deviceLabels: Record<DeviceType, string> = {
  DESKTOP: 'Desktop',
  MOBILE: 'Mobile',
  TABLET: 'Tablet',
  BOTH: 'All',
}

const uiLibraryConfig: Record<UILibrary, { label: string; className: string }> = {
  SHADCN: {
    label: 'Shadcn',
    className: 'bg-zinc-900/70 text-white dark:bg-zinc-100/90 dark:text-zinc-900',
  },
  MATERIAL_UI: {
    label: 'MUI',
    className: 'bg-blue-600/90 text-white',
  },
  ANT_DESIGN: {
    label: 'Ant',
    className: 'bg-red-500/90 text-white',
  },
  ACETERNITY: {
    label: 'Aceternity',
    className: 'bg-purple-600/90 text-white',
  },
}

const statusConfig: Record<MockupStatus, { icon: React.ReactNode; label: string; className: string }> = {
  PENDING: {
    icon: <Clock className="size-3.5" />,
    label: 'Pending',
    className: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
  },
  GENERATING: {
    icon: <Loader2 className="size-3.5 animate-spin" />,
    label: 'Generating',
    className: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  },
  COMPLETED: {
    icon: <CheckCircle2 className="size-3.5" />,
    label: 'Completed',
    className: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  },
  FAILED: {
    icon: <XCircle className="size-3.5" />,
    label: 'Failed',
    className: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  },
}

// Generate DiceBear avatar URL
function getDiceBearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`
}

export function MockupCard({ mockup }: MockupCardProps) {
  const status = statusConfig[mockup.status]
  const deviceIcon = deviceIcons[mockup.deviceType]
  const deviceLabel = deviceLabels[mockup.deviceType]
  const uiLibrary = uiLibraryConfig[mockup.uiLibrary]

  return (
    <Link
      to="/playground/$playgroundId"
      params={{ playgroundId: mockup.id }}
      className="group block"
    >
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-zinc-900/50">
        {/* Thumbnail using DiceBear */}
        <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <img
            src={getDiceBearUrl(mockup.name)}
            alt={mockup.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Status badge - top right */}
          <div className={cn(
            "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            status.className
          )}>
            {status.icon}
            <span>{status.label}</span>
          </div>

          {/* Tags - bottom left */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            {/* Device type badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-zinc-900/70 text-white dark:bg-zinc-100/90 dark:text-zinc-900">
              {deviceIcon}
              <span>{deviceLabel}</span>
            </div>
            
            {/* UI Library badge */}
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              uiLibrary.className
            )}>
              <Palette className="size-3" />
              <span>{uiLibrary.label}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">
            {mockup.name}
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {mockup.prompt}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {mockup.project.name}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {new Date(mockup.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
