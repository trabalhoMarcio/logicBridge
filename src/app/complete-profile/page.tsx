'use client'
import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '@/lib/services/userService'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ nome?: string; telefone?: string }>({})
  const [touched, setTouched] = useState<{ nome?: boolean; telefone?: boolean }>({})

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        const res = await getProfile()
        
        if (!mounted) return
        
        if (!res.ok) {
          router.push('/login')
          return
        }
        
        if (res.profile) {
          setNome(res.profile.nome ?? '')
          setTelefone(res.profile.telefone ?? '')
          
          // Se o perfil já estiver completo, redireciona para o dashboard
          if (res.isComplete) {
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        if (mounted) router.push('/login')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [router])

  // Função para formatar telefone durante a digitação
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0,2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0,2)}) ${numbers.slice(2,6)}-${numbers.slice(6)}`
    } else {
      return `(${numbers.slice(0,2)}) ${numbers.slice(2,7)}-${numbers.slice(7,11)}`
    }
  }

  // Validações
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'nome':
        if (!value.trim()) {
          newErrors.nome = 'Nome é obrigatório'
        } else if (value.trim().length < 2) {
          newErrors.nome = 'O nome deve ter pelo menos 2 caracteres'
        } else if (value.trim().length > 100) {
          newErrors.nome = 'O nome deve ter no máximo 100 caracteres'
        } else {
          delete newErrors.nome
        }
        break
        
      case 'telefone':
        const numbers = value.replace(/\D/g, '')
        if (!numbers) {
          newErrors.telefone = 'Telefone é obrigatório'
        } else if (numbers.length < 10) {
          newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos'
        } else if (numbers.length > 11) {
          newErrors.telefone = 'Telefone deve ter no máximo 11 dígitos'
        } else if (!/^[1-9]{2}9?[0-9]{8}$/.test(numbers)) {
          newErrors.telefone = 'Por favor, insira um telefone válido'
        } else {
          delete newErrors.telefone
        }
        break
    }
    
    setErrors(newErrors)
    return !newErrors[field as keyof typeof newErrors]
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === 'nome') validateField('nome', nome)
    if (field === 'telefone') validateField('telefone', telefone)
  }

  const handleTelefoneChange = (value: string) => {
    const formattedValue = formatPhone(value)
    setTelefone(formattedValue)
    if (touched.telefone) {
      validateField('telefone', value)
    }
  }

  const handleNomeChange = (value: string) => {
    setNome(value)
    if (touched.nome) {
      validateField('nome', value)
    }
  }

  const isFormValid = () => {
    return nome.trim().length >= 2 && 
           telefone.replace(/\D/g, '').length >= 10 &&
           Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    // Marca todos os campos como tocados para mostrar erros
    setTouched({ nome: true, telefone: true })
    
    // Valida todos os campos
    const isNomeValid = validateField('nome', nome)
    const isTelefoneValid = validateField('telefone', telefone)

    if (!isNomeValid || !isTelefoneValid) {
      return
    }

    if (!isFormValid()) {
      return
    }
    
    setSaving(true)
    try {
      const res = await updateProfile({ 
        nome: nome.trim(), 
        telefone: telefone.replace(/\D/g, '') 
      })
      
      if (!res.ok) {
        alert(res.error?.message || 'Erro ao salvar perfil')
        return
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('Erro interno ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

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
            <span className="text-white font-bold text-2xl">👤</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 font-montserrat tracking-tight"
          >
            Complete seu Perfil
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-gray-600 font-montserrat font-light text-lg"
          >
            Preencha os dados obrigatórios para continuar
          </motion.p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl"
        >
          <div className="space-y-6">
            {/* Campo Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-3 font-montserrat">
                Nome Completo *
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className={`w-full px-4 py-4 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-montserrat ${
                  touched.nome && errors.nome 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Seu nome completo"
                value={nome}
                onChange={e => handleNomeChange(e.target.value)}
                onBlur={() => handleBlur('nome')}
                maxLength={100}
              />
              {touched.nome && errors.nome && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2 font-montserrat flex items-center"
                >
                  <span className="mr-1">⚠️</span>
                  {errors.nome}
                </motion.p>
              )}
              <div className="text-right mt-1">
                <span className={`text-xs ${
                  nome.length > 80 ? 'text-orange-500' : 'text-gray-400'
                } font-montserrat`}>
                  {nome.length}/100
                </span>
              </div>
            </div>

            {/* Campo Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-3 font-montserrat">
                Telefone *
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                className={`w-full px-4 py-4 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-montserrat ${
                  touched.telefone && errors.telefone 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={e => handleTelefoneChange(e.target.value)}
                onBlur={() => handleBlur('telefone')}
                maxLength={15}
              />
              {touched.telefone && errors.telefone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-2 font-montserrat flex items-center"
                >
                  <span className="mr-1">⚠️</span>
                  {errors.telefone}
                </motion.p>
              )}
              {!errors.telefone && telefone && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-500 text-sm mt-2 font-montserrat flex items-center"
                >
                  <span className="mr-1">✅</span>
                  Formato válido
                </motion.p>
              )}
            </div>
          </div>

          {/* Botão de ação */}
          <motion.button
            whileHover={{ scale: isFormValid() ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
            onClick={handleSave}
            disabled={saving || !isFormValid()}
            className={`w-full py-4 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg font-montserrat ${
              isFormValid()
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-green-200'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Salvando...
              </div>
            ) : (
              'Continuar para o Dashboard'
            )}
          </motion.button>

          {/* Dicas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-4"
          >
            <p className="text-sm text-blue-700 font-montserrat font-light">
              💡 <strong>Dica:</strong> Use seu nome real para uma experiência personalizada. O telefone será usado apenas para contato importante.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}