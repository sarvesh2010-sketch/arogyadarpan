import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'

const languages = [
  { id: 'en', label: 'English', native: '🇬🇧 English', flag: '🇬🇧' },
  { id: 'hi', label: 'Hindi', native: '🇮🇳 हिन्दी', flag: '🇮🇳' },
  { id: 'pa', label: 'Punjabi', native: '🇮🇳 ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
]

export default function LanguageSelection() {
  const [selected, setSelected] = useState(localStorage.getItem('arogya_language') || 'en')
  const navigate = useNavigate()

  const handleContinue = () => {
    localStorage.setItem('arogya_language', selected)
    navigate('/patient/consent')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Globe className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
          Choose your language / भाषा चुनें
        </h1>
        <p className="text-text-secondary mb-10">
          You can change your language anytime.
        </p>

        <div className="space-y-3 mb-10">
          {languages.map((lang, i) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Card
                hover
                selected={selected === lang.id}
                onClick={() => setSelected(lang.id)}
                padding="px-6 py-5"
                className="flex items-center gap-4"
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-semibold text-text-primary text-lg">{lang.native}</p>
                </div>
                {selected === lang.id && (
                  <div className="ml-auto w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <Button size="lg" fullWidth onClick={handleContinue}>
          Continue
        </Button>
      </motion.div>
    </div>
  )
}
