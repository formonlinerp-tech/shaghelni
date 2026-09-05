'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatCurrency, formatRelativeTime, haversineDistance } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  User,
  Shield,
  ArrowLeft,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react'
import { SERVICE_CATEGORY_LABELS, URGENCY_LABELS, PROVIDER_TIER_LABELS } from '@/lib/utils'

interface Offer {
  id: string
  price: number
  estimatedArrival: string
  message?: string
  status: string
  createdAt: string
  provider: {
    id: string
    title: string
    bio?: string
    ratingAvg: number
    trustScore: number
    verification: string
    portfolioImages: string[]
    tier: string
    user: { id: string; name: string; avatar?: string; phone?: string }
  }
}

interface RequestData {
  id: string
  title: string
  description: string
  images: string[]
  category: string
  budgetMin: number
  budgetMax: number
  urgency: string
  preferredAt?: string
  address: string
  lat: number
  lng: number
  status: string
  createdAt: string
  offers: Offer[]
  review?: { rating: number; comment?: string } | null
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' }> = {
  PENDING: { label: 'بانتظار العروض', variant: 'warning' },
  OFFERS_RECEIVED: { label: 'عروض مستلمة', variant: 'info' },
  ACCEPTED: { label: 'تم قبول عرض', variant: 'success' },
  IN_PROGRESS: { label: 'قيد التنفيذ', variant: 'default' },
  COMPLETED: { label: 'مكتملة', variant: 'success' },
  CANCELLED: { label: 'ملغاة', variant: 'destructive' },
  DISPUTED: { label: 'نزاع', variant: 'destructive' },
}

const offerStatusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  PENDING: { label: 'بانتظار', variant: 'warning' },
  ACCEPTED: { label: 'مقبول', variant: 'success' },
  REJECTED: { label: 'مرفوض', variant: 'destructive' },
  WITHDRAWN: { label: 'مسحوب', variant: 'default' },
}

export default function RequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string
  const [activeTab, setActiveTab] = useState<'offers' | 'chat' | 'details'>('offers')

  // Mock data - replace with actual fetch
  const mockRequest: RequestData = {
    id: requestId,
    title: 'تصليح مكيف سبليت لا يبرد',
    description: 'المكيف يشتغل لكن ما يبرد، فيه صوت غريب من الوحدة الداخلية، عمر المكيف 3 سنوات، نوع LG سبليت 18000 BTU',
    images: [],
    category: 'AC_REPAIR',
    budgetMin: 25000,
    budgetMax: 40000,
    urgency: 'NORMAL',
    preferredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    address: 'حي الواسطي، شارع 14 رمضان، قرب جامع الرحمن',
    lat: 35.4681,
    lng: 44.3922,
    status: 'OFFERS_RECEIVED',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    offers: [
      {
        id: '1',
        price: 30000,
        estimatedArrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        message: 'يمكنني الوصول خلال 3 ساعات، عندي خبرة 10 سنوات في مكيفات LG',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        provider: {
          id: 'prov1',
          title: 'فني مكيفات وتبريد',
          bio: 'خبرة 10 سنوات في صيانة جميع أنواع المكيفات',
          ratingAvg: 4.8,
          trustScore: 92,
          verification: 'PHONE_VERIFIED',
          portfolioImages: [],
          tier: 'PRO',
          user: { id: 'user1', name: 'أحمد محمد', avatar: undefined, phone: '07701234567' },
        },
      },
      {
        id: '2',
        price: 35000,
        estimatedArrival: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        message: 'متوفر اليوم، ضمان 6 أشهر على الإصلاح',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        provider: {
          id: 'prov2',
          title: 'خبير تبريد وتكييف',
          bio: 'متخصص في مكيفات السبليت والشباك',
          ratingAvg: 4.5,
          trustScore: 85,
          verification: 'PHONE_VERIFIED',
          portfolioImages: [],
          tier: 'FREE',
          user: { id: 'user2', name: 'علي حسن', avatar: undefined, phone: '07707654321' },
        },
      },
    ],
  }

  const request = mockRequest

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const res = await fetch(`/api/client/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل قبول العرض')
      toast.success('تم قبول العرض! سيتم إبلاغ العامل.')
      // Refresh page or update state
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const distance = haversineDistance(35.4681, 44.3922, request.lat, request.lng)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/requests" className="p-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <Badge variant={statusLabels[request.status]?.variant || 'default'}>
            {statusLabels[request.status]?.label || request.status}
          </Badge>
        </div>
      </div>

      {/* Request Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-base">
              {SERVICE_CATEGORY_LABELS[request.category] || request.category}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الميزانية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}</p>
            <p className="text-sm text-muted-foreground">دينار عراقي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الأولوية</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{URGENCY_LABELS[request.urgency] || request.urgency}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Details & Location */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              الموقع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{request.address}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>~{distance.toFixed(1)} كم من مركز المدينة</span>
            </div>
            {request.preferredAt && (
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <span>مفضل: {formatRelativeTime(request.preferredAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              وقت الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">تم الإنشاء: {formatRelativeTime(request.createdAt)}</p>
            <p className="text-muted-foreground">الحالة: {statusLabels[request.status]?.label}</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>وصف المشكلة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{request.description}</p>
        </CardContent>
      </Card>

      {/* Images */}
      {request.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الصور المرفقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {request.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt={`مرفق ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4" aria-label="أقسام الطلب">
          <button
            onClick={() => setActiveTab('offers')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'offers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            العروض ({request.offers.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="inline h-4 w-4 mr-1" /> محادثة
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            التفاصيل
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {request.offers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">لا توجد عروض بعد</h3>
                <p className="text-muted-foreground mt-1">العمال القريبون تلقوا إشعاراً وسي gửiون عروضهم قريباً</p>
              </CardContent>
            </Card>
          ) : (
            request.offers.map(offer => (
              <Card key={offer.id} className={offer.status === 'ACCEPTED' ? 'ring-2 ring-green-500' : ''}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Provider Info */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={offer.provider.user.avatar || undefined} alt={offer.provider.user.name} />
                        <AvatarFallback className="text-xl">{getInitials(offer.provider.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{offer.provider.user.name}</h4>
                          <Badge variant="outline">{PROVIDER_TIER_LABELS[offer.provider.tier] || offer.provider.tier}</Badge>
                          {offer.provider.verification === 'PHONE_VERIFIED' && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              موثق
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{offer.provider.title}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {offer.provider.ratingAvg.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5" />
                            ثقة: {offer.provider.trustScore.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Offer Details */}
                    <div className="flex flex-col lg:items-end lg:flex-1 gap-2 text-right">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(offer.price)}</div>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="inline h-3.5 w-3.5 mr-1" />
                        وصول خلال: {formatRelativeTime(offer.estimatedArrival)}
                      </p>
                      {offer.message && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{offer.message}</p>
                      )}

                      <Badge variant={offerStatusLabels[offer.status]?.variant || 'default'}>
                        {offerStatusLabels[offer.status]?.label || offer.status}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 lg:ml-8">
                      {offer.status === 'PENDING' && request.status === 'OFFERS_RECEIVED' && (
                        <Button onClick={() => handleAcceptOffer(offer.id)} className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          قبول هذا العرض
                        </Button>
                      )}
                      {offer.status === 'ACCEPTED' && (
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/messages/${request.id}`}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            تواصل مع العامل
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <Card>
          <CardHeader>
            <CardTitle>المحادثة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 border rounded-lg p-4 overflow-y-auto bg-muted/30">
              <p className="text-center text-muted-foreground">اختر عرضاً أولاً للبدء في المحادثة مع العامل</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'details' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">معرف الطلب:</span> <code>{request.id}</code></div>
              <div className="flex justify-between"><span className="text-muted-foreground">النوع:</span> <span>{SERVICE_CATEGORY_LABELS[request.category]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الميزانية:</span> <span>{formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)} د.ع</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الأولوية:</span> <span>{URGENCY_LABELS[request.urgency]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الحالة:</span> <span>{statusLabels[request.status]?.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">تاريخ الإنشاء:</span> <span>{formatRelativeTime(request.createdAt)}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.status === 'OFFERS_RECEIVED' && (
                <>
                  <p className="text-sm text-muted-foreground">بانتظار قبول أحد العروض أعلاه</p>
                </>
              )}
              {request.status === 'ACCEPTED' && (
                <Link href={`/dashboard/messages/${request.id}`}>
                  <Button className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    تواصل مع العامل المقبول
                  </Button>
                </Link>
              )}
              {request.status === 'COMPLETED' && !request.review && (
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href={`/dashboard/reviews/new?requestId=${request.id}`}>
                    <Star className="h-4 w-4" />
                    تقييم الخدمة
                  </Link>
                </Button>
              )}
              {request.status === 'COMPLETED' && request.review && (
                <Badge variant="success" className="w-full justify-center">تم التقييم: {request.review.rating} نجوم</Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}