'use client'

import { useState } from 'react'
import { saveAssessment } from '@/actions/umukoro'
import {
  LEVEL_LABELS,
  SUBJECTS_BY_LEVEL,
  type EducationLevel,
  type Assessment,
  A_LEVEL_COMBINATIONS,
} from '@/types'

interface Props {
  assessment?: Assessment
}

const LEVELS: EducationLevel[] = ['primary', 'o_level', 'a_level', 'tvet']
const LANGUAGES = ['english', 'french', 'kinyarwanda']

export function AssessmentForm({ assessment }: Props) {
  const [level, setLevel] = useState<EducationLevel | ''>(assessment?.level ?? '')
  const [pending, setPending] = useState(false)

  const subjects = level ? SUBJECTS_BY_LEVEL[level] : []

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await saveAssessment(formData)
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {assessment?.id && <input type="hidden" name="id" value={assessment.id} />}

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          defaultValue={assessment?.title ?? ''}
          required
          placeholder="e.g. O'Level Mathematics Paper 1 — 2024"
          className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Description</label>
        <textarea
          name="description"
          defaultValue={assessment?.description ?? ''}
          rows={2}
          placeholder="Brief overview shown to students before starting…"
          className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
        />
      </div>

      {/* Instructions */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Instructions</label>
        <textarea
          name="instructions"
          defaultValue={assessment?.instructions ?? ''}
          rows={3}
          placeholder="Instructions shown at the start of the assessment…"
          className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
        />
      </div>

      {/* Metadata row 1 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

        {/* Subject */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Subject</label>
          {level ? (
            <select
              name="subject"
              defaultValue={assessment?.subject ?? ''}
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
            >
              <option value="">— Select —</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="subject"
              defaultValue={assessment?.subject ?? ''}
              placeholder="e.g. Mathematics"
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
            />
          )}
        </div>

        {/* Language */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">Language</label>
          <select
            name="language"
            defaultValue={assessment?.language ?? 'english'}
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
            Duration
            <span className="ml-1 font-normal text-[#94A3B8]">(mins)</span>
          </label>
          <input
            type="number"
            name="duration_minutes"
            defaultValue={assessment?.duration_minutes ?? ''}
            min={1}
            max={480}
            placeholder="e.g. 60"
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          />
        </div>
      </div>

      {/* A-Level combination */}
      {level === 'a_level' && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">A-Level Combination</label>
          <select
            name="combination"
            defaultValue={assessment?.combination ?? ''}
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          >
            <option value="">— Any combination —</option>
            {A_LEVEL_COMBINATIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Metadata row 2 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Pass mark */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
            Pass mark
            <span className="ml-1 font-normal text-[#94A3B8]">(%)</span>
          </label>
          <input
            type="number"
            name="pass_mark"
            defaultValue={assessment?.pass_mark ?? ''}
            min={1}
            max={100}
            placeholder="e.g. 50"
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          />
        </div>

        {/* Max attempts */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#334155]">
            Max attempts
            <span className="ml-1 font-normal text-[#94A3B8]">(blank = unlimited)</span>
          </label>
          <input
            type="number"
            name="max_attempts"
            defaultValue={assessment?.max_attempts ?? ''}
            min={1}
            placeholder="Unlimited"
            className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#CBD5E1] focus:border-[#3457A6] focus:ring-2 focus:ring-[#3457A6]/10"
          />
        </div>
      </div>

      {/* Toggle settings */}
      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="mb-3 text-xs font-semibold text-[#334155]">Settings</p>
        <div className="space-y-3">
          {[
            { name: 'shuffle_questions', label: 'Shuffle question order', defaultChecked: assessment?.shuffle_questions ?? false },
            { name: 'show_results', label: 'Show results after submission', defaultChecked: assessment?.show_results ?? true },
            { name: 'allow_review', label: 'Allow answer review after submission', defaultChecked: assessment?.allow_review ?? true },
          ].map((toggle) => (
            <label key={toggle.name} className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  name={toggle.name}
                  value="true"
                  defaultChecked={toggle.defaultChecked}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full border border-[#E2E8F0] bg-white transition-colors peer-checked:border-[#3457A6] peer-checked:bg-[#3457A6]" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#CBD5E1] shadow transition-transform peer-checked:translate-x-4 peer-checked:bg-white" />
              </div>
              <span className="text-sm text-[#334155]">{toggle.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit buttons */}
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-5">
        <a
          href="/admin/assessments"
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
            value="publish"
            disabled={pending}
            className="rounded-lg bg-[#3457A6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A96] disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save & continue →'}
          </button>
        </div>
      </div>
    </form>
  )
}
