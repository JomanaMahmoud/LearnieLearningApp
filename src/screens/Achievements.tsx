import { Award, BookOpenCheck, Brain, CalendarCheck, Camera, Crown, Lock, Medal, Rocket, TrendingUp } from 'lucide-react'
import { TODAY, examScore, starsFor } from '../data'
import { useStore } from '../store'
import type { TKey } from '../i18n'
import { Mascot } from '../components/Mascot'
import { Card, PageHeader, StarIcon, ProgressBar, SectionTitle, cx } from '../components/ui'

export function Achievements() {
  const { t, allAttempts, sessions, viewedExams, reflectionsDone, practiceDays, exams } = useStore()

  const quizCount = allAttempts.length
  const perfect = allAttempts.some((x) => x.attempt.score === x.attempt.questions.length)
  const fracAttempts = allAttempts.filter((x) => x.quiz.topic === 'fractions').map((x) => x.attempt.score / x.attempt.questions.length)
  const improved = fracAttempts.length >= 2 && fracAttempts[0] > fracAttempts[fracAttempts.length - 1]
  const uploads = sessions.filter((s) => s.submittedAt).length
  let streak = 0
  for (let d = new Date(`${TODAY}T12:00`); ; d.setDate(d.getDate() - 1)) {
    const iso = d.toISOString().slice(0, 10)
    if (practiceDays.includes(iso)) streak++
    else if (iso !== TODAY) break
    if (streak > 30) break
  }

  const stars =
    allAttempts.reduce((s, x) => s + starsFor(Math.round((x.attempt.score / x.attempt.questions.length) * 100)), 0) +
    exams.filter((e) => e.status === 'confirmed').reduce((s, e) => s + starsFor(examScore(e).pct), 0)

  const badges: { id: string; icon: typeof Rocket; key: TKey; desc: TKey; have: number; need: number; color: string }[] = [
    { id: 'upload', icon: Camera, key: 'badge.upload', desc: 'badge.uploadD', have: uploads, need: 1, color: 'bg-coral-400' },
    { id: 'quiz1', icon: Rocket, key: 'badge.quiz1', desc: 'badge.quiz1D', have: quizCount, need: 1, color: 'bg-sky-500' },
    { id: 'quiz5', icon: Medal, key: 'badge.quiz5', desc: 'badge.quiz5D', have: quizCount, need: 5, color: 'bg-grape-400' },
    { id: 'streak', icon: CalendarCheck, key: 'badge.streak', desc: 'badge.streakD', have: streak, need: 3, color: 'bg-mint-400' },
    { id: 'perfect', icon: Crown, key: 'badge.perfect', desc: 'badge.perfectD', have: perfect ? 1 : 0, need: 1, color: 'bg-sun-400' },
    { id: 'improve', icon: TrendingUp, key: 'badge.improve', desc: 'badge.improveD', have: improved ? 1 : 0, need: 1, color: 'bg-mint-500' },
    { id: 'reflect', icon: Brain, key: 'badge.reflect', desc: 'badge.reflectD', have: reflectionsDone, need: 1, color: 'bg-grape-600' },
    { id: 'reader', icon: BookOpenCheck, key: 'badge.reader', desc: 'badge.readerD', have: viewedExams.length, need: 5, color: 'bg-sky-600' },
  ]
  const earned = badges.filter((b) => b.have >= b.need).length
  const level = 1 + Math.floor(stars / 6)
  const toNext = 6 - (stars % 6)

  return (
    <div>
      <PageHeader title={t('ach.title')} subtitle={t('ach.subtitle')} speakText={`${t('ach.title')}. ${t('ach.celebrate', { n: earned })}`} />

      <Card className="relative overflow-hidden bg-gradient-to-br from-grape-400 to-sky-500 text-white !ring-0">
        <div className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row">
          <Mascot size={130} mood="cheer" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-extrabold uppercase tracking-wide text-white/80">{t('ach.level', { n: level })}</p>
            <p className="font-display text-4xl">{t('ach.celebrate', { n: earned })}</p>
            <div className="mt-4 flex items-center gap-3">
              <StarIcon className="size-8 fill-sun-400 text-sun-400" />
              <span className="font-display text-3xl font-semibold">{stars}</span>
              <span className="font-bold text-white/85">{t('ach.stars')}</span>
            </div>
            <div className="mt-3 max-w-sm">
              <ProgressBar value={6 - toNext} max={6} tone="sun" className="!bg-white/25" />
              <p className="mt-1 text-sm font-bold text-white/85">{t('ach.toNext', { n: toNext, level: level + 1 })}</p>
            </div>
          </div>
        </div>
      </Card>

      <SectionTitle>{t('ach.shelf')}</SectionTitle>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => {
          const got = b.have >= b.need
          return (
            <Card key={b.id} className={cx('flex flex-col items-center text-center', !got && 'bg-cloud !shadow-none')}>
              <span className={cx('relative grid size-20 place-items-center rounded-full', got ? `${b.color} animate-pop text-white shadow-lg` : 'bg-ink/10 text-ink/30')}>
                <b.icon className="size-9" />
                {got ? (
                  <Award className="absolute -bottom-1 -right-1 size-8 rounded-full bg-white p-1 text-sun-500" />
                ) : (
                  <Lock className="absolute -bottom-1 -right-1 size-7 rounded-full bg-white p-1.5 text-ink-soft" />
                )}
              </span>
              <p className="mt-3 font-display text-lg leading-tight">{t(b.key)}</p>
              <p className="mt-1 text-sm text-ink-soft">{t(b.desc)}</p>
              {!got && (
                <div className="mt-3 w-full">
                  <ProgressBar value={Math.min(b.have, b.need)} max={b.need} tone="sky" className="h-2.5" />
                  <p className="mt-1 text-xs font-bold text-ink-soft">
                    {Math.min(b.have, b.need)}/{b.need}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
