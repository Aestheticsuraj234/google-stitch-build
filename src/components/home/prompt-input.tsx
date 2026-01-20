import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  ChevronDown,
  ArrowUp,
  Monitor,
  Smartphone,
  Tablet,
  LayoutGrid,
  Palette,
  Check,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  AlertCircle,
  LayoutDashboard,
  Rocket,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'
import { createMockup } from '@/server/mockup'
import { mockupsQueryKey } from './mockup-list'

export type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'BOTH'
export type UILibrary = 'SHADCN' | 'MATERIAL_UI' | 'ANT_DESIGN' | 'ACETERNITY'
export type AIModel = 'sketch-mini' | 'sketch-pro'

export type PromptInputData = {
  prompt: string
  deviceType: DeviceType
  uiLibrary: UILibrary
  aiModel: AIModel
}

type DeviceOption = {
  id: DeviceType
  name: string
  icon: React.ReactNode
}

type UILibraryOption = {
  id: UILibrary
  name: string
  description: string
}

type AIModelOption = {
  id: AIModel
  name: string
  description: string
  icon: React.ReactNode
}

const deviceOptions: DeviceOption[] = [
  { id: 'DESKTOP', name: 'Desktop', icon: <Monitor className="size-4" /> },
  { id: 'MOBILE', name: 'Mobile', icon: <Smartphone className="size-4" /> },
  { id: 'TABLET', name: 'Tablet', icon: <Tablet className="size-4" /> },
  { id: 'BOTH', name: 'All Devices', icon: <LayoutGrid className="size-4" /> },
]

const uiLibraryOptions: UILibraryOption[] = [
  {
    id: 'SHADCN',
    name: 'Shadcn/UI',
    description: 'Modern, accessible components',
  },
  {
    id: 'MATERIAL_UI',
    name: 'Material UI',
    description: 'Google Material Design',
  },
  {
    id: 'ANT_DESIGN',
    name: 'Ant Design',
    description: 'Enterprise UI framework',
  },
  { id: 'ACETERNITY', name: 'Aceternity', description: 'Animated components' },
]

const aiModelOptions: AIModelOption[] = [
  {
    id: 'sketch-mini',
    name: 'Sketch Mini',
    description: 'Fast generation with Gemini',
    icon: <Zap className="size-4" />,
  },
  {
    id: 'sketch-pro',
    name: 'Sketch Pro',
    description: 'Advanced generation with Gemma 2',
    icon: <Sparkles className="size-4" />,
  },
]

export const SAMPLE_PROMPTS = [
  {
    id: 1,
    title: 'SaaS UI',
    icon: LayoutDashboard,
    prompt:
      'Create a SaaS dashboard with a billing overview, recent activity, and usage stats.',
  },
  {
    id: 2,
    title: 'Mobile Onboarding',
    icon: Smartphone,
    prompt:
      'Design a mobile onboarding flow for a finance app with 3 steps and a progress indicator.',
  },
  {
    id: 3,
    title: 'Landing Page',
    icon: Rocket,
    prompt:
      'Generate a responsive landing page hero section with a CTA, features, and testimonials.',
  },
  {
    id: 4,
    title: 'Settings Page',
    icon: Settings,
    prompt:
      'Build a settings page with account, notifications, and security sections.',
  },
] as const

const PromptInput = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [prompt, setPrompt] = useState('')
  const [deviceType, setDeviceType] = useState<DeviceType>('DESKTOP')
  const [uiLibrary, setUILibrary] = useState<UILibrary>('SHADCN')
  const [aiModel, setAIModel] = useState<AIModel>('sketch-mini')
  const [isLoading, setIsLoading] = useState(false)

  const selectedDevice = deviceOptions.find((d) => d.id === deviceType)!
  const selectedLibrary = uiLibraryOptions.find((l) => l.id === uiLibrary)!
  const selectedModel = aiModelOptions.find((m) => m.id === aiModel)!

  const handleSubmit = async()=>{
    try {
      setIsLoading(true);
      const result = await createMockup({
        data:{
          prompt:prompt.trim(),
          deviceType,
          uiLibrary,
          aiModel
        }
      })

      if(result.success && result.mockupId){
        await queryClient.invalidateQueries({queryKey:mockupsQueryKey})
        toast.success("Mockup creation started" , {
          description:'Redirecting to playground'
        })

        navigate({
          to:"/playground/$playgroundId",
          params:{playgroundId:result.mockupId}
        })
      }
      else{
        toast.error("Failed to create mockup")
      }
    } catch (error) {
      console.error('Error creating mockup:', error)
      toast.error('Failed to create mockup', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      })
    }
    finally{
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if(e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-2xl">

    <div className='mb-3 flex flex-wrap gap-2'>
        {
            SAMPLE_PROMPTS.map(({id , title , icon:Icon , prompt})=>(
                <Button
                key={id}
                variant={"outline"}
                size={"sm"}
                onClick={()=>setPrompt(prompt)}
                >
                    <Icon className='size-4'/>
                    {title}
                </Button>
            ))
        }
    </div>

      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm transition-all focus-within:border-zinc-300 dark:focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-300/50 dark:focus-within:ring-zinc-700/50 shadow-sm dark:shadow-none">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          placeholder="Describe the UI you want to create..."
          rows={1}
          disabled={isLoading}
          className={cn(
            'w-full resize-none bg-transparent px-4 pt-4 pb-16 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[80px] max-h-[200px] field-sizing-content',
          )}
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Plus className="size-4" />
            </Button>

             <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

               <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-normal"
                >
                  {selectedDevice.icon}
                  <span className="hidden sm:inline">{selectedDevice.name}</span>
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Device Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {deviceOptions.map((device) => (
                  <DropdownMenuItem
                    key={device.id}
                    onClick={() => setDeviceType(device.id)}
                    className="gap-2"
                  >
                    {device.icon}
                    <span className="flex-1">{device.name}</span>
                    {deviceType === device.id && <Check className="size-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-normal"
                >
                  <Palette className="size-4" />
                  <span className="hidden sm:inline">{selectedLibrary.name}</span>
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">UI Library</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {uiLibraryOptions.map((library) => (
                  <DropdownMenuItem
                    key={library.id}
                    onClick={() => setUILibrary(library.id)}
                    className="flex-col items-start gap-0.5"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="flex-1 font-medium">{library.name}</span>
                      {uiLibrary === library.id && <Check className="size-4 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{library.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />
                <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-normal"
                >
                  {selectedModel.icon}
                  <span className="hidden sm:inline">{selectedModel.name}</span>
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">AI Model</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {aiModelOptions.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setAIModel(model.id)}
                    className="flex-col items-start gap-0.5"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {model.icon}
                      <span className="flex-1 font-medium">{model.name}</span>
                      {aiModel === model.id && <Check className="size-4 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground pl-6">{model.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
          type="button"
        size="icon-sm"
         onClick={handleSubmit}
         disabled={isLoading}
          className={cn(
              "rounded-lg transition-all",
              prompt.trim() && !isLoading
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
            )}
          >
            {isLoading ? <Spinner className='size-4'/> : <ArrowUp className='size-4'/>}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PromptInput
