'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'react-hot-toast'
import { Loader2, User, Mail, Lock, Phone, Bell, Shield, Trash2, Eye, EyeOff } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function SettingsPage() {
  const { data: session, refresh } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'danger'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل التحديث')
      toast.success('تم تحديث الملف الشخصي')
      refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل تغيير كلمة المرور')
      toast.success('تم تغيير كلمة المرور بنجاح')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك.')) return
    if (!confirm('تأكيد نهائي: سيتم حذف حسابك وجميع طلباتك وتقييماتك ورسائلك بشكل دائم.')) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل حذف الحساب')
      toast.success('تم حذف الحساب')
      window.location.href = '/'
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة حسابك وتفضيلاتك</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.avatar || undefined} alt={session?.user?.name} />
              <AvatarFallback className="text-2xl">{getInitials(session?.user?.name || 'م')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{session?.user?.name}</h2>
              <p className="text-muted-foreground">{session?.user?.email}</p>
              <Badge variant="outline" className="mt-2">
                {session?.user?.role === 'CLIENT' ? 'زبون' : session?.user?.role === 'PROVIDER' ? 'عامل' : 'إدارة'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="danger">خطر</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
              <CardDescription>تحديث اسمك وبريدك الإلكتروني ورقم هاتفك</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    placeholder="07XX XXX XXXX"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={isLoading}
                  />
                  {!session?.user?.phoneVerified && (
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      <Phone className="mr-1 h-4 w-4" />
                      توثيق الرقم
                    </Button>
                  )}
                </div>
                <Button type="submit" loading={isLoading} className="w-full sm:w-auto">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  حفظ التغييرات
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>كلمة المرور</CardTitle>
              <CardDescription>تغيير كلمة المرور الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" loading={isLoading} className="w-full sm:w-auto">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  تغيير كلمة المرور
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Phone Verification */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                توثيق رقم الهاتف
              </CardTitle>
              <CardDescription>أضف طبقة أمان إضافية لحسابك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{session?.user?.phone || 'غير مضاف'}</p>
                  <p className="text-sm text-muted-foreground">
                    {session?.user?.phoneVerified ? 'موثق ✓' : 'غير موثق - اضغط لتوثيق'}
                  </p>
                </div>
                {!session?.user?.phoneVerified && (
                  <Button variant="outline" size="sm">
                    <Phone className="mr-1 h-4 w-4" />
                    أرسل رمز التحقق
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                تفضيلات الإشعارات
              </CardTitle>
              <CardDescription>اختر أنواع الإشعارات التي تريد تلقيها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'new_offers', label: 'عروض جديدة على طلباتي', default: true },
                { id: 'offer_accepted', label: 'قبول عروضي', default: true },
                { id: 'messages', label: 'رسائل جديدة', default: true },
                { id: 'reviews', label: 'تقييمات جديدة', default: true },
                { id: 'payments', label: 'المدفوعات والإيرادات', default: true },
                { id: 'system', label: 'إعلانات النظام', default: true },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">استلم إشعارات عند وجود {item.label.toLowerCase()}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                منطقة الخطر
              </CardTitle>
              <CardDescription>إجراءات لا يمكن التراجع عنها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                  <div>
                    <p className="font-medium text-destructive">حذف الحساب نهائياً</p>
                    <p className="text-sm text-muted-foreground">سيتم حذف جميع بياناتك وطلباتك وتقييماتك ورسائلك بشكل لا يمكن استعادته</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount} loading={isLoading}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    حذف الحساب
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}