'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createRequestSchema, type CreateRequestInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2, MapPin, DollarSign, Clock, Image as ImageIcon, ArrowLeft, Brain, Check } from 'lucide-react'
import { KIRKUK_NEIGHBORHOODS } from '@/lib/utils'
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_LABELS } from '@/lib/categories'
import Link from 'next/link'

export default function NewRequestForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      urgency: 'NORMAL',
      images: [],
    },
  })

  const description = watch('description')

  // AI Category suggestion
  const handleAiSuggest = async () => {
    if (!description || description.length < 10) {
      toast.error('اكتب وصفاً مفصلاً أولاً (10 أحرف على الأقل)')
      return
    }

    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description }),
      })
      const result = await res.json()
      if (result.success && result.data?.category) {
        setAiSuggestedCategory(result.data.category)
        setValue('category', result.data.category as any)
        toast.success(`الذكاء الاصطناعي يقترح: ${SERVICE_CATEGORY_LABELS[result.data.category]}`)
      }
    } catch {
      toast.error('فشل تحليل الطلب')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onSubmit = async (data: CreateRequestInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/client/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل إنشاء الطلب')
      toast.success('تم إنشاء الطلب بنجاح! العمال القريبين سيتلقون إشعاراً.')
      router.push(`/dashboard/requests/${result.data.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      const step1Fields = ['category', 'title', 'description', 'images']
      let valid = true
      step1Fields.forEach(field => {
        if (errors[field as keyof typeof errors]) valid = false
      })
      if (!valid) {
        toast.error('يرجى إكمال جميع الحقول المطلوبة')
        return
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">طلب خدمة جديد</h1>
          <p className="text-muted-foreground">املأ التفاصيل وسنجد لك أفضل العروض من عمال كركوك</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={3}>
        {[1, 2, 3].map(step => (
          <div key={step} className="flex flex-col items-center relative">
            <div className={`
              flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all
              ${step < currentStep ? 'bg-primary text-primary-foreground' : step === currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              {step < currentStep ? <Check className="h-5 w-5" /> : step}
            </div>
            <span className="mt-1 text-xs text-center w-24">
              {step === 1 && 'التفاصيل'}
              {step === 2 && 'الموقع والميزانية'}
              {step === 3 && 'مراجعة وإرسال'}
            </span>
            {step < 3 && (
              <div className={`
                absolute top-5 left-1/2 w-full h-1 -translate-x-1/2
                ${step < currentStep ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Service Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الخدمة</CardTitle>
              <CardDescription>أخبرنا ماذا تحتاج بدقة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">نوع الخدمة <span className="text-destructive">*</span></Label>
                <select
                  id="category"
                  onChange={(e) => setValue('category', e.target.value as any)}
                  value={watch('category') || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">اختر نوع الخدمة</option>
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
                {aiSuggestedCategory && (
                  <p className="mt-1 text-sm text-primary flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    مقترح من الذكاء الاصطناعي: {SERVICE_CATEGORY_LABELS[aiSuggestedCategory]}
                  </p>
                )}
                {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>}
              </div>

              <div>
                <Label htmlFor="title">عنوان الطلب <span className="text-destructive">*</span></Label>
                <input
                  id="title"
                  placeholder="مثال: تصليح مكيف سبليت لا يبرد"
                  {...register('title')}
                />
                {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">وصف المشكلة بالتفصيل <span className="text-destructive">*</span></Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="اكتب وصفاً مفصلاً للمشكلة... مثال: المكيف يشتغل لكن ما يبرد، فيه صوت غريب، عمر المكيف 3 سنوات"
                  {...register('description')}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">
                    {description.length}/2000 حرف
                  </p>
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={description.length < 10 || isAnalyzing}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="h-3 w-3" />
                    <span>تحليل بالذكاء الاصطناعي</span>
                    {isAnalyzing && <span className="animate-spin ml-1 h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />}
                  </button>
                </div>
                {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div>
                <Label>صور المرفقات (اختياري - حتى 5 صور)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">اضغط أو اسحب الصور هنا</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WebP - حتى 5 ميجابايت للصورة</p>
                  <input type="file" accept="image/*" multiple className="hidden" id="images" {...register('images')} />
                  <button type="button" className="mt-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10" onClick={() => document.getElementById('images')?.click()}>
                    اختر الصور
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location & Budget */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>الموقع والميزانية</CardTitle>
              <CardDescription>حدد مكان الخدمة وميزانيتك المتوقعة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="address">العنوان التفصيلي <span className="text-destructive">*</span></Label>
                  <input
                    id="address"
                    placeholder="مثال: حي الواسطي، شارع 14 رمضان، قرب جامع الرحمن"
                    {...register('address')}
                  />
                  {errors.address && <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>}
                </div>

                <div>
                  <Label htmlFor="neighborhood">الحي / المنطقة <span className="text-destructive">*</span></Label>
                  <select
                    id="neighborhood"
                    onChange={(e) => setValue('neighborhood', e.target.value)}
                    value={watch('neighborhood') || ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">اختر منطقتك</option>
                    {KIRKUK_NEIGHBORHOODS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {errors.neighborhood && <p className="mt-1 text-sm text-destructive">{errors.neighborhood.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="lat">خط العرض (GPS)</Label>
                  <input
                    id="lat"
                    type="number"
                    step="any"
                    placeholder="35.4681"
                    {...register('lat', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="lng">خط الطول (GPS)</Label>
                  <input
                    id="lng"
                    type="number"
                    step="any"
                    placeholder="44.3922"
                    {...register('lng', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label>استخدام موقعي الحالي</Label>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(pos => {
                          setValue('lat', pos.coords.latitude)
                          setValue('lng', pos.coords.longitude)
                          toast.success('تم الحصول على موقعك')
                        }, () => toast.error('تعذر الحصول على الموقع'))
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-1 inline" />
                    تحديد الموقع
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="budgetMin">أقل ميزانية (دينار) <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">د.ع</span>
                    <input
                      id="budgetMin"
                      type="number"
                      placeholder="25000"
                      className="pl-10"
                      {...register('budgetMin', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.budgetMin && <p className="mt-1 text-sm text-destructive">{errors.budgetMin.message}</p>}
                </div>

                <div>
                  <Label htmlFor="budgetMax">أعلى ميزانية (دينار) <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">د.ع</span>
                    <input
                      id="budgetMax"
                      type="number"
                      placeholder="40000"
                      className="pl-10"
                      {...register('budgetMax', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.budgetMax && <p className="mt-1 text-sm text-destructive">{errors.budgetMax.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="urgency">الأولوية <span className="text-destructive">*</span></Label>
                  <select
                    id="urgency"
                    onChange={(e) => setValue('urgency', e.target.value as any)}
                    value={watch('urgency') || ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="URGENT">عاجل (خلال ساعة)</option>
                    <option value="NORMAL">اليوم</option>
                    <option value="FLEXIBLE">خلال أيام</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="preferredAt">الوقت المفضل (اختياري)</Label>
                  <input
                    id="preferredAt"
                    type="datetime-local"
                    {...register('preferredAt')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>مراجعة وإرسال</CardTitle>
              <CardDescription>تأكد من البيانات ثم أرسل الطلب</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">تفاصيل الخدمة</h4>
                <dl className="grid gap-2 md:grid-cols-2 text-sm">
                  <div><dt className="text-muted-foreground">النوع:</dt> <dd className="font-medium">{SERVICE_CATEGORY_LABELS[watch('category') || '']}</dd></div>
                  <div><dt className="text-muted-foreground">العنوان:</dt> <dd className="font-medium">{watch('title')}</dd></div>
                  <div><dt className="text-muted-foreground">المنطقة:</dt> <dd className="font-medium">{watch('neighborhood')}</dd></div>
                  <div><dt className="text-muted-foreground">الميزانية:</dt> <dd className="font-medium">{watch('budgetMin')} - {watch('budgetMax')} دينار</dd></div>
                  <div><dt className="text-muted-foreground">الأولوية:</dt> <dd className="font-medium">{watch('urgency') === 'URGENT' ? 'عاجل' : watch('urgency') === 'NORMAL' ? 'اليوم' : 'مرن'}</dd></div>
                </dl>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>ملاحظة:</strong> بعد الإرسال، سيتلقى العمال المتاحون في منطقتك إشعاراً بطلبك.
                  ستتلقى عروضاً خلال دقائق. يمكنك مراجعة العروض واختيار الأنسب.
                </p>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={prevStep} className="flex-1 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10">
                  <ArrowLeft className="h-4 w-4 mr-1 inline" />
                  رجوع
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  إرسال الطلب
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons for steps 1 & 2 */}
        {(currentStep === 1 || currentStep === 2) && (
          <div className="flex gap-4 justify-end">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4 mr-1 inline" />
                رجوع
              </button>
            )}
            <button type="button" onClick={nextStep} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
              التالي
              {currentStep < 3 && <ArrowLeft className="h-4 w-4 ml-1 inline rotate-180" />}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}