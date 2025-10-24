'use client'
import GenKitInference from '@/components/GenkitInference'

export default function NLtoCPCPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 font-montserrat">NL → CPC</h1>
        <p className="text-gray-600 font-montserrat">Converta frases em português para lógica proposicional</p>
      </div>
      
      <GenKitInference
        labelInput="Frase em Português"
        labelOutput="Fórmula Lógica"
        placeholder="Exemplo: Se chover então a rua fica molhada..."
        buttonText="Converter para Lógica"
        
        buildPrompt={input => `Você é um especialista em lógica proposicional. Converta a frase em português abaixo para a fórmula lógica correspondente.

REGRAS ESTRITAS DE NOTAÇÃO:
- Use → para implicação ("se... então")
- Use ∧ para conjunção ("e") 
- Use ∨ para disjunção ("ou")
- Use ¬ para negação ("não")
- Use ↔ para "se e somente se"
- Use APENAS letras maiúsculas (P, Q, R, S, T, etc.) para as proposições
- Use parênteses quando necessário para agrupamento

EXEMPLOS:
"Se está chovendo, então a rua está molhada" → P → Q
"João é alto e Maria é inteligente" → P ∧ Q  
"Não está chovendo" → ¬P
"Se está chovendo e faz frio, então não vamos ao parque" → (P ∧ Q) → ¬R

FRASE PARA CONVERTER: "${input.trim()}"

SUA RESPOSTA DEVE SER APENAS UM OBJETO JSON COM A PROPRIEDADE "formula" CONTENDO A FÓRMULA:

{"formula": "sua_fórmula_aqui"}`}
      />
    </div>
  )
}