import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { EyeOff, Lightbulb, Volume2, VolumeX, X } from 'lucide-react'
import { useStore } from '../store'
import type { TKey } from '../i18n'
import { cx } from './ui'
import { PenguinArt } from './mascot/PenguinArt'
import { resolvePose, type MascotMood } from './mascot/moods'

export type Mood = MascotMood

/**
 * Pip, Learnie's penguin helper (layered SVG, animated with CSS; see ./mascot/).
 *
 * The owl's API is unchanged: `mood` still accepts 'happy' (idle), 'cheer' (celebrating) and
 * 'think' (thinking), and also the new poses 'greeting' and 'encouraging'. Optional extras:
 * - `replayKey`: change it to restart the burst animations (celebration hops, wave, sparkles).
 * - `halo`: cream outline on the strap and duck, for placing Pip on a yellow surface.
 */
export function Mascot({
  size = 120,
  mood = 'happy',
  className,
  replayKey,
  halo,
}: {
  size?: number
  mood?: MascotMood
  className?: string
  replayKey?: number
  halo?: boolean
}) {
  return <PenguinArt pose={resolvePose(mood)} size={size} className={cx('animate-bob overflow-visible', className)} replayKey={replayKey} halo={halo} />
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
  const { route, t, settings, setSetting, speak, celebrateKey, comfortKey, user } = useStore()
  const tips = useMemo(() => TIP_KEYS[route.name] ?? TIP_KEYS.home, [route.name])
  const [idx, setIdx] = useState(0)
  const [open, setOpen] = useState(true)
  const [cheering, setCheering] = useState(false)
  const [comforting, setComforting] = useState(false)
  const cheerEndsAt = useRef(0)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    setIdx(0)
    setPinned(false)
    if (route.name !== 'home') setOpen(false)
  }, [route.name])

  // Tips close on their own so they never block the page; tapping Pip pins them open.
  useEffect(() => {
    if (!open || pinned || cheering || comforting) return
    const id = window.setTimeout(() => setOpen(false), 9000)
    return () => window.clearTimeout(id)
  }, [open, pinned, cheering, comforting, idx])

  useEffect(() => {
    if (!celebrateKey) return
    cheerEndsAt.current = Date.now() + 4000
    setCheering(true)
    setOpen(true)
    const id = window.setTimeout(() => setCheering(false), 4000)
    return () => window.clearTimeout(id)
  }, [celebrateKey])

  // A quiz finished below 60%: one gentle, encouraging moment. It fires once per finished quiz (never on
  // navigation) and waits for any celebration to finish first, so it never talks over the confetti.
  useEffect(() => {
    if (!comfortKey) return
    const wait = Math.max(0, cheerEndsAt.current - Date.now())
    const start = window.setTimeout(() => {
      setComforting(true)
      setOpen(true)
    }, wait)
    const stop = window.setTimeout(() => setComforting(false), wait + 7000)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(stop)
    }
  }, [comfortKey])

  const text = cheering ? t('tip.cheer') : comforting ? t('tip.comfort') : t(tips[idx % tips.length], { name: user?.name ?? '' })

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
            {!cheering && !comforting && tips.length > 1 && (
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
        {/* replayKey: a second celebration while Pip is still cheering restarts the hops instead of being ignored */}
        <Mascot size={84} mood={cheering ? 'cheer' : comforting ? 'encouraging' : open ? 'happy' : 'think'} replayKey={celebrateKey} />
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
