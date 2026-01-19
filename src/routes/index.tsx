import { authClient } from '@/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
 const {data} = authClient.useSession()

 console.log(data)

  return (
   <div>
    Hello world
   </div>
  )
}
