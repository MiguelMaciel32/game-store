"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, type User } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateBalance: (newBalance: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        console.log("🔍 Verificando sessão inicial...")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("📋 Sessão encontrada:", session?.user?.email || "Nenhuma")

        if (session?.user) {
          await loadUserData(session.user)
        } else {
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error("❌ Erro ao verificar sessão:", error)
        setUser(null)
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Estado de auth mudou:", event, session?.user?.email || "sem usuário")

      if (event === "SIGNED_IN" && session?.user) {
        console.log("🎉 Usuário logado!")
        setLoading(true)
        await loadUserData(session.user)
      } else if (event === "SIGNED_OUT") {
        console.log("👋 Usuário deslogado!")
        setUser(null)
        setLoading(false)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token atualizado")
        await loadUserData(session.user)
      } else if (event === "INITIAL_SESSION") {
        console.log("🏁 Sessão inicial processada")
        if (session?.user) {
          await loadUserData(session.user)
        } else {
          setLoading(false)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (authUser: SupabaseUser) => {
    try {
      console.log("🔍 Carregando dados do usuário:", authUser.email)
      console.log("🆔 ID do usuário:", authUser.id)

      // Primeiro, tentar buscar o usuário
      const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      console.log("📊 Resultado da busca:", { data, error })

      if (error && error.code === "PGRST116") {
        console.log("👤 Usuário não encontrado, criando novo...")

        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split("@")[0],
          phone: authUser.user_metadata?.phone || null,
          balance: 50.0,
          level: 1,
          experience: 0,
          last_login: new Date().toISOString(),
        }

        console.log("📝 Dados do novo usuário:", newUser)

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single()

        console.log("📊 Resultado da criação:", { createdUser, createError })

        if (createError) {
          console.error("❌ Erro ao criar usuário:", createError)
          setLoading(false)
          return
        }

        console.log("✅ Usuário criado com sucesso:", createdUser)
        setUser(createdUser)
        setLoading(false)
      } else if (error) {
        console.error("❌ Erro ao carregar dados:", error)
        setLoading(false)
      } else {
        console.log("✅ Usuário encontrado:", data)

        // Atualizar last_login
        const { error: updateError } = await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", authUser.id)

        if (updateError) {
          console.warn("⚠️ Erro ao atualizar last_login:", updateError)
        }

        setUser(data)
        setLoading(false)
      }
    } catch (error) {
      console.error("💥 Erro crítico ao carregar usuário:", error)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 Tentando fazer login com:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("📊 Resultado do login:", {
        user: data.user?.email,
        session: !!data.session,
        error: error?.message,
      })

      if (error) {
        console.error("❌ Erro de login:", error.message)
        return { error: error.message }
      }

      console.log("✅ Login bem-sucedido!")
      return {}
    } catch (error) {
      console.error("💥 Erro inesperado:", error)
      return { error: "Erro inesperado ao fazer login" }
    }
  }

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      console.log("📝 Tentando criar conta para:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      })

      console.log("📊 Resultado do cadastro:", {
        user: data.user?.email,
        session: !!data.session,
        error: error?.message,
      })

      if (error) {
        console.error("❌ Erro de cadastro:", error.message)
        return { error: error.message }
      }

      console.log("✅ Cadastro bem-sucedido!")
      return {}
    } catch (error) {
      console.error("💥 Erro inesperado:", error)
      return { error: "Erro inesperado ao criar conta" }
    }
  }

  const signOut = async () => {
    console.log("👋 Fazendo logout...")
    await supabase.auth.signOut()
    setUser(null)
    setLoading(false)
  }

  const updateBalance = (newBalance: number) => {
    if (user) {
      console.log("💰 Atualizando saldo:", user.balance, "→", newBalance)
      setUser({ ...user, balance: newBalance })
    }
  }

  console.log("🎯 Estado atual do Auth:", {
    user: user?.email || "nenhum",
    loading,
    hasUser: !!user,
  })

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
