import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ArrowLeft, Volume2, X } from 'lucide-react'
import type { Lang, Tone } from '../data'
import { useStore } from '../store'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const toneBg: Record<Tone, string> = {
  sky: 'bg-sky-100 text-sky-700',
  mint: 'bg-mint-100 text-mint-700',
  sun: 'bg-sun-100 text-sun-700',
  coral: 'bg-coral-100 text-coral-700',
  grape: 'bg-grape-100 text-grape-600',
}
export const toneSolid: Record<Tone, string> = {
  sky: 'bg-sky-500',
  mint: 'bg-mint-400',
  sun: 'bg-sun-400',
  coral: 'bg-coral-400',
  grape: 'bg-grape-400',
}

type Variant = 'primary' | 'mint' | 'sun' | 'coral' | 'soft' | 'ghost' | 'white'
const variants: Record<Variant, string> = {
  primary: 'bg-sky-500 text-white shadow-[0_4px_0_0_var(--color-sky-700)] hover:bg-sky-600',
  mint: 'bg-mint-400 text-white shadow-[0_4px_0_0_var(--color-mint-700)] hover:bg-mint-500',
  sun: 'bg-sun-400 text-ink shadow-[0_4px_0_0_var(--color-sun-700)] hover:bg-sun-300',
  coral: 'bg-coral-400 text-white shadow-[0_4px_0_0_var(--color-coral-700)] hover:bg-coral-500',
  soft: 'bg-sky-50 text-sky-700 shadow-[0_3px_0_0_var(--color-sky-200)] hover:bg-sky-100',
  white: 'bg-white text-ink shadow-[0_3px_0_0_rgba(36,48,77,0.15)] ring-2 ring-ink/5 hover:bg-cloud',
  ghost: 'bg-transparent text-ink-soft hover:bg-ink/5',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'md' | 'lg' | 'xl'; icon?: ReactNode; iconRight?: ReactNode }) {
  return (
    <button
      {...props}
      className={cx(
        'inline-flex select-none items-center justify-center gap-2 rounded-2xl font-display font-semibold transition-[transform,box-shadow,background-color] active:translate-y-[3px] active:shadow-none disabled:opacity-45 disabled:active:translate-y-0',
        size === 'md' && 'min-h-11 px-4 text-base',
        size === 'lg' && 'min-h-14 px-6 text-lg',
        size === 'xl' && 'min-h-16 px-8 text-xl',
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}

export function Card({ className, children, as: As = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' }) {
  return <As className={cx('rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-ink/5 sm:p-6', className)}>{children}</As>
}

export function Chip({ tone = 'sky', icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold', toneBg[tone], className)}>
      {icon}
      {children}
    </span>
  )
}

export function SpeakButton({ text, lang, className, size = 'md' }: { text: string; lang?: Lang; className?: string; size?: 'sm' | 'md' }) {
  const { settings, speak, t } = useStore()
  if (!settings.readAloud) return null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speak(text, lang)
      }}
      aria-label={t('readAloud')}
      title={t('readAloud')}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-sun-100 text-sun-700 transition hover:bg-sun-300 active:scale-95',
        size === 'md' ? 'size-11' : 'size-9',
        className,
      )}
    >
      <Volume2 className={size === 'md' ? 'size-5' : 'size-4'} />
    </button>
  )
}

/** Chunky rounded star used for scores and rewards. */
export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points="12,2.5 14.9,8.6 21.5,9.3 16.5,13.8 17.9,20.4 12,17 6.1,20.4 7.5,13.8 2.5,9.3 9.1,8.6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function Stars({ n, of = 3, size = 'size-6', className }: { n: number; of?: number; size?: string; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-0.5', className)} aria-label={`${n} / ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <StarIcon key={i} className={cx(size, i < n ? 'fill-sun-400 text-sun-500' : 'fill-[#eceef3] text-[#c8cdd8]')} />
      ))}
    </span>
  )
}

export function ProgressBar({ value, max = 100, tone = 'sky', className, label }: { value: number; max?: number; tone?: Tone; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={cx('h-3.5 w-full overflow-hidden rounded-full bg-ink/8', className)} role="progressbar" aria-valuenow={value} aria-valuemax={max} aria-label={label}>
      <div className={cx('h-full rounded-full transition-[width] duration-500', toneSolid[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Ring({ value, size = 72, stroke = 9, color = 'var(--color-grape-400)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(36,48,77,0.08)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-display font-semibold">{children}</div>
    </div>
  )
}

export function FractionBar({ n, d, tone = 'sky', label }: { n: number; d: number; tone?: Tone; label?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {label !== false && (
        <span className="w-12 text-center font-display text-2xl font-semibold">
          {n}/{d}
        </span>
      )}
      <div className="flex h-9 flex-1 overflow-hidden rounded-xl ring-2 ring-ink/15">
        {Array.from({ length: d }, (_, i) => (
          <div key={i} className={cx('flex-1 border-r-2 border-white last:border-r-0', i < n ? toneSolid[tone] : 'bg-ink/5')} />
        ))}
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, onBack, right, speakText }: { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode; speakText?: string }) {
  const { t } = useStore()
  return (
    <div className="mb-6 flex flex-wrap items-start gap-4">
      {onBack && (
        <button onClick={onBack} aria-label={t('back')} className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white shadow-soft ring-1 ring-ink/5 hover:bg-cloud">
          <ArrowLeft className="size-6" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl text-ink sm:text-4xl">{title}</h1>
          {speakText !== undefined && <SpeakButton text={speakText || title} size="sm" />}
        </div>
        {subtitle && <p className="mt-1 text-lg text-ink-soft">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-center justify-between gap-3">
      <h2 className="text-2xl text-ink">{children}</h2>
      {right}
    </div>
  )
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-3 hover:bg-cloud">
      <span>
        <span className="block font-bold">{label}</span>
        {description && <span className="block text-sm text-ink-soft">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative h-9 w-16 shrink-0 rounded-full transition', checked ? 'bg-mint-400' : 'bg-ink/15')}
      >
        <span className={cx('absolute top-1 size-7 rounded-full bg-white shadow transition-all', checked ? 'left-8' : 'left-1')} />
      </button>
    </label>
  )
}

export function LangToggle({ compact }: { compact?: boolean }) {
  const { lang, setSetting, t } = useStore()
  const opts: { v: Lang; label: string; short: string }[] = [
    { v: 'en', label: 'English', short: 'EN' },
    { v: 'de', label: 'Deutsch', short: 'DE' },
  ]
  return (
    <div role="radiogroup" aria-label={t('language')} className="inline-flex rounded-2xl bg-white p-1 shadow-soft ring-1 ring-ink/5">
      {opts.map((o) => (
        <button
          key={o.v}
          role="radio"
          aria-checked={lang === o.v}
          onClick={() => setSetting('lang', o.v)}
          className={cx('rounded-xl px-3 py-2 text-sm font-extrabold transition', lang === o.v ? 'bg-sky-500 text-white' : 'text-ink-soft hover:bg-cloud')}
        >
          {compact ? o.short : o.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({ open, onClose, title, children, actions, tone = 'sky' }: { open: boolean; onClose: () => void; title: string; children?: ReactNode; actions?: ReactNode; tone?: Tone }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg animate-pop rounded-[32px] bg-white p-7 shadow-2xl outline-none"
      >
        <div className={cx('absolute inset-x-0 top-0 h-2 rounded-t-[32px]', toneSolid[tone])} />
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full hover:bg-cloud">
          <X className="size-5" />
        </button>
        <h2 className="pr-10 text-2xl">{title}</h2>
        {children && <div className="mt-3 text-lg text-ink-soft">{children}</div>}
        {actions && <div className="mt-6 flex flex-wrap justify-end gap-3">{actions}</div>}
      </div>
    </div>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[28px] border-2 border-dashed border-ink/10 p-8 text-center">
      <p className="font-display text-xl">{title}</p>
      {children && <div className="mt-2 text-ink-soft">{children}</div>}
    </div>
  )
}

export function formatDate(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Date(iso.length === 10 ? `${iso}T12:00` : iso).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', opts)
}
