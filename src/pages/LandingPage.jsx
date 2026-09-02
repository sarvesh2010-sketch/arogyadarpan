import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mic, FileText, Brain, ClipboardCheck,
  Stethoscope, ArrowRight, Shield, Globe,
  ChevronRight, Heart
} from 'lucide-react'
import Button from '../components/Button'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const flowSteps = [
  { icon: Mic, label: 'Patient Story', desc: 'Voice + Touch input' },
  { icon: Brain, label: 'AI Intake', desc: 'Smart structuring' },
  { icon: FileText, label: 'Medical Records', desc: 'OCR & extraction' },
  { icon: ClipboardCheck, label: 'Structured History', desc: 'Timeline & signals' },
  { icon: Stethoscope, label: 'Doctor Review', desc: 'Verify & decide' },
]

const features = [
  { icon: Globe, title: 'Multilingual', desc: 'Hindi, English, Punjabi support with voice input' },
  { icon: Shield, title: 'AI-Assisted, Doctor-Decided', desc: 'AI prepares and explains. The doctor decides.' },
  { icon: FileText, title: 'Evidence-Backed', desc: 'Every fact traced to its source document or response' },
  { icon: Heart, title: 'Patient-Friendly', desc: 'Simple language, voice-first, guided experience' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="w-full min-h-screen bg-surface">
      {/* Top Navbar */}
      <header className="w-full border-b border-border-light bg-surface-raised">
        <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-text-primary font-heading tracking-tight">
              ArogyaDarpan
            </span>
          </div>
          <button
            onClick={() => navigate('/demo')}
            className="text-sm font-semibold text-text-secondary hover:text-primary-600 transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-primary-50"
          >
            Try Demo →
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div
            custom={0}
            variants={fadeInUp}
            className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-200 shadow-xs"
          >
            <Shield className="w-4 h-4 text-primary-600" />
            AI prepares. AI explains. The doctor decides.
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-extrabold text-text-primary font-heading leading-[1.15] tracking-tight"
          >
            Your health story,
            <br />
            <span className="text-primary-500">
              ready before the consultation.
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeInUp}
            className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            A multilingual AI-powered platform that collects patient history,
            understands previous medical records and prepares a structured
            clinical summary for doctors.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/patient/language')}
              iconRight={ArrowRight}
            >
              Start Patient Journey
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/doctor')}
              icon={Stethoscope}
            >
              Doctor Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Flow */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-surface-raised rounded-3xl border border-border-light shadow-card p-8 md:p-12"
        >
          <motion.h2
            custom={0}
            variants={fadeInUp}
            className="text-center text-2xl font-bold text-text-primary font-heading mb-10"
          >
            How it works
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 items-center justify-between">
            {flowSteps.map((step, i) => (
              <motion.div key={i} custom={i + 1} variants={fadeInUp} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-3 border border-primary-200 shadow-xs">
                  <step.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-bold text-sm text-text-primary mb-1">{step.label}</h3>
                <p className="text-xs text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeInUp}
              className="bg-surface-raised rounded-2xl border border-border-light p-6 hover:shadow-card-hover transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 border border-primary-100">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-bold text-lg text-text-primary mb-2 font-heading">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border-light py-8 text-center bg-surface-raised">
        <p className="text-sm font-medium text-text-secondary">
          ArogyaDarpan — Smart India Hackathon 2026
        </p>
        <p className="text-xs text-text-muted mt-1">
          AI prepares. AI explains. The doctor decides.
        </p>
      </footer>
    </div>
  )
}
