import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Clock, CheckCircle, Users,
  ChevronRight, Heart, LogOut, Search, Filter
} from 'lucide-react'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import ConnectionStatus from '../../components/ConnectionStatus'
import { DEMO_PATIENTS, DEMO_DOCTOR } from '../../data/demoPatients'

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
}

const statusConfig = {
  ready_for_review: { label: 'Ready', badge: 'success', icon: CheckCircle },
  needs_verification: { label: 'Review', badge: 'medium', icon: AlertTriangle },
  in_progress: { label: 'In Progress', badge: 'neutral', icon: Clock },
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all') // 'all' | 'priority' | 'ready' | 'review'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const priorityCount = DEMO_PATIENTS.filter(p =>
    p.clinicalSignals.some(s => s.severity === 'critical' || s.severity === 'high')
  ).length
  const readyCount = DEMO_PATIENTS.filter(p =>
    p.consultation.status === 'ready_for_review'
  ).length
  const reviewCount = DEMO_PATIENTS.filter(p =>
    p.consultation.status === 'needs_verification'
  ).length

  // Filter patients based on query and status filter
  const filteredPatients = DEMO_PATIENTS.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.consultation.chiefComplaintText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.phone.includes(searchQuery)

    if (!matchesSearch) return false

    if (filterPriority === 'priority') {
      return patient.clinicalSignals.some(s => s.severity === 'critical' || s.severity === 'high')
    }
    if (filterPriority === 'ready') {
      return patient.consultation.status === 'ready_for_review'
    }
    if (filterPriority === 'review') {
      return patient.consultation.status === 'needs_verification'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface-raised border-b border-border-light/60 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary font-heading">
              ArogyaDarpan
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatus />
            <button
              onClick={() => navigate('/')}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-2 rounded-lg hover:bg-surface-muted"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <motion.div initial="hidden" animate="visible">
          {/* Greeting */}
          <motion.div custom={0} variants={fadeIn} className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary font-heading">
              {greeting}, {DEMO_DOCTOR.name}
            </h1>
            <p className="text-text-secondary mt-1 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary-600" />
              {DEMO_PATIENTS.length} patients in consultation queue
            </p>
          </motion.div>

          {/* Summary Metric Cards */}
          <motion.div custom={1} variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card
              hover
              onClick={() => setFilterPriority(filterPriority === 'priority' ? 'all' : 'priority')}
              selected={filterPriority === 'priority'}
              className="flex items-center gap-4 cursor-pointer"
              padding="p-5"
            >
              <div className="w-12 h-12 rounded-xl bg-critical-light flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-critical" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary font-heading">
                  {priorityCount}
                </p>
                <p className="text-sm text-text-muted">Priority Review Signals</p>
              </div>
            </Card>

            <Card
              hover
              onClick={() => setFilterPriority(filterPriority === 'ready' ? 'all' : 'ready')}
              selected={filterPriority === 'ready'}
              className="flex items-center gap-4 cursor-pointer"
              padding="p-5"
            >
              <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary font-heading">
                  {readyCount}
                </p>
                <p className="text-sm text-text-muted">Ready for Consultation</p>
              </div>
            </Card>

            <Card
              hover
              onClick={() => setFilterPriority(filterPriority === 'review' ? 'all' : 'review')}
              selected={filterPriority === 'review'}
              className="flex items-center gap-4 cursor-pointer"
              padding="p-5"
            >
              <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary font-heading">
                  {reviewCount}
                </p>
                <p className="text-sm text-text-muted">Needs Verification</p>
              </div>
            </Card>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div custom={2} variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, complaint, phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-surface-raised text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Filter className="w-4 h-4 text-text-muted mr-1" />
              {['all', 'priority', 'ready', 'review'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterPriority(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    filterPriority === tab
                      ? 'bg-primary-500 text-white shadow-xs'
                      : 'bg-surface-raised text-text-secondary border border-border-light hover:bg-surface-muted'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Patient list */}
          <motion.div custom={3} variants={fadeIn}>
            <div className="bg-surface-raised rounded-2xl border border-border-light/60 shadow-card overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-muted text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border-light/60">
                <div className="col-span-4">Patient</div>
                <div className="col-span-1">Age</div>
                <div className="col-span-3">Complaint</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Signals</div>
              </div>

              {/* Patient rows */}
              {filteredPatients.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-sm font-medium">
                  No matching patients found in this queue.
                </div>
              ) : (
                filteredPatients.map((patient, i) => {
                  const status = statusConfig[patient.consultation.status] || statusConfig.in_progress
                  const hasCritical = patient.clinicalSignals.some(s => s.severity === 'critical')

                  return (
                    <motion.div
                      key={patient.id}
                      custom={i + 3}
                      variants={fadeIn}
                      onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                      className={`
                        grid grid-cols-12 gap-4 px-6 py-4 items-center
                        border-b border-border-light/40 last:border-b-0
                        hover:bg-primary-50/30 cursor-pointer transition-colors
                        ${hasCritical ? 'bg-red-50/30' : ''}
                      `}
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{patient.name}</p>
                          <p className="text-xs text-text-muted">{patient.phone}</p>
                        </div>
                      </div>
                      <div className="col-span-1 text-sm text-text-secondary">{patient.age}</div>
                      <div className="col-span-3 text-sm text-text-primary">
                        {patient.consultation.chiefComplaintText}
                      </div>
                      <div className="col-span-2">
                        <Badge severity={status.badge} dot size="sm">
                          {status.label}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <div className="flex gap-1">
                          {patient.clinicalSignals.slice(0, 3).map((sig, j) => (
                            <span key={j} className="text-sm">
                              {sig.severity === 'critical' ? '🔴' :
                               sig.severity === 'high' ? '🟠' :
                               sig.severity === 'medium' ? '🟡' : '🔵'}
                            </span>
                          ))}
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
