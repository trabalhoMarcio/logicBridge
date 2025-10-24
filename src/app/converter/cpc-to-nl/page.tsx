'use client'
import GenKitInference from '@/components/GenkitInference'

export default function CPCtoNLPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 font-montserrat">CPC → NL</h1>
        <p className="text-gray-600 font-montserrat">Converta fórmulas lógicas para português</p>
      </div>
      
      <GenKitInference
        labelInput="Fórmula Lógica"
        labelOutput="Frase em Português"
        placeholder="Exemplo: P → Q, P ∧ Q, ¬P..."
        buttonText="Converter para Português"
        buildPrompt={input => `Você é um especialista em lógica proposicional. Converta a fórmula lógica abaixo para português claro.

NOTAÇÃO:
- → significa "se... então"
- ∧ significa "e"
- ∨ significa "ou" 
- ¬ significa "não"
- ↔ significa "se e somente se"

FÓRMULA: ${input.trim()}

SUA RESPOSTA DEVE SER APENAS UM OBJETO JSON COM A PROPRIEDADE "formula" CONTENDO A TRADUÇÃO:

{"formula": "sua_tradução_aqui"}`}
      />
    </div>
  )
}