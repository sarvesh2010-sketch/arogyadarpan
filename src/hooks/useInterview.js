import { useState, useCallback, useMemo } from 'react'
import { getQuestionSequence, COMPLETENESS_CATEGORIES } from '../data/questionBank'
import { calculateClinicalTriage } from '../services/triageEngine'

export function useInterview(initialComplaint = null) {
  const [selectedComplaint, setSelectedComplaint] = useState(initialComplaint)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [mode, setMode] = useState('modern') // 'modern' | 'ayush'
  const [isLowLiteracy, setIsLowLiteracy] = useState(false)

  // Calculate live clinical triage analysis from current responses
  const triageData = useMemo(() => {
    return calculateClinicalTriage({ responses })
  }, [responses])

  // Build question sequence based on selected complaint, mode, and dynamic triage insights
  const questions = useMemo(() => {
    let base = getQuestionSequence(selectedComplaint || 'chest_pain')
    if (mode === 'ayush') {
      base = [
        ...base,
        { id: 'ayush_prakriti', question: 'What is your primary Ayurvedic Constitution (Prakriti)?', type: 'single_select', options: [{ value: 'vata', label: 'Vata (Air/Space)' }, { value: 'pitta', label: 'Pitta (Fire/Water)' }, { value: 'kapha', label: 'Kapha (Earth/Water)' }], category: 'past_history' },
        { id: 'ayush_agni', question: 'How is your digestive fire (Agni)?', type: 'single_select', options: [{ value: 'sama', label: 'Sama Agni (Normal)' }, { value: 'visham', label: 'Visham Agni (Irregular)' }, { value: 'tikshna', label: 'Tikshna Agni (Hyperactive)' }, { value: 'manda', label: 'Manda Agni (Low/Slow)' }], category: 'associated_symptoms' },
      ]
    }

    // Inject dynamic follow-up questions if discovered by triage engine and not already in sequence
    if (triageData.dynamicQuestions && triageData.dynamicQuestions.length > 0) {
      triageData.dynamicQuestions.forEach(dq => {
        if (!base.some(q => q.id === dq.id)) {
          // Insert after associated symptoms or near the end before review
          const insertIdx = base.findIndex(q => q.id === 'ros_systems')
          if (insertIdx >= 0) {
            base.splice(insertIdx, 0, dq)
          } else {
            base.push(dq)
          }
        }
      })
    }

    return base
  }, [selectedComplaint, mode, triageData.dynamicQuestions])

  const currentQuestion = questions[currentIndex] || null
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? Math.round((currentIndex / totalQuestions) * 100) : 0

  const completeness = useMemo(() => {
    return COMPLETENESS_CATEGORIES.map(cat => {
      const categoryQuestions = questions.filter(q => q.category === cat.id)
      const answeredInCategory = categoryQuestions.filter(q =>
        responses.some(r => r.questionId === q.id && r.structuredValue !== null && r.structuredValue !== '')
      )

      let status = 'not_collected'
      if (answeredInCategory.length === categoryQuestions.length && categoryQuestions.length > 0) {
        status = 'collected'
      } else if (answeredInCategory.length > 0) {
        status = 'needs_clarification'
      }

      return { ...cat, status }
    })
  }, [responses, questions])

  const completenessPercent = useMemo(() => {
    const collected = completeness.filter(c => c.status === 'collected').length
    const partial = completeness.filter(c => c.status === 'needs_clarification').length
    return Math.round(((collected + partial * 0.5) / completeness.length) * 100)
  }, [completeness])

  const submitResponse = useCallback((questionId, originalResponse, structuredValue, inputMethod = 'touch') => {
    const response = {
      questionId,
      question: currentQuestion?.question || '',
      originalResponse: originalResponse || '',
      structuredValue,
      inputMethod,
      confidence: inputMethod === 'touch' ? 1.0 : 0.92,
      answeredAt: new Date().toISOString(),
    }

    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === questionId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = response
        return updated
      }
      return [...prev, response]
    })

    if (questionId === 'chief_complaint' && structuredValue) {
      setSelectedComplaint(structuredValue)
    }
  }, [currentQuestion])

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }, [currentIndex, questions.length])

  const previousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    questions,
    responses,
    selectedComplaint,
    setSelectedComplaint,
    isComplete,
    completeness,
    completenessPercent,
    triageData,
    mode,
    setMode,
    isLowLiteracy,
    setIsLowLiteracy,
    submitResponse,
    nextQuestion,
    previousQuestion,
  }
}
