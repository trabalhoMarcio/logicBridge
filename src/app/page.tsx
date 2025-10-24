'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  }

  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }

  // Se estiver carregando, mostra um loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-montserrat">Carregando...</p>
        </motion.div>
      </div>
    )
  }

  // Função para redirecionar baseado no estado de autenticação
  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/register')
    }
  }

  // Função para redirecionar para os conversores
  const handleConverterRedirect = (path: string) => {
    if (user) {
      router.push(path)
    } else {
      router.push('/register')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2 mb-8 shadow-sm"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-montserrat font-medium">
              IA Avançada • Processamento de Linguagem Natural
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-7xl font-bold text-gray-900 mb-6 font-montserrat tracking-tight"
          >
            Conecte a{' '}
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Lógica
            </span>{' '}
            à{' '}
            <motion.span 
              animate={floatAnimation}
              className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent"
            >
              Linguagem
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-2xl text-gray-600 mb-12 leading-relaxed font-montserrat font-light max-w-3xl mx-auto"
          >
            Transforme frases do português em fórmulas lógicas e vice-versa com nossa 
            <span className="font-medium text-green-500"> tecnologia de ponta</span>. 
            Uma ponte inteligente entre linguagem natural e lógica proposicional.
          </motion.p>

          {/* Features Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid lg:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto"
          >
            {/* Modo 1 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-8 bg-white border border-gray-200 rounded-3xl hover:border-green-200 hover:shadow-2xl hover:shadow-green-100 transition-all duration-500 cursor-pointer"
              onClick={() => handleConverterRedirect('/converter/nl-to-cpc')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <motion.span 
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white font-bold text-2xl"
                >
                  →
                </motion.span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">
                NL → CPC
              </h3>
              <p className="text-gray-600 mb-6 text-lg font-montserrat font-light leading-relaxed">
                Converta frases em português para fórmulas precisas de lógica proposicional
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100 group-hover:border-blue-200 transition-colors">
                <p className="text-sm text-gray-500 font-montserrat font-medium mb-2">Entrada:</p>
                <p className="text-gray-800 font-montserrat">"Se chover, então a grama ficará molhada."</p>
                <p className="text-sm text-gray-500 font-montserrat font-medium mt-4 mb-2">Saída:</p>
                <p className="text-gray-800 font-mono text-lg font-bold">P → Q</p>
              </div>
            </motion.div>

            {/* Modo 2 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-8 bg-white border border-gray-200 rounded-3xl hover:border-green-200 hover:shadow-2xl hover:shadow-green-100 transition-all duration-500 cursor-pointer"
              onClick={() => handleConverterRedirect('/converter/cpc-to-nl')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <motion.span 
                  animate={{ rotate: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white font-bold text-2xl"
                >
                  ←
                </motion.span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">
                CPC → NL
              </h3>
              <p className="text-gray-600 mb-6 text-lg font-montserrat font-light leading-relaxed">
                Traduza fórmulas lógicas complexas para frases coerentes em português
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 group-hover:border-green-200 transition-colors">
                <p className="text-sm text-gray-500 font-montserrat font-medium mb-2">Entrada:</p>
                <p className="text-gray-800 font-mono text-lg font-bold">(P ∧ Q) → R</p>
                <p className="text-sm text-gray-500 font-montserrat font-medium mt-4 mb-2">Saída:</p>
                <p className="text-gray-800 font-montserrat">"Se chover e fizer frio, então a aula será cancelada."</p>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-xl hover:from-green-600 hover:to-emerald-700 shadow-2xl shadow-green-200 transition-all duration-300 font-montserrat"
            >
              <span className="flex items-center space-x-3">
                <span>{user ? 'Ir para o Dashboard' : 'Começar Agora'}</span>
                <motion.svg 
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.button>
            
            <motion.p
              variants={itemVariants}
              className="text-gray-500 mt-6 font-montserrat font-light"
            >
              {user ? 'Continue explorando as funcionalidades' : 'Comece em segundos • Sem custo inicial'}
            </motion.p>

            {/* Mostra status do usuário logado */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-montserrat">
                  ✅ Você está logado como {user.email}
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6 font-montserrat">
              Conectivos Suportados
            </h2>
            <p className="text-xl text-gray-600 font-montserrat font-light max-w-2xl mx-auto">
              Trabalhe com todos os principais operadores da lógica proposicional de forma intuitiva
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto"
          >
            {[
              { symbol: '∧', name: 'E (Conjunção)', example: 'P ∧ Q', color: 'from-blue-500 to-cyan-600' },
              { symbol: '∨', name: 'OU (Disjunção)', example: 'P ∨ Q', color: 'from-purple-500 to-pink-600' },
              { symbol: '¬', name: 'NÃO (Negação)', example: '¬P', color: 'from-red-500 to-orange-600' },
              { symbol: '→', name: 'IMPLICA', example: 'P → Q', color: 'from-green-500 to-emerald-600' },
              { symbol: '↔', name: 'SE E SOMENTE SE', example: 'P ↔ Q', color: 'from-indigo-500 to-purple-600' },
            ].map((connective, index) => (
              <motion.div
                key={connective.symbol}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="bg-white p-8 rounded-3xl border border-gray-200 text-center hover:shadow-2xl hover:border-green-200 transition-all duration-300 group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${connective.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className="text-white font-bold text-3xl">
                    {connective.symbol}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg font-montserrat">
                  {connective.name}
                </h3>
                <p className="text-gray-500 font-mono text-sm bg-gray-50 py-2 px-3 rounded-lg group-hover:bg-gray-100 transition-colors">
                  {connective.example}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}