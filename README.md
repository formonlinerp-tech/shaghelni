# الشغّلني (Shaghelni) - منصة الخدمات المحلية في كركوك

منصة طلب الخدمات المحلية بنظام **طلب → عروض → اختيار**، مصممة للسوق العراقي مع تركيز على كركوك كمرحلة أولى.

## 🚀 المميزات الرئيسية

- **نظام العروض التنافسية**: الزبون يحدد الميزانية، العمال يرسلون عروضهم
- **البحث الذكي بالذكاء الاصطناعي**: تحليل اللهجة العراقية واقتراح نوع الخدمة
- **نظام الثقة والتقييمات**:Trust Score مبني على التقييمات، الإكمال، سرعة الرد، التوثيق
- **الاشتراكات المتدرجة**: Free / Pro (10,000 IQD) / Business (25,000 IQD)
- **عمولة 5%** على الطلبات المكتملة
- **توثيق الهاتف والهوية** للعمال الموثوقين
- **لوحة إدارة شاملة** للمستخدمين، الطلبات، المعاملات، التوثيقات

## 🛠 التقنيات المستخدمة

| المكون | التقنية |
|----------|---------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (Strict) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 5+ |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | JWT في HttpOnly Cookies |
| Validation | Zod |
| Forms | React Hook Form |
| AI | OpenAI GPT-4o-mini |
| Email | Resend |
| Deployment | Vercel |

## 📦 البدء السريع

### المتطلبات
- Node.js 18+
- PostgreSQL (محلي أو Neon)
- حساب OpenAI (اختياري للـ AI)

### التثبيت

```bash
# استنساخ المشروع
git clone <repo-url>
cd shaghelni

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env
# عدّل .env وأضف DATABASE_URL و JWT_SECRET وغيرها

# إعداد قاعدة البيانات
npm run db:generate
npm run db:push
npm run db:seed

# تشغيل خادم التطوير
npm run dev
```

الموقع سيعمل على `http://localhost:3000`

## 📁 هيكل المشروع

```
shaghelni/
├── prisma/
│   ├── schema.prisma      # مخطط قاعدة البيانات
│   └── seed.ts            # بيانات تجريبية
├── src/
│   ├── app/
│   │   ├── (auth)/        # صفحات التسجيل/الدخول
│   │   ├── (dashboard)/
│   │   │   ├── client/    # لوحة الزبون
│   │   │   ├── provider/  # لوحة العامل
│   │   │   └── admin/     # لوحة الإدارة
│   │   ├── api/           # API Routes
│   │   ├── globals.css    # الأنماط العامة
│   │   ├── layout.tsx     # التخطيط الجذر
│   │   └── page.tsx       # الصفحة الرئيسية
│   ├── components/
│   │   └── ui/            # مكونات shadcn/ui
│   ├── hooks/             # Custom React Hooks
│   ├── lib/
│   │   ├── auth.ts        # JWT، bcrypt، الجلسة
│   │   ├── prisma.ts      # Prisma Client
│   │   ├── utils.ts       # دوال مساعدة، Trust Score
│   │   └── validations.ts # Zod Schemas
│   ├── middleware.ts      # حماية المسارات
│   └── types/             # أنواع TypeScript
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 🔐 متغيرات البيئة

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Auth
JWT_SECRET="your-32-char-secret"
JWT_REFRESH_SECRET="your-32-char-refresh-secret"
OTP_SECRET="your-otp-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="شغّلني"

# AI (Optional)
OPENAI_API_KEY="sk-..."

# Email (Optional)
RESEND_API_KEY="re_..."

# File Upload (Optional)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## 🗄 أوامر Prisma المفيدة

```bash
# توليد Prisma Client
npm run db:generate

# دفع التغييرات لقاعدة البيانات (بدون migration)
npm run db:push

# إنشاء migration
npm run db:migrate

# فتح Prisma Studio
npm run db:studio

# تشغيل البيانات التجريبية
npm run db:seed
```

## 🚀 النشر على Vercel

1. ارفع الكود لـ GitHub
2. في Vercel: Import Project → اختر المستودع
3. أضف متغيرات البيئة في Settings → Environment Variables
3. Deploy!

قاعدة البيانات: استخدم **Neon** (PostgreSQL serverless) - يدعم branching و backups مجاناً.

## 📋 خارطة الطريق (MVP - 6 أسابيع)

- [x] الأسبوع 1: Setup، Prisma، Auth، Middleware
- [x] الأسبوع 2: طلبات الزبون، عروض، قبول
- [x] الأسبوع 3: ملف العامل، طلبات قريبة، إرسال عروض
- [x] الأسبوع 4: محادثة، تقييم، Trust Score، توثيق هاتف
- [ ] الأسبوع 5: لوحة الإدارة، اشتراكات، عمولات
- [ ] الأسبوع 6: Polish، RTL، Accessibility، Deploy

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ branch للميزة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 التواصل

- **الموقع**: https://shaghelni.com
- **البريد**: info@shaghelni.com
- **الهاتف**: +964 7XX XXX XXXX
- **الموقع**: كركوك، العراق

---

**تم التطوير بـ ❤️ لكركوك والعراق**