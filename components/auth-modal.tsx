"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Eye, EyeOff, User, Mail, Phone, Lock, Gift, GamepadIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "register"
}

export function AuthModal({ isOpen, onClose, defaultTab = "register" }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [couponCode, setCouponCode] = useState("")

  // Reset form when tab changes
  useEffect(() => {
    setError("")
    setIsLoading(false)
  }, [activeTab])

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError("")

    try {
      const { error } = await signIn(loginEmail, loginPassword)
      if (error) {
        setError(error)
      } else {
        console.log("🎉 Login realizado com sucesso, fechando modal...")
        // Limpar formulário
        setLoginEmail("")
        setLoginPassword("")
        // Fechar modal
        onClose()
      }
    } catch (error) {
      setError("Erro inesperado ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError("")

    // Validations
    if (!acceptTerms) {
      setError("Você deve aceitar os termos e condições")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password, name, phone)
      if (error) {
        setError(error)
      } else {
        console.log("🎉 Cadastro realizado com sucesso, fechando modal...")
        // Limpar formulário
        setName("")
        setEmail("")
        setPhone("")
        setPassword("")
        setConfirmPassword("")
        setCouponCode("")
        setAcceptTerms(false)
        // Fechar modal
        onClose()
      }
    } catch (error) {
      setError("Erro inesperado ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-auto">
        <div className="bg-white/20 backdrop-blur-2xl border border-white/20 rounded-2xl transition-all duration-300 overflow-hidden shadow-2xl">
          {/* Top accent line */}
          <div className="h-1 bg-blue-500 transition-all duration-300" />

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 border border-white/20 text-gray-600 hover:text-gray-800 hover:bg-white/30 transition-colors z-10 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <GamepadIcon className="h-6 w-6 text-blue-500 mr-2" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">GameVerse</h1>
                  <p className="text-sm text-gray-600">Sua loja de jogos</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-500 transition-all duration-300" />
            </div>

            {/* Tabs */}
            <div className="flex mb-6 bg-white/30 border border-white/20 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("login")}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-300 disabled:opacity-50 ${
                  activeTab === "login"
                    ? "bg-blue-500/20 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setActiveTab("register")}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-300 disabled:opacity-50 ${
                  activeTab === "register"
                    ? "bg-blue-500/20 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Cadastrar
              </button>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100/60 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">Bem-vindo de volta!</h2>
                  <p className="text-sm text-gray-600">Entre na sua conta para continuar</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 bg-white/50 border-white/20 text-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl"
                      placeholder="Seu e-mail"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/50 border-white/20 text-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl"
                      placeholder="Sua senha"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 h-12 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "Entrando..." : "Entrar agora"}
                </Button>

                <div className="text-center pt-2">
                  <span className="text-gray-600 text-sm">Não tem uma conta? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-blue-500 hover:text-blue-600 font-medium text-sm disabled:opacity-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cadastre-se aqui
                  </button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">Criar sua conta</h2>
                  <p className="text-sm text-gray-600">Junte-se a milhares de jogadores</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-white/50 border-white/20 text-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl"
                      placeholder="Nome completo"
                      required
                      disabled={isLoading}
                      autoComplete="name"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/50 border-white/20 text-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl"
                      placeholder="Seu e-mail"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span className="text-sm mr-1">🇧🇷</span>
                      <Phone className="h-4 w-4 text-blue-500" />
                    </div>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-14 bg-white/50 border-white/20 text-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl"
                      placeholder="Telefone"
                      disabled={isLoading}
                      autoComplete="tel"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/50 border-white/20 text-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl"
                      placeholder="Criar senha"
                      required
                      disabled={isLoading}
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/50 border-white/20 text-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl"
                      placeholder="Confirmar senha"
                      required
                      disabled={isLoading}
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="pl-10 bg-white/50 border-white/20 text-gray-800 placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl"
                      placeholder="Código de referência (opcional)"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    disabled={isLoading}
                    className="mt-1 border-blue-500/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    Tenho 18 anos e aceito os{" "}
                    <span className="text-blue-500 hover:text-blue-600 cursor-pointer transition-colors">Termos</span> e{" "}
                    <span className="text-blue-500 hover:text-blue-600 cursor-pointer transition-colors">
                      Política de Privacidade
                    </span>
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !acceptTerms}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 h-12 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar agora"}
                </Button>

                <div className="text-center pt-2">
                  <span className="text-gray-600 text-sm">Já tem uma conta? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-blue-500 hover:text-blue-600 font-medium text-sm disabled:opacity-50 transition-colors"
                    disabled={isLoading}
                  >
                    Faça login aqui
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
