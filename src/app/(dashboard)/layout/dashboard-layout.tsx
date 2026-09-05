'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DashboardLayoutProps,
  NavigationItem,
} from '../types'
import {
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Users,
  Briefcase,
  CreditCard,
  BarChart,
  Shield,
  Bell,
  Menu,
  X,
  ChevronLeft,
  Home,
  Building2,
  ClipboardList,
  DollarSign,
  FileText,
  UserCheck,
  Megaphone,
} from 'lucide-react'
import { useSession } from '@/hooks/use-session'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { toast } from 'react-hot-toast'

const CLIENT_NAV: NavigationItem[] = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home },
  { href: '/dashboard/requests/new', label: 'طلب جديد', icon: PlusCircle },
  { href: '/dashboard/requests', label: 'طلباتي', icon: ClipboardList },
  { href: '/dashboard/messages', label: 'المحادثات', icon: MessageSquare },
  { href: '/dashboard/reviews', label: 'تقييماتي', icon: Star },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
]

const PROVIDER_NAV: NavigationItem[] = [
  { href: '/provider/dashboard', label: 'الرئيسية', icon: Home },
  { href: '/provider/requests/nearby', label: 'طلبات قريبة', icon: Building2 },
  { href: '/provider/offers', label: 'عروضي', icon: ClipboardList },
  { href: '/provider/profile', label: 'الملف الشخصي', icon: UserCheck },
  { href: '/provider/subscription', label: 'الاشتراك', icon: CreditCard },
  { href: '/provider/earnings', label: 'الأرباح', icon: DollarSign },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
]

const ADMIN_NAV: NavigationItem[] = [
  { href: '/admin', label: 'لوحة التحكم', icon: BarChart },
  { href: '/admin/users', label: 'المستخدمين', icon: Users },
  { href: '/admin/providers', label: 'مقدمي الخدمات', icon: Briefcase },
  { href: '/admin/requests', label: 'الطلبات', icon: ClipboardList },
  { href: '/admin/transactions', label: 'المعاملات', icon: DollarSign },
  { href: '/admin/verifications', label: 'التوثيق', icon: Shield },
  { href: '/admin/ads', label: 'الإعلانات', icon: Megaphone },
  { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
]

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session, refresh } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false)

  const navItems = role === 'ADMIN' ? ADMIN_NAV : role === 'PROVIDER' ? PROVIDER_NAV : CLIENT_NAV

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('تم تسجيل الخروج')
      refresh()
      window.location.href = '/'
    } catch {
      toast.error('فشل تسجيل الخروج')
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <span className="text-2xl">⚡</span>
              شغّلني
            </Link>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-accent"
              onClick={() => setSidebarOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1" role="navigation" aria-label="القائمة الرئيسية">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t p-4">
            {session && (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.avatar || undefined} alt={session.user.name} />
                  <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.user.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {role === 'CLIENT' ? 'زبون' : role === 'PROVIDER' ? 'عامل' : 'إدارة'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 border-b">
                  <h4 className="font-medium">الإشعارات</h4>
                </div>
                <DropdownMenuItem className="text-sm">لا توجد إشعارات جديدة</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="قائمة المستخدم">
                  <Avatar className="h-10 w-10">
                    {session?.user?.avatar ? (
                      <AvatarImage src={session.user.avatar} alt={session.user.name} className="h-10 w-10 rounded-full" />
                    ) : (
                      <AvatarFallback className="h-10 w-10 rounded-full">{getInitials(session?.user?.name || 'م')}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1 border-b">
                  <p className="font-medium text-sm">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex w-full items-center gap-2">
                    <Settings className="h-4 w-4" />
                    الإعدادات
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  )
}