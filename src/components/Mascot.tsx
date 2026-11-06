import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { EyeOff, Lightbulb, Volume2, VolumeX, X } from 'lucide-react'
import { useStore } from '../store'
import type { TKey } from '../i18n'
import { cx } from './ui'

type Mood = 'happy' | 'cheer' | 'think'

/** Pip, Learnie's owl helper. Pure SVG so it scales crisply and animates with CSS. */
export function Mascot({ size = 120, mood = 'happy', className }: { size?: number; mood?: Mood; className?: string }) {
  const cheer = mood === 'cheer'
  return (
    <svg viewBox="0 0 160 170" width={size} height={size * (170 / 160)} className={cx('animate-bob overflow-visible', className)} aria-hidden="true">
      {/* shadow */}
      <ellipse cx="80" cy="162" rx="42" ry="6" fill="rgba(36,48,77,0.12)" />
      {/* wings */}
      <g style={{ transformOrigin: '34px 96px' }} className={cheer ? 'animate-wave' : ''}>
        <path d={cheer ? 'M38 92 C14 70 8 52 16 44 C30 56 40 72 46 88 Z' : 'M36 84 C18 98 18 124 34 134 C40 118 44 100 44 88 Z'} fill="#3a6fd6" />
      </g>
      <g style={{ transformOrigin: '126px 96px', animationDelay: '0.3s' }} className={cheer ? 'animate-wave' : ''}>
        <path d={cheer ? 'M122 92 C146 70 152 52 144 44 C130 56 120 72 114 88 Z' : 'M124 84 C142 98 142 124 126 134 C120 118 116 100 116 88 Z'} fill="#3a6fd6" />
      </g>
      {/* body */}
      <path d="M80 26 C122 26 132 62 132 98 C132 136 110 154 80 154 C50 154 28 136 28 98 C28 62 38 26 80 26 Z" fill="#6fa3ff" />
      {/* ear tufts */}
      <path d="M46 40 L40 14 L64 32 Z" fill="#4c86f0" />
      <path d="M114 40 L120 14 L96 32 Z" fill="#4c86f0" />
      {/* leaf */}
      <path d="M80 26 C78 14 86 6 96 6 C96 18 88 24 80 26 Z" fill="#4fcf9f" />
      {/* belly */}
      <ellipse cx="80" cy="116" rx="32" ry="32" fill="#fff8ee" />
      <path d="M66 108 q4 4 8 0 M86 108 q4 4 8 0 M74 122 q4 4 8 0" stroke="#ffc83d" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="60" cy="72" r="20" fill="#fff" />
      <circle cx="100" cy="72" r="20" fill="#fff" />
      <g className="animate-blink" style={{ transformOrigin: '80px 72px' }}>
        {mood === 'think' ? (
          <>
            <circle cx="64" cy="66" r="9" fill="#24304d" />
            <circle cx="104" cy="66" r="9" fill="#24304d" />
            <circle cx="67" cy="63" r="3" fill="#fff" />
            <circle cx="107" cy="63" r="3" fill="#fff" />
          </>
        ) : cheer ? (
          <>
            <path d="M50 74 q10 -12 20 0" stroke="#24304d" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M90 74 q10 -12 20 0" stroke="#24304d" strokeWidth="5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="62" cy="74" r="10" fill="#24304d" />
            <circle cx="98" cy="74" r="10" fill="#24304d" />
            <circle cx="65" cy="70" r="3.5" fill="#fff" />
            <circle cx="101" cy="70" r="3.5" fill="#fff" />
          </>
        )}
      </g>
      {/* cheeks */}
      <circle cx="44" cy="90" r="6" fill="#ff8470" opacity="0.45" />
      <circle cx="116" cy="90" r="6" fill="#ff8470" opacity="0.45" />
      {/* beak */}
      <path d="M73 88 L87 88 L80 99 Z" fill="#ffc83d" stroke="#f5b10f" strokeWidth="2" strokeLinejoin="round" />
      {/* feet */}
      <path d="M64 152 l-6 8 M68 153 l0 9 M72 152 l6 8" stroke="#f5b10f" strokeWidth="4" strokeLinecap="round" />
      <path d="M88 152 l-6 8 M92 153 l0 9 M96 152 l6 8" stroke="#f5b10f" strokeWidth="4" strokeLinecap="round" />
      {cheer && (
        <g fill="#ffc83d">
          <path d="M14 20 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" />
          <path d="M140 10 l2 5 5 1 -4 3 1 5 -4 -2 -4 2 1 -5 -4 -3 5 -1 z" />
        </g>
      )}
    </svg>
  )
}

const TIP_KEYS: Record<string, TKey[]> = {
  home: ['tip.home.1', 'tip.home.2', 'tip.home.3'],
  upload: ['tip.upload.1', 'tip.upload.2', 'tip.upload.3', 'tip.upload.4'],
  results: ['tip.results.1', 'tip.results.2', 'tip.results.3'],
  progress: ['tip.progress.1', 'tip.progress.2'],
  practice: ['tip.practice.1', 'tip.practice.2', 'tip.practice.3'],
  quiz: ['tip.quiz.1', 'tip.quiz.2', 'tip.quiz.3', 'tip.quiz.4'],
  achievements: ['tip.achievements.1', 'tip.achievements.2'],
  notifications: ['tip.notifications.1', 'tip.notifications.2'],
  settings: ['tip.settings.1', 'tip.settings.2'],
}

/** Floating help character: per-screen tips, read aloud, mute and hide. */
export function Helper() {
  const { route, t, settings, setSetting, speak, celebrateKey, user } = useStore()
  const tips = useMemo(() => TIP_KEYS[route.name] ?? TIP_KEYS.home, [route.name])
  const [idx, setIdx] = useState(0)
  const [open, setOpen] = useState(true)
  const [cheering, setCheering] = useState(false)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    setIdx(0)
    setPinned(false)
    if (route.name !== 'home') setOpen(false)
  }, [route.name])

  // Tips close on their own so they never block the page; tapping Pip pins them open.
  useEffect(() => {
    if (!open || pinned || cheering) return
    const id = window.setTimeout(() => setOpen(false), 9000)
    return () => window.clearTimeout(id)
  }, [open, pinned, cheering, idx])

  useEffect(() => {
    if (!celebrateKey) return
    setCheering(true)
    setOpen(true)
    const id = window.setTimeout(() => setCheering(false), 4000)
    return () => window.clearTimeout(id)
  }, [celebrateKey])

  const text = cheering ? t('tip.cheer') : t(tips[idx % tips.length], { name: user?.name ?? '' })

  if (settings.helperHidden) {
    return (
      <button
        onClick={() => setSetting('helperHidden', false)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-sky-700 shadow-soft ring-1 ring-ink/10 lg:bottom-6"
      >
        <Lightbulb className="size-4" /> {t('helper.show')}
      </button>
    )
  }

  return (
    <div className="pointer-events-none fixed bottom-24 right-3 z-40 flex items-end gap-2 lg:bottom-5 lg:right-6">
      {open && (
        <div className="pointer-events-auto relative mb-10 w-[min(80vw,330px)] animate-pop rounded-3xl bg-white p-4 shadow-2xl ring-2 ring-sky-100" role="status" aria-live="polite">
          <button onClick={() => setOpen(false)} aria-label={t('close')} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full text-ink-soft hover:bg-cloud">
            <X className="size-4" />
          </button>
          <p className="mb-1 font-display text-sm font-semibold text-sky-600">Pip</p>
          <p className="pr-4 text-base font-semibold leading-snug">{text}</p>
          <div className="mt-3 flex items-center gap-1.5">
            {!cheering && tips.length > 1 && (
              <button
                onClick={() => {
                  setPinned(true)
                  setIdx((i) => i + 1)
                }}
                className="mr-auto whitespace-nowrap rounded-full bg-sky-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-sky-600"
              >
                {t('helper.next')} ({(idx % tips.length) + 1}/{tips.length})
              </button>
            )}
            {!settings.helperMuted && (
              <button onClick={() => speak(text)} aria-label={t('readAloud')} className="grid size-9 place-items-center rounded-full bg-sun-100 text-sun-700 hover:bg-sun-300">
                <Volume2 className="size-4" />
              </button>
            )}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel()
                setSetting('helperMuted', !settings.helperMuted)
              }}
              aria-label={settings.helperMuted ? t('helper.unmute') : t('helper.mute')}
              title={settings.helperMuted ? t('helper.unmute') : t('helper.mute')}
              className="grid size-9 place-items-center rounded-full bg-cloud text-ink-soft hover:bg-ink/10"
            >
              {settings.helperMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 opacity-50" />}
            </button>
            <button onClick={() => setSetting('helperHidden', true)} aria-label={t('helper.hide')} title={t('helper.hide')} className="grid size-9 place-items-center rounded-full bg-cloud text-ink-soft hover:bg-ink/10">
              <EyeOff className="size-4" />
            </button>
          </div>
          <span className="absolute -bottom-2 right-6 size-5 rotate-45 bg-white ring-0" />
        </div>
      )}
      <button
        onClick={() => {
          setPinned(true)
          setOpen((o) => !o)
        }}
        aria-label={t('helper.help')}
        className="pointer-events-auto relative flex flex-col items-center"
      >
        <Mascot size={84} mood={cheering ? 'cheer' : open ? 'happy' : 'think'} />
        {!open && <span className="-mt-2 rounded-full bg-sky-500 px-3 py-1 text-xs font-extrabold text-white shadow">{t('helper.help')}</span>}
      </button>
    </div>
  )
}

export function Confetti() {
  const { celebrateKey } = useStore()
  const [pieces, setPieces] = useState<{ id: number; left: number; dx: number; delay: number; color: string; w: number; dur: number }[]>([])
  useEffect(() => {
    if (!celebrateKey) return
    const colors = ['#6fa3ff', '#4fcf9f', '#ffc83d', '#ff8470', '#9b85f5']
    setPieces(
      Array.from({ length: 70 }, (_, i) => ({
        id: celebrateKey * 100 + i,
        left: Math.random() * 100,
        dx: (Math.random() - 0.5) * 200,
        delay: Math.random() * 0.6,
        color: colors[i % colors.length],
        w: 8 + Math.random() * 8,
        dur: 2.2 + Math.random() * 1.6,
      })),
    )
    const id = window.setTimeout(() => setPieces([]), 4500)
    return () => window.clearTimeout(id)
  }, [celebrateKey])
  if (!pieces.length) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.w * 0.5,
              background: p.color,
              animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
              '--dx': `${p.dx}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
