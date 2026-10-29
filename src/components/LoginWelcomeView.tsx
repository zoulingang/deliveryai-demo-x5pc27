import { useTranslation } from 'react-i18next'
import { AlertCircle, ArrowRight, CheckCircle2, Flame, Loader2, LogIn, ShieldCheck } from 'lucide-react'
import hotpot from '@/assets/hotpot.jpg'
import { Button } from '@/components/ui/button'

interface LoginWelcomeViewProps {
  loading: boolean
  error: string | null
  onLogin: () => void
}

export function LoginWelcomeView({ loading, error, onLogin }: LoginWelcomeViewProps) {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen overflow-hidden bg-rice-100 paper-noise">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <section className="animate-rise">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-chili-500/20 bg-white/85 px-3 py-2 text-xs font-bold text-chili-600 shadow-sm">
            <Flame size={14} />
            {t('login.badge')}
          </div>
          <p className="mb-3 text-sm font-bold tracking-widest text-chili-500">{t('common.concept_en')}</p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-charcoal-900 sm:text-5xl lg:text-6xl">
            {t('login.title')}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-charcoal-500 sm:text-lg">
            {t('login.desc')}
          </p>

          <div className="mt-7 grid gap-3 text-sm text-charcoal-700 sm:grid-cols-3">
            {[t('login.feature_table'), t('login.feature_order'), t('login.feature_store')].map((item) => (
              <span key={item} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 font-semibold shadow-sm">
                <CheckCircle2 size={16} className="shrink-0 text-chili-500" />
                {item}
              </span>
            ))}
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-chili-500/20 bg-chili-50 px-4 py-3 text-sm text-chili-700" role="alert">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button onClick={onLogin} disabled={loading} className="mt-7 h-12 w-full text-base sm:w-auto sm:min-w-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? t('login.loading') : t('login.action')}
            {!loading && <ArrowRight size={18} />}
          </Button>
        </section>

        <section className="animate-rise overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-float backdrop-blur">
          <div className="relative h-64 overflow-hidden sm:h-80 lg:h-[30rem]">
            <img src={hotpot} alt={t('login.img_alt')} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-charcoal-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <ShieldCheck size={14} />
                {t('login.demo_note')}
              </div>
              <h2 className="max-w-sm text-2xl font-extrabold leading-tight sm:text-3xl">{t('login.image_title')}</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-rice-200">{t('login.image_desc')}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
