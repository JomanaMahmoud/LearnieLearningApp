import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, HeartHandshake, Lightbulb, Lock, MessageCircle, Minus, PartyPopper, Puzzle, RefreshCw, X } from 'lucide-react'
import { SUBJECTS, TOPICS, examScore, starsFor, type Exam, type ExamQuestion } from '../data'
import { useStore } from '../store'
import { Mascot } from '../components/Mascot'
import { Button, Card, Chip, FractionBar, PageHeader, SpeakButton, Stars, cx, formatDate, toneBg } from '../components/ui'

export function Results() {
  const { route, exams } = useStore()
  const exam = route.name === 'results' && route.examId ? exams.find((e) => e.id === route.examId) : undefined
  if (exam && exam.status === 'confirmed') return <ExamDetail key={exam.id} exam={exam} />
  return <ExamList />
}

function ExamList() {
  const { t, L, exams, go, viewedExams, lang } = useStore()
  return (
    <div>
      <PageHeader title={t('results.title')} subtitle={t('results.subtitle')} speakText={`${t('results.title')}. ${t('results.subtitle')}`} />
      <div className="grid gap-4 md:grid-cols-2">
        {exams.map((e) => {
          if (e.status !== 'confirmed')
            return (
              <Card key={e.id} className="relative overflow-hidden bg-cloud !shadow-none">
                <div className="flex items-start justify-between gap-3">
                  <Chip tone={SUBJECTS[e.subject].tone}>{L(SUBJECTS[e.subject].name)}</Chip>
                  <span className="grid size-12 place-items-center rounded-2xl bg-white text-ink-soft">
                    <Lock className="size-6" />
                  </span>
                </div>
                <h3 className="mt-3 text-2xl text-ink-soft">{L(e.title)}</h3>
                <p className="mt-2 text-lg font-bold">{t('results.notReady')}</p>
                <p className="text-ink-soft">{t('results.notReadyBody')}</p>
              </Card>
            )
          const s = examScore(e)
          const isNew = !viewedExams.includes(e.id)
          return (
            <button key={e.id} onClick={() => go({ name: 'results', examId: e.id })} className="group text-left">
              <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:ring-2 group-hover:ring-mint-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone={SUBJECTS[e.subject].tone}>{L(SUBJECTS[e.subject].name)}</Chip>
                    {isNew && <Chip tone="coral">{t('new')}</Chip>}
                    {e.corrected && <Chip tone="grape" icon={<RefreshCw className="size-3.5" />}>{t('results.updated')}</Chip>}
                  </div>
                  <Stars n={starsFor(s.pct)} />
                </div>
                <h3 className="mt-3 text-2xl">{L(e.title)}</h3>
                <p className="text-ink-soft">
                  {formatDate(e.date, lang, { day: 'numeric', month: 'long' })} · {e.teacher}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <p>
                    <span className="font-display text-4xl font-semibold">{s.pct}%</span>
                    <span className="ml-2 text-ink-soft">{t('results.points', { got: s.got, max: s.max })}</span>
                  </p>
                  <span className="grid size-12 place-items-center rounded-full bg-mint-100 text-mint-700 transition group-hover:translate-x-1">
                    <ArrowRight className="size-6" />
                  </span>
                </div>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}

type Tab = 'questions' | 'topics' | 'why'

function ExamDetail({ exam }: { exam: Exam }) {
  const { t, L, go, route, markExamViewed, viewedExams, lang } = useStore()
  const initialTab = (route.name === 'results' && route.tab) || 'questions'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [qIdx, setQIdx] = useState(Math.max(0, (route.name === 'results' && route.q ? route.q : 1) - 1))
  const [wasNew] = useState(!viewedExams.includes(exam.id))
  const s = examScore(exam)
  const stars = starsFor(s.pct)

  useEffect(() => {
    markExamViewed(exam.id)
  }, [exam.id, markExamViewed])

  const jumpTo = (n: number) => {
    setQIdx(n - 1)
    setTab('questions')
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'questions', label: t('results.tab.questions'), count: exam.questions.length },
    { id: 'topics', label: t('results.tab.topics'), count: exam.weaknesses.length },
    { id: 'why', label: t('results.tab.why'), count: exam.misconceptions.length },
  ]

  return (
    <div>
      <PageHeader title={L(exam.title)} subtitle={`${L(SUBJECTS[exam.subject].name)} · ${formatDate(exam.date, lang, { day: 'numeric', month: 'long' })} · ${t('results.checkedBy', { name: exam.teacher })}`} onBack={() => go({ name: 'results' })} />

      {exam.corrected && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-grape-100 p-4 font-semibold text-grape-600">
          <RefreshCw className="size-5 shrink-0" /> {L(exam.corrected)}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        {/* Score */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-mint-400 to-mint-500 text-white !ring-0">
          <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/10" />
          <p className="font-extrabold uppercase tracking-wide text-mint-50">{t('results.yourScore')}</p>
          <div className="mt-2 flex items-center gap-4">
            <span className="font-display text-6xl font-semibold">{s.pct}%</span>
            <div>
              <Stars n={stars} size="size-8" className="[&_svg]:drop-shadow" />
              <p className="mt-1 font-bold">{t('results.points', { got: s.got, max: s.max })}</p>
            </div>
          </div>
          <p className="mt-4 text-lg font-semibold">{t(stars === 3 ? 'results.cheer3' : stars === 2 ? 'results.cheer2' : 'results.cheer1')}</p>
          <div className="absolute bottom-2 right-3 hidden sm:block">
            <Mascot size={86} mood="cheer" />
          </div>
        </Card>

        {/* Overall feedback + teacher comment */}
        <Card>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl">{t('results.feedback')}</h2>
            {wasNew && <Chip tone="coral">{t('new')}</Chip>}
            <SpeakButton className="ml-auto" text={`${L(exam.overall)} ${exam.teacher}: ${L(exam.teacherComment)}`} />
          </div>
          <p className="mt-2 text-lg leading-relaxed">{L(exam.overall)}</p>
          <div className="mt-4 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-500 font-display text-lg text-white">{exam.teacher.split(' ')[1]?.[0]}</span>
            <div className="relative rounded-3xl rounded-tl-md bg-sky-50 p-4">
              <p className="text-sm font-extrabold text-sky-700">{exam.teacher}</p>
              <p className="text-lg">“{L(exam.teacherComment)}”</p>
            </div>
          </div>
        </Card>
      </div>

      {exam.support && <SupportCard exam={exam} />}

      {/* Tabs */}
      <div role="tablist" className="mb-4 mt-8 flex gap-2 overflow-x-auto">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
            className={cx('flex min-h-12 shrink-0 items-center gap-2 rounded-2xl px-5 font-display text-lg font-medium transition', tab === tb.id ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-soft hover:text-ink')}
          >
            {tb.label}
            <span className={cx('rounded-full px-2 text-sm', tab === tb.id ? 'bg-white/20' : 'bg-ink/5')}>{tb.count}</span>
          </button>
        ))}
      </div>

      {tab === 'questions' && <QuestionReview exam={exam} idx={qIdx} setIdx={setQIdx} onWhy={() => setTab('why')} />}
      {tab === 'topics' && <Weaknesses exam={exam} jumpTo={jumpTo} />}
      {tab === 'why' && <Misconceptions exam={exam} jumpTo={jumpTo} />}
    </div>
  )
}

function qState(q: ExamQuestion) {
  return q.mark === q.max ? 'right' : q.mark === 0 ? 'wrong' : 'part'
}

function QuestionReview({ exam, idx, setIdx, onWhy }: { exam: Exam; idx: number; setIdx: (n: number) => void; onWhy: () => void }) {
  const { t, L } = useStore()
  const q = exam.questions[idx]
  const st = qState(q)
  const styles = {
    right: { ring: 'bg-mint-400 text-white', icon: <Check className="size-5" strokeWidth={3} />, label: t('results.right'), tone: 'mint' as const },
    wrong: { ring: 'bg-coral-400 text-white', icon: <X className="size-5" strokeWidth={3} />, label: t('results.notYet'), tone: 'coral' as const },
    part: { ring: 'bg-sun-400 text-ink', icon: <Minus className="size-5" strokeWidth={3} />, label: t('results.part'), tone: 'sun' as const },
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Card className="h-fit !p-4">
        <p className="mb-3 font-display text-lg">{t('results.navigator')}</p>
        <div className="grid grid-cols-4 gap-2 lg:grid-cols-4">
          {exam.questions.map((x, i) => {
            const s = styles[qState(x)]
            return (
              <button
                key={x.n}
                onClick={() => setIdx(i)}
                aria-label={`${t('results.question', { n: x.n })}: ${s.label}`}
                aria-current={i === idx}
                className={cx('relative grid aspect-square place-items-center rounded-2xl font-display text-xl font-semibold transition', s.ring, i === idx ? 'scale-105 ring-4 ring-ink/80' : 'opacity-90 hover:opacity-100')}
              >
                {x.n}
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-white text-ink [&_svg]:size-3">{s.icon}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-4 space-y-1.5 text-sm font-bold">
          {(['right', 'part', 'wrong'] as const).map((k) => (
            <p key={k} className="flex items-center gap-2">
              <span className={cx('size-4 rounded-md', styles[k].ring)} /> {styles[k].label}
            </p>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl">{t('results.question', { n: q.n })}</h2>
          <Chip tone={styles[st].tone} icon={styles[st].icon}>
            {styles[st].label}
          </Chip>
          <span className="ml-auto font-display text-2xl font-semibold">
            {q.mark}/{q.max}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xl">{L(q.prompt)}</p>
          <SpeakButton size="sm" text={L(q.prompt)} lang={exam.subject === 'english' ? 'en' : undefined} />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-soft">{t('results.yourAnswer')}</p>
            <Scan text={q.studentAnswer} n={q.n} state={st} />
          </div>
          <div>
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-soft">{t('results.correctAnswer')}</p>
            <div className="flex h-[118px] items-center gap-3 rounded-2xl bg-mint-50 px-5 ring-2 ring-mint-100">
              <span className="grid size-10 place-items-center rounded-full bg-mint-400 text-white">
                <Check className="size-5" strokeWidth={3} />
              </span>
              <span className="font-display text-3xl font-semibold text-mint-700">{q.correctAnswer}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-sky-50 p-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-sky-600" />
            <p className="font-display text-lg text-sky-700">{t('results.teacherFeedback')}</p>
            <SpeakButton size="sm" className="ml-auto" text={L(q.feedback)} />
          </div>
          <p className="mt-1 text-lg leading-relaxed">{L(q.feedback)}</p>
          {q.misconceptionId && (
            <button onClick={onWhy} className="mt-3 flex items-center gap-2 font-bold text-sky-700 hover:underline">
              <Lightbulb className="size-5" /> {t('results.seeWhy')}
            </button>
          )}
        </div>

        <div className="mt-6 flex justify-between gap-3">
          <Button variant="white" disabled={idx === 0} onClick={() => setIdx(idx - 1)} icon={<ChevronLeft className="size-5" />}>
            {t('prev')}
          </Button>
          <Button variant="primary" disabled={idx === exam.questions.length - 1} onClick={() => setIdx(idx + 1)} iconRight={<ChevronRight className="size-5" />}>
            {t('next')}
          </Button>
        </div>
      </Card>
    </div>
  )
}

/** A crop of the scanned paper with the child's handwriting. */
function Scan({ text, n, state }: { text: string; n: number; state: 'right' | 'wrong' | 'part' }) {
  const mark = state === 'right' ? 'text-mint-500' : state === 'wrong' ? 'text-coral-400' : 'text-sun-500'
  return (
    <div
      className="relative flex h-[118px] items-center overflow-hidden rounded-2xl bg-[#fffdf7] px-5 shadow-inner ring-1 ring-ink/10"
      style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 34px, #c9dcff 34px 36px)', backgroundPositionY: '10px' }}
    >
      <span className="absolute inset-y-0 left-10 w-0.5 bg-coral-300/60" />
      <span className="relative ml-6 rotate-[-1.5deg] font-hand text-3xl text-[#2c3e8f]">
        {n}) {text}
      </span>
      <span className={cx('absolute right-4 top-3 font-hand text-4xl', mark)}>{state === 'right' ? '✓' : state === 'wrong' ? '✗' : '½'}</span>
    </div>
  )
}

function Weaknesses({ exam, jumpTo }: { exam: Exam; jumpTo: (n: number) => void }) {
  const { t, L, quizzes, go } = useStore()
  if (!exam.weaknesses.length)
    return (
      <Card className="text-center">
        <PartyPopper className="mx-auto size-10 text-mint-500" />
        <p className="mt-2 font-display text-2xl">{t('results.noWeak')}</p>
      </Card>
    )
  const levels = { 1: { label: t('level.1'), tone: 'coral' as const, n: 1 }, 2: { label: t('level.2'), tone: 'sun' as const, n: 2 }, 3: { label: t('level.3'), tone: 'mint' as const, n: 3 } }
  return (
    <div className="space-y-4">
      <p className="text-lg text-ink-soft">{t('results.weakIntro')}</p>
      {exam.weaknesses.map((w) => {
        const lv = levels[w.level]
        const quiz = quizzes.find((q) => q.topic === w.topic && q.status !== 'done') ?? quizzes.find((q) => q.topic === w.topic)
        return (
          <Card key={w.topic} className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className={cx('grid size-14 shrink-0 place-items-center rounded-2xl', toneBg[lv.tone])}>
              <Puzzle className="size-7" />
            </span>
            <div className="flex-1">
              <h3 className="text-2xl">{L(TOPICS[w.topic].name)}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex gap-1" aria-hidden>
                  {[1, 2, 3].map((i) => (
                    <span key={i} className={cx('h-2.5 w-7 rounded-full', i <= lv.n ? { coral: 'bg-coral-400', sun: 'bg-sun-400', mint: 'bg-mint-400' }[lv.tone] : 'bg-ink/10')} />
                  ))}
                </span>
                <span className="font-bold">{lv.label}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {w.questions.map((n) => (
                  <button key={n} onClick={() => jumpTo(n)} className="rounded-full bg-cloud px-3 py-1 text-sm font-bold text-sky-700 hover:bg-sky-100">
                    {t('results.question', { n })}
                  </button>
                ))}
              </div>
            </div>
            {quiz && (
              <Button variant="sun" onClick={() => go({ name: 'quiz', quizId: quiz.id })}>
                {t('results.practiceThis')}
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function Misconceptions({ exam, jumpTo }: { exam: Exam; jumpTo: (n: number) => void }) {
  const { t, L } = useStore()
  if (!exam.misconceptions.length)
    return (
      <Card className="text-center">
        <p className="font-display text-2xl">{t('results.noWhy')}</p>
      </Card>
    )
  return (
    <div className="space-y-5">
      {exam.misconceptions.map((m) => (
        <Card key={m.id}>
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sun-100 text-sun-700">
              <Lightbulb className="size-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-extrabold uppercase tracking-wide text-sun-700">{t('results.whatHappened')}</p>
              <h3 className="text-2xl leading-snug">{L(m.title)}</h3>
            </div>
            <SpeakButton text={`${L(m.title)}. ${L(m.explanation)} ${L(m.example.caption)}`} />
          </div>
          <p className="mt-4 text-lg leading-relaxed">{L(m.explanation)}</p>

          <div className="mt-5 rounded-3xl bg-cloud p-5">
            <p className="mb-3 font-display text-lg">{t('results.example')}</p>
            <div className="space-y-3">
              <FractionBar n={m.example.a[0]} d={m.example.a[1]} tone="coral" />
              <FractionBar n={m.example.b[0]} d={m.example.b[1]} tone="mint" />
            </div>
            <p className="mt-3 text-lg font-semibold">{L(m.example.caption)}</p>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-3xl bg-sky-50 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-500 font-display text-white">{exam.teacher.split(' ')[1]?.[0]}</span>
            <div>
              <p className="text-sm font-extrabold text-sky-700">{t('results.teacherNote', { name: exam.teacher })}</p>
              <p className="text-lg">“{L(m.teacherNote)}”</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-bold text-ink-soft">{t('results.seenIn')}</span>
            {m.questions.map((n) => (
              <button key={n} onClick={() => jumpTo(n)} className="rounded-full bg-white px-3 py-1 text-sm font-bold text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50">
                {t('results.question', { n })}
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

function SupportCard({ exam }: { exam: Exam }) {
  const { t, L, quizzes, go } = useStore()
  const sup = exam.support!
  const quiz = quizzes.find((q) => q.topic === sup.topic && q.status !== 'done') ?? quizzes.find((q) => q.topic === sup.topic)
  if (sup.resolved)
    return (
      <div className="mt-5 flex items-center gap-4 rounded-[28px] bg-mint-50 p-5 ring-2 ring-mint-100">
        <span className="grid size-14 place-items-center rounded-2xl bg-mint-400 text-white">
          <PartyPopper className="size-7" />
        </span>
        <div className="flex-1">
          <p className="font-display text-xl">{t('support.resolved', { topic: L(TOPICS[sup.topic].name) })}</p>
          <p className="text-lg">“{L(sup.comment)}”</p>
        </div>
        <Chip tone="mint" icon={<Check className="size-4" />}>
          {t('support.done')}
        </Chip>
      </div>
    )
  return (
    <div className="mt-5 flex flex-col gap-4 rounded-[28px] bg-coral-50 p-5 ring-2 ring-coral-100 sm:flex-row sm:items-center">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-coral-400 text-white">
        <HeartHandshake className="size-7" />
      </span>
      <div className="flex-1">
        <p className="font-display text-xl">{t('support.title', { topic: L(TOPICS[sup.topic].name) })}</p>
        <p className="text-lg">
          <span className="font-bold">{exam.teacher}: </span>“{L(sup.comment)}”
        </p>
      </div>
      <SpeakButton text={`${t('support.title', { topic: L(TOPICS[sup.topic].name) })}. ${L(sup.comment)}`} />
      {quiz && (
        <Button variant="coral" onClick={() => go({ name: 'quiz', quizId: quiz.id })}>
          {t('support.start')}
        </Button>
      )}
    </div>
  )
}
