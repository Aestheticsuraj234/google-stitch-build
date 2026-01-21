import { useState } from 'react'
import { X, Sparkles, Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface EditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentHtml: string
  variantLabel: string
  onSubmit: (prompt: string) => Promise<void>
}

const SUGGESTIONS = [
  { label: 'More vibrant', emoji: '🎨' },
  { label: 'Add whitespace', emoji: '📐' },
  { label: 'Dark theme', emoji: '🌙' },
  { label: 'Prominent CTAs', emoji: '🎯' },
  { label: 'Simplify layout', emoji: '✨' },
  { label: 'More sections', emoji: '📱' },
]

export function EditModal({
  open,
  onOpenChange,
  variantLabel,
  onSubmit,
}: EditModalProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async()=>{
   
    try {
        setIsLoading(true);
        await onSubmit(prompt)
        setPrompt("")
        onOpenChange(false)
        
    } catch (error) {
           console.error("Failed to edit variant:", error)
    }
    finally{
        setIsLoading(false)
    }
  }

  const handleSuggestion = (suggestion:string)=>{
    setPrompt(prev => prev ? `${prev}. ${suggestion}`: suggestion)
  }
  
   if(!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-10 w-full max-w-xl bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-linear-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Edit with AI</h2>
              <p className="text-sm text-muted-foreground">
                Modify "{variantLabel}"
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your changes</label>
            <Textarea
              placeholder="e.g., Change the primary color to purple and add more padding..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none text-base"
              autoFocus
            />
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Quick suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSuggestion(suggestion.label)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                    'bg-muted hover:bg-muted/80 transition-colors',
                    'border border-transparent hover:border-primary/20',
                  )}
                >
                  <span>{suggestion.emoji}</span>
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          </div>

            <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              size="lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!prompt.trim() || isLoading}
              className="gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
