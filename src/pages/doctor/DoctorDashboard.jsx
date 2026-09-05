import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Clock, CheckCircle2, Users,
  ChevronRight, Heart, LogOut, Search, Filter,
  Activity, Shield, Stethoscope, Sparkles, TrendingUp,
  BarChart3, ArrowUpRight, ArrowLeft
} from 'lucide-react'
import { DEMO_PATIENTS, DEMO_DOCTOR } from '../../data/demoPatients'
import ConnectionStatus from '../../components/ConnectionStatus'
import { BottomNav } from '../../components/kiosk/BionicKioskShell'

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
}

const statusConfig = {
  ready_for_review: { label: 'Ready for Review', chipClass: 'bg-emerald-soft text-emerald border border-emerald/20', icon: CheckCircle2 },
  needs_verification: { label: 'Needs Verification', chipClass: 'bg-amber-50 text-amber-700 border border-amber-200', icon: AlertTriangle },
  in_progress: { label: 'Intake In Progress', chipClass: 'bg-slate-100 text-slate-600 border border-slate-200', icon: Clock },
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
    <div className="min-h-screen kiosk-canvas text-slate-900 pb-28 overflow-y-auto">
      {/* Top Glass Navigation Bar with Safe Area Support */}
      <header className="glass-card sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5 pt-[calc(env(safe-area-inset-top,0px)+0.65rem)] shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-9 sm:size-10 rounded-2xl bg-gradient-to-tr from-cobalt to-cobalt-deep flex items-center justify-center shadow-cobalt text-white shrink-0">
              <Stethoscope className="size-4.5 sm:size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-heading text-base sm:text-lg font-black tracking-tight text-slate-900">
                  ArogyaDarpan
                </span>
                <span className="rounded-full bg-cobalt-soft px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-cobalt border border-cobalt/20">
                  Physician Console
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
                Clinical Decision Support • ABDM Linked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ConnectionStatus />
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="size-2 rounded-full bg-emerald animate-ping" />
              <span className="font-bold text-slate-700">{DEMO_DOCTOR.name}</span>
              <span className="text-[10px] text-slate-400">({DEMO_DOCTOR.specialty})</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="glass-pill p-1.5 sm:p-2 text-slate-500 hover:text-coral hover:border-coral/40 transition cursor-pointer"
              title="Logout to Home"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        <motion.div initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
          {/* Welcome & Queue Header */}
          <motion.div custom={0} variants={fadeIn} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">
                {greeting}, {DEMO_DOCTOR.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <Users className="size-3.5 text-cobalt" />
                <span>Active Consultation Stream: <strong className="text-slate-800">{DEMO_PATIENTS.length} Patients</strong> registered</span>
              </p>
            </div>

            <button
              onClick={() => navigate('/kiosk')}
              className="glass-pill px-3.5 py-1.5 text-xs font-bold text-cobalt border border-cobalt/30 hover:bg-cobalt-soft transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Activity className="size-3.5" />
              <span>Switch to Kiosk</span>
            </button>
          </motion.div>

          {/* 3 Summary Telemetry Cards */}
          <motion.div custom={1} variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'priority' ? 'all' : 'priority')}
              className={`glass-card tile-lift p-4 sm:p-5 text-left border transition cursor-pointer flex items-center gap-3.5 ${
                filterPriority === 'priority'
                  ? 'border-coral bg-white ring-2 ring-coral/30 shadow-xs'
                  : 'border-slate-200/80 bg-white/90 hover:bg-white'
              }`}
            >
              <div className="size-11 sm:size-12 rounded-2xl bg-coral-soft flex items-center justify-center shrink-0 text-coral">
                <AlertTriangle className="size-5 sm:size-6" />
              </div>
              <div>
                <p className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                  {priorityCount}
                </p>
                <p className="text-xs font-bold text-coral flex items-center gap-1 mt-0.5">
                  Priority Red Flags
                </p>
                <p className="text-[10px] text-slate-400">High severity alerts</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'ready' ? 'all' : 'ready')}
              className={`glass-card tile-lift p-4 sm:p-5 text-left border transition cursor-pointer flex items-center gap-3.5 ${
                filterPriority === 'ready'
                  ? 'border-emerald bg-white ring-2 ring-emerald/30 shadow-xs'
                  : 'border-slate-200/80 bg-white/90 hover:bg-white'
              }`}
            >
              <div className="size-11 sm:size-12 rounded-2xl bg-emerald-soft flex items-center justify-center shrink-0 text-emerald">
                <CheckCircle2 className="size-5 sm:size-6" />
              </div>
              <div>
                <p className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                  {readyCount}
                </p>
                <p className="text-xs font-bold text-emerald flex items-center gap-1 mt-0.5">
                  Ready for Review
                </p>
                <p className="text-[10px] text-slate-400">Intake & OCR done</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFilterPriority(filterPriority === 'review' ? 'all' : 'review')}
              className={`glass-card tile-lift p-4 sm:p-5 text-left border transition cursor-pointer flex items-center gap-3.5 ${
                filterPriority === 'review'
                  ? 'border-amber-400 bg-white ring-2 ring-amber-400/30 shadow-xs'
                  : 'border-slate-200/80 bg-white/90 hover:bg-white'
              }`}
            >
              <div className="size-11 sm:size-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600 border border-amber-200">
                <Clock className="size-5 sm:size-6" />
              </div>
              <div>
                <p className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                  {reviewCount}
                </p>
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                  Needs Verification
                </p>
                <p className="text-[10px] text-slate-400">Pending physician sign</p>
              </div>
            </button>
          </motion.div>

          {/* ── NEW: Animated Live Clinical Telemetry & Patient Flow Graph ── */}
          <motion.div custom={2} variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Telemetry: Triage Acuity Distribution with Animated Bars */}
            <div className="lg:col-span-6 glass-card p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-cobalt" />
                  <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900">
                    Triage Acuity Distribution (ESI Levels)
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Live Queue
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {/* ESI 1-2 */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-coral flex items-center gap-1">
                      <span className="size-2 rounded-full bg-coral animate-ping" />
                      ESI 1-2 (Emergent / Resuscitation)
                    </span>
                    <span className="font-mono font-bold text-slate-700">3 pts (25%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '25%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-xs"
                    />
                  </div>
                </div>

                {/* ESI 3 */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-600 flex items-center gap-1">
                      <span className="size-2 rounded-full bg-amber-500" />
                      ESI 3 (Urgent / Multi-Resource)
                    </span>
                    <span className="font-mono font-bold text-slate-700">5 pts (42%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '42%' }}
                      transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-xs"
                    />
                  </div>
                </div>

                {/* ESI 4-5 */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald flex items-center gap-1">
                      <span className="size-2 rounded-full bg-emerald" />
                      ESI 4-5 (Standard / Low Acuity)
                    </span>
                    <span className="font-mono font-bold text-slate-700">4 pts (33%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '33%' }}
                      transition={{ duration: 1.0, delay: 0.2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald to-teal-500 rounded-full shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Telemetry: Hourly Patient Volume Waveform Graph */}
            <div className="lg:col-span-6 glass-card p-4 sm:p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald" />
                  <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900">
                    OPD Intake Flow Velocity
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald">
                  <span className="size-2 rounded-full bg-emerald animate-pulse" />
                  <span>Avg Wait: 6.4m</span>
                </div>
              </div>

              {/* Animated Waveform SVG */}
              <div className="relative h-28 w-full pt-2">
                <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="flowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0d5c52" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#0d5c52" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <motion.path
                    d="M 0,65 Q 40,20 80,45 T 160,25 T 230,15 T 300,30 L 300,80 L 0,80 Z"
                    fill="url(#flowGrad)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* Stroke path */}
                  <motion.path
                    d="M 0,65 Q 40,20 80,45 T 160,25 T 230,15 T 300,30"
                    fill="none"
                    stroke="#0d5c52"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />

                  {/* Current Active Dot */}
                  <circle cx="230" cy="15" r="4.5" fill="#10b981" />
                  <circle cx="230" cy="15" r="8" fill="#10b981" opacity="0.4" className="animate-ping" />
                </svg>

                {/* X Axis Time Labels */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>08:00</span>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span className="font-bold text-cobalt">14:00 (Peak)</span>
                  <span>16:00</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search & Filter Controls */}
          <motion.div custom={3} variants={fadeIn} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
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

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <Filter className="size-3.5 text-slate-400 shrink-0 ml-0.5" />
              {[
                { id: 'all', label: 'All Patients' },
                { id: 'priority', label: 'Priority Red Flags' },
                { id: 'ready', label: 'Ready for Review' },
                { id: 'review', label: 'Needs Sign' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterPriority(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer tap-bounce ${
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

          {/* ── PATIENT QUEUE: Responsive Mobile Cards (md:hidden) ── */}
          <motion.div custom={4} variants={fadeIn} className="md:hidden space-y-3">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold glass-card bg-white rounded-2xl">
                No matching patients found in this queue.
              </div>
            ) : (
              filteredPatients.map((patient, i) => {
                const status = statusConfig[patient.consultation.status] || statusConfig.in_progress
                const hasCritical = patient.clinicalSignals.some(s => s.severity === 'critical')

                return (
                  <div
                    key={patient.id}
                    onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                    className={`glass-card tile-lift p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                      hasCritical
                        ? 'border-coral/40 bg-coral-soft/10 ring-1 ring-coral/20'
                        : 'border-slate-200/80 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`size-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                          hasCritical ? 'bg-coral text-white' : 'bg-cobalt-soft text-cobalt'
                        }`}>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-heading font-extrabold text-sm text-slate-900 leading-tight">
                            {patient.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {patient.age}y / {patient.gender?.[0] || 'M'} • {patient.phone}
                          </p>
                        </div>
                      </div>

                      <span className={`status-chip text-[10px] ${status.chipClass}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Complaint */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block mb-0.5">Chief Complaint</span>
                      <p className="font-medium line-clamp-2">{patient.consultation.chiefComplaintText}</p>
                    </div>

                    {/* Footer with signals and action */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {patient.clinicalSignals.slice(0, 2).map((sig, j) => (
                          <span
                            key={j}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              sig.severity === 'critical'
                                ? 'bg-coral-soft text-coral border border-coral/30'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${sig.severity === 'critical' ? 'bg-coral animate-ping' : 'bg-amber-500'}`} />
                            {sig.title || sig.severity}
                          </span>
                        ))}
                      </div>

                      <div className="text-cobalt font-bold text-xs flex items-center gap-1 tap-bounce">
                        <span>Review</span>
                        <ChevronRight className="size-4" />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </motion.div>

          {/* ── PATIENT QUEUE: Desktop 12-Col Table (hidden md:block) ── */}
          <motion.div custom={4} variants={fadeIn} className="hidden md:block">
            <div className="glass-card bg-white border border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Patient Identity & ABHA</div>
                <div className="col-span-1">Age / Sex</div>
                <div className="col-span-3">Chief Complaint</div>
                <div className="col-span-2">Consult Status</div>
                <div className="col-span-2 text-right">Signals & Action</div>
              </div>

              {filteredPatients.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold">
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
                      className={`grid grid-cols-12 gap-3 px-6 py-4 items-center border-b border-slate-100 last:border-b-0 hover:bg-cobalt-soft/20 cursor-pointer transition-colors ${
                        hasCritical ? 'bg-coral-soft/25 hover:bg-coral-soft/35' : ''
                      }`}
                    >
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

                      <div className="col-span-1 text-xs font-bold text-slate-600">
                        {patient.age}y / {patient.gender?.[0] || 'M'}
                      </div>

                      <div className="col-span-3 text-xs text-slate-800 font-medium line-clamp-2">
                        {patient.consultation.chiefComplaintText}
                      </div>

                      <div className="col-span-2">
                        <span className={`status-chip ${status.chipClass}`}>
                          {status.label}
                        </span>
                      </div>

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

      {/* Mobile Bottom Navigation Bar so doctor can navigate smoothly */}
      <BottomNav />
    </div>
  )
}
