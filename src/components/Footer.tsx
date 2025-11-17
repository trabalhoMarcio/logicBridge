'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function Footer() {
  const router = useRouter()

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-black border-t border-gray-100"
    >
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">⟁</span>
              </div>
              <span className="text-2xl font-bold text-white font-montserrat tracking-tight">LogicBridge</span>
            </div>
            <p className="text-white max-w-md font-montserrat font-light leading-relaxed">
              Conectando lógica e linguagem de forma inteligente. Transforme frases em fórmulas 
              lógicas e vice-versa com nossa plataforma avançada de IA.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-white mb-4 font-montserrat">Navegação</h3>
            <ul className="space-y-3">
              {['Início', 'Dashboard', 'NL → CPC', 'CPC → NL'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => router.push(item === 'Início' ? '/' : `/${item.toLowerCase().replace('→', 'to').replace(' ', '-')}`)}
                    className="text-white hover:text-green-500 transition-all duration-200 font-montserrat font-light hover:translate-x-1 transform"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Conta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-white mb-4 font-montserrat">Conta</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => router.push('/login')}
                  className="text-white hover:text-green-500 transition-all duration-200 font-montserrat font-light hover:translate-x-1 transform"
                >
                  Entrar
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/register')}
                  className="text-white hover:text-green-500 transition-all duration-200 font-montserrat font-light hover:translate-x-1 transform"
                >
                  Cadastrar
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push('/profile')}
                  className="text-white hover:text-green-500 transition-all duration-200 font-montserrat font-light hover:translate-x-1 transform"
                >
                  Meu Perfil
                </button>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="border-t border-gray-100 mt-8 pt-8 text-center"
        >
          <p className="text-white font-montserrat font-light">
            © 2025 LogicBridge. Conectando lógica e linguagem.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  )
}