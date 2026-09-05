import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  { key: 'ELECTRICIAN', label: 'كهربائي', keywords: ['كهرباء', 'كهربائي', 'أسلاك', 'فيوز', 'مفتاح', 'قاطع', 'تمديد', 'لمبة', 'إضاءة', 'شورت'] },
  { key: 'PLUMBER', label: 'سباك', keywords: ['سباك', 'ماء', 'مجاري', 'تسريب', 'أنابيب', 'صنبور', 'خزان', 'مضخة', 'تصريف', 'بلاعة'] },
  { key: 'AC_REPAIR', label: 'تصليح مكيف', keywords: ['مكيف', 'تبريد', 'فريون', 'كومبريسور', 'سبليت', 'شباك', 'مركزي', 'تنظيف مكيف'] },
  { key: 'WASHING_MACHINE_REPAIR', label: 'تصليح غسالة', keywords: ['غسالة', 'ملابس', 'عصر', 'برنامج', 'طلمبة', 'حزام', 'موتور غسالة'] },
  { key: 'PAINTING', label: 'صبغ', keywords: ['صبغ', 'دهان', 'طلاء', 'جدران', 'سقف', 'لون', 'فرشاة', 'رولر', 'معجون'] },
  { key: 'CARPENTRY', label: 'نجار', keywords: ['نجار', 'خشب', 'باب', 'شباك', 'خزانة', 'سرير', 'مكتب', 'تفصيل', 'تجميع'] },
  { key: 'WELDING', label: 'حداد', keywords: ['حداد', 'لحام', 'حديد', 'بوابة', 'سياج', 'درابزين', 'معدن', 'ستانلس'] },
  { key: 'MOVING', label: 'نقل أثاث', keywords: ['نقل', 'أثاث', 'عفش', 'تحريك', 'شاحنة', 'كرتون', 'تغليف', 'تفكيك'] },
  { key: 'CLEANING', label: 'تنظيف', keywords: ['تنظيف', 'كنس', 'مسح', 'تعقيم', 'شركة تنظيف', 'منزل', 'شقة', 'مكتب'] },
  { key: 'TUTORING', label: 'مدرس خصوصي', keywords: ['مدرس', 'خصوصي', 'تدريس', 'شرح', 'مراجعة', 'امتحان', 'رياضيات', 'إنكليزي', 'فيزياء'] },
  { key: 'DESIGN', label: 'مصمم', keywords: ['تصميم', 'جرافيك', 'شعار', 'لوغو', 'بوستر', 'بروشور', 'سوشيال', 'إعلان'] },
  { key: 'PROGRAMMING', label: 'مبرمج', keywords: ['برمجة', 'موقع', 'تطبيق', 'كود', 'مطور', 'ويب', 'موبايل', 'قاعدة بيانات', 'API'] },
  { key: 'PHOTOGRAPHY', label: 'مصور', keywords: ['مصور', 'تصوير', 'كاميرا', 'فرح', 'زواج', 'منتج', 'بورتريه', 'فيديو'] },
  { key: 'MECHANIC', label: 'ميكانيكي', keywords: ['ميكانيكي', 'سيارة', 'محرك', 'قير', 'فرامل', 'تعليق', 'زيت', 'فلتر', 'صيانة'] },
  { key: 'PHONE_REPAIR', label: 'تصليح موبايل', keywords: ['موبايل', 'جوال', 'شاشة', 'بطارية', 'شحن', 'صوت', 'مايك', 'سوفت وير', 'فورمات'] },
  { key: 'CAMERA_INSTALLATION', label: 'تركيب كاميرات', keywords: ['كاميرا', 'مراقبة', 'DVR', 'NVR', 'أسلاك', 'شبكة', 'IP كاميرا', 'تركيب'] },
  { key: 'CONSTRUCTION_WORKER', label: 'عامل بناء', keywords: ['بناء', 'عامل', 'طابوق', 'أسمنت', 'خرسانة', 'لياسة', 'بلاط', 'مقاول'] },
  { key: 'CAR_MAINTENANCE', label: 'صيانة سيارات', keywords: ['صيانة', 'سيارة', 'سيرفس', 'زيت', 'فلتر', 'إطارات', 'بطارية', 'تكييف سيارة'] },
]

function classifyWithKeywords(text: string): { category: string; confidence: number } | null {
  const lowerText = text.toLowerCase()
  let bestMatch: { category: string; score: number } | null = null

  for (const cat of CATEGORIES) {
    let score = 0
    for (const keyword of cat.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += keyword.length // Longer keywords = higher score
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { category: cat.key, score }
    }
  }

  if (bestMatch) {
    return { category: bestMatch.category, confidence: Math.min(bestMatch.score / 50, 0.95) }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return NextResponse.json({ success: false, error: 'النص قصير جداً' }, { status: 400 })
    }

    // Try keyword-based classification first (fast, free)
    const keywordResult = classifyWithKeywords(text)

    if (keywordResult && keywordResult.confidence > 0.7) {
      return NextResponse.json({
        success: true,
        data: { category: keywordResult.category, method: 'keywords', confidence: keywordResult.confidence },
      })
    }

    // Fallback to OpenAI if available and keywords not confident
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = await import('openai')
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const prompt = `أنت مساعد يصنف طلبات الخدمات باللهجة العراقية. clasificá النص التالي إلى أحد هذه الفئات بالضبط:
${CATEGORIES.map(c => `${c.key}: ${c.label}`).join('\n')}

النص: "${text}"

أجب بتنسيق JSON فقط: {"category": "CATEGORY_KEY", "confidence": 0.9}`

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 50,
          response_format: { type: 'json_object' },
        })

        const result = JSON.parse(completion.choices[0].message.content || '{}')
        if (result.category && CATEGORIES.some(c => c.key === result.category)) {
          return NextResponse.json({
            success: true,
            data: { category: result.category, method: 'openai', confidence: result.confidence || 0.85 },
          })
        }
      } catch (aiError) {
        console.error('AI classification error:', aiError)
      }
    }

    // Return best keyword match even if low confidence
    if (keywordResult) {
      return NextResponse.json({
        success: true,
        data: { category: keywordResult.category, method: 'keywords', confidence: keywordResult.confidence },
      })
    }

    return NextResponse.json({
      success: false,
      error: 'تعذر تحديد نوع الخدمة. يرجى اختيار التصنيف يدوياً.',
    })
  } catch (error) {
    console.error('Classify error:', error)
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 })
  }
}