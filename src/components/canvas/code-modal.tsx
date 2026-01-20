import { useState, useMemo } from 'react'
import { X, Copy, Check, Download, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Editor from '@monaco-editor/react'
import { useTheme } from '@/provider/theme-provider'
import { cn } from '@/lib/utils'
import { format } from 'path'


interface CodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  html: string
  title?: string
}

function formatHtml(html: string): string {
  let formatted = html.replace(/></g, '>\n<').replace(/>\s+</g, '>\n<')

  let indent = 0
  const lines = formatted.split('\n')
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed) return ''

    if (trimmed.startsWith('</') || trimmed.startsWith('/>')) {
      indent = Math.max(0, indent - 1)
    }

    const indented = '  '.repeat(indent) + trimmed

    if (
      trimmed.startsWith('<') &&
      !trimmed.startsWith('</') &&
      !trimmed.endsWith('/>') &&
      !trimmed.includes('</')
    ) {
      indent++
    }

    return indented
  })

  return formattedLines.filter(Boolean).join('\n')
}

function buildFullHtml(html: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mockup Export</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: { "primary": "#135bec" },
          fontFamily: { "sans": ["Inter", "system-ui", "sans-serif"] },
        },
      },
    }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400; }
  </style>
</head>
<body>
${html}
</body>
</html>`
}
const CodeModal = ({
    open,
    onOpenChange,
    html,
    title="code"
}:CodeModalProps) => {
 const [copied, setCopied] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const { theme } = useTheme()

  const displayCode = showFull ? buildFullHtml(html) : html

  const formattedCode = useMemo(()=>formatHtml(displayCode) , [displayCode])

 const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

      const handleCopy = async()=>{
        await navigator.clipboard.writeText(formattedCode);
        setCopied(true);
         setTimeout(()=>setCopied(false),2000)
      }

      const handleDownload = ()=>{
        const fullhtml = buildFullHtml(html);
        const blob = new Blob([fullhtml] , {type:"text/html"})
          const url = URL.createObjectURL(blob)
    const a = document.createElement("a");
    a.href = url;
    a.download = "mockup.html";
    a.click();
    URL.revokeObjectURL(url)
      }

      if(!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

        <div className="relative z-10 w-full max-w-5xl bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">
                {formattedCode.split("\n").length} lines
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toggle Full HTML */}
            <Button
              variant={showFull ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFull(!showFull)}
            >
              {showFull ? "Body Only" : "Full HTML"}
            </Button>

            {/* Copy */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy} 
              className={cn("gap-2", copied && "text-green-500 border-green-500")}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>

            {/* Download */}
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>

            {/* Close */}
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="ml-2">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="70vh"
            language="html"
            value={formattedCode}
            theme={isDark ? "vs-dark" : "light"}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 20, bottom: 20 },
              folding: true,
              bracketPairColorization: { enabled: true },
              renderLineHighlight: "all",
              smoothScrolling: true,
              cursorBlinking: "smooth",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default CodeModal