import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

const VALUE_PATTERN = /(?<!\d)(\d{1,3}(?:[.,]\d{1,2})?)(?!\d)/g

function extractNumber(text) {
  const raw = String(text || '')
  const candidates = []
  for (const m of raw.matchAll(VALUE_PATTERN)) {
    const n = parseFloat(m[1].replace(',', '.'))
    if (Number.isFinite(n) && n > 0 && n <= 200) {
      candidates.push(n)
    }
  }
  if (!candidates.length) return null
  return candidates.sort((a, b) => b - a)[0]
}

export async function readScaleFromImage(scalePhotoDataUrl) {
  if (!env.openAiApiKey) {
    throw new ApiError(503, 'OPENAI_API_KEY is not configured on server')
  }

  const prompt =
    'Read only the primary numeric value shown on the scale display. Return only one number with up to 2 decimals, no units, no extra text.'

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'You are an OCR assistant for green LED weighing-machine displays. Extract just the displayed numeric reading.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: scalePhotoDataUrl,
              },
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new ApiError(502, `OpenAI OCR failed: ${response.status} ${errText.slice(0, 300)}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content || ''
  const value = extractNumber(content)
  if (value == null) {
    throw new ApiError(422, 'Could not extract a valid scale number from AI response')
  }
  return { value, raw: String(content).trim() }
}
