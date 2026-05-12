'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { saveAnswer, submitAttempt } from '@/actions/umukoro'
import { QUESTION_TYPE_LABELS, type QuestionType, type QuestionOption } from '@/types'

interface AttemptQuestion {
  id: string
  question_text: string
  type: QuestionType
  options: QuestionOption[] | null
  correct_option: string | null
  explanation: string | null
  marks: number
}

interface Props {
  attemptId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assessment: any
  questions: AttemptQuestion[]
  initialAnswers: Record<string, { selected_option: string | null; answer_text: string | null }>
  startedAt: string
}

export function AttemptClient({ attemptId, assessment, questions, initialAnswers, startedAt }: Props) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { selected_option: string | null; answer_text: string | null }>>(initialAnswers)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalQuestions = questions.length
  const question = questions[current]

  // Timer
  useEffect(() => {
    if (!assessment?.duration_minutes) return
    const startMs = new Date(startedAt).getTime()
    const durationMs = assessment.duration_minutes * 60 * 1000
    const remaining = durationMs - (Date.now() - startMs)
    if (remaining <= 0) {
      handleSubmit()
      return
    }
    setTimeLeft(Math.floor(remaining / 1000))
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const answeredCount = Object.values(answers).filter(
    (a) => a.selected_option || a.answer_text
  ).length

  // Debounced save
  const debouncedSave = useCallback((qId: string, selectedOpt: string | null, ansText: string | null) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      saveAnswer(attemptId, qId, selectedOpt, ansText)
    }, 800)
  }, [attemptId])

  function handleOptionSelect(questionId: string, optionId: string) {
    const updated = { ...answers, [questionId]: { selected_option: optionId, answer_text: null } }
    setAnswers(updated)
    debouncedSave(questionId, optionId, null)
  }

  function handleTextChange(questionId: string, text: string) {
    const updated = { ...answers, [questionId]: { selected_option: null, answer_text: text } }
    setAnswers(updated)
    debouncedSave(questionId, null, text)
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    // Flush any pending saves
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    const cur = answers
    for (const [qId, ans] of Object.entries(cur)) {
      await saveAnswer(attemptId, qId, ans.selected_option, ans.answer_text)
    }
    await submitAttempt(attemptId)
    window.location.href = `/attempts/${attemptId}/results`
  }

  function confirmSubmit() {
    const unanswered = totalQuestions - answeredCount
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}. Submit anyway?`)) return
    }
    handleSubmit()
  }

  if (!question) return null

  const currentAnswer = answers[question.id] ?? { selected_option: null, answer_text: null }
  const isAnswered = !!(currentAnswer.selected_option || currentAnswer.answer_text)

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="max-w-[200px] truncate text-sm font-semibold text-[#0F172A] sm:max-w-none">
            {assessment?.title}
          </h1>
          <span className="text-xs text-[#94A3B8]">
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>

        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
              timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-[#F1F5F9] text-[#334155]'
            }`}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            type="button"
            onClick={confirmSubmit}
            disabled={submitting}
            className="rounded-lg bg-[#3457A6] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2B4A96] disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#E2E8F0]">
        <div
          className="h-full bg-[#3457A6] transition-all"
          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 sm:p-6">
        {/* Question card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          {/* Question header */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#3457A6]">
                {current + 1}
              </span>
              <span className="text-xs text-[#94A3B8]">
                {QUESTION_TYPE_LABELS[question.type] ?? question.type} · {question.marks} mark{question.marks !== 1 ? 's' : ''}
              </span>
            </div>
            {isAnswered && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Answered
              </span>
            )}
          </div>

          <p className="mb-6 text-base font-medium text-[#0F172A] leading-relaxed whitespace-pre-wrap">
            {question.question_text}
          </p>

          {/* MCQ / True-False options */}
          {(question.type === 'mcq' || question.type === 'true_false') && question.options && (
            <div className="space-y-2">
              {question.options.map((opt) => {
                const selected = currentAnswer.selected_option === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleOptionSelect(question.id, opt.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all ${
                      selected
                        ? 'border-[#3457A6] bg-[#EFF6FF] text-[#3457A6]'
                        : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                      selected ? 'border-[#3457A6] bg-[#3457A6] text-white' : 'border-[#CBD5E1] text-[#94A3B8]'
                    }`}>
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Short answer */}
          {(question.type === 'short' || question.type === 'math') && (
            <input
              type="text"
              value={currentAnswer.answer_text ?? ''}
              onChange={(e) => handleTextChange(question.id, e.target.value)}
              placeholder="Type your answer…"
              className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
            />
          )}

          {/* Long / Written / Essay */}
          {(question.type === 'long' || question.type === 'written') && (
            <textarea
              value={currentAnswer.answer_text ?? ''}
              onChange={(e) => handleTextChange(question.id, e.target.value)}
              placeholder="Write your answer here…"
              rows={8}
              className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10 resize-y"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {current < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrent((p) => Math.min(totalQuestions - 1, p + 1))}
              className="flex items-center gap-1.5 rounded-xl bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96]"
            >
              Next
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={confirmSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitting ? 'Submitting…' : 'Finish & submit'}
            </button>
          )}
        </div>

        {/* Question dots navigator */}
        <div className="flex flex-wrap justify-center gap-1.5 pb-4">
          {questions.map((q, idx) => {
            const ans = answers[q.id]
            const done = !!(ans?.selected_option || ans?.answer_text)
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrent(idx)}
                title={`Question ${idx + 1}`}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  idx === current
                    ? 'bg-[#3457A6] text-white ring-2 ring-[#3457A6]/30'
                    : done
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#E2E8F0]'
                }`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
