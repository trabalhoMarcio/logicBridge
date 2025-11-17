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
        labelOutput="Frase em Linguagem Natural"
        placeholder="Exemplo: (P ∧ Q) → R"
        buttonText="Converter para português"
        mode="cpc-to-nl"
      />
    </div>
  )
}