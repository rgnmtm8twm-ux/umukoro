'use client'

import { useState, useTransition } from 'react'
import { addQuestionToAssessment } from '@/actions/umukoro'
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_COLORS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  LEVEL_LABELS,
  type QuestionType,
  type QuestionDifficulty,
  type EducationLevel,
} from '@/types'

interface PickerQuestion {
  id: string
  question_text: string
  type: QuestionType
  difficulty: QuestionDifficulty
  marks: number
  level: EducationLevel | null
  subject: string | null
  tags: string[]
}

interface Props {
  assessmentId: string
  questions: PickerQuestion[]
}

export function QuestionPicker({ assessmentId, questions }: Props) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [adding, setAdding] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()

  const filtered = questions.filter((q) => {
    if (added.has(q.id)) return false
    if (typeFilter && q.type !== typeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        q.question_text.toLowerCase().includes(s) ||
        q.subject?.toLowerCase().includes(s) ||
        q.tags?.some((t) => t.toLowerCase().includes(s))
      )
    }
    return true
  })

  async function handleAdd(questionId: string) {
    setAdding(questionId)
    const fd = new FormData()
    fd.set('assessment_id', assessmentId)
    fd.set('question_id', questionId)
    startTransition(async () => {
      await addQuestionToAssessment(fd)
      setAdded((prev) => new Set([...prev, questionId]))
      setAdding(null)
    })
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F1F5F9] px-5 py-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="flex-1 min-w-[160px] rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs text-[#334155] outline-none focus:border-[#3457A6]"
        >
          <option value="">All types</option>
          {(Object.keys(QUESTION_TYPE_LABELS) as Array<keyof typeof QUESTION_TYPE_LABELS>).map((t) => (
            <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Question list */}
      {filtered.length > 0 ? (
        <div className="max-h-[500px] overflow-y-auto divide-y divide-[#F1F5F9]">
          {filtered.map((q) => (
            <div key={q.id} className="flex items-start gap-3 px-5 py-3 hover:bg-[#F8FAFC]">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm text-[#0F172A]">{q.question_text}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${QUESTION_TYPE_COLORS[q.type] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                    {QUESTION_TYPE_LABELS[q.type] ?? q.type}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFFICULTY_COLORS[q.difficulty] ?? ''}`}>
                    {DIFFICULTY_LABELS[q.difficulty] ?? q.difficulty}
                  </span>
                  <span className="text-[11px] font-semibold text-[#334155]">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                  {q.level && (
                    <span className="text-[11px] text-[#94A3B8]">
                      {LEVEL_LABELS[q.level] ?? q.level}
                      {q.subject ? ` · ${q.subject}` : ''}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={adding === q.id}
                onClick={() => handleAdd(q.id)}
                className="shrink-0 flex items-center gap-1 rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#3457A6] transition-colors hover:bg-[#DBEAFE] disabled:opacity-50"
              >
                {adding === q.id ? (
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                Add
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm text-[#334155]">
            {questions.length === 0 ? 'No published questions available.' : 'No questions match your filters.'}
          </p>
          {questions.length === 0 && (
            <a
              href="/admin/questions/new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#3457A6] hover:bg-[#EFF6FF]"
            >
              Create a question
            </a>
          )}
        </div>
      )}
    </div>
  )
}
