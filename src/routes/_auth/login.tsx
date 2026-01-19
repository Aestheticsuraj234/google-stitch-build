import { LoginForm } from '@/components/auth/login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col justify-center items-center h-screen gap-4 p-6 md:p-10'>
      <div className='flex flex-1 items-center justify-center'>
        <div className='w-full max-w-xl'>
          <LoginForm/>
        </div>
      </div>
    </div>
  )
}
