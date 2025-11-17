import { NextRequest, NextResponse } from 'next/server'
import { ai } from '@/lib/genkit'
import { googleAI } from '@genkit-ai/google-genai'

type Mode = 'nl-to-cpc' | 'cpc-to-nl'

function tokenize(formula: string): string[] {
  const tokens: string[] = []
  const ops = new Set(['¬','∧','∨','→','↔','(',')'])
  for (let i=0; i<formula.length; i++) {
    const ch = formula[i]
    if (ch === ' ' || ch === '\n' || ch === '\t') continue
    if (ops.has(ch)) { tokens.push(ch); continue }
    // two-char ops already handled by single codepoints
    if (/^[A-Z]$/.test(ch)) { tokens.push(ch); continue }
  }
  return tokens
}

function parseCPC(formula: string) {
  const tokens = tokenize(formula)
  let idx = 0
  const peek = () => tokens[idx]
  const consume = (t?: string) => {
    const cur = tokens[idx]
    if (t && cur !== t) throw new Error(`Expected '${t}', got '${cur}'`)
    idx++; return cur
  }
  function parseExpr(): any { return parseEquiv() }
  function parseEquiv(): any {
    let left = parseImpl()
    while (peek() === '↔') { consume('↔'); const right = parseImpl(); left = {type:'↔', left, right} }
    return left
  }
  function parseImpl(): any {
    let left = parseOr()
    if (peek() === '→') { consume('→'); const right = parseImpl(); return {type:'→', left, right} }
    return left
  }
  function parseOr(): any {
    let left = parseAnd()
    while (peek() === '∨') { consume('∨'); const right = parseAnd(); left = {type:'∨', left, right} }
    return left
  }
  function parseAnd(): any {
    let left = parseUnary()
    while (peek() === '∧') { consume('∧'); const right = parseUnary(); left = {type:'∧', left, right} }
    return left
  }
  function parseUnary(): any {
    if (peek() === '¬') { consume('¬'); return {type:'¬', value: parseUnary()} }
    if (peek() === '(') { consume('('); const e = parseExpr(); consume(')'); return e }
    const atom = consume()
    if (!atom || !/^[A-Z]$/.test(atom)) throw new Error('Invalid atom')
    return {type:'atom', name: atom}
  }
  const ast = parseExpr()
  if (idx !== tokens.length) throw new Error('Unexpected tokens')
  return ast
}

function astToPortuguese(ast: any, map: Record<string,string>): string {
  const prec: Record<string, number> = { '↔':1, '→':2, '∨':3, '∧':4, '¬':5, 'atom':6 }
  function phrase(node: any, parentOp?: string): string {
    switch(node.type){
      case 'atom': return map[node.name] || `proposição ${node.name}`
      case '¬': {
        const inner = phrase(node.value, '¬')
        const needPar = ['∧','∨','→','↔'].includes(node.value.type)
        return `não ${needPar ? '('+inner+')' : inner}`
      }
      case '∧':
      case '∨': {
        const a = phrase(node.left, node.type)
        const b = phrase(node.right, node.type)
        const conn = node.type === '∧' ? ' e ' : ' ou '
        const s = `${a}${conn}${b}`
        if (parentOp && prec[parentOp] > prec[node.type]) return `(${s})`
        return s
      }
      case '→': {
        const a = phrase(node.left, '→')
        const b = phrase(node.right, '→')
        const s = `se ${a}, então ${b}`
        if (parentOp && prec[parentOp] > prec[node.type]) return `(${s})`
        return s
      }
      case '↔': {
        const a = phrase(node.left, '↔')
        const b = phrase(node.right, '↔')
        return `${a} se e somente se ${b}`
      }
      default: return ''
    }
  }
  return phrase(ast)
}

function heuristicNLtoCPC(sentence: string) {
  const s = sentence.toLowerCase().trim()
  // simples: se ... então ...
  const iffIdx = s.indexOf('se e somente se')
  if (iffIdx !== -1) {
    const [aRaw, bRaw] = s.split('se e somente se')
    const P = aRaw?.replace(/^se\s+/, '').trim() || 'proposição P'
    const Q = bRaw?.replace(/^[,\s]+/, '').trim() || 'proposição Q'
    return { formula: 'P ↔ Q', propositions: { P: P, Q: Q } }
  }
  const thenIdx = s.indexOf('então')
  const ifIdx = s.indexOf('se ')
  if (ifIdx !== -1 && thenIdx !== -1 && thenIdx > ifIdx) {
    const antecedent = s.slice(ifIdx + 3, thenIdx).trim().replace(/^[,\s]+|[,\s]+$/g,'')
    const consequent = s.slice(thenIdx + 5).trim()
    return { formula: 'P → Q', propositions: { P: antecedent, Q: consequent } }
  }
  // conjunção / disjunção com negação simples
  const hasAnd = s.includes(' e ')
  const hasOr = s.includes(' ou ')
  if (hasAnd || hasOr) {
    const parts = s.split(hasAnd ? ' e ' : ' ou ').map(p=>p.trim()).filter(Boolean)
    const letters = ['P','Q','R','S']
    const props: Record<string,string> = {}
    parts.slice(0, letters.length).forEach((p,i)=> props[letters[i]] = p)
    const op = hasAnd ? ' ∧ ' : ' ∨ '
    const formula = letters.slice(0, parts.length).join(op)
    return { formula, propositions: props }
  }
  // negação simples
  if (s.startsWith('não ')) {
    const p = s.replace(/^não\s+/, '')
    return { formula: '¬P', propositions: { P: p } }
  }
  // fallback básico
  return { formula: 'P', propositions: { P: s } }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const mode: Mode | undefined = body.mode
    const input: string | undefined = body.input
    const propositions: Record<string,string> | undefined = body.propositions
    const prompt: string | undefined = body.prompt // compatibilidade antiga
    if (!mode && !prompt) {
      return NextResponse.json({ error: 'mode and input are required' }, { status: 400 })
    }
    if (mode && !input) {
      return NextResponse.json({ error: 'input is required' }, { status: 400 })
    }

    // (removed legacy strongPrompt block; prompt será montado mais abaixo)

    // Execução por modo
    if (mode === 'cpc-to-nl' && input) {
      try {
        const ast = parseCPC(input)
        const sentence = astToPortuguese(ast, propositions || {})
        return NextResponse.json({ text: sentence })
      } catch (e) {
        // se falhar parsing, tenta LLM
      }
    }

    // Construção de prompt forte quando necessário (NL→CPC principal; CPC→NL fallback)
    const userPrompt = mode && input ? (
      mode === 'nl-to-cpc' ?
`You are a formal logic assistant. Convert the following Portuguese sentence into a propositional logic formula and list the proposition meanings.

Rules:
- Allowed connectives: → ∧ ∨ ¬ ↔ ( )
- Use uppercase atoms P, Q, R, S, T, U, V in order of appearance.
- Output JSON only: {"formula":"...", "propositions": {"P": "...", "Q": "..."}}
- No explanations. No extra text.

Sentence: "${input}"` :
`You are a formal logic assistant. Convert the following propositional logic formula into a natural Portuguese sentence.

Atoms mapping: ${propositions ? Object.entries(propositions).map(([k,v])=>`${k}: ${v}`).join(' | ') : '(none)'}
Output JSON only: {"sentence":"..."}
No explanations. No extra text.

Formula: "${input}"`
    ) : (prompt as string)

    const strongPrompt = `${userPrompt}

STRICT INSTRUCTIONS:
- Respond ONLY with a single valid JSON object, no explanations, no extra text, no markdown, no newlines before or after.
- Do NOT use markdown formatting (no triple backticks).
- Do NOT add any commentary, apology, or explanation.
- If you cannot answer, return {"error": "<reason>"}.
- Example valid response: {"sentence": "Se chover, então a grama ficará molhada."}
- Example error: {"error": "Not convertible to propositional logic."}
- If you do not follow these instructions, your output will be discarded and considered invalid.`

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: strongPrompt,
      config: { temperature: 0.1, maxOutputTokens: 200 },
    })

    // Parsing robusto: tenta extrair JSON, mas aceita frase pura como fallback
    let text = typeof result.output === 'string' ? result.output : JSON.stringify(result.output)
    let json: any = null
    text = text.replace(/^\s*```(json)?/i, '').replace(/```\s*$/i, '').trim()
    // Tenta parsear direto
    try {
      json = JSON.parse(text)
    } catch {
      // Tenta extrair JSON de dentro do texto
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try { json = JSON.parse(match[0]) } catch {}
      }
    }

    // Se não conseguiu JSON, utiliza fallbacks
    if (!json || typeof json !== 'object') {
      if (mode === 'nl-to-cpc' && input) {
        const h = heuristicNLtoCPC(input)
        const stitched = `Fórmula: ${h.formula}\nProposições:\n${Object.entries(h.propositions).map(([k,v])=>`${k}: ${v}`).join('\n')}`
        return NextResponse.json({ text: stitched })
      }
      if (mode === 'cpc-to-nl' && input) {
        try {
          const ast = parseCPC(input)
          const sentence = astToPortuguese(ast, propositions || {})
          return NextResponse.json({ text: sentence })
        } catch {}
      }
      // Se for uma frase curta, retorna como sentence
      if (text.length > 0 && text.length < 300 && !text.includes('{') && !text.includes('error')) {
        return NextResponse.json({ text: text.trim() })
      }
      throw new Error('Model did not return a valid JSON object')
    }

    // NL→CPC: { formula, propositions }, erro: { error }
    // CPC→NL: { sentence }, erro: { error }
    if (json.error) {
      return NextResponse.json({ error: json.error }, { status: 422 })
    }

    if (json.formula) {
      if (!json.propositions || typeof json.propositions !== 'object') {
        return NextResponse.json({ error: 'Missing propositions mapping.' }, { status: 422 })
      }
      const entries = Object.entries(json.propositions as Record<string, unknown>)
      const stitched = `Fórmula: ${json.formula}\nProposições:\n${entries.map(([k,v])=>`${k}: ${String(v)}`).join('\n')}`
      return NextResponse.json({ text: stitched })
    }
    if (json.sentence) {
      return NextResponse.json({ text: json.sentence })
    }

    // Fallback: se houver só uma string válida, retorna
    if (typeof json === 'string' && json.length > 0 && json.length < 300) {
      return NextResponse.json({ text: json })
    }

    throw new Error('Model response missing required fields')
  } catch (error: any) {
    console.error('Server error:', error)
    let errorMessage = 'Internal server error'
    let statusCode = 500
    if (error.message?.includes('valid JSON object')) {
      errorMessage = 'The model did not return a valid JSON object. Try rephrasing your input.'
      statusCode = 422
    } else if (error.message?.includes('Missing propositions')) {
      errorMessage = 'The model did not return the mapping of propositions. Try a simpler sentence.'
      statusCode = 422
    } else if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
      errorMessage = 'Timeout. Try again with a shorter sentence.'
      statusCode = 408
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}