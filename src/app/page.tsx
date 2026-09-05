import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  MapPin,
  Star,
  Shield,
  Clock,
  ArrowLeft,
  Users,
  CreditCard,
  Smartphone,
  Building2,
  Wrench,
  Home,
  Car,
  Camera,
  Laptop,
  Paintbrush,
  Hammer,
  Truck,
  Sparkles,
  Zap,
  Droplets,
  Wind,
  WashingMachine,
  Monitor,
  Camera as CameraIcon,
  CarFront,
  Building,
  Code,
  Palette,
  GraduationCap,
  Music,
  Briefcase,
} from 'lucide-react'
import { SERVICE_CATEGORY_LABELS, KIRKUK_NEIGHBORHOODS } from '@/lib/utils'

const CATEGORY_ICONS = {
  ELECTRICIAN: Zap,
  PLUMBER: Droplets,
  AC_REPAIR: Wind,
  WASHING_MACHINE_REPAIR: WashingMachine,
  PAINTING: Paintbrush,
  CARPENTRY: Hammer,
  WELDING: Wrench,
  MOVING: Truck,
  CLEANING: Home,
  TUTORING: GraduationCap,
  DESIGN: Palette,
  PROGRAMMING: Code,
  PHOTOGRAPHY: CameraIcon,
  MECHANIC: CarFront,
  PHONE_REPAIR: Smartphone,
  CAMERA_INSTALLATION: Camera,
  CONSTRUCTION_WORKER: Building,
  CAR_MAINTENANCE: Car,
} as const

const categories = Object.entries(SERVICE_CATEGORY_LABELS).map(([key, label]) => ({
  key,
  label,
  icon: CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS] || Wrench,
}))

const features = [
  { icon: Search, title: 'بحث ذكي', description: 'اكتب مشكلتك باللهجة العراقية والذكاء الاصطناعي يحدد الخدمة المطلوبة' },
  { icon: MapPin, title: 'قريب منك', description: 'اعرض مقدمي الخدمات في حيك ومسافة كل واحد بالكيلومتر' },
  { icon: CreditCard, title: 'عروض تنافسية', description: 'حدد ميزانيتك واستقبل عروض من عدة عمال واختر الأنسب' },
  { icon: Star, title: 'تقييمات حقيقية', description: 'شوف تقييمات العملاء السابقين ومعدل الثقة لكل عامل' },
  { icon: Shield, title: 'عمال موثوقين', description: 'توثيق رقم الهاتف والهوية وشارة "موثّق" للعمالة المضمونة' },
  { icon: Clock, title: 'وقت محدد', description: 'العامل يحدد وقت الوصول وتلتزم به أو تلغى الخدمة' },
]

const stats = [
  { value: '100+', label: 'مقدم خدمة نشط' },
  { value: '50+', label: 'حي في كركوك' },
  { value: '17', label: 'تصنيف خدمة' },
  { value: '4.8', label: 'متوسط التقييم' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="success" className="mb-6 inline-flex items-center gap-2 text-lg px-4 py-2">
              <Sparkles className="h-4 w-4" />
              متاح الآن في كركوك - إطلاق تجريبي
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
              اطلب خدمة، <span className="text-primary">قارن العروض</span>، واختر الأفضل
            </h1>
            <p className="mb-8 text-lg text-muted-foreground lg:text-xl max-w-2xl mx-auto">
              أول منصة عراقية بنظام <strong>طلب → عروض → اختيار</strong> للخدمات المحلية.
              لا دليل فقط، بل سوق حقيقي يربطك بعمالة كركوك الموثوقة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register?role=CLIENT">
                <Button size="xl" className="w-full sm:w-auto gap-2">
                  <Search className="h-5 w-5" />
                  اطلب خدمة الآن
                </Button>
              </Link>
              <Link href="/auth/register?role=PROVIDER">
                <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2">
                  <Users className="h-5 w-5" />
                  سجل كعامل
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mt-16 max-w-3xl mx-auto">
            <Card className="shadow-xl border-primary/20">
              <CardContent className="p-6">
                <form className="space-y-4" action="/dashboard/requests/new" method="GET">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <label htmlFor="category" className="block mb-2 text-sm font-medium">
                        نوع الخدمة
                      </label>
                      <select
                        id="category"
                        name="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">اختر الخدمة المطلوبة</option>
                        {categories.map(cat => (
                          <option key={cat.key} value={cat.key}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="neighborhood" className="block mb-2 text-sm font-medium">
                        الحي / المنطقة
                      </label>
                      <select
                        id="neighborhood"
                        name="neighborhood"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">اختر منطقتك</option>
                        {KIRKUK_NEIGHBORHOODS.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="budget" className="block mb-2 text-sm font-medium">
                        الميزانية التقريبية (دينار)
                      </label>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        placeholder="مثال: 30000"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="urgency" className="block mb-2 text-sm font-medium">
                        الأولوية
                      </label>
                      <select
                        id="urgency"
                        name="urgency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="NORMAL">اليوم</option>
                        <option value="URGENT">عاجل (خلال ساعة)</option>
                        <option value="FLEXIBLE">خلال أيام</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <Search className="mr-2 h-4 w-4" />
                    ابحث عن عمال متاحين
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">جميع الخدمات المتاحة</h2>
            <p className="mt-2 text-muted-foreground">أكثر من 17 تصنيف خدمة يغطي احتياجات منزلك وسيارتك وعملك</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                href={`/dashboard/requests/new?category=${key}`}
                className="group flex flex-col items-center gap-3 rounded-xl border p-6 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-sm font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">لماذا شغّلني؟</h2>
            <p className="mt-2 text-muted-foreground">مصممة للسوق العراقي بخصائص تفيدك أنت والعامل</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="h-full border-primary/10 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">كيف تعمل؟</h2>
            <p className="mt-2 text-muted-foreground">ثلاث خطوات بسيطة لتحصل على خدمتك</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">اطلب الخدمة</h3>
              <p className="text-muted-foreground">اختر نوع الخدمة، حدد الموقع، ارفع صورة، اكتب التفاصيل والميزانية</p>
            </div>
            <div className="relative text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">استقبل العروض</h3>
              <p className="text-muted-foreground">العمال القريبين يرسلون عروضهم مع السعر ووقت الوصول والتقييم</p>
            </div>
            <div className="relative text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">اختر وأنجز</h3>
              <p className="text-muted-foreground">اختر العرض الأنسب، تواصل مع العامل، أنجز العمل، ثم قيم الخدمة</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-4xl">
            جاهز تبدأ؟ سجل الآن مجاناً
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            لا رسوم تسجيل، لا عمولة على أول 5 طلبات. ابدأ بتقديم خدماتك أو اطلب خدمتك الأولى اليوم.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register?role=CLIENT">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto gap-2">
                <Search className="h-5 w-5" />
                أنا زبون - أطلب خدمة
              </Button>
            </Link>
            <Link href="/auth/register?role=PROVIDER">
              <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Users className="h-5 w-5" />
                أنا عامل - أقدم خدماتي
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="mb-4 font-semibold text-lg">شغّلني</h3>
              <p className="text-sm text-muted-foreground">
                منصة الخدمات المحلية الأولى في كركوك. نربط الزبائن بالعمالة الموثوقة بنظام عروض تنافسي شفاف.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-medium">للزبائن</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard/requests/new" className="hover:text-primary">طلب خدمة جديدة</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary">طلباتي</Link></li>
                <li><Link href="#" className="hover:text-primary">التقييمات</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-medium">للعمال</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/register?role=PROVIDER" className="hover:text-primary">تسجيل عامل</Link></li>
                <li><Link href="/provider/dashboard" className="hover:text-primary">لوحة التحكم</Link></li>
                <li><Link href="#" className="hover:text-primary">الاشتراكات</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-medium">تواصل معنا</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>كركوك، العراق</li>
                <li>info@shaghelni.com</li>
                <li>+964 7XX XXX XXXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 شغّلني. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  )
}