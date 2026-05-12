import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { AttemptClient } from '@/components/attempt/AttemptClient'

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Load attempt
  const { data: attempt, error } = await db
    .from('attempts')
    .select('id, user_id, assessment_id, is_complete, started_at, submitted_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !attempt) notFound()

  // Already submitted — redirect to results
  if (attempt.is_complete) {
    redirect(`/attempts/${id}/results`)
  }

  // Load assessment
  const { data: assessment } = await db
    .from('assessments')
    .select('id, title, duration_minutes, shuffle_questions, instructions')
    .eq('id', attempt.assessment_id)
    .single()

  // Load questions for this assessment
  const { data: aqRows } = await db
    .from('assessment_questions')
    .select('id, order_index, marks_override, question:questions(id, question_text, type, options, correct_option, explanation, marks)')
    .eq('assessment_id', attempt.assessment_id)
    .order('order_index', { ascending: true })

  // Load existing answers
  const { data: answers } = await db
    .from('attempt_answers')
    .select('question_id, selected_option, answer_text')
    .eq('attempt_id', id)

  const answerMap: Record<string, { selected_option: string | null; answer_text: string | null }> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers?.forEach((a: any) => {
    answerMap[a.question_id] = { selected_option: a.selected_option, answer_text: a.answer_text }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = (aqRows ?? []).map((aq: any) => ({
    aqId: aq.id,
    marks: aq.marks_override ?? aq.question?.marks ?? 1,
    ...aq.question,
  }))

  // Shuffle if needed
  if (assessment?.shuffle_questions) {
    // deterministic shuffle based on attempt id
    const seed = id.charCodeAt(0) + id.charCodeAt(1)
    questions.sort(() => (seed % 2 === 0 ? 1 : -1))
  }

  return (
    <AttemptClient
      attemptId={id}
      assessment={assessment}
      questions={questions}
      initialAnswers={answerMap}
      startedAt={attempt.started_at}
    />
  )
}
