'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { signOut } from '@/lib/services/userService'
import { useAuth } from '@/components/AuthProvider'

export default function Header() {
  const router = useRouter()
  const { user, loading, profile } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (!error) {
        setShowDropdown(false)
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut" as const
      }
    }
  }

  // Formata telefone brasileiro com máscara
  const formatPhone = (raw?: string | null) => {
    if (!raw) return ''
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 11) {
      // (11) 91234-5678
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
    }
    if (digits.length === 10) {
      // (11) 1234-5678
      return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
    }
    return raw
  }

  if (loading) {
    return (
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">⟁</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 font-montserrat">LogicBridge</span>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-200 transition-all duration-300"
            >
              <span className="text-white font-bold text-lg">⟁</span>
            </motion.div>
            <div>
              <span className="text-2xl font-bold text-gray-900 font-montserrat tracking-tight">LogicBridge</span>
              <div className="h-1 w-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full group-hover:w-full transition-all duration-500"></div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Dashboard Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard')}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-green-200 transition-all duration-200"
                >
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-montserrat font-medium">Dashboard</span>
                </motion.button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-green-100"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.nome || user.email || 'Avatar'}
                        className="w-10 h-10 rounded-full object-cover shadow-md border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm font-montserrat">
                          {user.user_metadata?.nome?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900 font-montserrat">
                        {profile?.nome || user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 font-montserrat font-light">
                        {user.email || ''}
                      </p>
                      { (profile?.telefone || user.user_metadata?.telefone) && (
                        <p className="text-xs text-gray-500 font-montserrat font-light">
                          {formatPhone(profile?.telefone ?? user.user_metadata?.telefone)}
                        </p>
                      ) }
                    </div>
                    <motion.div
                      animate={{ rotate: showDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 font-montserrat">
                            {profile?.nome || user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário'}
                          </p>
                          <p className="text-xs text-gray-500 truncate font-montserrat font-light">
                            {user.email || ''}
                          </p>
                          { (profile?.telefone || user.user_metadata?.telefone) && (
                            <p className="text-xs text-gray-500 truncate font-montserrat font-light">
                              {formatPhone(profile?.telefone ?? user.user_metadata?.telefone)}
                            </p>
                          ) }
                        </div>
                        
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            router.push('/profile')
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-3 group"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="font-montserrat">Meu Perfil</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            router.push('/dashboard')
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-3 group"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          <span className="font-montserrat">Dashboard</span>
                        </button>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center space-x-3 group"
                          >
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </div>
                            <span className="font-montserrat font-medium">Sair</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="px-6 py-2.5 text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-green-200 transition-all duration-200 font-montserrat"
                >
                  Entrar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/register')}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-200 transition-all duration-200 font-montserrat font-semibold"
                >
                  Cadastrar
                </motion.button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}