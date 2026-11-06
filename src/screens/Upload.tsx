import { useRef, useState, type DragEvent } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  GripVertical,
  Hourglass,
  ImagePlus,
  Maximize2,
  PartyPopper,
  RefreshCw,
  Send,
  Sun,
  Trash2,
  Upload as UploadIcon,
  X,
} from 'lucide-react'
import { SUBJECTS, newId, samplePage, type ExamSession, type Page, type SessionStatus } from '../data'
import { useStore } from '../store'
import type { TKey } from '../i18n'
import { Mascot } from '../components/Mascot'
import { Button, Card, Chip, Modal, PageHeader, SectionTitle, SpeakButton, cx, formatDate, toneBg } from '../components/ui'

export function SessionStatusChip({ status }: { status: SessionStatus }) {
  const { t } = useStore()
  const map: Record<SessionStatus, { tone: 'sky' | 'mint' | 'sun' | 'coral' | 'grape'; key: TKey }> = {
    open: { tone: 'sky', key: 'status.open' },
    uploaded: { tone: 'grape', key: 'status.uploaded' },
    checking: { tone: 'sun', key: 'status.checking' },
    results: { tone: 'mint', key: 'status.results' },
    reupload: { tone: 'coral', key: 'status.reupload' },
  }
  const m = map[status]
  return (
    <Chip tone={m.tone} icon={<span className={cx('size-2 rounded-full bg-current', status === 'checking' && 'animate-pulse')} />}>
      {t(m.key)}
    </Chip>
  )
}

export function Upload() {
  const { route, sessions } = useStore()
  const sessionId = route.name === 'upload' ? route.sessionId : undefined
  const session = sessions.find((s) => s.id === sessionId)
  if (session) return <SessionView key={session.id} session={session} />
  return <SessionList />
}

function SessionList() {
  const { t, L, sessions, go, lang } = useStore()
  const reupload = sessions.filter((s) => s.status === 'reupload')
  const open = sessions.filter((s) => s.status === 'open' || s.status === 'reupload')
  const sent = sessions.filter((s) => s.status !== 'open' && s.status !== 'reupload')

  return (
    <div>
      <PageHeader title={t('upload.title')} subtitle={t('upload.subtitle')} speakText={`${t('upload.title')}. ${t('upload.subtitle')}`} />

      {reupload.map((s) => (
        <ReuploadBanner key={s.id} session={s} onAction={() => go({ name: 'upload', sessionId: s.id })} />
      ))}

      <SectionTitle>{t('upload.openSessions')}</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {open.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <Chip tone={SUBJECTS[s.subject].tone}>{L(SUBJECTS[s.subject].name)}</Chip>
              <SessionStatusChip status={s.status} />
            </div>
            <h3 className="mt-3 text-2xl">{L(s.title)}</h3>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-ink-soft">
              <span>
                {t('upload.examLang')}: <b className="text-ink">{s.examLang === 'de' ? 'Deutsch' : 'English'}</b>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-4" /> {t('upload.due')}: <b className="text-ink">{formatDate(s.due, lang, { weekday: 'short', day: 'numeric', month: 'short' })}</b>
              </span>
            </div>
            <Button className="mt-5 self-start" variant={s.status === 'reupload' ? 'coral' : 'primary'} onClick={() => go({ name: 'upload', sessionId: s.id })} iconRight={<ArrowRight className="size-5" />}>
              {s.status === 'reupload' ? t('upload.reuploadCta') : s.pages.length ? t('upload.continue') : t('upload.start')}
            </Button>
          </Card>
        ))}
        {open.length === 0 && <p className="text-ink-soft">{t('upload.noneOpen')}</p>}
      </div>

      <SectionTitle>{t('upload.sent')}</SectionTitle>
      <Card className="!p-2 sm:!p-3">
        <ul className="divide-y divide-ink/5">
          {sent.map((s) => (
            <li key={s.id}>
              <button onClick={() => go({ name: 'upload', sessionId: s.id })} className="flex w-full flex-wrap items-center gap-3 rounded-2xl p-3 text-left hover:bg-cloud">
                <span className={cx('grid size-11 place-items-center rounded-xl', toneBg[SUBJECTS[s.subject].tone])}>
                  <FileText className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg">{L(s.title)}</span>
                  {s.submittedAt && (
                    <span className="text-sm text-ink-soft">
                      {t('upload.sentOn')} {formatDate(s.submittedAt, lang)}
                    </span>
                  )}
                </span>
                <SessionStatusChip status={s.status} />
                <ChevronRight className="size-5 text-ink-soft" />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function ReuploadBanner({ session, onAction }: { session: ExamSession; onAction?: () => void }) {
  const { t, L } = useStore()
  if (!session.reuploadReason) return null
  return (
    <div className="mb-4 flex flex-col gap-4 rounded-[28px] bg-coral-50 p-5 ring-2 ring-coral-100 sm:flex-row sm:items-center">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-coral-400 text-white">
        <RefreshCw className="size-7" />
      </span>
      <div className="flex-1">
        <p className="font-display text-xl">
          {t('upload.reuploadTitle')}: {L(session.title)}
        </p>
        <p className="mt-1 text-lg">
          <span className="font-bold">Ms. Weber: </span>“{L(session.reuploadReason)}”
        </p>
      </div>
      <SpeakButton text={L(session.reuploadReason)} />
      {onAction && (
        <Button variant="coral" onClick={onAction}>
          {t('upload.reuploadCta')}
        </Button>
      )}
    </div>
  )
}

function StepTracker({ status }: { status: SessionStatus }) {
  const { t } = useStore()
  const steps: TKey[] = ['track.uploaded', 'track.checking', 'track.results']
  const at = status === 'uploaded' ? 0 : status === 'checking' ? 1 : status === 'results' ? 2 : -1
  return (
    <ol className="flex items-start" aria-label={t('track.label')}>
      {steps.map((k, i) => {
        const done = i < at || (i === at && status === 'results')
        const current = i === at && status !== 'results'
        return (
          <li key={k} className="relative flex flex-1 flex-col items-center text-center" aria-current={current ? 'step' : undefined}>
            {i > 0 && <span className={cx('absolute right-1/2 top-6 h-1.5 w-full -translate-y-1/2 rounded-full', i <= at ? 'bg-mint-400' : 'bg-ink/10')} />}
            <span
              className={cx(
                'relative z-10 grid size-12 place-items-center rounded-full font-display text-lg font-semibold ring-4 ring-white',
                done ? 'bg-mint-400 text-white' : current ? 'bg-sun-400 text-ink' : 'bg-ink/10 text-ink-soft',
              )}
            >
              {done ? <Check className="size-6" strokeWidth={3} /> : current ? <Hourglass className="size-5 animate-pulse" /> : i + 1}
            </span>
            <span className={cx('mt-2 max-w-28 text-sm font-bold sm:text-base', current || done ? 'text-ink' : 'text-ink-soft')}>{t(k)}</span>
          </li>
        )
      })}
    </ol>
  )
}

function SessionView({ session }: { session: ExamSession }) {
  const [replacing, setReplacing] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const editable = session.status === 'open' || session.status === 'reupload' || replacing
  if (justSent) return <SentScreen session={session} />
  if (editable)
    return (
      <UploadFlow
        session={session}
        replacing={replacing}
        onCancelReplace={() => setReplacing(false)}
        onSent={() => {
          setReplacing(false)
          setJustSent(true)
        }}
      />
    )
  return <StatusView session={session} onReplace={() => setReplacing(true)} />
}

function StatusView({ session, onReplace }: { session: ExamSession; onReplace: () => void }) {
  const { t, L, go, lang } = useStore()
  const msg: Record<string, TKey> = { uploaded: 'track.msg.uploaded', checking: 'track.msg.checking', results: 'track.msg.results' }
  return (
    <div>
      <PageHeader title={L(session.title)} subtitle={`${L(SUBJECTS[session.subject].name)} · ${t('upload.sentOn')} ${session.submittedAt ? formatDate(session.submittedAt, lang) : ''}`} onBack={() => go({ name: 'upload' })} />
      <Card>
        <StepTracker status={session.status} />
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl bg-cloud p-6 text-center sm:flex-row sm:text-left">
          <Mascot size={90} mood={session.status === 'results' ? 'cheer' : 'think'} />
          <div className="flex-1">
            <p className="font-display text-2xl">{t(msg[session.status] ?? 'track.msg.checking')}</p>
            <p className="mt-1 text-ink-soft">{t('track.private')}</p>
          </div>
          <SpeakButton text={t(msg[session.status] ?? 'track.msg.checking')} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {session.status === 'results' && session.examId && (
            <Button variant="mint" onClick={() => go({ name: 'results', examId: session.examId })}>
              {t('track.seeResults')}
            </Button>
          )}
          {session.status === 'uploaded' && (
            <>
              <Button variant="white" icon={<RefreshCw className="size-5" />} onClick={onReplace}>
                {t('track.replace')}
              </Button>
              <p className="self-center text-sm text-ink-soft">{t('track.replaceHint')}</p>
            </>
          )}
          {session.status === 'checking' && <p className="text-ink-soft">{t('track.noReplace')}</p>}
        </div>
      </Card>
    </div>
  )
}

function SentScreen({ session }: { session: ExamSession }) {
  const { t, L, go } = useStore()
  return (
    <div className="mx-auto max-w-2xl pt-6 text-center">
      <div className="flex justify-center">
        <Mascot size={160} mood="cheer" />
      </div>
      <h1 className="mt-4 text-4xl">{t('sent.title')}</h1>
      <p className="mt-2 text-xl text-ink-soft">{t('sent.body', { exam: L(session.title), n: session.pages.length })}</p>
      <Card className="mt-8 text-left">
        <StepTracker status="uploaded" />
      </Card>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => go({ name: 'home' })}>{t('backHome')}</Button>
        <Button variant="white" onClick={() => go({ name: 'upload' })}>
          {t('sent.more')}
        </Button>
      </div>
    </div>
  )
}

const isPdf = (p: Page) => p.name.toLowerCase().endsWith('.pdf')

function PageThumb({ page, className }: { page: Page; className?: string }) {
  if (isPdf(page))
    return (
      <div className={cx('grid place-items-center bg-coral-50 text-coral-500', className)}>
        <FileText className="size-10" />
      </div>
    )
  return <img src={page.url} alt={page.name} className={cx('object-cover', className)} draggable={false} />
}

function UploadFlow({ session, replacing, onCancelReplace, onSent }: { session: ExamSession; replacing: boolean; onCancelReplace: () => void; onSent: () => void }) {
  const { t, L, go, updateSession, submitSession, showToast, lang } = useStore()
  const [step, setStep] = useState<1 | 2>(1)
  const pages = session.pages
  const setPages = (next: Page[]) => updateSession(session.id, { pages: next })
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [retakeIdx, setRetakeIdx] = useState<number | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [checks, setChecks] = useState([false, false])
  const fileRef = useRef<HTMLInputElement>(null)
  const camRef = useRef<HTMLInputElement>(null)
  const retakeRef = useRef<HTMLInputElement>(null)

  const toPages = (files: FileList | File[]) => {
    const ok: Page[] = []
    let bad = 0
    let big = 0
    Array.from(files).forEach((f) => {
      const allowed = f.type.startsWith('image/') || f.type === 'application/pdf'
      if (!allowed) bad++
      else if (f.size > 15 * 1024 * 1024) big++
      else ok.push({ id: newId('p'), url: URL.createObjectURL(f), name: f.name })
    })
    if (bad) setError(t('upload.err.type'))
    else if (big) setError(t('upload.err.size'))
    else setError(null)
    return ok
  }

  const addFiles = (files: FileList | File[] | null) => {
    if (!files || !files.length) return
    const ok = toPages(files)
    if (ok.length) {
      setPages([...pages, ...ok])
      showToast(t('upload.added', { n: ok.length }))
    }
  }

  const addSamples = () => {
    const start = pages.length
    setPages([...pages, ...[1, 2].map((i) => ({ id: newId('p'), url: samplePage(start + i, L(session.title).split(':')[0]), name: `page-${start + i}.png` }))])
    setError(null)
  }

  const remove = (idx: number) => {
    const removed = pages[idx]
    const next = pages.filter((_, i) => i !== idx)
    setPages(next)
    setPreview(null)
    showToast(t('upload.deleted', { n: idx + 1 }), {
      label: t('undo'),
      fn: () => {
        const restored = [...next]
        restored.splice(idx, 0, removed)
        updateSession(session.id, { pages: restored })
      },
    })
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= pages.length || from === to) return
    const next = [...pages]
    const [p] = next.splice(from, 1)
    next.splice(to, 0, p)
    setPages(next)
  }

  const retake = (files: FileList | null) => {
    if (retakeIdx === null || !files?.length) return
    const [p] = toPages(files)
    if (p) {
      const next = [...pages]
      next[retakeIdx] = p
      setPages(next)
      showToast(t('upload.replaced', { n: retakeIdx + 1 }))
    }
    setRetakeIdx(null)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const steps = [t('flow.add'), t('flow.check'), t('flow.send')]
  const current = step === 1 ? 0 : 1

  return (
    <div>
      <PageHeader
        title={L(session.title)}
        subtitle={`${L(SUBJECTS[session.subject].name)} · ${t('upload.examLang')}: ${session.examLang === 'de' ? 'Deutsch' : 'English'} · ${t('upload.due')} ${formatDate(session.due, lang)}`}
        onBack={() => (step === 2 ? setStep(1) : replacing ? onCancelReplace() : go({ name: 'upload' }))}
      />

      {session.status === 'reupload' && <ReuploadBanner session={session} />}
      {replacing && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-grape-100 p-4 font-semibold text-grape-600">
          <RefreshCw className="size-5" /> {t('upload.replacingInfo')}
        </div>
      )}

      {/* Flow steps */}
      <ol className="mb-6 flex flex-wrap gap-2" aria-label={t('flow.label')}>
        {steps.map((s, i) => (
          <li key={s} aria-current={i === current ? 'step' : undefined} className={cx('flex items-center gap-2 rounded-full px-4 py-2 font-bold', i === current ? 'bg-sky-500 text-white' : i < current ? 'bg-mint-100 text-mint-700' : 'bg-white text-ink-soft ring-1 ring-ink/10')}>
            <span className={cx('grid size-6 place-items-center rounded-full text-sm', i === current ? 'bg-white/25' : i < current ? 'bg-mint-400 text-white' : 'bg-ink/10')}>{i < current ? <Check className="size-4" /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => (addFiles(e.target.files), (e.target.value = ''))} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => (addFiles(e.target.files), (e.target.value = ''))} />
      <input ref={retakeRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => (retake(e.target.files), (e.target.value = ''))} />

      {step === 1 && (
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cx('rounded-[28px] border-[3px] border-dashed bg-white p-6 text-center transition sm:p-8', dragOver ? 'border-sky-400 bg-sky-50' : 'border-sky-200')}
            >
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-sky-100 text-sky-600">
                <UploadIcon className="size-8" />
              </div>
              <p className="mt-3 font-display text-2xl">{t('upload.drop')}</p>
              <p className="text-ink-soft">{t('upload.types')}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button variant="coral" icon={<Camera className="size-6" />} onClick={() => camRef.current?.click()}>
                  {t('upload.camera')}
                </Button>
                <Button variant="primary" icon={<FolderOpen className="size-6" />} onClick={() => fileRef.current?.click()}>
                  {t('upload.files')}
                </Button>
              </div>
              <button onClick={addSamples} className="mt-4 text-sm font-bold text-sky-700 underline-offset-4 hover:underline">
                {t('upload.samples')}
              </button>
              {error && (
                <p role="alert" className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-coral-50 p-3 font-bold text-coral-700">
                  <AlertTriangle className="size-5 shrink-0" /> {error}
                </p>
              )}
            </div>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">{t('upload.yourPages')}</h2>
                <Chip tone={pages.length ? 'mint' : 'sky'}>{t('upload.pageCount', { n: pages.length })}</Chip>
              </div>
              {pages.length === 0 ? (
                <p className="mt-3 text-ink-soft">{t('upload.noPages')}</p>
              ) : (
                <>
                  <p className="mt-1 text-sm text-ink-soft">{t('upload.reorderHint')}</p>
                  <ul className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {pages.map((p, i) => (
                      <li
                        key={p.id}
                        draggable
                        onDragStart={() => setDragIdx(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (dragIdx !== null) move(dragIdx, i)
                          setDragIdx(null)
                        }}
                        className={cx('w-36 shrink-0 rounded-2xl bg-cloud p-2 ring-1 ring-ink/5', dragIdx === i && 'opacity-50')}
                      >
                        <div className="mb-1.5 flex items-center justify-between px-1">
                          <span className="font-display font-semibold">{t('upload.page', { n: i + 1 })}</span>
                          <GripVertical className="size-4 cursor-grab text-ink-soft" aria-hidden />
                        </div>
                        <button onClick={() => setPreview(i)} className="group relative block w-full overflow-hidden rounded-xl" aria-label={t('upload.preview', { n: i + 1 })}>
                          <PageThumb page={p} className="aspect-[3/4] w-full" />
                          <span className="absolute inset-0 grid place-items-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/30 group-hover:opacity-100">
                            <Maximize2 className="size-6" />
                          </span>
                        </button>
                        <div className="mt-2 grid grid-cols-4 gap-1">
                          <IconBtn label={t('upload.moveLeft')} onClick={() => move(i, i - 1)} disabled={i === 0}>
                            <ChevronLeft className="size-4" />
                          </IconBtn>
                          <IconBtn
                            label={t('upload.retake')}
                            onClick={() => {
                              setRetakeIdx(i)
                              retakeRef.current?.click()
                            }}
                          >
                            <RefreshCw className="size-4" />
                          </IconBtn>
                          <IconBtn label={t('upload.delete')} onClick={() => remove(i)} danger>
                            <Trash2 className="size-4" />
                          </IconBtn>
                          <IconBtn label={t('upload.moveRight')} onClick={() => move(i, i + 1)} disabled={i === pages.length - 1}>
                            <ChevronRight className="size-4" />
                          </IconBtn>
                        </div>
                      </li>
                    ))}
                    <li className="w-36 shrink-0">
                      <button onClick={() => fileRef.current?.click()} className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 font-bold text-ink-soft hover:border-sky-300 hover:text-sky-700">
                        <ImagePlus className="size-7" /> {t('upload.addPage')}
                      </button>
                    </li>
                  </ul>
                </>
              )}
              <div className="mt-5 flex justify-end">
                <Button disabled={!pages.length} onClick={() => setStep(2)} iconRight={<ArrowRight className="size-5" />}>
                  {t('flow.next')}
                </Button>
              </div>
            </Card>
          </div>

          <Card className="h-fit bg-sun-50 !ring-sun-100">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-sun-400 text-ink">
                <Sun className="size-6" />
              </span>
              <h2 className="text-2xl">{t('photo.title')}</h2>
              <SpeakButton size="sm" text={`${t('photo.title')}. ${t('photo.1')}. ${t('photo.2')}. ${t('photo.3')}. ${t('photo.4')}`} />
            </div>
            <ol className="mt-4 space-y-3">
              {(['photo.1', 'photo.2', 'photo.3', 'photo.4'] as TKey[]).map((k, i) => (
                <li key={k} className="flex items-start gap-3 text-lg">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white font-display font-semibold text-sun-700">{i + 1}</span>
                  {t(k)}
                </li>
              ))}
            </ol>
            <PhotoGuide />
          </Card>
        </div>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-2xl">{t('review.title')}</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <Summary label={t('review.subject')} value={L(SUBJECTS[session.subject].name)} />
            <Summary label={t('review.exam')} value={L(session.title)} />
            <Summary label={t('review.pages')} value={t('upload.pageCount', { n: pages.length })} />
          </dl>
          <ul className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {pages.map((p, i) => (
              <li key={p.id} className="w-28 shrink-0">
                <button onClick={() => setPreview(i)} className="block w-full overflow-hidden rounded-xl ring-1 ring-ink/10">
                  <PageThumb page={p} className="aspect-[3/4] w-full" />
                </button>
                <p className="mt-1 text-center text-sm font-bold">{t('upload.page', { n: i + 1 })}</p>
              </li>
            ))}
          </ul>
          <fieldset className="mt-5 space-y-2">
            <legend className="mb-2 font-display text-xl">{t('review.checkTitle')}</legend>
            {(['review.check1', 'review.check2'] as TKey[]).map((k, i) => (
              <label key={k} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl p-3 text-lg ring-2 transition', checks[i] ? 'bg-mint-50 ring-mint-300' : 'bg-white ring-ink/10')}>
                <input type="checkbox" className="size-6 accent-[var(--color-mint-500)]" checked={checks[i]} onChange={(e) => setChecks((c) => c.map((x, j) => (j === i ? e.target.checked : x)))} />
                {t(k)}
              </label>
            ))}
          </fieldset>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <Button variant="white" icon={<ArrowLeft className="size-5" />} onClick={() => setStep(1)}>
              {t('review.change')}
            </Button>
            <Button variant="mint" disabled={!checks.every(Boolean)} icon={<Send className="size-5" />} onClick={() => setConfirm(true)}>
              {t('review.send')}
            </Button>
          </div>
          {!checks.every(Boolean) && <p className="mt-2 text-right text-sm text-ink-soft">{t('review.tickHint')}</p>}
        </Card>
      )}

      {/* Full-screen preview */}
      {preview !== null && pages[preview] && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink/90 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label={t('upload.preview', { n: preview + 1 })}>
          <div className="flex items-center justify-between text-white">
            <p className="font-display text-xl">
              {t('upload.page', { n: preview + 1 })} / {pages.length}
            </p>
            <button onClick={() => setPreview(null)} aria-label={t('close')} className="grid size-12 place-items-center rounded-full bg-white/15 hover:bg-white/25">
              <X className="size-6" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center gap-3 py-4">
            <button disabled={preview === 0} onClick={() => setPreview(preview - 1)} aria-label={t('prev')} className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 text-white disabled:opacity-30">
              <ChevronLeft className="size-7" />
            </button>
            <PageThumb page={pages[preview]} className="max-h-full max-w-full rounded-2xl !object-contain shadow-2xl" />
            <button disabled={preview === pages.length - 1} onClick={() => setPreview(preview + 1)} aria-label={t('next')} className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 text-white disabled:opacity-30">
              <ChevronRight className="size-7" />
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="white"
              icon={<RefreshCw className="size-5" />}
              onClick={() => {
                setRetakeIdx(preview)
                retakeRef.current?.click()
              }}
            >
              {t('upload.retake')}
            </Button>
            <Button variant="coral" icon={<Trash2 className="size-5" />} onClick={() => remove(preview)}>
              {t('upload.delete')}
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('review.confirmTitle')}
        tone="mint"
        actions={
          <>
            <Button variant="white" onClick={() => setConfirm(false)}>
              {t('review.notYet')}
            </Button>
            <Button
              variant="mint"
              icon={<PartyPopper className="size-5" />}
              onClick={() => {
                setConfirm(false)
                submitSession(session.id)
                onSent()
              }}
            >
              {t('review.yesSend')}
            </Button>
          </>
        }
      >
        {t('review.confirmBody', { n: pages.length, exam: L(session.title) })}
      </Modal>
    </div>
  )
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className={cx('grid h-9 place-items-center rounded-lg bg-white transition disabled:opacity-30', danger ? 'text-coral-500 hover:bg-coral-50' : 'text-ink-soft hover:bg-sky-50 hover:text-sky-700')}>
      {children}
    </button>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-cloud p-4">
      <dt className="text-sm font-bold text-ink-soft">{label}</dt>
      <dd className="font-display text-lg">{value}</dd>
    </div>
  )
}

function PhotoGuide() {
  const { t } = useStore()
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <figure className="rounded-2xl bg-white p-3 text-center">
        <div className="relative mx-auto aspect-[3/4] w-20 rounded-md bg-paper shadow ring-1 ring-ink/10">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="absolute left-2 right-2 h-0.5 rounded bg-sky-300" style={{ top: 14 + i * 14 }} />
          ))}
        </div>
        <figcaption className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-mint-700">
          <Check className="size-4" /> {t('photo.good')}
        </figcaption>
      </figure>
      <figure className="rounded-2xl bg-white p-3 text-center">
        <div className="relative mx-auto aspect-[3/4] w-20 rotate-12 rounded-md bg-ink/30 blur-[1.5px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="absolute left-2 right-2 h-0.5 rounded bg-white/40" style={{ top: 14 + i * 14 }} />
          ))}
        </div>
        <figcaption className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-coral-700">
          <X className="size-4" /> {t('photo.bad')}
        </figcaption>
      </figure>
    </div>
  )
}
