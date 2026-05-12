'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { QuestionType, QuestionDifficulty, EducationLevel } from '@/types'

// ─────────────────────────────────────────────────────────────
// QUESTION ACTIONS
// ─────────────────────────────────────────────────────────────

export async function saveQuestion(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id            = formData.get('id') as string | null
  const submitType    = formData.get('submit_type') as string // 'draft' | 'submit'
  const questionType  = formData.get('type') as QuestionType

  // Parse options JSON (from hidden field)
  let options = null
  const optionsRaw = formData.get('options') as string | null
  if (optionsRaw) {
    try { options = JSON.parse(optionsRaw) } catch { options = null }
  }

  // Parse tags
  const tagsRaw = formData.get('tags') as string | null
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  const payload = {
    question_text:      (formData.get('question_text') as string).trim(),
    type:               questionType,
    difficulty:         (formData.get('difficulty') as QuestionDifficulty) || 'medium',
    marks:              parseInt(formData.get('marks') as string) || 1,
    options,
    correct_option:     (formData.get('correct_option') as string) || null,
    correct_answer:     (formData.get('correct_answer') as string)?.trim() || null,
    explanation:        (formData.get('explanation') as string)?.trim() || null,
    level:              (formData.get('level') as EducationLevel) || null,
    subject:            (formData.get('subject') as string) || null,
    language:           (formData.get('language') as string) || 'english',
    tags,
    source_resource_id: (formData.get('source_resource_id') as string) || null,
    created_by:         user.id,
    status:             submitType === 'submit' ? 'pending_review' : 'draft',
  }

  if (id) {
    const { error } = await db.from('questions').update(payload).eq('id', id).eq('created_by', user.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await db.from('questions').insert({ ...payload, order_index: 0 })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/questions')
  redirect('/admin/questions')
}

export async function publishQuestion(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = formData.get('id') as string
  await db.from('questions').update({ status: 'published' }).eq('id', id)
  revalidatePath('/admin/questions')
}

export async function rejectQuestion(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = formData.get('id') as string
  await db.from('questions').update({ status: 'rejected' }).eq('id', id)
  revalidatePath('/admin/questions')
}

export async function archiveQuestion(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('questions').update({ status: 'archived' }).eq('id', id)
  revalidatePath('/admin/questions')
}

export async function deleteQuestion(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('questions').delete().eq('id', id)
  revalidatePath('/admin/questions')
}

// ─────────────────────────────────────────────────────────────
// ASSESSMENT ACTIONS
// ─────────────────────────────────────────────────────────────

export async function saveAssessment(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id         = formData.get('id') as string | null
  const submitType = formData.get('submit_type') as string // 'draft' | 'publish'

  const payload = {
    title:             (formData.get('title') as string).trim(),
    description:       (formData.get('description') as string)?.trim() || null,
    instructions:      (formData.get('instructions') as string)?.trim() || null,
    level:             (formData.get('level') as string) || null,
    subject:           (formData.get('subject') as string) || null,
    combination:       (formData.get('combination') as string) || null,
    language:          (formData.get('language') as string) || 'english',
    duration_minutes:  formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes') as string) : null,
    pass_mark:         formData.get('pass_mark') ? parseInt(formData.get('pass_mark') as string) : null,
    shuffle_questions: formData.get('shuffle_questions') === 'true',
    show_results:      formData.get('show_results') !== 'false',
    allow_review:      formData.get('allow_review') !== 'false',
    max_attempts:      formData.get('max_attempts') ? parseInt(formData.get('max_attempts') as string) : null,
    created_by:        user.id,
    status:            submitType === 'publish' ? 'published' : 'draft',
    published_at:      submitType === 'publish' ? new Date().toISOString() : null,
  }

  let assessmentId = id
  if (id) {
    const { error } = await db.from('assessments').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await db.from('assessments').insert(payload).select('id').single()
    if (error) throw new Error(error.message)
    assessmentId = data.id
  }

  revalidatePath('/admin/assessments')
  redirect(`/admin/assessments/${assessmentId}/edit`)
}

export async function publishAssessment(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('assessments').update({
    status: 'published',
    published_at: new Date().toISOString(),
  }).eq('id', id)
  revalidatePath('/admin/assessments')
}

export async function archiveAssessment(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('assessments').update({ status: 'archived' }).eq('id', id)
  revalidatePath('/admin/assessments')
}

export async function deleteAssessment(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const id = formData.get('id') as string
  await db.from('assessments').delete().eq('id', id)
  revalidatePath('/admin/assessments')
  redirect('/admin/assessments')
}

// ─── Assessment questions (reorder / add / remove) ───────────

export async function addQuestionToAssessment(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const assessment_id = formData.get('assessment_id') as string
  const question_id   = formData.get('question_id') as string

  // Get current max order_index
  const { data: existing } = await db
    .from('assessment_questions')
    .select('order_index')
    .eq('assessment_id', assessment_id)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  await db.from('assessment_questions').insert({
    assessment_id,
    question_id,
    order_index: nextIndex,
  })

  revalidatePath(`/admin/assessments/${assessment_id}/edit`)
}

export async function removeQuestionFromAssessment(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const id            = formData.get('id') as string
  const assessment_id = formData.get('assessment_id') as string
  await db.from('assessment_questions').delete().eq('id', id)
  revalidatePath(`/admin/assessments/${assessment_id}/edit`)
}

export async function reorderAssessmentQuestions(
  assessmentId: string,
  orderedIds: string[] // assessment_question IDs in new order
) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await Promise.all(
    orderedIds.map((id, index) =>
      db.from('assessment_questions').update({ order_index: index }).eq('id', id)
    )
  )
  revalidatePath(`/admin/assessments/${assessmentId}/edit`)
}

// ─────────────────────────────────────────────────────────────
// ATTEMPT ACTIONS (student-facing)
// ─────────────────────────────────────────────────────────────

export async function startAttempt(formData: FormData) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const assessment_id = formData.get('assessment_id') as string

  // Check max_attempts
  const { data: assessment } = await db
    .from('assessments')
    .select('max_attempts')
    .eq('id', assessment_id)
    .single()

  if (assessment?.max_attempts) {
    const { count } = await db
      .from('attempts')
      .select('id', { count: 'exact', head: true })
      .eq('assessment_id', assessment_id)
      .eq('user_id', user.id)
      .eq('is_complete', true)

    if ((count ?? 0) >= assessment.max_attempts) {
      redirect(`/assessments/${assessment_id}?error=max_attempts`)
    }
  }

  const { data: attempt, error } = await db
    .from('attempts')
    .insert({
      assessment_id,
      user_id: user.id,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  redirect(`/attempts/${attempt.id}`)
}

export async function submitAttempt(attemptId: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error } = await db.rpc('submit_attempt', { p_attempt_id: attemptId })
  if (error) throw new Error(error.message)
  revalidatePath(`/attempts/${attemptId}`)
  return data
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedOption: string | null,
  answerText: string | null
) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.rpc('upsert_answer', {
    p_attempt_id:   attemptId,
    p_question_id:  questionId,
    p_selected_opt: selectedOption,
    p_answer_text:  answerText,
  })
}
