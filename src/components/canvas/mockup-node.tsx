import { memo, useState, useCallback, useMemo } from 'react'
import { NodeResizer } from '@xyflow/react'
import { cn } from '@/lib/utils'

export type MockupNodeData = {
  label: string
  html: string
  width: number
  height: number
}

interface MockupNodeProps {
  data: MockupNodeData
  selected?: boolean
}

function buildHtmlDocument(html: string): string {
  return `
<!DOCTYPE html>
<html class="light" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Mockup Preview</title>
  
  <!-- Tailwind CSS with plugins -->
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  
  <!-- Material Symbols Icons -->
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  
  <!-- Tailwind Config -->
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "primary": "#135bec",
            "background-light": "#f6f6f8",
            "background-dark": "#101622",
          },
          fontFamily: {
            "display": ["Inter", "sans-serif"],
            "sans": ["Inter", "system-ui", "sans-serif"]
          },
          borderRadius: {
            "DEFAULT": "0.25rem",
            "lg": "0.5rem",
            "xl": "0.75rem",
            "2xl": "1rem",
            "3xl": "1.5rem",
            "full": "9999px"
          },
        },
      },
    }
  <\/script>
  
  <style>
    body {
      font-family: 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 0;
    }
    
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    
    /* Disable all interactions */
    *, *::before, *::after {
      pointer-events: none !important;
      user-select: none !important;
      cursor: default !important;
    }
    
    /* Disable transitions for static preview */
    * {
      transition: none !important;
      animation-play-state: paused !important;
    }
    
    ::-webkit-scrollbar { display: none !important; }
    * { scrollbar-width: none !important; }
    
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#0d121b] dark:text-slate-100 antialiased">
${html}
</body>
</html>`
}

export const MockupNode = memo(function MockupNode({
  data,
  selected,
}: MockupNodeProps) {
  const { height, html, label, width } = data
  const [isLoaded, setIsLoaded] = useState(false)
  const [dimensions, setDimensions] = useState({ width, height })

  const srcDoc = useMemo(() => buildHtmlDocument(html), [html])

  const handleLoad = useCallback(() => {
    setTimeout(() => setIsLoaded(true), 500)
  }, [])

  return (
    <>
      <NodeResizer
        minWidth={320}
        minHeight={480}
        isVisible={selected}
        lineClassName="!border-blue-500 !border-[4px]"
        handleClassName="!h-4 !w-4 !bg-white !border-[4px] !border-blue-500 !rounded-lg hover:!bg-blue-50 hover:!scale-110 !transition-transform !shadow-lg"
        onResize={(_, params) => {
          setDimensions({ width: params.width, height: params.height })
        }}
      />
      <div className="flex flex-col items-center">
        <div className="mb-3 text-center">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            {label}
          </h3>
        </div>

        <div
          className={cn(
            'relative bg-white rounded-xl overflow-hidden',
            'shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.12)]',
            'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.5)]',
            selected &&
              'ring-[6px] ring-blue-500 ring-offset-[6px] ring-offset-zinc-100 dark:ring-offset-zinc-950',
          )}
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
          }}
        >
          <iframe
            title={label}
            srcDoc={srcDoc}
            className={cn(
              'w-full h-full border-0 bg-white',
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
            )}
            style={{ pointerEvents: 'none' }}
            onLoad={handleLoad}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-zinc-200 dark:border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-xs text-zinc-400">Rendering...</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
        </div>
      </div>
    </>
  )
})
