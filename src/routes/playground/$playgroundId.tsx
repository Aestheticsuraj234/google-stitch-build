import Canvas from '@/components/canvas/canvas'
import { cn } from '@/lib/utils'
import { getMockupWithVariations } from '@/server/mockup'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/playground/$playgroundId')({
  component: RouteComponent,
})

export type Variation = {
  id: string
  code: string
  label: string
  version?: number
}

function RouteComponent() {
  const { playgroundId } = Route.useParams()

  const queryClient = useQueryClient()

  const {
    data: mockup,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['mockup', playgroundId],
    queryFn: () => getMockupWithVariations({ data: playgroundId }),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'PENDING' || status === 'GENERATING') {
        return 2000
      }
      return false
    },
  })

  if(isLoading){
     return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-sm">Loading mockup...</p>
      </div>
    )
  }

   if (mockup?.status === 'PENDING' || mockup?.status === 'GENERATING') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <div className="relative mb-6">
          {/* Animated rings */}
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div
            className={cn(
              'relative h-16 w-16 rounded-full border-4 border-muted',
              'flex items-center justify-center',
            )}
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">
          {mockup.status === 'PENDING'
            ? 'Preparing your mockup...'
            : 'Generating variations...'}
        </h2>

        <p className="text-muted-foreground text-sm text-center max-w-md mb-4">
          {mockup.status === 'PENDING'
            ? 'Your mockup is queued and will start generating shortly.'
            : 'AI is creating 3 unique variations based on your prompt. This usually takes 1-3 mins.'}
        </p>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              mockup.status === 'PENDING'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-green-500',
            )}
          />
          <span>{mockup.status === 'PENDING' ? 'Queued' : 'Generating'}</span>
          {isRefetching && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
        </div>

        {/* Prompt preview */}
        <div className="mt-8 max-w-lg w-full px-4">
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-xs text-muted-foreground mb-1">Prompt</p>
            <p className="text-sm line-clamp-3">{mockup.prompt}</p>
          </div>
        </div>
      </div>
    )
  }

  const canvasVariations:Variation[] = mockup?.varitions?.length > 0 ? mockup?.varitions?.map((v)=>({
    id:v.id,
    code:v.code,
    label:`V${v.version}`,
    version:v.version
  })):[
    {
    id:"default",
    code:mockup?.code,
    label:"V1",
    version:1
  }
  ]

  const handleEditComplete = ()=>{
    const pollInterval = setInterval(async()=>{
      await queryClient.invalidateQueries({queryKey:["mockup" , playgroundId]})
    },2000)

    setTimeout(()=>{
      clearInterval(pollInterval)
    },30000)
  }

  return (
    <Canvas
     title={mockup?.name || `Mockup ${playgroundId}`}
      mockupId={mockup?.id}
      deviceType={mockup?.deviceType}
      variations={canvasVariations}
      onEditComplete={handleEditComplete}
    
    />
  )
}
