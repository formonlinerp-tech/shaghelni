'use client'

import dynamic from 'next/dynamic'

const NewRequestForm = dynamic(() => import('@/components/new-request-form'), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">طلب خدمة جديد</h1>
          <p className="text-muted-foreground">جاري تحميل النموذج...</p>
        </div>
      </div>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    </div>
  ),
})

export default function NewRequestPage() {
  return <NewRequestForm />
}