import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useLanguage } from '../../context/LanguageContext'

export default function LanguageSelection() {
  const { lang: selected, setLanguage, languages, t } = useLanguage()
  const navigate = useNavigate()

  const handleContinue = () => {
    navigate('/patient/consent')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/30 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full text-center"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back', 'Home')}</span>
          </button>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
            Step 1 of 6
          </span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
          <Globe className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
          {t('chooseLanguage', 'Choose your language')} / भाषा चुनें
        </h1>
        <p className="text-text-secondary mb-8 text-sm sm:text-base">
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
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                <Card
                  hover
                  selected={isSelected}
                  onClick={() => setLanguage(langItem.id)}
                  padding="px-4 py-3.5"
                  className={`flex items-center justify-between cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/20 bg-primary-50/30'
                      : 'border-border-light hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{langItem.flag}</span>
                    <div>
                      <p className="font-semibold text-text-primary text-base leading-tight">
                        {langItem.native}
                      </p>
                      <p className="text-xs text-text-muted">
                        {langItem.label} ({langItem.region})
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border-light shrink-0" />
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>

        <Button size="lg" fullWidth onClick={handleContinue} className="shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2">
          <span>{t('continue', 'Continue')}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  )
}
