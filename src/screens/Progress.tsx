import { useState } from 'react'
import { ArrowRight, ChevronRight, Puzzle, TrendingDown, TrendingUp } from 'lucide-react'
import { RECURRING, SUBJECTS, TOPICS, examScore, starsFor, topicMastery, type Subject, type TopicId } from '../data'
import { useStore } from '../store'
import { Button, Card, Chip, Empty, PageHeader, ProgressBar, SectionTitle, Stars, cx, formatDate, toneSolid } from '../components/ui'

export function Progress() {
  const { t, L, exams, quizzes, go, lang, allAttempts } = useStore()
  const subjects = (Object.keys(SUBJECTS) as Subject[]).filter((s) => exams.some((e) => e.subject === s))
  const [subject, setSubject] = useState<Subject>('math')
  const [topicFilter, setTopicFilter] = useState<TopicId | 'all'>('all')

  const list = exams.filter((e) => e.subject === subject && e.status === 'confirmed').sort((a, b) => a.date.localeCompare(b.date))
  const scores = list.map((e) => ({ e, ...examScore(e) }))
  const lastTwo = scores.slice(-2)
  const change = lastTwo.length === 2 ? lastTwo[1].pct - lastTwo[0].pct : null
  const tone = SUBJECTS[subject].tone

  const pending = quizzes.filter((q) => q.status !== 'done' && (topicFilter === 'all' || q.topic === topicFilter))
  const completed = allAttempts.filter((x) => topicFilter === 'all' || x.quiz.topic === topicFilter)
  const topicsUsed = Array.from(new Set(quizzes.map((q) => q.topic)))

  return (
    <div>
      <PageHeader title={t('progress.title')} subtitle={t('progress.subtitle')} speakText={`${t('progress.title')}. ${t('progress.subtitle')}`} />

      {/* Grades over time */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">{t('progress.grades')}</h2>
          <div role="tablist" className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={subject === s}
                onClick={() => setSubject(s)}
                className={cx('min-h-11 rounded-2xl px-4 font-display text-lg transition', subject === s ? `${toneSolid[SUBJECTS[s].tone]} text-white` : 'bg-cloud text-ink-soft hover:text-ink')}
              >
                {L(SUBJECTS[s].name)}
              </button>
            ))}
          </div>
        </div>

        {scores.length === 0 ? (
          <div className="mt-6">
            <Empty title={t('progress.noGrades')} />
          </div>
        ) : (
          <>
            {change !== null && (
              <p className={cx('mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold', change >= 0 ? 'bg-mint-100 text-mint-700' : 'bg-sun-100 text-sun-700')}>
                {change >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
                {change >= 0 ? t('progress.up', { n: change }) : t('progress.down')}
              </p>
            )}
            <div className="mt-6 flex h-64 items-end gap-4 border-b-2 border-ink/10 px-2 sm:gap-8">
              {scores.map(({ e, pct }) => (
                <button key={e.id} onClick={() => go({ name: 'results', examId: e.id })} className="group flex h-full flex-1 flex-col items-center justify-end gap-2" aria-label={`${L(e.title)}: ${pct}%`}>
                  <Stars n={starsFor(pct)} size="size-4" />
                  <span className="font-display text-xl font-semibold">{pct}%</span>
                  <span className={cx('w-full max-w-20 rounded-t-2xl transition group-hover:brightness-110', toneSolid[tone])} style={{ height: `${Math.max(8, pct * 0.62)}%` }} />
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-4 px-2 sm:gap-8">
              {scores.map(({ e }) => (
                <span key={e.id} className="flex-1 text-center text-sm font-bold text-ink-soft">
                  {formatDate(e.date, lang)}
                </span>
              ))}
            </div>
            <ul className="mt-6 divide-y divide-ink/5">
              {[...scores].reverse().map(({ e, pct, got, max }) => (
                <li key={e.id}>
                  <button onClick={() => go({ name: 'results', examId: e.id })} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-cloud">
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg">{L(e.title)}</span>
                      <span className="text-sm text-ink-soft">
                        {formatDate(e.date, lang, { day: 'numeric', month: 'long' })} · {got}/{max}
                      </span>
                    </span>
                    <span className="font-display text-xl font-semibold">{pct}%</span>
                    <ChevronRight className="size-5 text-ink-soft" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {/* Recurring mistakes */}
      <SectionTitle>{t('progress.recurring')}</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {RECURRING.map((r) => {
          const first = r.points[0].count
          const last = r.points[r.points.length - 1].count
          const better = last < first
          const maxC = Math.max(...r.points.map((p) => p.count))
          const quiz = quizzes.find((q) => q.topic === r.topic && q.status !== 'done') ?? quizzes.find((q) => q.topic === r.topic)
          return (
            <Card key={r.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <Chip tone="sun">{L(TOPICS[r.topic].name)}</Chip>
                <span className={cx('ml-auto flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold', better ? 'bg-mint-100 text-mint-700' : 'bg-sun-100 text-sun-700')}>
                  {better ? <TrendingDown className="size-4" /> : <ArrowRight className="size-4" />}
                  {better ? t('progress.lessOften') : t('progress.same')}
                </span>
              </div>
              <h3 className="mt-3 text-xl leading-snug">{L(r.title)}</h3>
              <div className="mt-4 space-y-2">
                {r.points.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-sm font-bold text-ink-soft">{L(p.label)}</span>
                    <div className="flex flex-1 gap-1">
                      {Array.from({ length: maxC }, (_, k) => (
                        <span key={k} className={cx('h-4 flex-1 rounded-md', k < p.count ? 'bg-coral-300' : 'bg-ink/5')} />
                      ))}
                    </div>
                    <span className="w-6 text-right font-display font-semibold">{p.count}×</span>
                  </div>
                ))}
              </div>
              {quiz && (
                <Button className="mt-5 self-start" variant="soft" size="md" icon={<Puzzle className="size-5" />} onClick={() => go({ name: 'quiz', quizId: quiz.id })}>
                  {t('progress.practiceIt')}
                </Button>
              )}
            </Card>
          )
        })}
      </div>

      {/* Topics */}
      <SectionTitle>{t('progress.topics')}</SectionTitle>
      <Card>
        <ul className="space-y-4">
          {(Object.keys(TOPICS) as TopicId[]).map((tp) => {
            const m = topicMastery(tp, quizzes)
            return (
              <li key={tp} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[200px_1fr_auto]">
                <span className="font-display text-lg">{L(TOPICS[tp].name)}</span>
                <span className="font-display text-lg font-semibold sm:order-last">{m}%</span>
                <ProgressBar value={m} tone={m >= 85 ? 'mint' : m >= 70 ? 'sun' : 'coral'} className="col-span-2 h-4 sm:col-span-1" label={L(TOPICS[tp].name)} />
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Quiz history */}
      <SectionTitle>{t('progress.quizHistory')}</SectionTitle>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t('progress.filterTopic')}>
        {(['all', ...topicsUsed] as const).map((tp) => (
          <button key={tp} onClick={() => setTopicFilter(tp)} aria-pressed={topicFilter === tp} className={cx('min-h-11 rounded-full px-4 font-bold transition', topicFilter === tp ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-soft hover:text-ink')}>
            {tp === 'all' ? t('all') : L(TOPICS[tp].name)}
          </button>
        ))}
      </div>
      <Card className="!p-3">
        <ul className="divide-y divide-ink/5">
          {pending.map((q) => (
            <li key={q.id} className="flex flex-wrap items-center gap-3 p-3">
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg">{L(q.title)}</span>
                <span className="text-sm text-ink-soft">{L(TOPICS[q.topic].name)}</span>
              </span>
              <Chip tone="sky">{t('progress.pending')}</Chip>
              <Button size="md" variant="sun" onClick={() => go({ name: 'quiz', quizId: q.id })}>
                {t('quiz.start')}
              </Button>
            </li>
          ))}
          {completed.map(({ quiz, attempt }) => {
            const pct = Math.round((attempt.score / attempt.questions.length) * 100)
            return (
              <li key={attempt.id} className="flex flex-wrap items-center gap-3 p-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg">{L(quiz.title)}</span>
                  <span className="text-sm text-ink-soft">
                    {L(TOPICS[quiz.topic].name)} · {formatDate(attempt.date, lang, { day: 'numeric', month: 'long' })}
                  </span>
                </span>
                <span className={cx('rounded-full px-3 py-1 font-display font-semibold', pct >= 80 ? 'bg-mint-100 text-mint-700' : pct >= 60 ? 'bg-sun-100 text-sun-700' : 'bg-coral-100 text-coral-700')}>
                  {attempt.score}/{attempt.questions.length}
                </span>
                <Button size="md" variant="white" onClick={() => go({ name: 'quiz', quizId: quiz.id, attemptId: attempt.id })}>
                  {t('progress.reopen')}
                </Button>
              </li>
            )
          })}
          {pending.length + completed.length === 0 && <li className="p-4 text-center text-ink-soft">{t('progress.noQuizzes')}</li>}
        </ul>
      </Card>
    </div>
  )
}
