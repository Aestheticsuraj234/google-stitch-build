import { useQuery } from '@tanstack/react-query'
import { Layers, Loader2, RefreshCw } from 'lucide-react'
import { getUserMockups } from '@/server/mockup'
import { MockupCard } from './mockup-card'

export const mockupsQueryKey = ['mockup', 'list'] as const

const POLLING_INTERVAL = 3000

export function MokcupList() {

  const {
    data: mockups = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: mockupsQueryKey,
    queryFn: () => getUserMockups(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const data = query.state.data

      if (!data) return false

      const hasActiveJobs = data.some(
        (mockup) =>
          mockup.status === 'PENDING' || mockup.status === 'GENERATING',
      )

      return hasActiveJobs ? POLLING_INTERVAL : false
    },
  })

  console.log(mockups)

  const hasActiveJobs = mockups.some(
    (mockup) => mockup.status === 'PENDING' || mockup.status === 'GENERATING',
  )

  const activeJobsCount = mockups.filter(
    (mockup) => mockup.status === 'PENDING' || mockup.status === 'GENERATING',
  ).length


  if(isLoading){
     return (
      <div className="w-full max-w-5xl mt-16">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-zinc-400" />
        </div>
      </div>
    )
  }

    if (mockups.length === 0) {
    return (
      <div className="w-full max-w-5xl mt-16">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Layers className="size-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No mockups yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            Start by describing the UI you want to create in the prompt above.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-5xl mt-16'>

         <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Your Mockups
          </h2>
          {/* Active jobs indicator */}
          {hasActiveJobs && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
              <RefreshCw className={`size-3 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{activeJobsCount} generating</span>
            </div>
          )}
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {mockups.length} {mockups.length === 1 ? 'mockup' : 'mockups'}
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {
            mockups.map((mockup)=>(
            <MockupCard key={mockup.id} mockup={mockup} /> 
            ))
          }
      </div>

    </div>
  )
}
