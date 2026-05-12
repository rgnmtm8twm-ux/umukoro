import { AssessmentForm } from '@/components/admin/AssessmentForm'
import Link from 'next/link'

export default function NewAssessmentPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/admin/assessments"
          className="mb-3 flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#64748B]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Assessments
        </Link>
        <h1 className="text-xl font-semibold text-[#0F172A]">New Assessment</h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Set up the assessment details. You can add questions on the next step.
        </p>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <AssessmentForm />
      </div>
    </div>
  )
}
