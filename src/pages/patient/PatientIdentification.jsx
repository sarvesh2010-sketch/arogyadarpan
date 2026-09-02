import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, ArrowRight, Phone, CreditCard } from 'lucide-react'
import Button from '../../components/Button'
import Card from '../../components/Card'

export default function PatientIdentification() {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => {
    try {
      const stored = localStorage.getItem('arogya_patient')
      if (stored) return JSON.parse(stored)
    } catch (e) { /* ignore */ }
    return { name: '', age: '', gender: '', phone: '', abhaId: '' }
  })

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('arogya_patient', JSON.stringify(form))
    navigate('/patient/interview')
  }

  const handleDemoPatient = () => {
    const demoData = {
      name: 'Rahul Sharma',
      age: '46',
      gender: 'Male',
      phone: '9876543210',
      abhaId: 'ABHA-1234-5678',
    }
    setForm(demoData)
    localStorage.setItem('arogya_patient', JSON.stringify(demoData))
    navigate('/patient/interview')
  }

  const canContinue = form.name.trim() && form.age && form.gender

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface to-primary-50/20 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
            Your Information / आपकी जानकारी
          </h1>
          <p className="text-text-secondary">Please enter your basic identification details</p>
        </div>

        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Age (Years) *</label>
                <input
                  type="number"
                  required
                  value={form.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="e.g. 46"
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Gender *</label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male (पुरुष)</option>
                  <option value="Female">Female (महिला)</option>
                  <option value="Other">Other (अन्य)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-text-muted" /> Phone Number (10 Digits)
              </label>
              <input
                type="tel"
                maxLength={10}
                pattern="[0-9]{10}"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-text-muted" /> ABHA ID</span>
                <span className="text-text-muted font-normal text-xs">(optional / optional ABDM ID)</span>
              </label>
              <input
                type="text"
                value={form.abhaId}
                onChange={(e) => updateField('abhaId', e.target.value)}
                placeholder="e.g. ABHA-1234-5678 or 91-XXXXXXXXXXXX"
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={!canContinue}
              iconRight={ArrowRight}
            >
              Continue to Intake Interview
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <button
            onClick={handleDemoPatient}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer underline decoration-primary-200 hover:decoration-primary-400 transition-all"
          >
            Continue as Golden Demo Patient (Rahul Sharma)
          </button>
        </div>
      </motion.div>
    </div>
  )
}
