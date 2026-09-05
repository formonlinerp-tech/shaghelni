'use client'

export const dynamic = 'force-dynamic'

import { useSession } from '@/hooks/use-session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, ClipboardList, DollarSign, Star, TrendingUp, Users, Award, CreditCard, Settings } from 'lucide-react'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

interface Offer {
  id: string
  price: number
  status: string
  createdAt: string
  request: {
    id: string
    title: string
    category: string
    address: string
    lat: number
    lng: number
  }
}

export default function ProviderDashboardPage() {
  const { data: session, isLoading } = useSession()

  // Mock data
  const providerTier: 'FREE' | 'PRO' | 'BUSINESS' = 'FREE' // from session
  const mockOffers: Offer[] = [
    {
      id: '1',
      price: 30000,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      request: {
        id: 'req1',
        title: 'تصليح مكيف سبليت',
        category: 'AC_REPAIR',
        address: 'حي الواسطي، شارع 14 رمضان',
        lat: 35.4681,
        lng: 44.3922,
      },
    },
    {
      id: '2',
      price: 65000,
      status: 'ACCEPTED',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      request: {
        id: 'req2',
        title: 'سباكة الحمام الرئيسي',
        category: 'PLUMBER',
        address: 'حي المجرد، قرب السوق',
        lat: 35.4700,
        lng: 44.3950,
      },
    },
    {
      id: '3',
      price: 120000,
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      request: {
        id: 'req3',
        title: 'صبغ غرفتين وصالة',
        category: 'PAINTING',
        address: 'حي القادسية، شارع 20',
        lat: 35.4650,
        lng: 44.3880,
      },
    },
  ]

  const stats = [
    { label: 'طلبات قريبة', value: '12', icon: Building2, color: 'text-blue-600', desc: 'في منطقتك الآن' },
    { label: 'عروض معلقة', value: mockOffers.filter(o => o.status === 'PENDING').length.toString(), icon: ClipboardList, color: 'text-yellow-600', desc: 'بانتظار رد الزبون' },
    { label: 'مشاريع نشطة', value: mockOffers.filter(o => o.status === 'ACCEPTED').length.toString(), icon: TrendingUp, color: 'text-green-600', desc: 'قيد التنفيذ' },
    { label: 'مكتملة الشهر', value: mockOffers.filter(o => o.status === 'COMPLETED').length.toString(), icon: Star, color: 'text-amber-600', desc: 'هذا الشهر' },
  ]

  const tierLabels = { FREE: 'مجاني', PRO: 'احترافي', BUSINESS: 'أعمال' }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مرحباً، {session?.user?.name?.split(' ')[0] || 'عامل'}!</h1>
          <p className="text-muted-foreground">لوحة تحكم مقدم الخدمة - {tierLabels[providerTier as keyof typeof tierLabels]}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/provider/requests/nearby">
            <Button variant="outline" className="gap-2">
              <Building2 className="h-4 w-4" />
              طلبات قريبة
            </Button>
          </Link>
          <Link href="/provider/profile">
            <Button className="gap-2">
              <Settings className="h-4 w-4" />
              تعديل الملف
            </Button>
          </Link>
        </div>
      </div>

      {/* Tier badge */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="p-3 rounded-xl bg-primary/10">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-medium">اشتراكك الحالي: <span className="text-primary">{tierLabels[providerTier as keyof typeof tierLabels]}</span></p>
          <p className="text-sm text-muted-foreground">
            {tierLabels[providerTier as keyof typeof tierLabels] === 'مجاني' && 'عروض محدودة (5/شهر) - لا ظهور مميز'}
            {tierLabels[providerTier as keyof typeof tierLabels] === 'احترافي' && 'عروض غير محدودة - ظهور محسن - إحصائيات أساسية'}
            {tierLabels[providerTier as keyof typeof tierLabels] === 'أعمال' && 'عروض غير محدودة - ظهور مميز - شارة موثوق - طلبات مباشرة'}
          </p>
        </div>
        {tierLabels[providerTier as keyof typeof tierLabels] === 'مجاني' && (
          <Link href="/provider/subscription">
            <Button size="sm" className="ml-auto gap-2">
              <CreditCard className="h-4 w-4" />
              ترقية الآن
            </Button>
          </Link>
        )}
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
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 {stat.color}">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Offers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-xl">آخر عروضك</CardTitle>
        <Link href="/provider/offers" className="text-sm text-primary hover:underline">عرض الكل</Link>
      </div>

      <div className="space-y-4">
        {mockOffers.map(offer => (
          <Card key={offer.id} className={offer.status === 'ACCEPTED' ? 'ring-2 ring-green-500' : ''}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{offer.request.title}</h4>
                    <Badge variant="outline">{offer.request.category}</Badge>
                    <Badge variant={offer.status === 'ACCEPTED' ? 'success' : offer.status === 'PENDING' ? 'warning' : 'default'}>
                      {offer.status === 'ACCEPTED' ? 'مقبول' : offer.status === 'PENDING' ? 'معلق' : 'مكتمل'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{offer.request.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(offer.price)}</p>
                  <p className="text-sm text-muted-foreground">{formatRelativeTime(offer.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  {offer.status === 'PENDING' && (
                    <Button variant="outline" asChild>
                      <Link href={`/provider/offers/${offer.id}`}>عرض التفاصيل</Link>
                    </Button>
                  )}
                  {offer.status === 'ACCEPTED' && (
                    <Button asChild>
                      <Link href={`/dashboard/messages/${offer.request.id}`}>
                        تواصل مع الزبون
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Link href="/provider/requests/nearby">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Building2 className="h-8 w-8 mx-auto" />
              طلبات قريبة
            </Button>
          </Link>
          <Link href="/provider/offers">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <ClipboardList className="h-8 w-8 mx-auto" />
              عروضي
            </Button>
          </Link>
          <Link href="/provider/earnings">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <DollarSign className="h-8 w-8 mx-auto" />
              الأرباح
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}