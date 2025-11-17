'use client'
import { useRef, useState } from 'react'

interface GenKitInferenceProps {
  labelInput: string
  labelOutput: string
  placeholder: string
  buttonText?: string
  mode: 'nl-to-cpc' | 'cpc-to-nl'
}

type ApiResponse = {
  text?: string; error?: string; [k: string]: any;
}

async function callGenKitAPI(payload: any, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
  buttonText = 'Convert',
  mode,
}: GenKitInferenceProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [propositions, setPropositions] = useState<{[key:string]:string}>({})
  const [showProps, setShowProps] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const insertAtCursor = (text: string) => {
    const el = textareaRef.current
    if (!el) {
      setInput(prev => prev + text)
      return
    }
    const start = el.selectionStart ?? input.length
    const end = el.selectionEnd ?? input.length
    const before = input.slice(0, start)
    const after = input.slice(end)
    const next = before + text + after
    setInput(next)
    // reposiciona o cursor após inserir
    requestAnimationFrame(() => {
      const pos = start + text.length
      el.focus()
      try { el.setSelectionRange(pos, pos) } catch {}
    })
  }

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) {
      setError('Please enter a value to convert')
      return
    }

    setLoading(true)
    setError('')
    setOutput('')

    try {
      let payload: any
      if (mode === 'nl-to-cpc') {
        payload = { mode: 'nl-to-cpc', input: input.trim() }
      } else {
        payload = { mode: 'cpc-to-nl', input: input.trim(), propositions }
      }
      const result = await callGenKitAPI(payload)
      // Sempre tenta extrair algo útil da resposta
      let clean = result
      // Se vier JSON, tenta pegar formula/sentence
      try {
        const json = JSON.parse(result)
        if (json.formula) clean = json.formula
        else if (json.sentence) clean = json.sentence
      } catch {}
      // Se vier texto com "Fórmula:" ou "Proposições:", extrai partes úteis e mapeamento
      if (/F[óo]rmula:/i.test(result)) {
        const fm = result.match(/F[óo]rmula:\s*([\s\S]+?)(?:\n|$)/i)
        if (fm) clean = fm[1].trim()
      }
      if (/Proposi[cç][õo]es:/i.test(result) && mode === 'nl-to-cpc') {
        const blockMatch = result.match(/Proposi[cç][õo]es:\s*([\s\S]*)/i)
        if (blockMatch) {
          const block = blockMatch[1]
          const lines = block.split('\n').map(l=>l.trim()).filter(l=>l)
          const map: Record<string,string> = {}
          lines.forEach(l=>{
            const mm = l.match(/^([A-Z])\s*:\s*(.+)$/)
            if (mm) map[mm[1]] = mm[2]
          })
          if (Object.keys(map).length>0) { setPropositions(map); setShowProps(true) }
        }
      }
      setOutput(clean)
      // Se for NL→CPC, tenta extrair e mostrar as proposições
      if (mode === 'nl-to-cpc') {
        try {
          const json = JSON.parse(result)
          if (json.propositions && typeof json.propositions === 'object') {
            setPropositions(json.propositions)
            setShowProps(true)
          } else {
            setShowProps(false)
          }
        } catch { setShowProps(false) }
      }
    } catch (err: any) {
      setError(err.message || 'Error processing request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center">
      <form onSubmit={handleConvert} className="w-full space-y-4">
        <label className="block text-lg font-montserrat font-semibold mb-1">{labelInput}</label>
        {/* Barra de conectivos (somente CPC→NL) */}
        {mode === 'cpc-to-nl' && (
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs text-gray-500 font-montserrat mr-1">Inserir conectivos:</span>
            {[
              { k: '¬', v: '¬', title: 'Negação' },
              { k: '∧', v: ' ∧ ', title: 'Conjunção' },
              { k: '∨', v: ' ∨ ', title: 'Disjunção' },
              { k: '→', v: ' → ', title: 'Implicação' },
              { k: '↔', v: ' ↔ ', title: 'Bicondicional' },
              { k: '(', v: '(', title: 'Abre parêntese' },
              { k: ')', v: ')', title: 'Fecha parêntese' },
            ].map(btn => (
              <button
                key={btn.k}
                type="button"
                title={btn.title}
                onClick={() => insertAtCursor(btn.v)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 font-montserrat"
              >
                {btn.k}
              </button>
            ))}
          </div>
        )}
        <textarea
          className="w-full border border-gray-300 rounded-xl p-4 font-montserrat"
          rows={4}
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          ref={textareaRef}
          required
        />
        {/* Se for CPC→NL, permitir definir as proposições */}
        {mode === 'cpc-to-nl' && (
          <div className="mt-2">
            <label className="block text-sm font-montserrat mb-1">Propositions mapping (e.g. P: chover)</label>
            <div className="flex flex-wrap gap-2">
              {[...'PQRSTUV'].map(atom => (
                <input
                  key={atom}
                  type="text"
                  className="border border-gray-300 rounded px-2 py-1 text-sm font-montserrat"
                  placeholder={atom}
                  value={propositions[atom] || ''}
                  onChange={e => setPropositions(p => ({ ...p, [atom]: e.target.value }))}
                  style={{ width: 100 }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(Opcional: só preencha as proposições usadas na fórmula)</span>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-montserrat disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Converting...' : buttonText}
        </button>
      </form>

      {/* Exibe proposições extraídas no modo NL→CPC */}
      {showProps && mode === 'nl-to-cpc' && Object.keys(propositions).length > 0 && (
        <div className="mt-4 w-full bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="font-montserrat text-blue-700 font-semibold mb-1">Propositions mapping:</div>
          <ul className="text-blue-900 text-sm font-montserrat">
            {Object.entries(propositions).map(([k,v]) => (
              <li key={k}><b>{k}</b>: {v}</li>
            ))}
          </ul>
        </div>
      )}


      {/* Exibe resultado se não for null, vazio ou claramente inválido */}
      {output && output !== 'null' && output.trim() !== '' && output.trim() !== 'undefined' && (
        <div className="mt-8 w-full bg-gray-50 border border-green-100 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2 text-green-700 font-montserrat">{labelOutput}</h2>
          <div className="text-green-900 font-sans text-lg whitespace-pre-wrap">{output}</div>
        </div>
      )}
      {/* Fallback: tenta extrair frase de JSON/texto se resposta for inválida */}
      {output && (output === 'null' || output.trim() === '' || output.trim() === 'undefined') && (() => {
        // Tenta extrair frase de JSON string
        let extracted = ''
        try {
          const match = output.match(/"sentence"\s*:\s*"([^"]+)"/)
          if (match) extracted = match[1]
        } catch {}
        if (extracted) {
          return (
            <div className="mt-8 w-full bg-gray-50 border border-green-100 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-2 text-green-700 font-montserrat">{labelOutput}</h2>
              <div className="text-green-900 font-sans text-lg whitespace-pre-wrap">{extracted}</div>
            </div>
          )
        }
        // Se não extraiu nada, mostra mensagem amigável
        return (
          <div className="mt-8 w-full bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-2 text-yellow-700 font-montserrat">No valid result</h2>
            <div className="text-yellow-900 font-sans text-lg">The model could not generate a valid answer for this input. Try rephrasing or check your formula and proposition mapping.</div>
          </div>
        )
      })()}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl w-full">
          <p className="text-red-600 font-montserrat font-semibold">Error:</p>
          <p className="text-red-600 font-montserrat text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}