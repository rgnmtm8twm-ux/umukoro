import { QuestionForm } from '@/components/admin/QuestionForm'
import Link from 'next/link'

export default function NewQuestionPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/questions"
          className="mb-3 flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Question Bank
        </Link>
        <h1 className="text-xl font-semibold text-[#0F172A]">New Question</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Create a question for the bank. Save as draft to finish later, or submit for review.
        </p>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <QuestionForm />
      </div>
    </div>
  )
}
