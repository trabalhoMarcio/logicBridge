// components/AuthProvider.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase-browser'
import { User } from '@supabase/supabase-js'
import { getProfile } from '@/lib/services/userService'

interface UserProfile {
  id: string
  nome: string
  telefone: string
  email: string
  other_data?: any
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  signOut: async () => {}
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  // Permite atualização manual do profile global
  const refreshProfile = async () => {
    try {
      const { ok, profile: userProfile } = await getProfile()
      if (ok && userProfile) {
        setProfile({
          id: userProfile.id,
          nome: userProfile.nome || '',
          telefone: userProfile.telefone || '',
          email: user?.email || '',
          other_data: userProfile.other_data
        })
      }
    } catch (e) {
      // ignora
    }
  }
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    // Busca sessão inicial
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao buscar sessão:', error)
          if (mounted) {
            setLoading(false)
            setInitialized(true)
          }
          return
        }

        if (session?.user && mounted) {
          setUser(session.user)
          // Carrega perfil
          const { ok, profile: userProfile } = await getProfile()
          if (ok && userProfile && mounted) {
            setProfile({
              id: userProfile.id,
              nome: userProfile.nome || '',
              telefone: userProfile.telefone || '',
              email: session.user.email || '',
              other_data: userProfile.other_data
            })
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        
        if (!initialized) return // Ignora eventos até a inicialização completa
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
          
          if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/converter')) {
            router.push('/login')
          }
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          
          try {
            // Carrega perfil após login
            const { ok, profile: userProfile } = await getProfile()
            if (ok && userProfile) {
              setProfile({
                id: userProfile.id,
                nome: userProfile.nome || '',
                telefone: userProfile.telefone || '',
                email: session.user.email || '',
                other_data: userProfile.other_data
              })
            }

            // Redireciona após login
            if (event === 'SIGNED_IN') {
              const urlParams = new URLSearchParams(window.location.search)
              const from = urlParams.get('from')
              
              if (from) {
                router.push(from)
              } else {
                router.push('/dashboard')
              }
            }
          } catch (error) {
            console.error('Erro ao carregar perfil:', error)
          }
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, pathname])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}