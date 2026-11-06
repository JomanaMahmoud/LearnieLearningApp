import type { ReactNode } from 'react'
import { BarChart3, Bell, BookOpenCheck, Home, LogOut, Puzzle, Settings, Trophy, Upload, Volume2, VolumeX } from 'lucide-react'
import type { Route } from '../data'
import { useStore } from '../store'
import type { TKey } from '../i18n'
import { Mascot } from './Mascot'
import { Button, LangToggle, cx } from './ui'

const NAV: { name: Route['name']; key: TKey; icon: typeof Home; tone: string }[] = [
  { name: 'home', key: 'nav.home', icon: Home, tone: 'bg-sky-500' },
  { name: 'upload', key: 'nav.upload', icon: Upload, tone: 'bg-coral-400' },
  { name: 'results', key: 'nav.results', icon: BookOpenCheck, tone: 'bg-mint-400' },
  { name: 'progress', key: 'nav.progress', icon: BarChart3, tone: 'bg-grape-400' },
  { name: 'practice', key: 'nav.practice', icon: Puzzle, tone: 'bg-sun-400' },
  { name: 'achievements', key: 'nav.achievements', icon: Trophy, tone: 'bg-coral-400' },
]

const activeName = (r: Route['name']) => (r === 'quiz' ? 'practice' : r)

export function Logo({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Mascot size={small ? 34 : 44} className="!animate-none" />
      <span className={cx('font-display font-bold tracking-tight text-sky-600', small ? 'text-2xl' : 'text-3xl')}>
        Learn<span className="text-coral-400">ie</span>
      </span>
    </div>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { route, go, t, unread, user, settings, setSetting, toast, dismissToast } = useStore()
  const current = activeName(route.name)

  return (
    <div className="min-h-screen lg:pl-72">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-white px-5 py-6 shadow-soft lg:flex">
        <button onClick={() => go({ name: 'home' })} className="mb-8 self-start" aria-label="Learnie">
          <Logo />
        </button>
        <nav className="flex flex-col gap-1.5" aria-label={t('nav.main')}>
          {NAV.map((n) => {
            const active = current === n.name
            return (
              <button
                key={n.name}
                onClick={() => go({ name: n.name } as Route)}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex min-h-14 items-center gap-3 rounded-2xl px-3 text-left font-display text-lg font-medium transition',
                  active ? 'bg-sky-50 text-sky-700' : 'text-ink-soft hover:bg-cloud hover:text-ink',
                )}
              >
                <span className={cx('grid size-10 place-items-center rounded-xl text-white transition', active ? n.tone : 'bg-ink/10 text-ink-soft')}>
                  <n.icon className="size-5" />
                </span>
                {t(n.key)}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1.5">
          <button
            onClick={() => go({ name: 'settings' })}
            className={cx('flex min-h-12 items-center gap-3 rounded-2xl px-3 font-bold', route.name === 'settings' ? 'bg-sky-50 text-sky-700' : 'text-ink-soft hover:bg-cloud')}
          >
            <Settings className="size-5" /> {t('nav.settings')}
          </button>
          <button onClick={() => go({ name: 'settings' })} className="flex items-center gap-3 rounded-2xl bg-cloud p-3 text-left">
            <Avatar idx={user?.avatar ?? 0} />
            <span>
              <span className="block font-display text-lg leading-tight">{user?.name}</span>
              <span className="text-sm text-ink-soft">
                {t('class')} {user?.className}
              </span>
            </span>
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-paper/85 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="lg:hidden">
          <button onClick={() => go({ name: 'home' })} aria-label="Learnie">
            <Logo small />
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LangToggle />
          </div>
          <div className="sm:hidden">
            <LangToggle compact />
          </div>
          <button
            onClick={() => setSetting('readAloud', !settings.readAloud)}
            aria-pressed={settings.readAloud}
            title={t('readAloudToggle')}
            aria-label={t('readAloudToggle')}
            className={cx('grid size-12 place-items-center rounded-2xl shadow-soft ring-1 ring-ink/5 transition', settings.readAloud ? 'bg-sun-100 text-sun-700' : 'bg-white text-ink-soft')}
          >
            {settings.readAloud ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </button>
          <button
            onClick={() => go({ name: 'notifications' })}
            aria-label={`${t('nav.notifications')} (${unread})`}
            className={cx('relative grid size-12 place-items-center rounded-2xl bg-white shadow-soft ring-1 ring-ink/5', route.name === 'notifications' && 'ring-2 ring-sky-400')}
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-6 place-items-center rounded-full bg-coral-400 px-1.5 text-xs font-extrabold text-white ring-2 ring-paper">{unread}</span>
            )}
          </button>
          <button onClick={() => go({ name: 'settings' })} aria-label={t('nav.settings')} className="lg:hidden">
            <Avatar idx={user?.avatar ?? 0} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-40 pt-2 sm:px-8 lg:pb-24">{children}</main>

      {/* Mobile / tablet bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 gap-1 border-t border-ink/5 bg-white px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 lg:hidden" aria-label={t('nav.main')}>
        {NAV.map((n) => {
          const active = current === n.name
          return (
            <button key={n.name} onClick={() => go({ name: n.name } as Route)} aria-current={active ? 'page' : undefined} className="flex flex-col items-center gap-0.5 rounded-xl py-1">
              <span className={cx('grid h-9 w-12 place-items-center rounded-xl transition', active ? `${n.tone} text-white` : 'text-ink-soft')}>
                <n.icon className="size-5" />
              </span>
              <span className={cx('max-w-full truncate text-[11px] font-bold', active ? 'text-ink' : 'text-ink-soft')}>{t(n.key)}</span>
            </button>
          )
        })}
      </nav>

      {toast && (
        <div key={toast.id} className="fixed inset-x-0 bottom-28 z-50 flex justify-center px-4 lg:bottom-8" role="status">
          <div className="flex animate-rise items-center gap-4 rounded-2xl bg-ink px-5 py-3 font-semibold text-white shadow-2xl">
            {toast.msg}
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.fn()
                  dismissToast()
                }}
                className="rounded-xl bg-white/15 px-3 py-1.5 font-extrabold text-sun-300 hover:bg-white/25"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const AVATARS = ['bg-sky-400', 'bg-coral-400', 'bg-mint-400', 'bg-sun-400', 'bg-grape-400']
export function Avatar({ idx, size = 'size-12', name }: { idx: number; size?: string; name?: string }) {
  const { user } = useStore()
  const letter = (name ?? user?.name ?? '?').charAt(0)
  return <span className={cx('grid shrink-0 place-items-center rounded-2xl font-display text-xl font-semibold text-white', AVATARS[idx % AVATARS.length], size)}>{letter}</span>
}

export function LogoutButton({ onClick }: { onClick: () => void }) {
  const { t } = useStore()
  return (
    <Button variant="white" onClick={onClick} icon={<LogOut className="size-5" />}>
      {t('logout')}
    </Button>
  )
}
