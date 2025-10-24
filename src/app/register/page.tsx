'use client'
import { useState, useEffect } from 'react'
import { register, signInWithGoogle } from '@/lib/services/userService'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'

export default function RegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      router.replace('/dashboard')
    }
  }, [user, router])

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email é obrigatório'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Por favor, insira um email válido'
        } else {
          delete newErrors.email
        }
        break
        
      case 'password':
        if (!value) {
          newErrors.password = 'Senha é obrigatória'
        } else if (value.length < 6) {
          newErrors.password = 'A senha deve ter pelo menos 6 caracteres'
        } else {
          delete newErrors.password
        }
        break
        
      case 'nome':
        if (!value) {
          newErrors.nome = 'Nome é obrigatório'
        } else if (value.trim().length < 2) {
          newErrors.nome = 'O nome deve ter pelo menos 2 caracteres'
        } else {
          delete newErrors.nome
        }
        break
        
      case 'telefone':
        if (!value) {
          newErrors.telefone = 'Telefone é obrigatório'
        } else if (!/^(\d{10,11})$/.test(value.replace(/\D/g, ''))) {
          newErrors.telefone = 'Por favor, insira um telefone válido (10 ou 11 dígitos)'
        } else {
          delete newErrors.telefone
        }
        break
    }
    
    setErrors(newErrors)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valida todos os campos
    validateField('email', email)
    validateField('password', password)
    validateField('nome', nome)
    validateField('telefone', telefone)

    // Verifica se há erros
    if (Object.keys(errors).length > 0) {
      setMessage('Por favor, corrija os erros antes de continuar')
      return
    }

    if (!email || !password || !nome || !telefone) {
      setMessage('Por favor, preencha todos os campos')
      return
    }

    setLoading(true)
    setMessage('')
    
    try {
      const res = await register({ 
        email: email.trim(), 
        password, 
        nome: nome.trim(), 
        telefone: telefone.trim() 
      })
      
      if (!res.ok) {
        setMessage(res.error?.message || 'Erro no cadastro')
        return
      }
      
      if (res.note === 'confirm_email') {
        setMessage('Conta criada com sucesso! Verifique seu email para confirmar sua conta antes de fazer login.')
        alert('Conta criada com sucesso! Verifique seu email para confirmar sua conta antes de fazer login.')
        router.push('/login')
        return
      }
      
      if (res.note === 'user_created_profile_pending') {
        setMessage('Conta criada com sucesso! Faça login para completar seu perfil.')
        alert('Conta criada com sucesso! Faça login para completar seu perfil.')
        router.push('/login')
        return
      }

      // Se chegou aqui, registro foi completo com profile criado
      setMessage(res.message || 'Cadastro realizado com sucesso!')
      alert('Cadastro realizado com sucesso!')
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Erro no registro:', error)
      setMessage('Erro interno no sistema. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInWithGoogle(`${window.location.origin}/auth/callback`)
    } catch (error) {
      console.error('Erro no login com Google:', error)
      alert('Erro ao entrar com Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          >
            <span className="text-white font-bold text-2xl">⟁</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 font-montserrat tracking-tight"
          >
            Criar Conta
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-gray-600 font-montserrat font-light text-lg"
          >
            Junte-se ao LogicBridge e comece a conectar lógica e linguagem
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleRegister}
          className="mt-8 space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl"
        >
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-2xl text-center font-montserrat border ${
                message.includes('sucesso') 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message}
            </motion.div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-3 font-montserrat">
                Nome Completo *
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className={`w-full px-4 py-4 border rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-montserrat ${
                  errors.nome ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Seu nome completo"
                value={nome}
                onChange={e => {
                  setNome(e.target.value)
                  validateField('nome', e.target.value)
                }}
              />
              {errors.nome && <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.nome}</p>}
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-3 font-montserrat">
                Telefone *
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                className={`w-full px-4 py-4 border rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-montserrat ${
                  errors.telefone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={e => {
                  setTelefone(e.target.value.replace(/\D/g, ''))
                  validateField('telefone', e.target.value)
                }}
              />
              {errors.telefone && <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.telefone}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3 font-montserrat">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-4 py-4 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-montserrat ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  validateField('email', e.target.value)
                }}
              />
              {errors.email && <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3 font-montserrat">
                Senha *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`w-full px-4 py-4 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-montserrat ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  validateField('password', e.target.value)
                }}
              />
              {errors.password && <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.password}</p>}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-green-200 font-montserrat"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Cadastrando...
              </div>
            ) : (
              'Criar Conta'
            )}
          </motion.button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200 font-montserrat"
            >
              Já tem uma conta? Entre aqui
            </Link>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-montserrat">ou</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white text-gray-700 py-4 px-4 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 hover:border-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center font-montserrat"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Cadastrar com Google
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}