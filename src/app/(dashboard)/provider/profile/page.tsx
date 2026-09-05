'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { providerProfileSchema, type ProviderProfileInput, availabilitySchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { Loader2, MapPin, DollarSign, Clock, Image as ImageIcon, Shield, Check, Calendar, Trash2, Plus } from 'lucide-react'
import { SERVICE_CATEGORY_LABELS, KIRKUK_NEIGHBORHOODS } from '@/lib/utils'

const categories = Object.entries(SERVICE_CATEGORY_LABELS).map(([key, label]) => ({ key, label }))
const days = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
]

export default function ProviderProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [availabilities, setAvailabilities] = useState<Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>>([
    { dayOfWeek: 0, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '14:00', isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: false },
  ])

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ProviderProfileInput>({
    resolver: zodResolver(providerProfileSchema),
    defaultValues: {
      title: 'فني مكيفات وتبريد',
      bio: 'خبرة 10 سنوات في صيانة جميع أنواع المكيفات السبليت والشباك والمركزية. خدمة سريعة وأسعار تنافسية.',
      specialties: ['AC_REPAIR'],
      workAreas: ['الوَاسِطِي', 'المُجَرَّد'],
      priceRangeMin: 25000,
      priceRangeMax: 50000,
      portfolioImages: [],
    },
  })

  const onSubmit = async (data: ProviderProfileInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/provider/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل تحديث الملف')
      toast.success('تم تحديث الملف الشخصي بنجاح')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvailabilitySubmit = async (data: any) => {
    try {
      const res = await fetch('/api/provider/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل حفظ المواعيد')
      toast.success('تم حفظ مواعيد العمل')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    }
  }

  const addAvailability = () => {
    const newDay = days.find(d => !availabilities.some(a => a.dayOfWeek === d.value))
    if (newDay) {
      setAvailabilities([...availabilities, { dayOfWeek: newDay.value, startTime: '08:00', endTime: '18:00', isActive: true }])
    }
  }

  const updateAvailability = (index: number, field: string, value: any) => {
    setAvailabilities(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  const removeAvailability = (index: number) => {
    setAvailabilities(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        <p className="text-muted-foreground">أكمل معلوماتك ليجدك الزبائن بسهولة</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">معلومات أساسية</TabsTrigger>
          <TabsTrigger value="availability">مواعيد العمل</TabsTrigger>
          <TabsTrigger value="portfolio">أعمال سابقة</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  التخصصات ومناطق العمل
                </CardTitle>
                <CardDescription>اختر الخدمات التي تجيدها والأحياء التي تخدمها في كركوك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>المسمى الوظيفي <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="مثال: فني مكيفات وتبريد"
                    {...register('title')}
                  />
                  {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div>
                  <Label>نبذة عنك</Label>
                  <Textarea
                    rows={3}
                    placeholder="اكتب نبذة مختصرة عن خبرتك وخدماتك..."
                    {...register('bio')}
                  />
                </div>

<div>
                  <Label>التخصصات <span className="text-destructive">*</span></Label>
                  <Select 
                    // @ts-expect-error - multiple select returns string[]
                    onValueChange={(values: string[]) => setValue('specialties', values)} 
                    value={watch('specialties') as any} 
                    multiple
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تخصصاتك" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.key} value={cat.key}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialties && <p className="mt-1 text-sm text-destructive">{errors.specialties.message}</p>}
                </div>

<div>
                  <Label>مناطق العمل في كركوك <span className="text-destructive">*</span></Label>
                  <Select 
                    // @ts-expect-error - multiple select returns string[]
                    onValueChange={(values: string[]) => setValue('workAreas', values)} 
                    value={watch('workAreas') as any} 
                    multiple
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الأحياء التي تخدمها" />
                    </SelectTrigger>
                    <SelectContent>
                      {KIRKUK_NEIGHBORHOODS.map(n => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.workAreas && <p className="mt-1 text-sm text-destructive">{errors.workAreas.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  نطاق الأسعار
                </CardTitle>
                <CardDescription>حدد نطاق أسعارك التقريبية للخدمات الشائعة</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="priceRangeMin">أقل سعر (دينار)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="priceRangeMin"
                      type="number"
                      placeholder="25000"
                      className="pl-10"
                      {...register('priceRangeMin', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="priceRangeMax">أعلى سعر (دينار)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="priceRangeMax"
                      type="number"
                      placeholder="50000"
                      className="pl-10"
                      {...register('priceRangeMax', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" loading={isLoading} className="w-full sm:w-auto gap-2">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              حفظ التغييرات
            </Button>
          </form>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                مواعيد العمل الأسبوعية
              </CardTitle>
              <CardDescription>حدد الأيام والأوقات التي تكون متاحاً فيها لاستقبال الطلبات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availabilities.map((avail, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3 w-full sm:w-32">
                      <input
                        type="checkbox"
                        checked={avail.isActive}
                        onChange={e => updateAvailability(index, 'isActive', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label className="font-medium mb-0 w-auto">{days.find(d => d.value === avail.dayOfWeek)?.label}</Label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Label className="text-sm text-muted-foreground w-auto">من</Label>
                      <Input
                        type="time"
                        value={avail.startTime}
                        onChange={e => updateAvailability(index, 'startTime', e.target.value)}
                        className="w-32"
                      />
                      <Label className="text-sm text-muted-foreground w-auto">إلى</Label>
                      <Input
                        type="time"
                        value={avail.endTime}
                        onChange={e => updateAvailability(index, 'endTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAvailability(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {availabilities.length < 7 && (
                  <Button type="button" variant="outline" onClick={addAvailability} className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة يوم عمل
                  </Button>
                )}
                <div className="pt-4 border-t">
                  <Button type="button" onClick={() => handleAvailabilitySubmit(availabilities)} className="w-full sm:w-auto gap-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    حفظ جميع المواعيد
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                معرض الأعمال
              </CardTitle>
              <CardDescription>أضف صوراً لأعمالك السابقة لبناء ثقة الزبائن (حتى 10 صور)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">اسحب الصور هنا أو اضغط للاختيار</p>
                <p className="text-sm text-muted-foreground">JPG, PNG, WebP - حتى 5 ميجابايت للصورة</p>
                <Button type="button" variant="outline" className="mt-4">
                  <Plus className="mr-1 h-4 w-4" />
                  اختر الصور
                </Button>
              </div>
              <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-4">
                {/* Portfolio images would appear here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}