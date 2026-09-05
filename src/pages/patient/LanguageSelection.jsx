import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function LanguageSelection() {
  const { lang: selected, setLanguage, languages, t } = useLanguage()
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/patient/consent')
  }

  return (
    <div className="min-h-screen kiosk-canvas text-slate-900 flex items-center justify-center px-4 py-10 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-6 sm:p-10 border border-slate-200/80 bg-white/95 shadow-lg rounded-3xl max-w-2xl w-full text-center"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="glass-pill px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t('back', 'Home')}</span>
          </button>
          <span className="status-chip bg-cobalt-soft text-cobalt font-bold">
            Step 1 of 6 • भाषा चयन
          </span>
        </div>

        <div className="size-16 rounded-2xl bg-gradient-to-tr from-cobalt to-cobalt-deep flex items-center justify-center mx-auto mb-4 shadow-cobalt text-white">
          <Globe className="size-8" />
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-slate-900 mb-1">
          {t('chooseLanguage', 'Choose your language')} / भाषा चुनें
        </h1>
        <p className="text-xs text-slate-500 font-medium mb-6">
          {t('canChangeLang', 'You can change your language anytime during your session.')}
        </p>

        {/* 2-Column Responsive Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          {languages.map((langItem, i) => {
            const isSelected = selected === langItem.id
            return (
              <motion.div
                key={langItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.03 }}
              >
                <div
                  onClick={() => setLanguage(langItem.id)}
                  className={`glass-card tile-lift p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-cobalt ring-2 ring-cobalt/30 bg-cobalt-soft/20 shadow-xs'
                      : 'border-slate-200/80 bg-slate-50/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{langItem.flag}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm font-heading leading-tight">
                        {langItem.native}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {langItem.label} ({langItem.region})
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="size-6 rounded-full bg-cobalt flex items-center justify-center shrink-0 shadow-xs text-white">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="size-5 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-cobalt to-cobalt-deep text-white font-bold text-sm shadow-cobalt hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{t('continue', 'Continue')}</span>
          <ArrowRight className="size-4" />
        </button>
      </motion.div>
    </div>
  )
}
