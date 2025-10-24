'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

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
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-green-200 rounded-full px-6 py-3 mb-8 shadow-sm"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-montserrat font-medium">
              Dashboard • Escolha o modo de conversão
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl font-bold text-gray-900 mb-6 font-montserrat tracking-tight"
          >
            Bem-vindo ao{' '}
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 mb-12 font-montserrat font-light max-w-2xl mx-auto"
          >
            Escolha o modo de conversão que deseja usar e comece a conectar lógica e linguagem
          </motion.p>

          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {/* Modo NL → CPC */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-8 bg-white border border-gray-200 rounded-3xl hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 cursor-pointer"
              onClick={() => router.push('/converter/nl-to-cpc')}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto">
                <motion.span 
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white font-bold text-3xl"
                >
                  →
                </motion.span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat text-center">
                NL → CPC
              </h3>
              <p className="text-gray-600 mb-6 text-lg font-montserrat font-light leading-relaxed text-center">
                Converta frases em português para fórmulas precisas de lógica proposicional
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100 group-hover:border-blue-200 transition-colors">
                <p className="text-sm text-gray-500 font-montserrat font-medium mb-2">Entrada:</p>
                <p className="text-gray-800 font-montserrat text-center">"Se chover, então a grama ficará molhada."</p>
                <p className="text-sm text-gray-500 font-montserrat font-medium mt-4 mb-2">Saída:</p>
                <p className="text-gray-800 font-mono text-lg font-bold text-center">P → Q</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-200 font-montserrat"
              >
                Usar Este Modo
              </motion.button>
            </motion.div>

            {/* Modo CPC → NL */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-8 bg-white border border-gray-200 rounded-3xl hover:border-green-200 hover:shadow-2xl hover:shadow-green-100 transition-all duration-500 cursor-pointer"
              onClick={() => router.push('/converter/cpc-to-nl')}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto">
                <motion.span 
                  animate={{ rotate: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white font-bold text-3xl"
                >
                  ←
                </motion.span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat text-center">
                CPC → NL
              </h3>
              <p className="text-gray-600 mb-6 text-lg font-montserrat font-light leading-relaxed text-center">
                Traduza fórmulas lógicas complexas para frases coerentes em português
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 group-hover:border-green-200 transition-colors">
                <p className="text-sm text-gray-500 font-montserrat font-medium mb-2">Entrada:</p>
                <p className="text-gray-800 font-mono text-lg font-bold text-center">(P ∧ Q) → R</p>
                <p className="text-sm text-gray-500 font-montserrat font-medium mt-4 mb-2">Saída:</p>
                <p className="text-gray-800 font-montserrat text-center">"Se chover e fizer frio, então a aula será cancelada."</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-200 font-montserrat"
              >
                Usar Este Modo
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}