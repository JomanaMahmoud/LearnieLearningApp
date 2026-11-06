import { useState } from 'react'
import { AlertCircle, Bell, BookOpenCheck, CheckCheck, FileCheck2, HeartHandshake, Lightbulb, MessageCircle, Puzzle, RefreshCw, Send, ThumbsUp, Hand, Target } from 'lucide-react'
import type { Note, NoteType } from '../data'
import { useStore } from '../store'
import type { TKey } from '../i18n'
import { Button, Card, Empty, PageHeader, SpeakButton, cx, formatDate } from '../components/ui'

const TYPE_META: Record<NoteType, { icon: typeof Bell; bg: string; key: TKey }> = {
  results: { icon: BookOpenCheck, bg: 'bg-mint-100 text-mint-700', key: 'ntype.results' },
  feedback: { icon: MessageCircle, bg: 'bg-sky-100 text-sky-700', key: 'ntype.feedback' },
  weakness: { icon: Target, bg: 'bg-sun-100 text-sun-700', key: 'ntype.weakness' },
  support: { icon: HeartHandshake, bg: 'bg-coral-100 text-coral-700', key: 'ntype.support' },
  recommendation: { icon: Lightbulb, bg: 'bg-sun-100 text-sun-700', key: 'ntype.recommendation' },
  quiz: { icon: Puzzle, bg: 'bg-sun-100 text-sun-700', key: 'ntype.quiz' },
  reupload: { icon: RefreshCw, bg: 'bg-coral-100 text-coral-700', key: 'ntype.reupload' },
  corrected: { icon: AlertCircle, bg: 'bg-grape-100 text-grape-600', key: 'ntype.corrected' },
  submission: { icon: FileCheck2, bg: 'bg-sky-100 text-sky-700', key: 'ntype.submission' },
  message: { icon: MessageCircle, bg: 'bg-grape-100 text-grape-600', key: 'ntype.message' },
}

const FILTERS: { id: string; key: TKey; types: NoteType[] | null }[] = [
  { id: 'all', key: 'all', types: null },
  { id: 'results', key: 'nfilter.results', types: ['results', 'feedback', 'corrected'] },
  { id: 'practice', key: 'nfilter.practice', types: ['quiz', 'recommendation', 'weakness'] },
  { id: 'uploads', key: 'nfilter.uploads', types: ['submission', 'reupload'] },
  { id: 'messages', key: 'nfilter.messages', types: ['message', 'support'] },
]

export function Notifications() {
  const { t, notes, markAllRead, unread } = useStore()
  const [filter, setFilter] = useState('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const f = FILTERS.find((x) => x.id === filter)!
  const list = notes.filter((n) => (!f.types || f.types.includes(n.type)) && (!unreadOnly || !n.read)).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t('notes.title')}
        subtitle={unread ? t('notes.unread', { n: unread }) : t('notes.allRead')}
        right={
          <Button variant="white" size="md" disabled={!unread} icon={<CheckCheck className="size-5" />} onClick={markAllRead}>
            {t('notes.markAll')}
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((x) => {
          const count = notes.filter((n) => !n.read && (!x.types || x.types.includes(n.type))).length
          return (
            <button key={x.id} onClick={() => setFilter(x.id)} aria-pressed={filter === x.id} className={cx('flex min-h-11 items-center gap-2 rounded-full px-4 font-bold transition', filter === x.id ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-soft hover:text-ink')}>
              {t(x.key)}
              {count > 0 && <span className={cx('rounded-full px-2 text-xs', filter === x.id ? 'bg-coral-400' : 'bg-coral-100 text-coral-700')}>{count}</span>}
            </button>
          )
        })}
        <label className="ml-auto flex cursor-pointer items-center gap-2 font-bold text-ink-soft">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="size-5 accent-[var(--color-sky-500)]" />
          {t('notes.unreadOnly')}
        </label>
      </div>

      {list.length === 0 ? (
        <Empty title={t('notes.empty')} />
      ) : (
        <ul className="space-y-3">
          {list.map((n) => (
            <NoteItem key={n.id} note={n} />
          ))}
        </ul>
      )}
    </div>
  )
}

function NoteItem({ note }: { note: Note }) {
  const { t, L, go, markRead, reply, lang, user } = useStore()
  const [text, setText] = useState('')
  const meta = TYPE_META[note.type]
  const canReply = note.type === 'message' && (user?.grade ?? 0) >= 3
  const sendReply = (r: string) => {
    if (!r.trim()) return
    reply(note.id, r.trim())
    setText('')
  }
  return (
    <li>
      <Card className={cx('!p-4 sm:!p-5', !note.read && 'ring-2 !ring-sky-200')}>
        <div className="flex items-start gap-4">
          <span className={cx('relative grid size-12 shrink-0 place-items-center rounded-2xl', meta.bg)}>
            <meta.icon className="size-6" />
            {!note.read && <span className="absolute -right-1 -top-1 size-3.5 rounded-full bg-coral-400 ring-2 ring-white" aria-label={t('new')} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{t(meta.key)}</span>
              <span className="text-xs font-bold text-ink-soft">{formatDate(note.date, lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className={cx('mt-0.5 font-display text-lg leading-snug', !note.read ? 'text-ink' : 'text-ink/80')}>{L(note.title)}</p>
            <p className="text-ink-soft">{L(note.body)}</p>

            {canReply && (
              <div className="mt-3">
                {note.reply ? (
                  <p className="inline-flex items-center gap-2 rounded-2xl bg-mint-50 px-4 py-2 font-bold text-mint-700">
                    <Send className="size-4" /> {t('notes.youReplied')}: “{note.reply}”
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Button size="md" variant="mint" icon={<ThumbsUp className="size-5" />} onClick={() => sendReply(t('notes.understand'))}>
                        {t('notes.understand')}
                      </Button>
                      <Button size="md" variant="coral" icon={<Hand className="size-5" />} onClick={() => sendReply(t('notes.needHelp'))}>
                        {t('notes.needHelp')}
                      </Button>
                    </div>
                    <form
                      className="mt-2 flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                        sendReply(text)
                      }}
                    >
                      <input value={text} onChange={(e) => setText(e.target.value)} maxLength={80} placeholder={t('notes.replyPh')} className="min-h-11 flex-1 rounded-2xl bg-cloud px-4 outline-none ring-2 ring-transparent focus:ring-sky-300" aria-label={t('notes.replyPh')} />
                      <Button size="md" type="submit" disabled={!text.trim()} aria-label={t('notes.send')} icon={<Send className="size-5" />}>
                        <span className="hidden sm:inline">{t('notes.send')}</span>
                      </Button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <SpeakButton size="sm" text={`${L(note.title)}. ${L(note.body)}`} />
            {note.target && (
              <Button
                size="md"
                variant="soft"
                onClick={() => {
                  markRead(note.id)
                  go(note.target!)
                }}
              >
                {t('open')}
              </Button>
            )}
            {!note.read && !note.target && !canReply && (
              <button onClick={() => markRead(note.id)} className="text-sm font-bold text-sky-700 hover:underline">
                {t('notes.markRead')}
              </button>
            )}
          </div>
        </div>
      </Card>
    </li>
  )
}
