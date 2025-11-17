'use client'
import GenKitInference from '@/components/GenkitInference'

export default function NLtoCPCPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 font-montserrat">NL → CPC</h1>
        <p className="text-gray-600 font-montserrat">Converter linguagem natural em lógica proposicional</p>
      </div>
      
      <GenKitInference
        labelInput="Frase em Linguagem Natural"
        labelOutput="Fórmula Lógica"
        placeholder="Exemplo: Se choveu, então a grama está molhada."
        buttonText="Converter para lógica"
        mode="nl-to-cpc"
      />
    </div>
  )
}
