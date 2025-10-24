import { supabase } from '@/lib/supabase-browser'

type RegisterPayload = {
  email: string
  password: string
  nome?: string
  telefone?: string
}

type UpdateProfilePayload = {
  nome?: string
  telefone?: string
  other_data?: Record<string, any>
}

// Função para validar email
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// Função para validar senha
function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres' }
  }
  return { isValid: true, message: '' }
}

// Função para validar telefone (formato brasileiro básico)
function validatePhone(telefone: string): boolean {
  const phoneRegex = /^(\d{10,11})$/
  return phoneRegex.test(telefone.replace(/\D/g, ''))
}

/** ---------- Email + Senha ---------- */
export async function register(payload: RegisterPayload) {
  const { email, password, nome, telefone } = payload
  
  // Validações no lado do cliente
  if (!validateEmail(email)) {
    return { ok: false, error: new Error('Por favor, insira um email válido') }
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return { ok: false, error: new Error(passwordValidation.message) }
  }

  if (!nome || nome.trim().length < 2) {
    return { ok: false, error: new Error('O nome deve ter pelo menos 2 caracteres') }
  }

  if (!telefone || !validatePhone(telefone)) {
    return { ok: false, error: new Error('Por favor, insira um telefone válido (10 ou 11 dígitos)') }
  }

  try {
    // Primeiro, registra o usuário no Auth
    const { data: signData, error: signErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      options: { 
        data: { 
          nome: nome.trim(), 
          telefone: telefone.trim()
        }
      }
    })

    if (signErr) {
      console.error('Erro de autenticação:', signErr)
      
      // Traduz mensagens de erro comuns do Supabase
      let errorMessage = 'Erro ao criar conta'
      
      if (signErr.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.'
      } else if (signErr.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido. Por favor, verifique o formato do email.'
      } else if (signErr.message?.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (signErr.message) {
        errorMessage = `Erro: ${signErr.message}`
      }
      
      return { ok: false, error: new Error(errorMessage) }
    }

    // Se o usuário foi criado, cria o profile usando a função do banco
    if (signData.user) {
      try {
        // Chama a função do banco para criar o profile
        const { data: profileResult, error: profileErr } = await supabase
          .rpc('create_user_profile', {
            user_id: signData.user.id,
            user_nome: nome.trim(),
            user_telefone: telefone.trim()
          })

        if (profileErr) {
          console.error('Erro na criação do perfil:', profileErr)
          // Mesmo com erro no profile, o usuário foi criado
          return { 
            ok: true, 
            note: 'user_created_profile_pending',
            user: signData.user,
            message: 'Conta criada com sucesso! Faça login para completar seu perfil.'
          }
        }

        // Verifica se o email precisa ser confirmado
        const needsEmailConfirmation = signData.user.identities?.length === 0
        
        if (needsEmailConfirmation) {
          return { 
            ok: true, 
            note: 'confirm_email',
            user: signData.user,
            message: 'Conta criada com sucesso! Verifique seu email para confirmar sua conta antes de fazer login.'
          }
        }

        // Se não precisa confirmar email, faz login automático
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim()
        })

        if (signInError) {
          console.error('Erro no login automático:', signInError)
          return { 
            ok: true, 
            note: 'login_required',
            user: signData.user,
            message: 'Conta criada com sucesso! Faça login para continuar.'
          }
        }

        // Login automático bem-sucedido
        return { 
          ok: true, 
          user: signInData.user,
          message: 'Cadastro realizado com sucesso! Bem-vindo!'
        }

      } catch (profileError) {
        console.error('Exceção na criação do perfil:', profileError)
        return { 
          ok: true, 
          note: 'user_created_profile_pending',
          user: signData.user,
          message: 'Conta criada com sucesso! Faça login para completar seu perfil.'
        }
      }
    }

    // Se não há user mas também não há erro, provavelmente precisa confirmar email
    return { 
      ok: true, 
      note: 'confirm_email', 
      data: signData,
      message: 'Verifique seu email para confirmar sua conta antes de fazer login.'
    }

  } catch (error) {
    console.error('Erro no registro:', error)
    return { 
      ok: false, 
      error: new Error('Erro interno no sistema. Tente novamente mais tarde.') 
    }
  }
}

export async function signIn(email: string, password: string) {
  // Validações básicas
  if (!validateEmail(email)) {
    return { ok: false, error: new Error('Por favor, insira um email válido') }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: email.trim().toLowerCase(), 
    password: password.trim()
  })
  
  if (error) {
    console.error('Erro no login:', error)
    
    // Traduz mensagens de erro comuns do Supabase
    let errorMessage = 'Erro ao fazer login'
    
    if (error.message?.includes('Invalid login credentials')) {
      errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.'
    } else if (error.message?.includes('Email not confirmed')) {
      errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.'
    } else if (error.message?.includes('Too many requests')) {
      errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos.'
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`
    }
    
    return { ok: false, error: new Error(errorMessage) }
  }
  
  // Após login bem-sucedido, garante que o profile existe
  await createProfileIfNotExistsFromSession()
  
  return { ok: true, data }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Erro ao sair:', error)
    return { ok: false, error: new Error('Erro ao fazer logout') }
  }
  return { ok: true }
}

/** ---------- Profile ---------- */
export async function getProfile() {
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) {
    return { ok: false, error: new Error('Usuário não autenticado. Faça login novamente.') }
  }

  const userId = userRes.user.id
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, nome, telefone, other_data, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (profileErr) {
    return { ok: false, error: new Error('Erro ao carregar perfil') }
  }
  
  const isComplete = !!(profile?.nome && profile?.telefone)
  return { ok: true, profile, isComplete }
}

export async function isProfileComplete(): Promise<boolean> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) return false

  const userId = userRes.user.id
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('nome, telefone')
    .eq('id', userId)
    .single()

  if (profileErr) return false
  
  return !!(profile?.nome && profile?.telefone)
}

export async function createProfile(payload: { nome?: string; telefone?: string }) {
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) {
    return { ok: false, error: new Error('Usuário não autenticado') }
  }

  const userId = userRes.user.id
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ 
      id: userId, 
      nome: payload.nome ?? null, 
      telefone: payload.telefone ?? null 
    }])
    .select()
    .single()

  if (error) {
    return { ok: false, error: new Error('Erro ao criar perfil') }
  }
  return { ok: true, profile: data }
}

export async function updateProfile(updates: UpdateProfilePayload) {
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) {
    return { ok: false, error: new Error('Usuário não autenticado') }
  }

  const userId = userRes.user.id
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: new Error('Erro ao atualizar perfil') }
  }
  return { ok: true, profile: data }
}

export async function deleteProfile() {
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes.user) {
    return { ok: false, error: new Error('Usuário não autenticado') }
  }

  const userId = userRes.user.id
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { ok: false, error: new Error('Erro ao excluir perfil') }
  }
  return { ok: true, deleted: data }
}

/** ---------- Google OAuth ---------- */
export async function signInWithGoogle(redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { 
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  
  if (error) {
    console.error('Erro no login com Google:', error)
    return { ok: false, error: new Error('Erro ao entrar com Google') }
  }
  
  return { ok: true, data }
}

export async function createProfileIfNotExistsFromSession() {
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr) return { ok: false, error: userErr }
  
  const user = userRes.user
  if (!user) return { ok: false, error: new Error('Usuário não autenticado') }

  // Verifica se profile já existe
  const { data: existing, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, nome, telefone, other_data')
    .eq('id', user.id)
    .single()

  // Se já existe, retorna
  if (!fetchErr && existing) {
    const isComplete = !!(existing.nome && existing.telefone)
    return { ok: true, profile: existing, created: false, isComplete }
  }

  // Se não existe, cria com dados do user_metadata
  const metaNome = user.user_metadata?.nome || user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário'
  const metaPhone = user.user_metadata?.telefone || user.user_metadata?.phone || null

  const { data: profileData, error: insertErr } = await supabase
    .from('profiles')
    .insert([{ 
      id: user.id, 
      nome: metaNome, 
      telefone: metaPhone 
    }])
    .select()
    .single()

  if (insertErr) {
    console.error('Erro ao criar perfil:', insertErr)
    return { ok: false, error: insertErr }
  }
  
  const isComplete = !!(profileData.nome && profileData.telefone)
  return { ok: true, profile: profileData, created: true, isComplete }
}

export function initAuthListenerToSyncProfile() {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Estado de autenticação alterado:', event)
    
    if (event === 'SIGNED_IN' && session?.user) {
      try {
        await createProfileIfNotExistsFromSession()
      } catch (e) {
        console.error('Falha ao sincronizar perfil após login:', e)
      }
    }
  })
}