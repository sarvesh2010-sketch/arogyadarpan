import express from 'express'
import { generateSummary } from '../services/summaryService.js'

const router = express.Router()

// POST /api/summary/generate
router.post('/generate', async (req, res) => {
  try {
    const { consultationId, responses, documents } = req.body
    const summary = await generateSummary(consultationId, responses, documents)
    res.json(summary)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/summary/llm-proxy (Secure backend LLM proxy)
router.post('/llm-proxy', async (req, res) => {
  try {
    const groqKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY
    if (!groqKey) {
      return res.status(503).json({ error: 'Groq API key is not configured in server environment' })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify(req.body)
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/summary/:consultationId
router.get('/:consultationId', (req, res) => {
  res.json({ consultationId: req.params.consultationId, status: 'generated' })
})

// PATCH /api/summary/:id
router.patch('/:id', (req, res) => {
  res.json({
    id: req.params.id,
    ...req.body,
    updatedAt: new Date().toISOString(),
  })
})

export default router
