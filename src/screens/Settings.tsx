import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useStore } from '../store'
import { Avatar } from '../components/Shell'
import { Button, Card, LangToggle, Modal, PageHeader, Toggle } from '../components/ui'

export function Settings() {
  const { t, user, settings, setSetting, logout } = useStore()
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('settings.title')} />
      <Card className="flex items-center gap-4">
        <Avatar idx={user?.avatar ?? 0} size="size-20" />
        <div className="flex-1">
          <p className="font-display text-3xl">{user?.name}</p>
          <p className="text-ink-soft">
            {t('class')} {user?.className} · {t('settings.grade', { n: user?.grade ?? 4 })}
          </p>
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="text-2xl">{t('language')}</h2>
        <p className="mb-3 text-ink-soft">{t('settings.langHint')}</p>
        <LangToggle />
      </Card>

      <Card className="mt-5 !p-3 sm:!p-4">
        <h2 className="px-3 pt-2 text-2xl">{t('settings.helpTitle')}</h2>
        <Toggle checked={settings.readAloud} onChange={(v) => setSetting('readAloud', v)} label={t('readAloudToggle')} description={t('settings.readAloudD')} />
        <Toggle checked={!settings.helperHidden} onChange={(v) => setSetting('helperHidden', !v)} label={t('settings.helper')} description={t('settings.helperD')} />
        <Toggle checked={!settings.helperMuted} onChange={(v) => setSetting('helperMuted', !v)} label={t('settings.helperVoice')} description={t('settings.helperVoiceD')} />
        <Toggle checked={settings.largeText} onChange={(v) => setSetting('largeText', v)} label={t('settings.large')} description={t('settings.largeD')} />
      </Card>

      <Card className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h2 className="text-2xl">{t('logout')}</h2>
          <p className="text-ink-soft">{t('settings.logoutD')}</p>
        </div>
        <Button variant="coral" icon={<LogOut className="size-5" />} onClick={() => setConfirm(true)}>
          {t('logout')}
        </Button>
      </Card>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('logout.confirm')}
        tone="coral"
        actions={
          <>
            <Button variant="white" onClick={() => setConfirm(false)}>
              {t('logout.stay')}
            </Button>
            <Button variant="coral" onClick={logout}>
              {t('logout.yes')}
            </Button>
          </>
        }
      >
        {t('logout.body')}
      </Modal>
    </div>
  )
}
