import { PrismaClient, UserRole, ProviderTier, ServiceCategory, VerificationStatus } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shaghelni.com' },
    update: {},
    create: {
      email: 'admin@shaghelni.com',
      name: 'مدير النظام',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      phoneVerified: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create test client
  const clientPassword = await hashPassword('client123')
  const client = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      name: 'أحمد الزبون',
      passwordHash: clientPassword,
      role: UserRole.CLIENT,
      phone: '+9647701234567',
      phoneVerified: true,
    },
  })
  await prisma.clientProfile.upsert({
    where: { userId: client.id },
    update: {},
    create: { userId: client.id, address: 'حي الواسطي، كركوك', lat: 35.4681, lng: 44.3922 },
  })
  console.log('✅ Test client created:', client.email)

  // Create test providers
  const providers = [
    {
      email: 'electrician@test.com',
      name: 'أحمد كهربائي',
      title: 'كهربائي منازل ومحلات',
      bio: 'خبرة 15 سنة في التمديدات الكهربائية، إصلاح الأعطال، تركيب الإضاءة، وفحص السلامة.',
      specialties: [ServiceCategory.ELECTRICIAN],
      workAreas: ['الوَاسِطِي', 'المُجَرَّد', 'الْعَرَبِي'],
      priceRangeMin: 15000,
      priceRangeMax: 50000,
      tier: ProviderTier.PRO,
    },
    {
      email: 'plumber@test.com',
      name: 'محمد سباك',
      title: 'سباك محترف - تمديدات وصيانة',
      bio: 'متخصص في تمديدات الماء والمجاري، إصلاح التسريبات، تركيب السخانات والخزانات.',
      specialties: [ServiceCategory.PLUMBER],
      workAreas: ['الْكُورْدِي', 'التُّرْكُمَانِي', 'الرَّحِيمَاوِي'],
      priceRangeMin: 20000,
      priceRangeMax: 60000,
      tier: ProviderTier.PRO,
    },
    {
      email: 'ac@test.com',
      name: 'علي مكيفات',
      title: 'فني مكيفات وتبريد مركزي',
      bio: 'صيانة جميع أنواع المكيفات (سبليت، شباك، مركزي)، تعبئة فريون، تنظيف، ضمان 6 أشهر.',
      specialties: [ServiceCategory.AC_REPAIR],
      workAreas: ['الْقَادِسِيَّة', 'الْأَنْصَار', 'الْحُرِّيَّة'],
      priceRangeMin: 25000,
      priceRangeMax: 80000,
      tier: ProviderTier.BUSINESS,
    },
    {
      email: 'carpenter@test.com',
      name: 'حسن نجار',
      title: 'نجار تفصيل أثاث وأبواب',
      bio: 'تفصيل غرف نوم، مطابخ، أبواب، نوافذ، مكاتب. خشب عالي الجودة وتصاميم عصرية.',
      specialties: [ServiceCategory.CARPENTRY],
      workAreas: ['الْعُرُوبَة', 'النِّصْر', 'الشَّهَادَة'],
      priceRangeMin: 50000,
      priceRangeMax: 300000,
      tier: ProviderTier.PRO,
    },
    {
      email: 'painter@test.com',
      name: 'كريم صباغ',
      title: 'صباغ محترف - داخلي وخارجي',
      bio: 'صبغ جدران، أسقف، واجهات خارجية. ألوان عالية الجودة، تقنيات حديثة، تنظيف بعد العمل.',
      specialties: [ServiceCategory.PAINTING],
      workAreas: ['الْيَرْمُوك', 'الْعَرُوس', 'الْوَحْدَة'],
      priceRangeMin: 30000,
      priceRangeMax: 150000,
      tier: ProviderTier.FREE,
    },
  ]

  for (const p of providers) {
    const password = await hashPassword('provider123')
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        name: p.name,
        passwordHash: password,
        role: UserRole.PROVIDER,
        phone: `+964770${Math.floor(1000000 + Math.random() * 9000000)}`,
        phoneVerified: true,
      },
    })

    const providerProfile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        title: p.title,
        bio: p.bio,
        specialties: p.specialties,
        workAreas: p.workAreas,
        priceRangeMin: p.priceRangeMin,
        priceRangeMax: p.priceRangeMax,
        portfolioImages: [],
        tier: p.tier,
        trustScore: 75 + Math.floor(Math.random() * 20),
        verification: VerificationStatus.PHONE_VERIFIED,
        ratingAvg: 4.0 + Math.random(),
        ratingCount: Math.floor(Math.random() * 20) + 5,
        completedJobs: Math.floor(Math.random() * 50) + 10,
        isActive: true,
      },
    })

    // Add availability
    for (let day = 0; day < 7; day++) {
      await prisma.availability.upsert({
        where: { providerId_dayOfWeek: { providerId: providerProfile.id, dayOfWeek: day } },
        update: {},
        create: {
          providerId: providerProfile.id,
          dayOfWeek: day,
          startTime: day < 5 ? '08:00' : '09:00',
          endTime: day < 5 ? '18:00' : '14:00',
          isActive: day < 6,
        },
      })
    }

    console.log(`✅ Provider created: ${p.name} (${p.email})`)
  }

  // Create sample requests
  const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: client.id } })
  if (clientProfile) {
    const sampleRequests = [
      {
        category: ServiceCategory.AC_REPAIR,
        title: 'تصليح مكيف سبليت لا يبرد',
        description: 'المكيف LG سبليت 18000 BTU يشتغل لكن ما يبرد، فيه صوت غريب من الوحدة الداخلية، عمر المكيف 3 سنوات.',
        images: [],
        budgetMin: 25000,
        budgetMax: 40000,
        urgency: 'NORMAL' as const,
        address: 'حي الواسطي، شارع 14 رمضان، قرب جامع الرحمن',
        lat: 35.4681,
        lng: 44.3922,
      },
      {
        category: ServiceCategory.PLUMBER,
        title: 'تسريب ماء في حمام الماستر',
        description: ' فيه تسريب تحت الحوض، الماء يتجمع على الأرض، شك إنه من التمديدات أو السيفون.',
        images: [],
        budgetMin: 15000,
        budgetMax: 30000,
        urgency: 'URGENT' as const,
        address: 'حي المجرد، قرب السوق الكبير',
        lat: 35.4700,
        lng: 44.3950,
      },
    ]

    for (const req of sampleRequests) {
      await prisma.serviceRequest.create({
        data: {
          clientId: clientProfile.id,
          ...req,
          status: 'OFFERS_RECEIVED',
        },
      })
    }
    console.log('✅ Sample requests created')
  }

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { key: 'platform_fee_percent' },
    update: {},
    create: { key: 'platform_fee_percent', value: 5, description: 'نسبة عمولة المنصة من كل طلب' },
  })

  await prisma.systemSettings.upsert({
    where: { key: 'max_free_offers_per_month' },
    update: {},
    create: { key: 'max_free_offers_per_month', value: 5, description: 'الحد الأقصى للعروض المجانية شهرياً' },
  })

  await prisma.systemSettings.upsert({
    where: { key: 'pro_subscription_price' },
    update: {},
    create: { key: 'pro_subscription_price', value: 10000, description: 'سعر اشتراك PRO الشهري بالدينار' },
  })

  await prisma.systemSettings.upsert({
    where: { key: 'business_subscription_price' },
    update: {},
    create: { key: 'business_subscription_price', value: 25000, description: 'سعر اشتراك BUSINESS الشهري بالدينار' },
  })

  console.log('✅ System settings created')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })