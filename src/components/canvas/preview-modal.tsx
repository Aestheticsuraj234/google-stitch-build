import { useState, useMemo, useEffect } from 'react'
import { X, Smartphone, Tablet, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeviceSize } from './canvas'

const DEVICE_SIZES = {
  mobile: { width: 375, height: 667, label: 'Mobile', icon: Smartphone },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: Tablet },
  desktop: { width: 1280, height: 800, label: 'Desktop', icon: Monitor },
}

interface PreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  html: string
  initialDevice: DeviceSize
}

function buildPreviewHtml(html: string): string {
  return `<!DOCTYPE html>
<html class="light" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: { "primary": "#135bec", "background-light": "#f6f6f8", "background-dark": "#101622" },
          fontFamily: { "display": ["Inter", "sans-serif"], "sans": ["Inter", "system-ui", "sans-serif"] },
        },
      },
    }
  <\/script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 0; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-slate-100 antialiased">
${html}
</body>
</html>`
}

const PreviewModal = ({
  open,
  onOpenChange,
  html,
  initialDevice,
}: PreviewModalProps) => {
 const [device, setDevice] = useState<DeviceSize>(initialDevice)
  const [scale, setScale] = useState(1)
  const currentSize = DEVICE_SIZES[device]

  const srcDoc = useMemo(() => buildPreviewHtml(html), [html])

  useEffect(()=>{
    if(!open) return;

    const calculateScale = ()=>{
        const padding = 140 //header + margins
        const bezelPadding = 24;
        const maxWidth = window.innerWidth - padding
      const maxHeight = window.innerHeight - padding

      const totalWidth = currentSize.width + bezelPadding
      const totalHeight = currentSize.height + bezelPadding

        const scaleX = maxWidth / totalWidth
      const scaleY = maxHeight / totalHeight
      const newScale = Math.min(scaleX, scaleY, 0.9)

      setScale(newScale)
    }

    calculateScale();
    window.addEventListener("resize" , calculateScale);
    return ()=> window.removeEventListener("resize" , calculateScale)
  },[open , currentSize.width , currentSize.height])

  if(!open) return null

    const scaledWidth = (currentSize.width + 24) * scale
  const scaledHeight = (currentSize.height + 24) * scale

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden'>
         <div
        className="absolute inset-0 bg-black/90"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-10 flex items-center gap-3 bg-zinc-900/95 backdrop-blur-md rounded-full px-2 py-1.5 shadow-lg border border-zinc-700/50 mb-4">

      <span className="text-sm font-medium text-white pl-3">Preview</span>

        {/* Device Selector */}
        <div className="flex items-center gap-0.5 bg-zinc-800 rounded-full p-0.5">
          {(Object.entries(DEVICE_SIZES) as [DeviceSize, typeof DEVICE_SIZES.mobile][]).map(([key, value]) => {
            const Icon = value.icon
            return (
              <button
                key={key}
                onClick={() => setDevice(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  device === key 
                    ? "bg-white text-zinc-900" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{value.label}</span>
              </button>
            )
          })}
        </div>

          {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="p-1.5 rounded-full hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      
      <div
      className='relative z-10'
      style={{
        width:`${scaledWidth}px`,
        height:`${scaledHeight}px`
      }}
      >
 <div 
          className={cn(
            "absolute top-0 left-0 bg-zinc-800 shadow-2xl",
            device === "mobile" ? "rounded-[2.5rem] p-2" : "rounded-2xl p-2",
            "ring-1 ring-white/5"
          )}
          style={{
            width: `${currentSize.width + 24}px`,
            height: `${currentSize.height + 24}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Device Notch (for mobile) */}
          {device === "mobile" && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-800 rounded-b-xl z-10 flex items-center justify-center">
              <div className="w-12 h-3 bg-zinc-900 rounded-full" />
            </div>
          )}

          {/* Screen */}
          <div
            className={cn(
              "bg-white overflow-hidden",
              device === "mobile" ? "rounded-[2rem]" : "rounded-xl"
            )}
            style={{
              width: `${currentSize.width}px`,
              height: `${currentSize.height}px`,
            }}
          >
            <iframe
              title="Preview"
              srcDoc={srcDoc}
              className="w-full h-full border-0"
            />
          </div>

          {/* Home Indicator (for mobile) */}
          {device === "mobile" && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-600 rounded-full" />
          )}
        </div>
      </div>

      <div className="relative z-10 mt-4 text-xs text-zinc-500">
        {currentSize.width} × {currentSize.height} · {Math.round(scale * 100)}%
      </div>
    </div>
  )
}

export default PreviewModal
