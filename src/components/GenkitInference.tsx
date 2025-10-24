'use client'
import { useState } from 'react'

interface GenKitInferenceProps {
  labelInput: string
  labelOutput: string
  placeholder: string
  buttonText?: string
  buildPrompt: (input: string) => string
}

type ApiResponse = {
  text?: string
  error?: string
  choices?: Array<{ text?: string }>
  [k: string]: any
}

async function callGenKitAPI(prompt: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    })

    const contentType = response.headers.get('content-type') || ''
    let data: ApiResponse | null = null
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        if (response.ok) return text
        throw new Error(`Erro ${response.status}: ${text}`)
      }
    }

    if (!response.ok) {
      const msg = (data && (data.error || data.message)) ?? `Erro ${response.status}`
      throw new Error(msg)
    }

    // Extrai texto em possíveis formatos
    const text =
      data?.text ??
      (data?.choices && data.choices[0]?.text) ??
      (typeof data === 'string' ? data : undefined)

    if (!text) {
      return JSON.stringify(data)
    }

    return text
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('A requisição expirou (timeout). Tente novamente.')
    throw err
  } finally {
    clearTimeout(id)
  }
}

export default function GenKitInference({
  labelInput,
  labelOutput,
  placeholder,
  buttonText = 'Converter',
  buildPrompt,
}: GenKitInferenceProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) {
      setError('Por favor, digite algo para converter')
      return
    }

    setLoading(true)
    setError('')
    setOutput('')

    try {
      const prompt = buildPrompt(input)
      const result = await callGenKitAPI(prompt)
      setOutput(result)
    } catch (err: any) {
      console.error('Erro na conversão:', err)
      setError(err.message || 'Erro ao processar a requisição')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center">
      <form onSubmit={handleConvert} className="w-full space-y-4">
        <label className="block text-lg font-montserrat font-semibold mb-1">{labelInput}</label>
        <textarea
          className="w-full border border-gray-300 rounded-xl p-4 font-montserrat"
          rows={4}
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-montserrat disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Convertendo...' : buttonText}
        </button>
      </form>

      {output && (
        <div className="mt-8 w-full bg-gray-50 border border-green-100 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2 text-green-700 font-montserrat">{labelOutput}</h2>
          {/* AQUI ESTÁ A CORREÇÃO: MUDANÇA DE 'font-mono' PARA 'font-sans' (ou remoção total) */}
          <div className="text-green-900 font-sans text-lg whitespace-pre-wrap">{output}</div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl w-full">
          <p className="text-red-600 font-montserrat font-semibold">Erro:</p>
          <p className="text-red-600 font-montserrat text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}