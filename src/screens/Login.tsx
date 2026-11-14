import { useState } from 'react'
import {
  Apple,
  ArrowLeft,
  BriefcaseBusiness,
  Cat,
  Delete,
  Fish,
  GraduationCap,
  Heart,
  LockKeyhole,
  Mail,
  Moon,
  Rocket,
  Star,
  Sun,
  TreePine,
} from 'lucide-react'
import { useStore } from '../store'
import { Mascot } from '../components/Mascot'
import { Avatar, Logo } from '../components/Shell'
import { LangToggle, SpeakButton, cx } from '../components/ui'

const PICS = [
  { id: 'cat', icon: Cat, bg: 'bg-coral-100 text-coral-500' },
  { id: 'sun', icon: Sun, bg: 'bg-sun-100 text-sun-500' },
  { id: 'rocket', icon: Rocket, bg: 'bg-sky-100 text-sky-500' },
  { id: 'fish', icon: Fish, bg: 'bg-mint-100 text-mint-500' },
  { id: 'tree', icon: TreePine, bg: 'bg-mint-100 text-mint-700' },
  { id: 'star', icon: Star, bg: 'bg-sun-100 text-sun-700' },
  { id: 'apple', icon: Apple, bg: 'bg-coral-100 text-coral-700' },
  { id: 'heart', icon: Heart, bg: 'bg-grape-100 text-grape-600' },
  { id: 'moon', icon: Moon, bg: 'bg-sky-100 text-sky-700' },
] as const
const SECRET = ['cat', 'sun', 'rocket']
const STUDENTS = ['Omar', 'Sara', 'Lina', 'Adam', 'Mia', 'Jonas']

export function Login() {
  const { t, login } = useStore()
  const [mode, setMode] = useState<'student' | 'teacher'>('student')
  const [student, setStudent] = useState<number | null>(null)
  const [picks, setPicks] = useState<string[]>([])
  const [error, setError] = useState(false)
  const [teacherEmail, setTeacherEmail] = useState('m.weber@learnie.school')
  const [teacherPassword, setTeacherPassword] = useState('learnie')

  const choose = (id: string) => {
    if (picks.length >= 3) return
    const next = [...picks, id]
    setPicks(next)
    setError(false)
    if (next.length === 3) {
      if (next.join() === SECRET.join()) {
        window.setTimeout(
          () =>
            login({
              name: STUDENTS[student ?? 0],
              className: '4B',
              grade: 4,
              avatar: student ?? 0,
              role: 'student',
            }),
          350,
        )
      } else {
        window.setTimeout(() => {
          setError(true)
          setPicks([])
        }, 400)
      }
    }
  }

  const step = student === null ? 1 : 2
  const prompt = step === 1 ? t('login.who') : t('login.pictures')

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-sky-500 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-sky-400" />
        <div className="absolute -bottom-32 -left-20 size-[28rem] rounded-full bg-sky-600" />
        <div className="absolute bottom-24 right-16 size-24 rounded-full bg-sun-400" />
        <div className="absolute left-20 top-48 size-10 rounded-full bg-mint-300" />
        <div className="relative">
          <div className="inline-flex rounded-3xl bg-white px-4 py-2">
            <Logo />
          </div>
        </div>
        <div className="relative mt-auto">
          <Mascot size={220} mood="happy" />
          <h1 className="mt-6 max-w-md text-5xl leading-tight">{mode === 'teacher' ? t('login.teacherHero') : t('login.hero')}</h1>
          <p className="mt-3 max-w-md text-xl text-sky-50">{mode === 'teacher' ? t('login.teacherHeroSub') : t('login.heroSub')}</p>
        </div>
      </div>

      <div className="flex flex-col px-5 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo small />
          </div>
          <div className="ml-auto">
            <LangToggle />
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-xl py-10">
          <div className="mb-8 grid grid-cols-2 rounded-2xl bg-cloud p-1.5" role="tablist" aria-label="Choose account type">
            <button
              role="tab"
              aria-selected={mode === 'student'}
              onClick={() => setMode('student')}
              className={cx(
                'flex min-h-12 items-center justify-center gap-2 rounded-xl font-display font-semibold transition',
                mode === 'student' ? 'bg-white text-sky-700 shadow-sm' : 'text-ink-soft hover:text-ink',
              )}
            >
              <GraduationCap className="size-5" /> {t('login.student')}
            </button>
            <button
              role="tab"
              aria-selected={mode === 'teacher'}
              onClick={() => setMode('teacher')}
              className={cx(
                'flex min-h-12 items-center justify-center gap-2 rounded-xl font-display font-semibold transition',
                mode === 'teacher' ? 'bg-white text-sky-700 shadow-sm' : 'text-ink-soft hover:text-ink',
              )}
            >
              <BriefcaseBusiness className="size-5" /> {t('login.teacher')}
            </button>
          </div>

          {mode === 'teacher' ? (
            <div className="animate-rise">
              <p className="text-sm font-extrabold uppercase tracking-wide text-sky-600">{t('login.teacherPortal')}</p>
              <h2 className="mt-1 text-4xl">{t('login.teacherWelcome')}</h2>
              <p className="mt-2 text-lg text-ink-soft">{t('login.teacherBody')}</p>
              <form
                className="mt-7 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  login({
                    name: 'Ms. Weber',
                    className: '4A',
                    grade: 4,
                    avatar: 0,
                    role: 'teacher',
                    email: teacherEmail,
                  })
                }}
              >
                <label className="block">
                  <span className="mb-1.5 block font-bold">{t('login.email')}</span>
                  <span className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 shadow-soft ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-sky-400">
                    <Mail className="size-5 text-ink-soft" />
                    <input
                      type="email"
                      required
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-bold">{t('login.password')}</span>
                  <span className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 shadow-soft ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-sky-400">
                    <LockKeyhole className="size-5 text-ink-soft" />
                    <input
                      type="password"
                      required
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                    />
                  </span>
                </label>
                <button
                  type="submit"
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 font-display text-lg font-semibold text-white shadow-[0_4px_0_0_var(--color-sky-700)] transition hover:bg-sky-700 active:translate-y-1 active:shadow-none"
                >
                  {t('login.teacherSignIn')} <ArrowLeft className="size-5 rotate-180" />
                </button>
              </form>
              <p className="mt-5 rounded-2xl bg-sky-50 p-3 text-center text-sm font-semibold text-sky-700">{t('login.teacherDemo')}</p>
            </div>
          ) : (
            <>
          <div className="mb-2 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-sky-600">
            {t('login.step', { n: step })}
            <span className="flex gap-1">
              <span className={cx('h-2 w-8 rounded-full', 'bg-sky-500')} />
              <span className={cx('h-2 w-8 rounded-full', step === 2 ? 'bg-sky-500' : 'bg-ink/10')} />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl">{prompt}</h2>
            <SpeakButton text={prompt} size="sm" />
          </div>

          {step === 1 ? (
            <>
              <p className="mt-2 text-lg text-ink-soft">{t('login.classInfo')}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {STUDENTS.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setStudent(i)}
                    className="flex flex-col items-center gap-2 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink/5 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-sky-300"
                  >
                    <Avatar idx={i} size="size-16" name={s} />
                    <span className="font-display text-xl">{s}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-ink/5">
                <Avatar idx={student ?? 0} name={STUDENTS[student ?? 0]} />
                <span className="font-display text-xl">{STUDENTS[student ?? 0]}</span>
                <button
                  onClick={() => {
                    setStudent(null)
                    setPicks([])
                    setError(false)
                  }}
                  className="ml-auto flex items-center gap-1 rounded-xl px-3 py-2 font-bold text-sky-700 hover:bg-sky-50"
                >
                  <ArrowLeft className="size-4" /> {t('login.notMe')}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3" aria-live="polite">
                {[0, 1, 2].map((i) => {
                  const p = PICS.find((x) => x.id === picks[i])
                  return (
                    <span key={i} className={cx('grid size-16 place-items-center rounded-2xl border-2 border-dashed', p ? `${p.bg} animate-pop border-transparent` : 'border-ink/15')}>
                      {p && <p.icon className="size-8" />}
                    </span>
                  )
                })}
                <button
                  onClick={() => setPicks((p) => p.slice(0, -1))}
                  disabled={!picks.length}
                  aria-label={t('login.undo')}
                  className="ml-2 grid size-12 place-items-center rounded-2xl bg-white text-ink-soft shadow-soft disabled:opacity-40"
                >
                  <Delete className="size-5" />
                </button>
              </div>

              {error && (
                <p className="mx-auto mt-4 max-w-md animate-shake rounded-2xl bg-coral-50 p-3 text-center font-bold text-coral-700" role="alert">
                  {t('login.wrong')}
                </p>
              )}

              <div className="mt-6 grid grid-cols-3 gap-3">
                {PICS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => choose(p.id)}
                    aria-label={t(`pic.${p.id}` as never)}
                    className={cx('grid aspect-square place-items-center rounded-3xl text-4xl shadow-soft ring-1 ring-ink/5 transition hover:-translate-y-0.5 active:scale-95', p.bg)}
                  >
                    <p.icon className="size-12" strokeWidth={2.2} />
                  </button>
                ))}
              </div>
              <p className="mt-5 rounded-2xl bg-sun-50 p-3 text-center text-sm font-semibold text-sun-700">{t('login.demo')}</p>
            </>
          )}
          {step === 1 && (
            <p className="mt-8 text-center text-ink-soft">{t('login.sharedDevice')}</p>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
