import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  INITIAL_EXAMS,
  INITIAL_NOTES,
  INITIAL_SESSIONS,
  TODAY,
  TOPICS,
  initialQuizzes,
  newId,
  starsFor,
  type Attempt,
  type Exam,
  type ExamSession,
  type Lang,
  type Loc,
  type Note,
  type Quiz,
  type Reason,
  type Route,
} from './data'
import { translate, type TKey } from './i18n'

type Settings = {
  lang: Lang
  readAloud: boolean
  helperHidden: boolean
  helperMuted: boolean
  largeText: boolean
}

type Toast = { id: number; msg: string; action?: { label: string; fn: () => void } }

type User = { name: string; className: string; grade: number; avatar: number }

const DEFAULT_SETTINGS: Settings = { lang: 'en', readAloud: true, helperHidden: false, helperMuted: false, largeText: false }

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem('learnie.settings')
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function useStoreValue() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [user, setUser] = useState<User | null>(null)
  const [route, setRoute] = useState<Route>({ name: 'home' })
  const [sessions, setSessions] = useState<ExamSession[]>(INITIAL_SESSIONS)
  const [exams] = useState<Exam[]>(INITIAL_EXAMS)
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes)
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES)
  const [viewedExams, setViewedExams] = useState<string[]>(['e-eng-1', 'e-math-0', 'e-eng-0'])
  const [reflectionsDone, setReflectionsDone] = useState(0)
  const [practiceDays, setPracticeDays] = useState<string[]>(['2026-10-10', '2026-10-11'])
  const [celebrateKey, setCelebrateKey] = useState(0)
  // One-shot "kind word" signal, fired once when a quiz is finished below 60% (never on navigation).
  const [comfortKey, setComfortKey] = useState(0)
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    localStorage.setItem('learnie.settings', JSON.stringify(settings))
    document.documentElement.lang = settings.lang
    document.documentElement.classList.toggle('large-text', settings.largeText)
  }, [settings])

  const lang = settings.lang
  const t = useCallback((key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])
  const L = useCallback((loc: Loc) => loc[lang], [lang])

  const setSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }, [])

  const go = useCallback((r: Route) => {
    setRoute(r)
    window.speechSynthesis?.cancel()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const speak = useCallback(
    (text: string, speechLang?: Lang) => {
      const synth = window.speechSynthesis
      if (!synth) return
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = (speechLang ?? lang) === 'de' ? 'de-DE' : 'en-US'
      u.rate = 0.9
      u.pitch = 1.1
      synth.speak(u)
    },
    [lang],
  )

  const showToast = useCallback((msg: string, action?: Toast['action']) => {
    window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), msg, action })
    toastTimer.current = window.setTimeout(() => setToast(null), 5000)
  }, [])

  const celebrate = useCallback(() => setCelebrateKey((k) => k + 1), [])
  const comfort = useCallback(() => setComfortKey((k) => k + 1), [])

  const addNote = useCallback((n: Omit<Note, 'id' | 'date' | 'read'>) => {
    setNotes((all) => [{ ...n, id: newId('n'), date: `${TODAY}T${new Date().toTimeString().slice(0, 5)}`, read: false }, ...all])
  }, [])

  const updateSession = useCallback((id: string, patch: Partial<ExamSession>) => {
    setSessions((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const submitSession = useCallback(
    (id: string) => {
      const s = sessions.find((x) => x.id === id)
      setSessions((all) =>
        all.map((x) => (x.id === id ? { ...x, status: 'uploaded', submittedAt: TODAY, reuploadReason: undefined } : x)),
      )
      if (s)
        addNote({
          type: 'submission',
          title: { en: `Your ${s.title.en} arrived`, de: `${s.title.de}: angekommen` },
          body: { en: 'Your teacher will check it soon.', de: 'Deine Lehrkraft schaut es bald an.' },
          target: { name: 'upload', sessionId: id },
        })
      setNotes((all) => all.map((n) => (n.type === 'reupload' && n.target?.name === 'upload' && n.target.sessionId === id ? { ...n, read: true } : n)))
      celebrate()
    },
    [sessions, addNote, celebrate],
  )

  const markExamViewed = useCallback((id: string) => {
    setViewedExams((v) => (v.includes(id) ? v : [...v, id]))
    setNotes((all) => all.map((n) => (n.target?.name === 'results' && n.target.examId === id && n.type === 'results' ? { ...n, read: true } : n)))
  }, [])

  const setQuizStatus = useCallback((id: string, status: Quiz['status']) => {
    setQuizzes((all) => all.map((q) => (q.id === id ? { ...q, status, isNew: false } : q)))
  }, [])

  const saveAttempt = useCallback(
    (quizId: string, attempt: Attempt) => {
      setQuizzes((all) => all.map((q) => (q.id === quizId ? { ...q, status: 'done', isNew: false, attempts: [...q.attempts, attempt] } : q)))
      setPracticeDays((d) => (d.includes(TODAY) ? d : [...d, TODAY]))
      setNotes((all) => all.map((n) => (n.type === 'quiz' && n.target?.name === 'quiz' && n.target.quizId === quizId ? { ...n, read: true } : n)))
      if (attempt.score / attempt.questions.length >= 0.6) celebrate()
      else comfort()
    },
    [celebrate, comfort],
  )

  const saveReflections = useCallback(
    (quizId: string, attemptId: string, reflections: (Reason | null)[], notesText: string[]) => {
      const quiz = quizzes.find((q) => q.id === quizId)
      setQuizzes((all) =>
        all.map((q) =>
          q.id === quizId ? { ...q, attempts: q.attempts.map((a) => (a.id === attemptId ? { ...a, reflections, notes: notesText } : a)) } : q,
        ),
      )
      setReflectionsDone((n) => n + 1)
      if (!quiz) return undefined
      // Build an adaptive follow-up quiz from the most common reason.
      const counts: Record<string, number> = {}
      reflections.forEach((r) => r && (counts[r] = (counts[r] ?? 0) + 1))
      const top = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unsure') as Reason
      const topicName = TOPICS[quiz.topic].name
      const titles: Record<Reason, Loc> = {
        understand: { en: `${topicName.en}: step by step with pictures`, de: `${topicName.de}: Schritt für Schritt mit Bildern` },
        rule: { en: `${topicName.en}: remember the rule`, de: `${topicName.de}: Die Regel merken` },
        calc: { en: `${topicName.en}: slow and careful`, de: `${topicName.de}: Langsam und genau` },
        unsure: { en: `${topicName.en}: confidence builder`, de: `${topicName.de}: Mutmacher-Übung` },
      }
      const id = newId('qz')
      const follow: Quiz = {
        id,
        topic: quiz.topic,
        title: titles[top],
        reason: { en: 'Picked for you from your reflection', de: 'Für dich ausgesucht nach deinem Nachdenken' },
        count: top === 'calc' ? 4 : 3,
        minutes: 3,
        status: 'ready',
        level: 1,
        followUp: true,
        fromExam: quiz.fromExam,
        attempts: [],
        isNew: true,
      }
      setQuizzes((all) => [follow, ...all.filter((q) => !(q.followUp && q.attempts.length === 0 && q.topic === quiz.topic))])
      return follow
    },
    [quizzes],
  )

  const markRead = useCallback((id: string) => setNotes((all) => all.map((n) => (n.id === id ? { ...n, read: true } : n))), [])
  const markAllRead = useCallback(() => setNotes((all) => all.map((n) => ({ ...n, read: true }))), [])
  const reply = useCallback((id: string, text: string) => setNotes((all) => all.map((n) => (n.id === id ? { ...n, reply: text, read: true } : n))), [])

  const login = useCallback((u: User) => {
    setUser(u)
    setRoute({ name: 'home' })
  }, [])
  const logout = useCallback(() => {
    window.speechSynthesis?.cancel()
    setUser(null)
    setRoute({ name: 'home' })
  }, [])

  const allAttempts = useMemo(
    () => quizzes.flatMap((q) => q.attempts.map((a) => ({ quiz: q, attempt: a }))).sort((a, b) => b.attempt.date.localeCompare(a.attempt.date)),
    [quizzes],
  )

  const weeklyStars = useMemo(
    () => 7 + allAttempts.filter((x) => x.attempt.date === TODAY).reduce((s, x) => s + starsFor(Math.round((x.attempt.score / x.attempt.questions.length) * 100)), 0),
    [allAttempts],
  )

  const unread = notes.filter((n) => !n.read).length

  return {
    settings,
    setSetting,
    lang,
    t,
    L,
    user,
    login,
    logout,
    route,
    go,
    speak,
    toast,
    showToast,
    dismissToast: () => setToast(null),
    celebrateKey,
    celebrate,
    comfortKey,
    sessions,
    updateSession,
    submitSession,
    exams,
    viewedExams,
    markExamViewed,
    quizzes,
    setQuizStatus,
    saveAttempt,
    saveReflections,
    allAttempts,
    reflectionsDone,
    practiceDays,
    weeklyStars,
    notes,
    unread,
    markRead,
    markAllRead,
    reply,
  }
}

export type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside provider')
  return v
}
