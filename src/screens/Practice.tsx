import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  Clock,
  Delete,
  Dices,
  Ear,
  Flag,
  HelpCircle,
  Home as HomeIcon,
  MousePointerClick,
  Puzzle,
  RotateCcw,
  SkipForward,
  Sparkles,
  X,
} from 'lucide-react'
import { TOPICS, TODAY, generateQuestions, isCorrect, newId, starsFor, type Attempt, type Quiz, type QuizQ, type Reason } from '../data'
import { useStore } from '../store'
import type { TKey } from '../i18n'
import { Mascot } from '../components/Mascot'
import { Button, Card, Chip, Empty, FractionBar, Modal, PageHeader, ProgressBar, SectionTitle, SpeakButton, Stars, cx, formatDate } from '../components/ui'

export function Practice() {
  const { t, L, quizzes, go, setQuizStatus } = useStore()
  const ready = quizzes.filter((q) => q.status === 'ready')
  const later = quizzes.filter((q) => q.status === 'later')
  const done = quizzes.filter((q) => q.status === 'done')

  return (
    <div>
      <PageHeader title={t('practice.title')} subtitle={t('practice.subtitle')} speakText={`${t('practice.title')}. ${t('practice.subtitle')}`} />

      <HowTo />

      <SectionTitle>{t('practice.ready')}</SectionTitle>
      {ready.length === 0 ? (
        <Empty title={t('practice.noneReady')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ready.map((q) => (
            <QuizCard key={q.id} quiz={q} onStart={() => go({ name: 'quiz', quizId: q.id })} onLater={() => setQuizStatus(q.id, 'later')} />
          ))}
        </div>
      )}

      {later.length > 0 && (
        <>
          <SectionTitle>{t('practice.savedLater')}</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {later.map((q) => (
              <QuizCard key={q.id} quiz={q} onStart={() => go({ name: 'quiz', quizId: q.id })} />
            ))}
          </div>
        </>
      )}

      <SectionTitle
        right={
          <button onClick={() => go({ name: 'progress' })} className="font-bold text-sky-700 hover:underline">
            {t('practice.history')}
          </button>
        }
      >
        {t('practice.again')}
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {done.map((q) => {
          const last = q.attempts[q.attempts.length - 1]
          const pct = last ? Math.round((last.score / last.questions.length) * 100) : 0
          return (
            <Card key={q.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-ink-soft">{L(TOPICS[q.topic].name)}</p>
                <h3 className="text-xl">{L(q.title)}</h3>
                {last && (
                  <p className="mt-1 flex items-center gap-2 text-ink-soft">
                    <Stars n={starsFor(pct)} size="size-5" /> {last.score}/{last.questions.length}
                  </p>
                )}
              </div>
              <Button variant="soft" size="md" icon={<RotateCcw className="size-5" />} onClick={() => go({ name: 'quiz', quizId: q.id })}>
                {t('quiz.tryAgain')}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function HowTo() {
  const { t } = useStore()
  const items: { icon: typeof Ear; key: TKey; bg: string }[] = [
    { icon: MousePointerClick, key: 'howto.1', bg: 'bg-sky-100 text-sky-600' },
    { icon: Ear, key: 'howto.2', bg: 'bg-sun-100 text-sun-700' },
    { icon: SkipForward, key: 'howto.3', bg: 'bg-grape-100 text-grape-600' },
    { icon: Sparkles, key: 'howto.4', bg: 'bg-mint-100 text-mint-700' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink/5">
          <span className={cx('grid size-11 shrink-0 place-items-center rounded-2xl', it.bg)}>
            <it.icon className="size-5" />
          </span>
          <span className="font-bold leading-tight">{t(it.key)}</span>
        </div>
      ))}
    </div>
  )
}

function QuizCard({ quiz, onStart, onLater }: { quiz: Quiz; onStart: () => void; onLater?: () => void }) {
  const { t, L } = useStore()
  return (
    <Card className={cx('relative overflow-hidden', quiz.followUp && 'ring-2 !ring-grape-400/40')}>
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-sun-100" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="sun" icon={<Puzzle className="size-4" />}>
            {L(TOPICS[quiz.topic].name)}
          </Chip>
          {quiz.followUp && <Chip tone="grape">{t('practice.nextPractice')}</Chip>}
          {quiz.isNew && <Chip tone="coral">{t('new')}</Chip>}
        </div>
        <h3 className="mt-3 text-2xl">{L(quiz.title)}</h3>
        <p className="text-ink-soft">{L(quiz.reason)}</p>
        <p className="mt-2 flex items-center gap-4 font-bold">
          <span>{t('quiz.nQuestions', { n: quiz.count })}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-4" /> {t('quiz.minutes', { n: quiz.minutes })}
          </span>
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="sun" onClick={onStart} iconRight={<ArrowRight className="size-5" />}>
            {t('quiz.start')}
          </Button>
          {onLater && (
            <Button variant="ghost" onClick={onLater}>
              {t('quiz.later')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ======================= Quiz runner ======================= */

type Phase = 'intro' | 'question' | 'review' | 'results' | 'reflect' | 'followup'

export function QuizScreen() {
  const { route, quizzes } = useStore()
  if (route.name !== 'quiz') return null
  const quiz = quizzes.find((q) => q.id === route.quizId)
  if (!quiz) return <Empty title="Quiz not found" />
  return <QuizRunner key={`${quiz.id}-${route.attemptId ?? ''}`} quiz={quiz} attemptId={route.attemptId} />
}

function QuizRunner({ quiz, attemptId }: { quiz: Quiz; attemptId?: string }) {
  const { t, L, go, saveAttempt, saveReflections } = useStore()
  const reopened = attemptId ? quiz.attempts.find((a) => a.id === attemptId) : undefined
  const [phase, setPhase] = useState<Phase>(reopened ? 'results' : 'intro')
  const [questions, setQuestions] = useState<QuizQ[]>([])
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [unsure, setUnsure] = useState<boolean[]>([])
  const [idx, setIdx] = useState(0)
  const [attempt, setAttempt] = useState<Attempt | undefined>(reopened)
  const [confirm, setConfirm] = useState(false)
  const [follow, setFollow] = useState<Quiz | undefined>()

  const start = () => {
    const qs = generateQuestions(quiz.topic, quiz.count, quiz.level)
    setQuestions(qs)
    setAnswers(qs.map(() => null))
    setUnsure(qs.map(() => false))
    setIdx(0)
    setAttempt(undefined)
    setPhase('question')
  }

  const submit = () => {
    const score = questions.reduce((s, q, i) => s + (isCorrect(q, answers[i]) ? 1 : 0), 0)
    const a: Attempt = { id: newId('a'), date: TODAY, questions, answers, unsure, score }
    saveAttempt(quiz.id, a)
    setAttempt(a)
    setConfirm(false)
    setPhase('results')
  }

  const exit = () => go({ name: 'practice' })

  if (phase === 'intro')
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={L(quiz.title)} subtitle={L(quiz.reason)} onBack={exit} />
        <Card className="text-center">
          <div className="flex justify-center">
            <Mascot size={130} mood="happy" />
          </div>
          <h2 className="mt-3 text-3xl">{t('quiz.introTitle')}</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Chip tone="sun" className="!text-base">
              {L(TOPICS[quiz.topic].name)}
            </Chip>
            <Chip tone="sky" className="!text-base">
              {t('quiz.nQuestions', { n: quiz.count })}
            </Chip>
            <Chip tone="mint" className="!text-base" icon={<Clock className="size-4" />}>
              {t('quiz.minutes', { n: quiz.minutes })}
            </Chip>
          </div>
          <p className="mx-auto mt-5 max-w-md text-lg text-ink-soft">{t('quiz.introBody')}</p>
          <p className="mx-auto mt-2 max-w-md text-sm font-bold text-grape-600">{t('quiz.separate')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="xl" variant="sun" onClick={start} iconRight={<ArrowRight className="size-6" />}>
              {t('quiz.letsGo')}
            </Button>
          </div>
        </Card>
      </div>
    )

  if (phase === 'question') {
    const q = questions[idx]
    const ans = answers[idx]
    const setAns = (v: string | null) => setAnswers((a) => a.map((x, i) => (i === idx ? v : x)))
    const last = idx === questions.length - 1
    const goNext = () => (last ? setPhase('review') : setIdx(idx + 1))
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-4">
          <button onClick={exit} aria-label={t('quiz.exit')} className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white shadow-soft">
            <X className="size-6" />
          </button>
          <div className="flex-1">
            <div className="mb-1.5 flex justify-between font-bold">
              <span>{t('quiz.qOf', { n: idx + 1, total: questions.length })}</span>
              <span className="text-ink-soft">{L(quiz.title)}</span>
            </div>
            <ProgressBar value={idx + 1} max={questions.length} tone="sun" className="h-4" />
          </div>
        </div>
        <div className="mb-4 flex justify-center gap-2" aria-hidden>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              tabIndex={-1}
              className={cx('h-3 rounded-full transition-all', i === idx ? 'w-8 bg-sun-400' : answers[i] != null ? 'w-3 bg-mint-400' : 'w-3 bg-ink/15')}
            />
          ))}
        </div>

        <Card key={q.id} className="animate-rise">
          <div className="flex items-start gap-3">
            <h2 className="flex-1 text-3xl leading-snug sm:text-4xl">{L(q.prompt)}</h2>
            <SpeakButton text={L(q.prompt)} />
          </div>

          {q.bars && (
            <div className="mt-5 space-y-3 rounded-3xl bg-cloud p-4">
              <FractionBar n={q.bars.a[0]} d={q.bars.a[1]} tone="sky" label={false} />
              <FractionBar n={q.bars.b[0]} d={q.bars.b[1]} tone="grape" label={false} />
            </div>
          )}

          {q.kind === 'choice' ? (
            <div className={cx('mt-6 grid gap-3', (q.options?.length ?? 0) > 2 ? 'sm:grid-cols-3' : 'grid-cols-2')}>
              {q.options?.map((o, i) => {
                const sel = ans === o
                const tones = ['sky', 'grape', 'mint']
                return (
                  <button
                    key={o}
                    onClick={() => setAns(o)}
                    aria-pressed={sel}
                    className={cx(
                      'flex min-h-24 items-center justify-center gap-3 rounded-3xl p-4 font-display text-4xl font-semibold ring-[3px] transition active:scale-[0.98]',
                      sel ? 'bg-sun-100 ring-sun-400 shadow-[0_5px_0_0_var(--color-sun-500)]' : 'bg-white ring-ink/10 shadow-[0_5px_0_0_rgba(36,48,77,0.1)] hover:ring-sky-300',
                    )}
                  >
                    {q.bars && <span className={cx('size-4 rounded-full', tones[i] === 'sky' ? 'bg-sky-500' : 'bg-grape-400')} />}
                    {o}
                    {sel && <Check className="size-7 text-sun-700" strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          ) : (
            <NumPad value={ans ?? ''} onChange={(v) => setAns(v || null)} fraction={q.kind === 'fraction'} />
          )}

          <label className={cx('mt-6 flex w-fit cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 font-bold ring-2 transition', unsure[idx] ? 'bg-grape-100 text-grape-600 ring-grape-400' : 'ring-ink/10')}>
            <input type="checkbox" className="size-5 accent-[var(--color-grape-600)]" checked={unsure[idx]} onChange={(e) => setUnsure((u) => u.map((x, i) => (i === idx ? e.target.checked : x)))} />
            <HelpCircle className="size-5" /> {t('quiz.notSure')}
          </label>
        </Card>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Button variant="white" disabled={idx === 0} onClick={() => setIdx(idx - 1)} icon={<ArrowLeft className="size-5" />}>
            {t('back')}
          </Button>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setAns(null)
                goNext()
              }}
              icon={<SkipForward className="size-5" />}
            >
              {t('quiz.skip')}
            </Button>
            <Button variant="primary" disabled={ans == null} onClick={goNext} iconRight={<ArrowRight className="size-5" />}>
              {last ? t('quiz.toReview') : t('next')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'review') {
    const skipped = answers.filter((a) => a == null).length
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title={t('quiz.reviewTitle')} subtitle={t('quiz.reviewSub')} onBack={() => setPhase('question')} />
        {skipped > 0 && (
          <div role="alert" className="mb-4 flex items-center gap-3 rounded-2xl bg-sun-100 p-4 font-bold text-sun-700">
            <AlertTriangle className="size-6 shrink-0" /> {t('quiz.skippedWarn', { n: skipped })}
          </div>
        )}
        <Card className="!p-3">
          <ul className="divide-y divide-ink/5">
            {questions.map((q, i) => {
              const a = answers[i]
              return (
                <li key={q.id}>
                  <button
                    onClick={() => {
                      setIdx(i)
                      setPhase('question')
                    }}
                    className="flex w-full items-center gap-4 rounded-2xl p-3 text-left hover:bg-cloud"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cloud font-display text-lg font-semibold">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg">{L(q.prompt)}</span>
                      <span className="font-display text-xl font-semibold text-sky-700">{a ?? '–'}</span>
                    </span>
                    {a == null ? <Chip tone="sun">{t('quiz.skipped')}</Chip> : unsure[i] ? <Chip tone="grape">{t('quiz.unsure')}</Chip> : <Chip tone="mint">{t('quiz.answered')}</Chip>}
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
        <div className="mt-5 flex justify-end">
          <Button variant="mint" size="xl" onClick={() => setConfirm(true)} icon={<Flag className="size-6" />}>
            {t('quiz.submit')}
          </Button>
        </div>
        <Modal
          open={confirm}
          onClose={() => setConfirm(false)}
          title={t('quiz.confirmTitle')}
          tone={skipped ? 'sun' : 'mint'}
          actions={
            <>
              <Button variant="white" onClick={() => setConfirm(false)}>
                {t('quiz.keepWorking')}
              </Button>
              <Button variant="mint" onClick={submit}>
                {t('quiz.yesSubmit')}
              </Button>
            </>
          }
        >
          {skipped ? t('quiz.confirmSkipped', { n: skipped }) : t('quiz.confirmBody')}
        </Modal>
      </div>
    )
  }

  if (phase === 'reflect' && attempt)
    return (
      <Reflection
        quiz={quiz}
        attempt={attempt}
        onBack={() => setPhase('results')}
        onDone={(refl, notes) => {
          setFollow(saveReflections(quiz.id, attempt.id, refl, notes))
          setPhase('followup')
        }}
      />
    )

  if (phase === 'followup')
    return (
      <div className="mx-auto max-w-2xl pt-4 text-center">
        <div className="flex justify-center">
          <Mascot size={150} mood="cheer" />
        </div>
        <h1 className="mt-3 text-4xl">{t('reflect.thanks')}</h1>
        <p className="mt-2 text-xl text-ink-soft">{t('reflect.thanksBody')}</p>
        {follow && (
          <div className="mt-8 text-left">
            <QuizCard quiz={follow} onStart={() => go({ name: 'quiz', quizId: follow.id })} />
          </div>
        )}
        <Button className="mt-6" variant="white" icon={<HomeIcon className="size-5" />} onClick={() => go({ name: 'home' })}>
          {t('backHome')}
        </Button>
      </div>
    )

  if (attempt) return <QuizResults quiz={quiz} attempt={attempt} reopened={!!reopened} onRetry={start} onReflect={() => setPhase('reflect')} />
  return null
}

function NumPad({ value, onChange, fraction }: { value: string; onChange: (v: string) => void; fraction: boolean }) {
  const { t } = useStore()
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', fraction ? '/' : '', '0', 'del']
  const press = (k: string) => {
    if (k === 'del') onChange(value.slice(0, -1))
    else if (k === '/' && (value.includes('/') || !value)) return
    else if (value.length < 6) onChange(value + k)
  }
  return (
    <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
      <div className="w-full max-w-60">
        <label className="mb-2 block text-sm font-extrabold uppercase tracking-wide text-ink-soft" htmlFor="quiz-answer">
          {t('quiz.yourAnswer')}
        </label>
        <input
          id="quiz-answer"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(fraction ? /[^0-9/]/g : /[^0-9]/g, '').slice(0, 6))}
          className="h-24 w-full rounded-3xl bg-sun-50 text-center font-display text-5xl font-semibold outline-none ring-[3px] ring-sun-300 focus:ring-sun-500"
          placeholder={fraction ? '?/?' : '?'}
        />
        {fraction && <p className="mt-2 text-center text-sm text-ink-soft">{t('quiz.fractionHint')}</p>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : (
            <button
              key={k}
              onClick={() => press(k)}
              aria-label={k === 'del' ? t('quiz.delete') : k}
              className={cx('grid size-16 place-items-center rounded-2xl font-display text-2xl font-semibold shadow-[0_4px_0_0_rgba(36,48,77,0.12)] ring-1 ring-ink/10 active:translate-y-1 active:shadow-none', k === 'del' ? 'bg-coral-50 text-coral-500' : k === '/' ? 'bg-sky-100 text-sky-700' : 'bg-white')}
            >
              {k === 'del' ? <Delete className="size-6" /> : k}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

function QuizResults({ quiz, attempt, reopened, onRetry, onReflect }: { quiz: Quiz; attempt: Attempt; reopened: boolean; onRetry: () => void; onReflect: () => void }) {
  const { t, L, go, lang } = useStore()
  const total = attempt.questions.length
  const pct = Math.round((attempt.score / total) * 100)
  const stars = starsFor(pct)
  const wrong = attempt.questions.filter((q, i) => !isCorrect(q, attempt.answers[i])).length
  const [open, setOpen] = useState<number | null>(attempt.questions.findIndex((q, i) => !isCorrect(q, attempt.answers[i])))
  const msgKey: TKey = pct === 100 ? 'qres.perfect' : pct >= 60 ? 'qres.great' : pct > 0 ? 'qres.good' : 'qres.start'
  const reflected = !!attempt.reflections

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={L(quiz.title)} subtitle={reopened ? `${t('qres.from')} ${formatDate(attempt.date, lang, { day: 'numeric', month: 'long' })}` : t('qres.subtitle')} onBack={() => go(reopened ? { name: 'progress' } : { name: 'practice' })} />

      <Card className="relative overflow-hidden bg-gradient-to-br from-sun-300 to-sun-400 text-center !ring-0">
        <div className="absolute -left-10 -top-10 size-40 rounded-full bg-white/20" />
        <div className="relative flex flex-col items-center">
          <Mascot size={110} mood={pct >= 60 ? 'cheer' : 'encouraging'} halo />
          <Stars n={stars} size="size-12" className="mt-2" />
          <p className="mt-2 font-display text-5xl font-semibold">
            {attempt.score}/{total}
          </p>
          <p className="mt-2 flex items-center gap-2 text-xl font-bold">
            {t(msgKey)} <SpeakButton size="sm" text={t(msgKey)} className="bg-white/50" />
          </p>
          <p className="mt-1 text-sm font-bold opacity-75">{t('quiz.separate')}</p>
        </div>
      </Card>

      <SectionTitle>{t('qres.answers')}</SectionTitle>
      <div className="space-y-3">
        {attempt.questions.map((q, i) => {
          const ok = isCorrect(q, attempt.answers[i])
          const isOpen = open === i
          return (
            <Card key={q.id} className="!p-0">
              <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center gap-4 p-4 text-left">
                <span className={cx('grid size-11 shrink-0 place-items-center rounded-full text-white', ok ? 'bg-mint-400' : 'bg-coral-400')}>{ok ? <Check className="size-6" strokeWidth={3} /> : <X className="size-6" strokeWidth={3} />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg">{L(q.prompt)}</span>
                  <span className="text-ink-soft">
                    {t('qres.you')}: <b className={ok ? 'text-mint-700' : 'text-coral-700'}>{attempt.answers[i] ?? t('quiz.skipped')}</b>
                    {!ok && (
                      <>
                        {' · '}
                        {t('qres.correct')}: <b className="text-mint-700">{q.answer}</b>
                      </>
                    )}
                  </span>
                </span>
                <ChevronDown className={cx('size-6 shrink-0 text-ink-soft transition', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="mx-4 mb-4 flex items-start gap-3 rounded-2xl bg-sky-50 p-4">
                  <Sparkles className="mt-0.5 size-5 shrink-0 text-sky-600" />
                  <p className="flex-1 text-lg">{L(q.explain)}</p>
                  <SpeakButton size="sm" text={L(q.explain)} />
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {wrong > 0 && !reflected && (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-[28px] bg-grape-100 p-5 sm:flex-row">
          <Mascot size={64} mood="think" className="!animate-none" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-display text-xl">{t('qres.reflectTitle')}</p>
            <p className="text-ink-soft">{t('qres.reflectBody')}</p>
          </div>
          <Button className="!bg-grape-600 !shadow-[0_4px_0_0_#4a37a0]" onClick={onReflect}>
            {t('qres.reflectCta')}
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="sun" icon={<RotateCcw className="size-5" />} onClick={onRetry}>
          {t('quiz.tryAgain')}
        </Button>
        {quiz.fromExam && (
          <Button variant="white" onClick={() => go({ name: 'results', examId: quiz.fromExam, tab: 'topics' })} icon={<BookOpen className="size-5" />}>
            {t('qres.topicLink')}
          </Button>
        )}
        <Button variant="white" icon={<HomeIcon className="size-5" />} onClick={() => go({ name: 'home' })}>
          {t('backHome')}
        </Button>
      </div>
    </div>
  )
}

const REASONS: { id: Reason; icon: typeof HelpCircle; key: TKey; hint: TKey; bg: string }[] = [
  { id: 'understand', icon: HelpCircle, key: 'reason.understand', hint: 'reason.understandHint', bg: 'bg-sky-100 text-sky-600' },
  { id: 'rule', icon: BookOpen, key: 'reason.rule', hint: 'reason.ruleHint', bg: 'bg-mint-100 text-mint-700' },
  { id: 'calc', icon: Calculator, key: 'reason.calc', hint: 'reason.calcHint', bg: 'bg-sun-100 text-sun-700' },
  { id: 'unsure', icon: Dices, key: 'reason.unsure', hint: 'reason.unsureHint', bg: 'bg-grape-100 text-grape-600' },
]

function Reflection({ quiz, attempt, onBack, onDone }: { quiz: Quiz; attempt: Attempt; onBack: () => void; onDone: (r: (Reason | null)[], notes: string[]) => void }) {
  const { t, L } = useStore()
  const wrongIdx = useMemo(() => attempt.questions.map((q, i) => (isCorrect(q, attempt.answers[i]) ? -1 : i)).filter((i) => i >= 0), [attempt])
  const [step, setStep] = useState(0)
  const [choices, setChoices] = useState<(Reason | null)[]>(() => attempt.questions.map(() => null))
  const [notes, setNotes] = useState<string[]>(() => attempt.questions.map(() => ''))
  const [hover, setHover] = useState<Reason | null>(null)
  const qi = wrongIdx[step]
  const q = attempt.questions[qi]
  const last = step === wrongIdx.length - 1
  const choice = choices[qi]
  const helperText = hover ? t(REASONS.find((r) => r.id === hover)!.hint) : t('reflect.helper')
  const next = () => (last ? onDone(choices, notes) : setStep(step + 1))

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t('reflect.title')} subtitle={L(quiz.title)} onBack={step === 0 ? onBack : () => setStep(step - 1)} />
      <div className="mb-4 flex items-center justify-center gap-2" aria-label={t('reflect.progress', { n: step + 1, total: wrongIdx.length })}>
        {wrongIdx.map((i, s) => (
          <span key={i} className={cx('h-3 rounded-full transition-all', s === step ? 'w-8 bg-grape-400' : choices[i] ? 'w-3 bg-mint-400' : 'w-3 bg-ink/15')} />
        ))}
      </div>

      <Card key={q.id} className="animate-rise">
        <p className="text-sm font-extrabold uppercase tracking-wide text-grape-600">{t('reflect.progress', { n: step + 1, total: wrongIdx.length })}</p>
        <h2 className="mt-1 text-2xl">{L(q.prompt)}</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Chip tone="coral" className="!text-base">
            {t('qres.you')}: {attempt.answers[qi] ?? t('quiz.skipped')}
          </Chip>
          <Chip tone="mint" className="!text-base">
            {t('qres.correct')}: {q.answer}
          </Chip>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <p className="font-display text-xl">{t('reflect.question')}</p>
          <SpeakButton size="sm" text={`${t('reflect.question')} ${REASONS.map((r) => t(r.key)).join(', ')}`} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {REASONS.map((r) => {
            const sel = choice === r.id
            return (
              <button
                key={r.id}
                onClick={() => setChoices((c) => c.map((x, i) => (i === qi ? (sel ? null : r.id) : x)))}
                onMouseEnter={() => setHover(r.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(r.id)}
                onBlur={() => setHover(null)}
                aria-pressed={sel}
                className={cx('flex min-h-20 items-center gap-4 rounded-3xl p-4 text-left text-lg font-bold ring-[3px] transition', sel ? 'bg-grape-100 ring-grape-400' : 'bg-white ring-ink/10 hover:ring-grape-400/50')}
              >
                <span className={cx('grid size-12 shrink-0 place-items-center rounded-2xl', r.bg)}>
                  <r.icon className="size-6" />
                </span>
                <span className="flex-1">{t(r.key)}</span>
                {sel && <Check className="size-6 text-grape-600" strokeWidth={3} />}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sky-50 p-3">
          <Mascot size={44} mood="encouraging" className="!animate-none" />
          <p className="font-semibold text-sky-700">{helperText}</p>
        </div>

        <label className="mt-4 block">
          <span className="font-bold">{t('reflect.note')}</span>
          <textarea
            value={notes[qi]}
            maxLength={140}
            onChange={(e) => setNotes((n) => n.map((x, i) => (i === qi ? e.target.value : x)))}
            rows={2}
            className="mt-1 w-full rounded-2xl bg-cloud p-3 text-lg outline-none ring-2 ring-transparent focus:ring-sky-300"
            placeholder={t('reflect.notePh')}
          />
        </label>
      </Card>

      <div className="mt-5 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" icon={<SkipForward className="size-5" />} onClick={next}>
          {t('reflect.skip')}
        </Button>
        <Button variant={last ? 'mint' : 'primary'} disabled={!choice} onClick={next} iconRight={last ? <Check className="size-5" /> : <ArrowRight className="size-5" />}>
          {last ? t('reflect.done') : t('next')}
        </Button>
      </div>
    </div>
  )
}
