import { createClient } from "@supabase/supabase-js"

// Configuração do Supabase com as credenciais corretas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://clffaowbdpnhnnzplfsi.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsZmZhb3diZHBuaG5uenBsZnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTQ1MzAsImV4cCI6MjA2NzA3MDUzMH0.gbeQHEoSUZCrNwg8oq2w_bCvHWG2ozs8WuTjkcaAq1U"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para o banco de dados
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  balance: number
  level: number
  experience: number
  created_at: string
  updated_at: string
  last_login?: string
  is_active: boolean
}

export interface ChatMessage {
  id: string
  user_id: string
  message: string
  message_type: "text" | "image" | "system"
  reply_to?: string
  is_edited: boolean
  edited_at?: string
  created_at: string
  updated_at: string
  user?: {
    name: string
    avatar_url?: string
    level: number
  }
}

export interface PixPayment {
  id: string
  user_id: string
  transaction_id: string
  amount: number
  status: "PENDING" | "APPROVED" | "EXPIRED" | "CANCELLED"
  pix_code?: string
  qr_code?: string
  influencer_code?: string
  expires_at?: string
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: "DEPOSIT" | "WITHDRAWAL" | "PURCHASE" | "BONUS"
  amount: number
  description?: string
  reference_id?: string
  balance_before: number
  balance_after: number
  created_at: string
}

// Função helper para verificar se o usuário está autenticado
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error("Erro ao obter usuário:", error)
    return null
  }
  return user
}

// Função helper para fazer logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Erro ao fazer logout:", error)
    return false
  }
  return true
}
