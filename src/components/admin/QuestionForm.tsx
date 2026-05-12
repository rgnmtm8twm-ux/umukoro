'use client'

import { useState, useEffect } from 'react'
import { saveQuestion } from '@/actions/umukoro'
import {
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  LEVEL_LABELS,
  SUBJECTS_BY_LEVEL,
  TRUE_FALSE_OPTIONS,
  type Question,
  type QuestionType,
  type QuestionDifficulty,
  type EducationLevel,
  type QuestionOption,
} from '@/types'

interface Props {
  question?: Question
  sourceResourceId?: string
}

const QUESTION_TYPES: QuestionType[] = ['mcq', 'true_false', 'short', 'long', 'math', 'written']
const DIFFICULTIES: QuestionDifficulty[] = ['easy', 'medium', 'hard']
const LEVELS: EducationLevel[] = ['primary', 'o_level', 'a_level', 'tvet']
const LANGUAGES = ['english', 'french', 'kinyarwanda']

function genId() {
  return Math.random().toString(36).slice(2, 8)
}

export function QuestionForm({ question, sourceResourceId }: Props) {
  const [type, setType] = useState<QuestionType>(question?.type ?? 'mcq')
  const [level, setLevel] = useState<EducationLevel | ''>(question?.level ?? '')
  const [options, setOptions] = useState<QuestionOption[]>(
    question?.options ?? (type === 'true_false' ? TRUE_FALSE_OPTIONS : [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ])
  )
  const [correctOption, setCorrectOption] = useState<string>(question?.correct_option ?? '')
  const [tags, setTags] = useState<string>(question?.tags?.join(', ') ?? '')
  const [pending, setPending] = useState(false)

  const subjects = level ? SUBJECTS_BY_LEVEL[level] : []

  // When type changes, reset options
  useEffect(() => {
    if (type === 'true_false') {
      setOptions(TRUE_FALSE_OPTIONS)
      setCorrectOption('')
    } else if (type === 'mcq' && options === TRUE_FALSE_OPTIONS) {
      setOptions([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ])
      setCorrectOption('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  function addOption() {
    const labels = 'ABCDEFGHIJKLMNOP'
    const nextId = labels[options.length] ?? genId()
    setOptions([...options, { id: nextId, text: '' }])
  }

  function removeOption(id: string) {
    setOptions(options.filter((o) => o.id !== id))
    if (correctOption === id) setCorrectOption('')
  }

  function updateOptionText(id: string, text: string) {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)))
  }

  const isMCQ = type === 'mcq' || type === 'true_false'
  const isAutoMark = isMCQ
  const needsAnswer = type === 'short' || type === 'math'

  async function handleSubmit(formData: FormData) {
    setPending(true)
    // Inject computed fields
    if (isMCQ) {
      formData.set('options', JSON.stringify(options))
      formData.set('correct_option', correctOption)
    }
    formData.set('tags', tags)
    try {
      await saveQuestion(formData)
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {question?.id && <input type="hidden" name="id" value={question.id} />}
      {sourceResourceId && <input type="hidden" name="source_resource_id" value={sourceResourceId} />}

      {/* Question type */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Question type</label>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                type === t
                  ? 'border-[#3457A6] bg-[#EFF6FF] text-[#3457A6]'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:text-[#334155]'
              }`}
            >
              {QUESTION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {/* Question text */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
          Question <span className="text-red-500">*</span>
        </label>
        <textarea
          name="question_text"
          defaultValue={question?.question_text ?? ''}
          required
          rows={4}
          placeholder="Enter the full question text…"
          className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
        />
      </div>

      {/* MCQ / True-False options */}
      {isMCQ && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-[#334155]">
            Answer options
            {type === 'true_false' && <span className="ml-1 text-[#94A3B8]">(fixed)</span>}
          </label>
          <div className="space-y-2">
            {options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectOption(opt.id)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                    correctOption === opt.id
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-[#CBD5E1] text-[#94A3B8] hover:border-emerald-400'
                  }`}
                  title="Mark as correct"
                >
                  {opt.id}
                </button>
                {type === 'true_false' ? (
                  <span className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#334155]">
                    {opt.text}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                    placeholder={`Option ${opt.id}…`}
                    className="flex-1 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
                  />
                )}
                {type === 'mcq' && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="shrink-0 rounded p-1 text-[#CBD5E1] hover:bg-red-50 hover:text-red-400"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {type === 'mcq' && options.length < 8 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-1.5 text-xs text-[#94A3B8] hover:border-[#3457A6] hover:text-[#3457A6]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add option
            </button>
          )}
          {!correctOption && (
            <p className="mt-1.5 text-[11px] text-amber-600">
              ⚠ Click a letter to mark the correct answer
            </p>
          )}
        </div>
      )}

      {/* Correct answer (short / math) */}
      {needsAnswer && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
            Model answer / keywords
          </label>
          <input
            type="text"
            name="correct_answer"
            defaultValue={question?.correct_answer ?? ''}
            placeholder="Correct answer or keywords for auto-checking…"
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          />
        </div>
      )}

      {/* Explanation */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
          Explanation
          <span className="ml-1 font-normal text-[#94A3B8]">(shown after submission)</span>
        </label>
        <textarea
          name="explanation"
          defaultValue={question?.explanation ?? ''}
          rows={3}
          placeholder="Optional: explain the correct answer…"
          className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
        />
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Difficulty */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Difficulty</label>
          <select
            name="difficulty"
            defaultValue={question?.difficulty ?? 'medium'}
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>
        </div>

        {/* Marks */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Marks</label>
          <input
            type="number"
            name="marks"
            defaultValue={question?.marks ?? 1}
            min={1}
            max={100}
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          />
        </div>

        {/* Language */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Language</label>
          <select
            name="language"
            defaultValue={question?.language ?? 'english'}
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Level</label>
          <select
            name="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as EducationLevel | '')}
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          >
            <option value="">— Any —</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Subject</label>
        {level ? (
          <select
            name="subject"
            defaultValue={question?.subject ?? ''}
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          >
            <option value="">— Select subject —</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            name="subject"
            defaultValue={question?.subject ?? ''}
            placeholder="Select a level first, or type freely…"
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          />
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
          Tags
          <span className="ml-1 font-normal text-[#94A3B8]">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. algebra, equations, 2023…"
          className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
        />
      </div>

      {/* Marking note for manual types */}
      {!isAutoMark && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-700">
            <span className="font-semibold">{QUESTION_TYPE_LABELS[type]}</span> questions require manual marking by an assessor. Auto-scoring applies only to Multiple Choice and True/False.
          </p>
        </div>
      )}

      {/* Submit buttons */}
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-5">
        <a
          href="/admin/questions"
          className="rounded-lg px-4 py-2 text-sm text-[#64748B] hover:bg-[#F1F5F9]"
        >
          Cancel
        </a>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            name="submit_type"
            value="draft"
            disabled={pending}
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="submit_type"
            value="submit"
            disabled={pending}
            className="rounded-lg bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96] disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Submit for review'}
          </button>
        </div>
      </div>
    </form>
  )
}
