import { NextRequest, NextResponse } from 'next/server'
import { ai } from '@/lib/genkit'
import { googleAI } from '@genkit-ai/google-genai'
import * as z from 'zod'

const FormulaSchema = z.object({
  formula: z.string().min(1, "A fórmula não pode ser vazia.")
});
type FormulaOutput = z.infer<typeof FormulaSchema>;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório' }, { status: 400 })
    }

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 150, // Aumentei um pouco para frases mais complexas
      },
      output: {
        schema: FormulaSchema,
      },
    })
    
    // 🔍 CORREÇÃO: Verificação mais robusta da resposta
    if (!result.output || typeof result.output !== 'object') {
      throw new Error('Resposta do modelo é inválida ou está vazia')
    }

    const formulaOutput = result.output as FormulaOutput;

    // Validação extra com Zod para garantir a estrutura
    const validationResult = FormulaSchema.safeParse(formulaOutput)
    
    if (!validationResult.success) {
      console.error('Validação Zod falhou:', validationResult.error)
      throw new Error('Formato da resposta do modelo é inválido')
    }

    if (!formulaOutput.formula || formulaOutput.formula.trim() === '') {
      throw new Error('A fórmula gerada está vazia')
    }

    // 🔥 NOVO: Limpeza da fórmula para remover possíveis artefatos JSON
    let cleanFormula = formulaOutput.formula.trim()
      .replace(/^"|"$/g, '') // Remove aspas no início/fim se houver
      .replace(/\\"/g, '"')  // Remove escapes de aspas
      .trim()

    return NextResponse.json({
      text: cleanFormula,
    })
    
  } catch (error: any) {
    console.error('Erro no servidor:', error)
    
    // 🔧 TRATAMENTO DE ERROS ESPECÍFICOS
    let errorMessage = 'Erro interno do servidor'
    let statusCode = 500

    if (error.message?.includes('Schema validation failed') || 
        error.message?.includes('Parse Errors') ||
        error.message?.includes('must be object') ||
        error.message?.includes('Provided data: null')) {
      
      errorMessage = 'O modelo não conseguiu gerar uma resposta estruturada. Tente reformular sua frase de forma mais clara.'
      statusCode = 422
      
    } else if (error.message?.includes('A fórmula gerada está vazia') ||
               error.message?.includes('fórmula não pode ser vazia')) {
      
      errorMessage = 'O modelo retornou uma fórmula vazia. Tente usar uma frase mais clara ou específica.'
      statusCode = 422
      
    } else if (error.message?.includes('Resposta do modelo é inválida') ||
               error.message?.includes('Formato da resposta')) {
      
      errorMessage = 'Resposta do modelo em formato inesperado. Tente novamente com uma entrada diferente.'
      statusCode = 422
      
    } else if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
      
      errorMessage = 'Tempo limite excedido. Tente novamente com uma frase mais curta.'
      statusCode = 408
      
    } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      
      errorMessage = 'Problema de configuração do servidor. Contate o administrador.'
      statusCode = 500
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}