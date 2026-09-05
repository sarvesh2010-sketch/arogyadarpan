import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Clock, CheckCircle2, Users,
  ChevronRight, Heart, LogOut, Search, Filter,
  Activity, Shield, Stethoscope, Sparkles
} from 'lucide-react'
import { DEMO_PATIENTS, DEMO_DOCTOR } from '../../data/demoPatients'
import ConnectionStatus from '../../components/ConnectionStatus'

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
}

const statusConfig = {
  ready_for_review: { label: 'Ready for Review', chipClass: 'bg-emerald-soft text-emerald', icon: CheckCircle2 },
  needs_verification: { label: 'Needs Verification', chipClass: 'bg-amber-50 text-amber-700 border border-amber-200', icon: AlertTriangle },
  in_progress: { label: 'Intake In Progress', chipClass: 'bg-slate-100 text-slate-600', icon: Clock },
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')

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
    <div className="min-h-screen kiosk-canvas text-slate-900 pb-12 select-none">
      {/* Top Glass Navigation Bar */}
      <header className="glass-card sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-cobalt to-cobalt-deep flex items-center justify-center shadow-cobalt text-white">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-black tracking-tight text-slate-900">
                  ArogyaDarpan
                </span>
                <span className="rounded-full bg-cobalt-soft px-2 py-0.5 text-[10px] font-bold text-cobalt border border-cobalt/20">
                  Physician Triage Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Clinical Decision Support • ABDM Linked • AYUSH Integration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="size-2 rounded-full bg-emerald animate-ping" />
              <span className="font-bold text-slate-700">{DEMO_DOCTOR.name}</span>
              <span className="text-[10px] text-slate-400">({DEMO_DOCTOR.specialty})</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="glass-pill p-2 text-slate-500 hover:text-coral hover:border-coral/40 transition cursor-pointer"
              title="Logout to Home"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-6">
        <motion.div initial="hidden" animate="visible" className="space-y-6">
          {/* Welcome & Queue Header */}
          <motion.div custom={0} variants={fadeIn} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-extrabold text-slate-900">
                {greeting}, {DEMO_DOCTOR.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <Users className="size-4 text-cobalt" />
                Active Consultation Stream: <strong className="text-slate-800">{DEMO_PATIENTS.length} Patients</strong> registered today
              </p>
            </div>

            <button
              onClick={() => navigate('/kiosk')}
              className="glass-pill px-4 py-2 text-xs font-bold text-cobalt border border-cobalt/30 hover:bg-cobalt-soft transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Activity className="size-3.5" />
              <span>Switch to Kiosk View</span>
            </button>
          </motion.div>

          {/* 3 Summary Telemetry Cards */}
          <motion.div custom={1} variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'priority' ? 'all' : 'priority')}
              className={`glass-card tile-lift p-5 text-left border transition cursor-pointer flex items-center gap-4 ${
                filterPriority === 'priority'
                  ? 'border-coral bg-white ring-2 ring-coral/30 shadow-xs'
                  : 'border-slate-200/80 bg-white/90 hover:bg-white'
              }`}
            >
              <div className="size-12 rounded-2xl bg-coral-soft flex items-center justify-center shrink-0 text-coral">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <p className="font-heading text-3xl font-black text-slate-900">
                  {priorityCount}
                </p>
                <p className="text-xs font-bold text-coral flex items-center gap-1 mt-0.5">
                  Priority Red-Flag Signals
                </p>
                <p className="text-[11px] text-slate-400">High severity triage alerts</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'ready' ? 'all' : 'ready')}
              className={`glass-card tile-lift p-5 text-left border transition cursor-pointer flex items-center gap-4 ${
                filterPriority === 'ready'
                  ? 'border-emerald bg-white ring-2 ring-emerald/30 shadow-xs'
                  : 'border-slate-200/80 bg-white/90 hover:bg-white'
              }`}
            >
              <div className="size-12 rounded-2xl bg-emerald-soft flex items-center justify-center shrink-0 text-emerald">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="font-heading text-3xl font-black text-slate-900">
                  {readyCount}
                </p>
                <p className="text-xs font-bold text-emerald flex items-center gap-1 mt-0.5">
                  Ready for Consultation
                </p>
                <p className="text-[11px] text-slate-400">Intake & OCR completed</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'review' ? 'all' : 'review')}
              className={`glass-card tile-lift p-5 text-left border transition cursor-pointer flex items-center gap-4 ${
                filterPriority === 'review'
                  ? 'border-amber-400 bg-white ring-2 ring-amber-400/30 shadow-xs'
                  : 'border-slate-200/80 bg-white/90 hover:bg-white'
              }`}
            >
              <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600 border border-amber-200">
                <Clock className="size-6" />
              </div>
              <div>
                <p className="font-heading text-3xl font-black text-slate-900">
                  {reviewCount}
                </p>
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                  Needs Physician Verification
                </p>
                <p className="text-[11px] text-slate-400">Complex history / pending tests</p>
              </div>
            </button>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div custom={2} variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, complaint, phone..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200/80 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt/40 focus:border-cobalt transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <Filter className="size-3.5 text-slate-400 shrink-0" />
              {[
                { id: 'all', label: 'All Patients' },
                { id: 'priority', label: 'Priority Alerts' },
                { id: 'ready', label: 'Ready for Review' },
                { id: 'review', label: 'Needs Verification' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterPriority(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    filterPriority === tab.id
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Patient Consultation Queue Table */}
          <motion.div custom={3} variants={fadeIn}>
            <div className="glass-card bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Patient Identity & ABHA</div>
                <div className="col-span-1">Age / Sex</div>
                <div className="col-span-3">Chief Complaint</div>
                <div className="col-span-2">Consult Status</div>
                <div className="col-span-2 text-right">Signals & Action</div>
              </div>

              {/* Rows */}
              {filteredPatients.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                  No matching patients found in this queue.
                </div>
              ) : (
                filteredPatients.map((patient, i) => {
                  const status = statusConfig[patient.consultation.status] || statusConfig.in_progress
                  const hasCritical = patient.clinicalSignals.some(s => s.severity === 'critical')
                  const hasHigh = patient.clinicalSignals.some(s => s.severity === 'high')

                  return (
                    <motion.div
                      key={patient.id}
                      custom={i + 3}
                      variants={fadeIn}
                      onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                      className={`grid grid-cols-12 gap-3 px-6 py-4 items-center border-b border-slate-100 last:border-b-0 hover:bg-cobalt-soft/20 cursor-pointer transition-colors ${
                        hasCritical ? 'bg-coral-soft/30 hover:bg-coral-soft/40' : ''
                      }`}
                    >
                      {/* Identity */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className={`size-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          hasCritical ? 'bg-coral text-white shadow-xs' : 'bg-cobalt-soft text-cobalt'
                        }`}>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate font-heading">{patient.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{patient.phone} • {patient.id}</p>
                        </div>
                      </div>

                      {/* Age */}
                      <div className="col-span-1 text-xs font-bold text-slate-600">
                        {patient.age}y / {patient.gender?.[0] || 'M'}
                      </div>

                      {/* Complaint */}
                      <div className="col-span-3 text-xs text-slate-800 font-medium line-clamp-2">
                        {patient.consultation.chiefComplaintText}
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`status-chip ${status.chipClass}`}>
                          {status.label}
                        </span>
                      </div>

                      {/* Signals & Action */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <div className="flex items-center gap-1">
                          {patient.clinicalSignals.slice(0, 3).map((sig, j) => (
                            <span
                              key={j}
                              className={`size-2.5 rounded-full inline-block ${
                                sig.severity === 'critical' ? 'bg-coral animate-ping' :
                                sig.severity === 'high' ? 'bg-amber-500' :
                                sig.severity === 'medium' ? 'bg-amber-300' : 'bg-cobalt'
                              }`}
                              title={sig.title || sig.severity}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          className="glass-pill size-8 flex items-center justify-center text-slate-400 hover:text-cobalt hover:border-cobalt/40 transition cursor-pointer"
                        >
                          <ChevronRight className="size-4" />
                        </button>
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
