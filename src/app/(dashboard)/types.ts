import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  href: string
  label: string
  icon: LucideIcon
}

export interface DashboardLayoutProps {
  children: ReactNode
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN'
}

export interface UserSession {
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
    phone?: string
    phoneVerified: boolean
  }
  session: {
    userId: string
    email: string
    role: string
  }
}