'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import {
  Users,
  Building2,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Shield,
  BarChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
} from 'lucide-react'

interface AdminStats {
  overview: {
    totalUsers: number
    totalClients: number
    totalProviders: number
    totalRequests: number
    totalOffers: number
    totalReviews: number
    totalTransactions: number
    monthlyRevenue: number
    monthlyRevenueGrowth: number
    pendingVerifications: number
    activeDisputes: number
  }
  requestsByStatus: Array<{ status: string; count: number }>
  requestsByCategory: Array<{ category: string; count: number }>
  providersByTier: Array<{ tier: string; count: number }>
}

const statusLabels: Record<string, string> = {
  PENDING: 'بانتظار',
  OFFERS_RECEIVED: 'عروض مستلمة',
  ACCEPTED: 'مقبول',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  DISPUTED: 'نزاع',
}

const tierLabels: Record<string, string> = {
  FREE: 'مجاني',
  PRO: 'احترافي',
  BUSINESS: 'أعمال',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const statCards = [
    { label: 'إجمالي المستخدمين', value: stats?.overview.totalUsers || 0, icon: Users, color: 'text-blue-600', trend: '+12%' },
    { label: 'الزبائن', value: stats?.overview.totalClients || 0, icon: Building2, color: 'text-green-600', trend: '+8%' },
    { label: 'مقدمي الخدمات', value: stats?.overview.totalProviders || 0, icon: Building2, color: 'text-purple-600', trend: '+5%' },
    { label: 'إجمالي الطلبات', value: stats?.overview.totalRequests || 0, icon: ClipboardList, color: 'text-orange-600', trend: '+15%' },
    { label: 'العروض المرسلة', value: stats?.overview.totalOffers || 0, icon: Activity, color: 'text-indigo-600', trend: '+20%' },
    { label: 'التقييمات', value: stats?.overview.totalReviews || 0, icon: Star, color: 'text-amber-600', trend: '+10%' },
    { label: 'الإيرادات هذا الشهر', value: formatCurrency(stats?.overview.monthlyRevenue || 0), icon: DollarSign, color: 'text-emerald-600', trend: `${(stats?.overview.monthlyRevenueGrowth ?? 0) >= 0 ? '+' : ''}${(stats?.overview.monthlyRevenueGrowth ?? 0).toFixed(1)}%` },
    { label: 'التوثيقات المعلقة', value: stats?.overview.pendingVerifications || 0, icon: Shield, color: 'text-red-600', trend: 'يتطلب إجراء' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i}><CardContent className="p-6 h-32 animate-pulse bg-muted/50" /></Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i}><CardContent className="p-6 h-48 animate-pulse bg-muted/50" /></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة تحكم الإدارة</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء المنصة وإحصائيات رئيسية</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold {stat.color}">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-medium {stat.trend.startsWith('+') ? 'text-green-600' : stat.trend.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'}">
                      {stat.trend.startsWith('+') && <ArrowUpRight className="h-3 w-3" />}
                      {stat.trend.startsWith('-') && <ArrowDownRight className="h-3 w-3" />}
                      {stat.trend === 'يتطلب إجراء' && <Shield className="h-3 w-3" />}
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 {stat.color}">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Requests by Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الطلبات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" style={{ height: '300px' }}>
              {stats?.requestsByStatus.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Badge variant="outline" className="w-32 text-right">{statusLabels[item.status] || item.status}</Badge>
                  <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: stats && stats.overview.totalRequests > 0 ? `${(item.count / stats.overview.totalRequests) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="font-medium w-16 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Providers by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>مقدمو الخدمات حسب الخطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" style={{ height: '300px' }}>
              {stats?.providersByTier.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Badge variant={item.tier === 'BUSINESS' ? 'default' : item.tier === 'PRO' ? 'secondary' : 'outline'} className="w-24">
                    {tierLabels[item.tier]}
                  </Badge>
                  <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: stats && stats.overview.totalProviders > 0 ? `${(item.count / stats.overview.totalProviders) * 100}%` : '0%',
                        backgroundColor: item.tier === 'BUSINESS' ? '#f59e0b' : item.tier === 'PRO' ? '#3b82f6' : '#6b7280'
                      }}
                    />
                  </div>
                  <span className="font-medium w-16 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requests by Category */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الطلبات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" style={{ height: '300px' }}>
              {stats?.requestsByCategory.slice(0, 10).map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-36 text-sm text-right truncate">{item.category}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: stats && stats.overview.totalRequests > 0 ? `${(item.count / stats.overview.totalRequests) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="font-medium w-16 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" asChild className="gap-2">
              <a href="/admin/users">إدارة المستخدمين</a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="/admin/providers">مقدمو الخدمات</a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="/admin/requests">جميع الطلبات</a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="/admin/verifications">التوثيقات المعلقة</a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="/admin/transactions">المعاملات المالية</a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="/admin/ads">الإعلانات</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

