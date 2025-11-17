'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '@/lib/services/userService'
import { useAuth } from '@/components/AuthProvider'

interface ProfileData {
  nome: string
  telefone: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    nome: '',
    telefone: '',
    email: user?.email || ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { ok, profile: userProfile } = await getProfile()
      if (ok && userProfile) {
        setProfile({
          nome: userProfile.nome || '',
          telefone: userProfile.telefone || '',
          email: user?.email || ''
        })
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `(${numbers.slice(0,2)}) ${numbers.slice(2,7)}-${numbers.slice(7)}`
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0,2)}) ${numbers.slice(2,6)}-${numbers.slice(6)}`
    }
    return phone
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'nome':
        if (!value.trim()) {
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
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valida todos os campos
    const isNomeValid = validateField('nome', profile.nome)
    const isTelefoneValid = validateField('telefone', profile.telefone)

    if (!isNomeValid || !isTelefoneValid) {
      setMessage('Por favor, corrija os erros antes de salvar')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const { ok, error } = await updateProfile({
        nome: profile.nome.trim(),
        telefone: profile.telefone.trim()
      })

      if (ok) {
        setMessage('Perfil atualizado com sucesso!')
      } else {
        setMessage(error?.message || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setMessage('Erro interno ao salvar perfil')
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
          <p className="text-gray-600 font-montserrat">Carregando perfil...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 overflow-hidden"
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={profile.nome || user.email || 'Avatar'}
                  className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                />
              ) : (
                <span className="text-white font-bold text-xl sm:text-2xl md:text-3xl">
                  {profile.nome.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 font-montserrat"
            >
              Meu Perfil
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-gray-600 font-montserrat font-light"
            >
              Gerencie suas informações pessoais
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSave}
            className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xl mb-6 sm:mb-8"
          >
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 border font-montserrat text-sm sm:text-base ${
                  message.includes('sucesso') 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {message}
              </motion.div>
            )}

            <div className="space-y-4 sm:space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 font-montserrat">
                  Nome Completo 
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 text-black focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-montserrat text-sm sm:text-base ${
                    errors.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                  value={profile.nome}
                  onChange={e => {
                    setProfile({ ...profile, nome: e.target.value })
                    validateField('nome', e.target.value)
                  }}
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.nome}</p>
                )}
              </div>

              {/* Email (readonly) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 font-montserrat">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  readOnly
                  className="w-full px-4 py-3 sm:py-4 border border-gray-300 text-black rounded-xl bg-gray-50 cursor-not-allowed font-montserrat text-sm sm:text-base"
                  value={profile.email}
                />
                <p className="text-gray-500 text-sm mt-2 font-montserrat font-light">
                  O email não pode ser alterado
                </p>
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 font-montserrat">
                  Telefone *
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  className={`w-full px-4 py-3 sm:py-4 border rounded-xl focus:ring-2 text-black focus:ring-green-500 focus:border-green-500 transition-all duration-200 font-montserrat text-sm sm:text-base ${
                    errors.telefone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                  value={formatPhone(profile.telefone)}
                  onChange={e => {
                    const numbers = e.target.value.replace(/\D/g, '')
                    setProfile({ ...profile, telefone: numbers })
                    validateField('telefone', numbers)
                  }}
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm mt-2 font-montserrat">{errors.telefone}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 font-montserrat text-sm sm:text-base"
              >
                Voltar
              </motion.button>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving || Object.keys(errors).length > 0}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-green-200 font-montserrat text-sm sm:text-base"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                    Salvando...
                  </div>
                ) : (
                  'Salvar Alterações'
                )}
              </motion.button>
            </div>
          </motion.form>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4 sm:gap-6"
          >
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-200 text-center group hover:shadow-lg transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform">2</div>
              <p className="text-gray-700 font-montserrat font-medium text-xs sm:text-sm">Modos de Conversão</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-green-200 text-center group hover:shadow-lg transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform">5</div>
              <p className="text-gray-700 font-montserrat font-medium text-xs sm:text-sm">Conectivos Suportados</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}