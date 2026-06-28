import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

function getAi() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }
  return new GoogleGenAI({ apiKey })
}

export async function POST(request: Request) {
  try {
    const { targetLang, texts } = (await request.json()) as {
      targetLang?: string
      texts?: Record<string, string>
    }

    if (!targetLang || !texts || typeof texts !== 'object') {
      return NextResponse.json({ error: 'targetLang and texts object are required.' }, { status: 400 })
    }

    const keysCount = Object.keys(texts).length
    if (keysCount === 0) {
      return NextResponse.json({ translatedTexts: {} })
    }

    const ai = getAi()
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the values of the following JSON object from English to the language with ISO 639-1 code "${targetLang}". Keep the keys identical. Do not alter or translate the keys.
JSON Object: ${JSON.stringify(texts)}`,
      config: {
        systemInstruction: `You are an expert translator.
You translate the provided JSON object values into the target language.
Guidelines:
1. Do not translate any personal names or platform/brand names (like vBiz Me). Keep them exactly as is.
2. Provide a 100% accurate, natural, fluent, and professional translation of the values.
3. Keep the keys identical.
4. Output ONLY the resulting valid JSON object. No markdown, no triple backticks, no notes, no conversation.`,
        responseMimeType: 'application/json',
      },
    })

    const translatedText = response.text || '{}'
    const translatedJson = JSON.parse(translatedText)
    return NextResponse.json({ translatedTexts: translatedJson })
  } catch (error) {
    console.error('Backend translation error:', error)
    return NextResponse.json({ error: 'Internal Server Error', message: String(error) }, { status: 500 })
  }
}
