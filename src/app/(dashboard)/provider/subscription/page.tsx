'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { Loader2, CreditCard, Check, Star, Shield, TrendingUp, Award, Lock, Users, BarChart, Zap, Crown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const TIERS = {
  FREE: {
    name: 'مجاني',
    price: 0,
    period: 'شهرياً',
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-muted',
    features: [
      { icon: Check, label: '5 عروض في الشهر', included: true },
      { icon: Check, label: 'ملف شخصي أساسي', included: true },
      { icon: Check, label: 'ظهور في البحث العادي', included: true },
      { icon: Lock, label: 'ظهور مميز في البحث', included: false },
      { icon: Star, label: 'شارة "PRO"', included: false },
      { icon: BarChart, label: 'إحصائيات أساسية', included: false },
      { icon: Shield, label: 'شارة موثوق', included: false },
      { icon: Users, label: 'طلبات مباشرة', included: false },
    ],
    cta: 'الخطة الحالية',
    popular: false,
  },
  PRO: {
    name: 'احترافي',
    price: 10000,
    period: 'شهرياً',
    color: 'text-primary',
    bg: 'bg-primary/5',
    border: 'border-primary',
    features: [
      { icon: Check, label: 'عروض غير محدودة', included: true },
      { icon: Check, label: 'ملف شخصي محسن', included: true },
      { icon: Zap, label: 'ظهور محسن في البحث (+20%)', included: true },
      { icon: Star, label: 'شارة "PRO" ذهبية', included: true },
      { icon: BarChart, label: 'إحصائيات مفصلة + تصدير', included: true },
      { icon: Lock, label: 'أولوية في الدعم', included: true },
      { icon: Shield, label: 'شارة موثوق', included: false },
      { icon: Users, label: 'طلبات مباشرة', included: false },
    ],
    cta: 'ترقية الآن',
    popular: true,
  },
  BUSINESS: {
    name: 'أعمال',
    price: 25000,
    period: 'شهرياً',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-500',
    features: [
      { icon: Check, label: 'عروض غير محدودة', included: true },
      { icon: Crown, label: 'ظهور في أعلى النتائج (+50%)', included: true },
      { icon: Star, label: 'شارة "BUSINESS" مميزة', included: true },
      { icon: Award, label: 'شارة "موثوق" معتمدة', included: true },
      { icon: BarChart, label: 'لوحة تحليلات متقدمة + API', included: true },
      { icon: Shield, label: 'دعم أولوي 24/7 واتساب', included: true },
      { icon: Users, label: 'استقبال طلبات مباشرة', included: true },
      { icon: TrendingUp, label: 'أدوات إدارة فريق/موظفين', included: true },
    ],
    cta: 'للشركات والورش',
    popular: false,
  },
}

export default function ProviderSubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<'FREE' | 'PRO' | 'BUSINESS'>('FREE')
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)

  const handleUpgrade = async (tier: 'PRO' | 'BUSINESS') => {
    setIsUpgrading(tier)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل الترقية')
      toast.success(`تم الترقية إلى ${TIERS[tier].name} بنجاح!`)
      setCurrentTier(tier)
      setIsUpgrading(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
      setIsUpgrading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الاشتراكات والترقيات</h1>
        <p className="text-muted-foreground">اختر الخطة المناسبة لحجم عملك وابدأ بالحصول على المزيد من الطلبات</p>
      </div>

      {/* Current Plan */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            خطتك الحالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">{TIERS[currentTier].name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentTier === 'FREE' ? 'خطة مجانية بقدرات محدودة' :
                   currentTier === 'PRO' ? 'خطة احترافية بعروض غير محدودة' :
                   'خطة أعمال بجميع المميزات'}
                </p>
              </div>
            </div>
            {currentTier !== 'BUSINESS' && (
              <Button variant="outline" size="sm" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>
                عرض الخطط المتاحة
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards */}
      <div id="plans" className="grid gap-6 md:grid-cols-3">
        {(Object.keys(TIERS) as Array<keyof typeof TIERS>).map(tier => {
          const plan = TIERS[tier]
          const isCurrent = tier === currentTier
          const isUpgrade = tier === 'PRO' || tier === 'BUSINESS'
          return (
            <Card
              key={tier}
              className={`relative ${plan.border} ${plan.bg} ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''} transition-all hover:shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="px-3 py-1 text-xs">
                    الأكثر شعبية
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto mb-3 p-3 rounded-2xl ${plan.bg} ${plan.border} w-16 h-16 flex items-center justify-center`}>
                  {tier === 'FREE' && <Users className="h-8 w-8" />}
                  {tier === 'PRO' && <Star className="h-8 w-8" />}
                  {tier === 'BUSINESS' && <Crown className="h-8 w-8" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold {plan.color}">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground ml-1">/ {plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2" role="list">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <feature.icon className={`h-4 w-4 ${feature.included ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span className={feature.included ? '' : 'text-muted-foreground line-through'}>{feature.label}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-4"
                  variant={isCurrent ? 'outline' : tier === 'PRO' ? 'default' : 'secondary'}
                  size="lg"
                  onClick={() => isUpgrade && !isCurrent && handleUpgrade(tier)}
                  disabled={isCurrent || isUpgrading === tier}
                  loading={isUpgrading === tier}
                >
                  {isCurrent ? 'الخطة الحالية' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>لماذا ترقي خطتك؟</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-4">
            <div className="mx-auto mb-3 p-3 rounded-xl bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">ظهور أكثر</h4>
            <p className="text-sm text-muted-foreground">خطط PRO و BUSINESS تظهر أولاً في نتائج البحث</p>
          </div>
          <div className="text-center p-4">
            <div className="mx-auto mb-3 p-3 rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">ثقة الزبائن</h4>
            <p className="text-sm text-muted-foreground">شارات PRO/BUSINESS/MOHTAQ تزيد معدل التحويل 40%</p>
          </div>
          <div className="text-center p-4">
            <div className="mx-auto mb-3 p-3 rounded-xl bg-primary/10">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">إحصائيات ذكية</h4>
            <p className="text-sm text-muted-foreground">تتبع أدائك، تعرف على أوقات الذروة، حسّن أسعارك</p>
          </div>
          <div className="text-center p-4">
            <div className="mx-auto mb-3 p-3 rounded-xl bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">دعم مميز</h4>
            <p className="text-sm text-muted-foreground">أولوية في الرد، مدير حساب مخصص لخطط BUSINESS</p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>أسئلة شائعة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { q: 'هل يمكنني إلغاء الاشتراك في أي وقت؟', a: 'نعم، يمكنك الإلغاء من إعدادات الحساب. ستبقى المميزات نشطة حتى نهاية الفترة المدفوعة.' },
            { q: 'ماذا يحدث لعروضي المعلقة عند إلغاء الاشتراك؟', a: 'عروضك المعلقة تبقى نشطة، لكنك لن تتمكن من إرسال عروض جديدة إذا تجاوزت حد الخطة المجانية (5/شهر).' },
            { q: 'هل يوجد تجربة مجانية للخطة PRO؟', a: 'حالياً لا توجد فترة تجريبية، لكن يمكنك البدء بالخطة المجانية والترقية 언제ما شئت.' },
            { q: 'كيف أدفع الاشتراك؟', a: 'حالياً ندعم الدفع عبر بوابات الدفع العراقية (آسيا حوالة، زين كاش) والبطاقات المصرفية.' },
          ].map((faq, i) => (
            <details key={i} className="group border rounded-lg p-4 bg-muted/30">
              <summary className="font-medium cursor-pointer flex items-center gap-2 list-none">
                <span>{faq.q}</span>
                <span className="ml-auto text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}