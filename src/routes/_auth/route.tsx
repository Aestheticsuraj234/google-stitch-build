import { buttonVariants } from '@/components/ui/button'
import { createFileRoute , Link , Outlet } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return( 
    <div className='min-h-screen bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 w-full'>
      <div className='absolute top-8 left-8'>
      <Link
      to={"/"}
      className={buttonVariants({variant:"outline"})}
      >
        <ArrowLeft className='size-4'/>
        Back to Home
      </Link>
      </div>

      <div>
        <Outlet/>
      </div>
    </div>
  )
}
