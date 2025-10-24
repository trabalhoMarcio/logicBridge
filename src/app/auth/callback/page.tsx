// app/auth/callback/page.tsx
'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createProfileIfNotExistsFromSession } from '@/lib/services/userService'
import { supabase } from '@/lib/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Finalizando login...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const processAuth = async () => {
      try {
        if (!mounted) return

        setStatus('Verificando autenticação...')
        
        // Aguarda um pouco para garantir que o Supabase processou a sessão
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verifica se há uma sessão ativa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.error('❌ Nenhuma sessão encontrada:', sessionError)
          setError('Erro: sessão não encontrada')
          setStatus('Redirecionando para login...')
          timeoutId = setTimeout(() => {
            if (mounted) router.push('/login')
          }, 2000)
          return
        }

        setStatus('Configurando sua conta...')
        
        // Tenta criar o perfil com timeout
        const profilePromise = createProfileIfNotExistsFromSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )

        let res: any = null
        try {
          res = await Promise.race([profilePromise, timeoutPromise])
        } catch (error) {
          console.error('❌ Erro ao criar profile:', error)
          setError('Erro ao configurar conta')
          setStatus('Redirecionando para login...')
          timeoutId = setTimeout(() => {
            if (mounted) router.push('/login')
          }, 2000)
          return
        }

        if (!res?.ok) {
          console.error('❌ Erro ao criar profile:', res?.error)
          setError('Erro ao configurar conta')
          setStatus('Redirecionando para login...')
          timeoutId = setTimeout(() => {
            if (mounted) router.push('/login')
          }, 2000)
          return
        }

        // Verifica se o perfil foi criado mas está incompleto
        const isProfileComplete = res.profile?.nome && res.profile?.telefone
        
        setStatus(isProfileComplete ? 'Redirecionando para o dashboard...' : 'Completando informações do perfil...')
        
        timeoutId = setTimeout(() => {
          if (!mounted) return
          if (!isProfileComplete) {
            router.push('/complete-profile')
          } else {
            router.push('/dashboard')
          }
        }, 1000)

      } catch (error) {
        console.error('❌ Erro inesperado no callback:', error)
        if (mounted) {
          setError('Erro inesperado')
          setStatus('Redirecionando para login...')
          timeoutId = setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    processAuth()

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg"
        >
          <span className="text-white font-bold text-2xl">⟁</span>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-6"></div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-bold text-gray-900 mb-4 font-montserrat"
          >
            {loading ? 'Processando...' : (error ? 'Erro' : 'Pronto!')}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-600 font-montserrat font-light text-lg mb-2"
          >
            {status}
          </motion.p>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center space-x-2 mb-4"
        >
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + step * 0.1 }}
              className={`w-3 h-3 rounded-full ${
                loading 
                  ? 'bg-green-500 animate-pulse' 
                  : error 
                  ? 'bg-red-500'
                  : 'bg-emerald-400'
              }`}
            />
          ))}
        </motion.div>

        {/* Additional Info */}
        {!error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-8"
          >
            <p className="text-sm text-blue-700 font-montserrat font-light">
              ⚡ Sua conta está sendo preparada com todas as funcionalidades do LogicBridge
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}