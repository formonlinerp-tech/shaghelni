'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useSession } from '@/hooks/use-session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, ClipboardList, Clock, CheckCircle, XCircle, DollarSign, Star, TrendingUp } from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

interface Request {
  id: string
  title: string
  category: string
  status: string
  budgetMin: number
  budgetMax: number
  createdAt: string
  offers: Array<{ id: string; price: number; status: string }>
  review?: { rating: number } | null
}

export default function ClientDashboardPage() {
  const { data: session, isLoading } = useSession()

  // Mock data - replace with actual fetch
  const mockRequests: Request[] = [
    {
      id: '1',
      title: 'تصليح مكيف سبليت',
      category: 'AC_REPAIR',
      status: 'OFFERS_RECEIVED',
      budgetMin: 25000,
      budgetMax: 40000,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      offers: [
        { id: '1', price: 30000, status: 'PENDING' },
        { id: '2', price: 35000, status: 'PENDING' },
      ],
    },
    {
      id: '2',
      title: 'سباكة الحمام',
      category: 'PLUMBER',
      status: 'ACCEPTED',
      budgetMin: 50000,
      budgetMax: 80000,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      offers: [
        { id: '3', price: 65000, status: 'ACCEPTED' },
      ],
    },
    {
      id: '3',
      title: 'صبغ غرفة النوم',
      category: 'PAINTING',
      status: 'COMPLETED',
      budgetMin: 100000,
      budgetMax: 150000,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      offers: [
        { id: '4', price: 120000, status: 'ACCEPTED' },
      ],
      review: { rating: 5 },
    },
  ]

  const stats = [
    { label: 'طلبات نشطة', value: mockRequests.filter(r => ['PENDING', 'OFFERS_RECEIVED', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status)).length, icon: ClipboardList, color: 'text-blue-600' },
    { label: 'مكتملة', value: mockRequests.filter(r => r.status === 'COMPLETED').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'بانتظار العروض', value: mockRequests.filter(r => r.status === 'OFFERS_RECEIVED').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'معدل التقييم', value: mockRequests.filter(r => r.review).length > 0
      ? (mockRequests.filter(r => r.review).reduce((sum, r) => sum + (r.review?.rating || 0), 0) / mockRequests.filter(r => r.review).length).toFixed(1)
      : '—', icon: Star, color: 'text-amber-600' },
  ]

  const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' }> = {
    PENDING: { label: 'بانتظار العروض', variant: 'warning' },
    OFFERS_RECEIVED: { label: 'عروض مستلمة', variant: 'info' },
    ACCEPTED: { label: 'تم قبول عرض', variant: 'success' },
    IN_PROGRESS: { label: 'قيد التنفيذ', variant: 'default' },
    COMPLETED: { label: 'مكتملة', variant: 'success' },
    CANCELLED: { label: 'ملغاة', variant: 'destructive' },
    DISPUTED: { label: 'نزاع', variant: 'destructive' },
  }

  const categoryLabels: Record<string, string> = {
    ELECTRICIAN: 'كهربائي',
    PLUMBER: 'سباك',
    AC_REPAIR: 'تصليح مكيف',
    WASHING_MACHINE_REPAIR: 'تصليح غسالة',
    PAINTING: 'صبغ',
    CARPENTRY: 'نجار',
    WELDING: 'حداد',
    MOVING: 'نقل',
    CLEANING: 'تنظيف',
    TUTORING: 'تدريس',
    DESIGN: 'تصميم',
    PROGRAMMING: 'برمجة',
    PHOTOGRAPHY: 'تصوير',
    MECHANIC: 'ميكانيكي',
    PHONE_REPAIR: 'تصليح موبايل',
    CAMERA_INSTALLATION: 'كاميرات',
    CONSTRUCTION_WORKER: 'بناء',
    CAR_MAINTENANCE: 'صيانة سيارة',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مرحباً، {session?.user?.name?.split(' ')[0] || 'زبون'}!</h1>
          <p className="text-muted-foreground">إليك ملخص طلباتك ونشاطك الأخير</p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button size="lg" className="gap-2">
            <PlusCircle className="h-5 w-5" />
            طلب خدمة جديد
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold {stat.color}">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 {stat.color}">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent requests */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-xl">أحدث الطلبات</CardTitle>
        <Link href="/dashboard/requests" className="text-sm text-primary hover:underline">
          عرض الكل
        </Link>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-right font-medium text-sm text-muted-foreground">الطلب</th>
              <th className="p-4 text-right font-medium text-sm text-muted-foreground">النوع</th>
              <th className="p-4 text-right font-medium text-sm text-muted-foreground">الميزانية</th>
              <th className="p-4 text-right font-medium text-sm text-muted-foreground">الحالة</th>
              <th className="p-4 text-right font-medium text-sm text-muted-foreground">العروض</th>
              <th className="p-4 text-right font-medium text-sm text-muted-foreground">الوقت</th>
              <th className="p-4 text-right font-medium text-sm text-muted-foreground">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockRequests.map(request => (
              <tr key={request.id} className="hover:bg-muted/30">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-sm text-muted-foreground">{formatRelativeTime(request.createdAt)}</p>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline">{categoryLabels[request.category] || request.category}</Badge>
                </td>
                <td className="p-4 text-sm">
                  {formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}
                </td>
                <td className="p-4">
                  <Badge variant={statusLabels[request.status]?.variant || 'default'}>
                    {statusLabels[request.status]?.label || request.status}
                  </Badge>
                </td>
                <td className="p-4 text-sm">
                  {request.offers.length} عرض
                  {request.offers.some(o => o.status === 'ACCEPTED') && (
                    <Badge variant="success" className="ml-2">مقبول</Badge>
                  )}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {formatRelativeTime(request.createdAt)}
                </td>
                <td className="p-4">
                  <Link
                    href={`/dashboard/requests/${request.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    عرض التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Link href="/dashboard/requests/new">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <PlusCircle className="h-8 w-8 mx-auto" />
              طلب خدمة جديدة
            </Button>
          </Link>
          <Link href="/dashboard/requests">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <ClipboardList className="h-8 w-8 mx-auto" />
              عرض جميع الطلبات
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Star className="h-8 w-8 mx-auto" />
              تقييماتي
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}