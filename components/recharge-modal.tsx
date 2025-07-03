"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Copy, QrCode, Clock, CheckCircle, AlertCircle, ArrowLeft, Sparkles, Zap } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

interface RechargeModalProps {
  isOpen: boolean
  onClose: () => void
  onRechargeSuccess?: (amount: number) => void
}

export default function RechargeModal({ isOpen, onClose, onRechargeSuccess }: RechargeModalProps) {
  const { user, updateBalance } = useAuth()
  const [amount, setAmount] = useState(50)
  const [noBonus, setNoBonus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "APPROVED" | "expired">("idle")
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [checkCount, setCheckCount] = useState(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const predefinedAmounts = [
    { value: 30, label: "R$ 30", bonus: 0 },
    { value: 50, label: "R$ 50", bonus: 5, popular: true },
    { value: 100, label: "R$ 100", bonus: 15 },
    { value: 250, label: "R$ 250", bonus: 50, hot: true },
    { value: 500, label: "R$ 500", bonus: 125 },
    { value: 1000, label: "R$ 1.000", bonus: 300, hot: true },
  ]

  const handleAmountChange = (value: string) => {
    const numValue = Number.parseInt(value) || 0
    if (numValue >= 30 && numValue <= 10000) {
      setAmount(numValue)
    }
  }

  const incrementAmount = () => {
    if (amount < 10000) {
      setAmount((prev) => prev + 10)
    }
  }

  const decrementAmount = () => {
    if (amount > 30) {
      setAmount((prev) => Math.max(30, prev - 10))
    }
  }

  const clearIntervals = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
      checkIntervalRef.current = null
    }
  }

  const savePixPaymentToDatabase = async (pixData: any, status = "PENDING") => {
    if (!user || !pixData) {
      console.error("Dados insuficientes para salvar PIX no banco")
      return null
    }

    try {
      const pixPaymentData = {
        user_id: user.id,
        transaction_id: pixData.id,
        amount: amount,
        status: status,
        pix_code: pixData.pixCode || null,
        qr_code: pixData.pixQrCode || null,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("pix_payments").insert([pixPaymentData]).select().single()

      if (error) {
        console.error("❌ Erro ao salvar PIX no banco:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("💥 Erro ao salvar PIX no banco:", error)
      return null
    }
  }

  const updatePixPaymentStatus = async (transactionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("pix_payments")
        .update({
          status: status,
          updated_at: new Date().toISOString(),
          ...(status === "APPROVED" && { paid_at: new Date().toISOString() }),
        })
        .eq("transaction_id", transactionId)

      if (error) {
        console.error("❌ Erro ao atualizar status do PIX:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("💥 Erro ao atualizar status do PIX:", error)
      return false
    }
  }

  const generatePix = async () => {
    if (!user) {
      toast.error("Usuário não encontrado")
      return
    }

    setIsLoading(true)
    try {
      const transactionData = {
        paymentMethod: "PIX",
        amount: amount * 100,
        traceable: true,
        items: [
          {
            unitPrice: amount * 100,
            title: "Recarga de Saldo",
            quantity: 1,
            tangible: false,
          },
        ],
      }

      const response = await fetch("/api/create-pix-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setPixData(result.data)
          setPaymentStatus("pending")
          setTimeLeft(15 * 60)
          setCheckCount(0)
          await savePixPaymentToDatabase(result.data, "PENDING")
          toast.success("✅ PIX gerado com sucesso!")
          if (result.data.id) {
            startPaymentCheck(result.data.id)
          }
        } else {
          toast.error("❌ Erro ao gerar PIX: " + result.error)
        }
      } else {
        toast.error("❌ Erro ao gerar PIX")
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
      toast.error("❌ Erro interno. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const startPaymentCheck = (transactionId: string) => {
    checkPaymentStatus(transactionId)
    checkIntervalRef.current = setInterval(() => {
      setCheckCount((prev) => prev + 1)
      checkPaymentStatus(transactionId)
    }, 1000)
  }

  const updateUserBalance = async (newAmount: number) => {
    if (!user) {
      console.error("Usuário não encontrado")
      return false
    }

    try {
      const newBalance = user.balance + newAmount
      const { error } = await supabase.from("users").update({ balance: newBalance }).eq("id", user.id)

      if (error) {
        console.error("Erro ao atualizar saldo no banco:", error)
        return false
      }

      updateBalance(newBalance)
      return true
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error)
      return false
    }
  }

  const checkPaymentStatus = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/check-payment-status?id=${transactionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (result.status === "APPROVED") {
            clearIntervals()
            setPaymentStatus("APPROVED")
            await updatePixPaymentStatus(transactionId, "APPROVED")
            const balanceUpdated = await updateUserBalance(amount)
            if (balanceUpdated) {
              toast.success("🎉 Pagamento aprovado! Saldo atualizado!")
            } else {
              toast.error("❌ Pagamento aprovado, mas erro ao atualizar saldo. Contate o suporte.")
            }
            if (onRechargeSuccess) {
              onRechargeSuccess(amount)
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error)
    }
  }

  useEffect(() => {
    if (pixData && paymentStatus === "pending") {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPaymentStatus("expired")
            clearIntervals()
            if (pixData?.id) {
              updatePixPaymentStatus(pixData.id, "EXPIRED")
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [pixData, paymentStatus])

  useEffect(() => {
    return () => {
      clearIntervals()
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      clearIntervals()
    }
  }, [isOpen])

  useEffect(() => {
    if (paymentStatus !== "pending" && paymentStatus !== "idle") {
      clearIntervals()
    }
  }, [paymentStatus])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const copyPixCode = async () => {
    if (pixData?.pixCode) {
      try {
        await navigator.clipboard.writeText(pixData.pixCode)
        toast.success("📋 Código PIX copiado!")
      } catch (error) {
        toast.error("❌ Erro ao copiar código")
      }
    }
  }

  const resetModal = () => {
    clearIntervals()
    setPixData(null)
    setPaymentStatus("idle")
    setTimeLeft(15 * 60)
    setCheckCount(0)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const getBonus = (value: number) => {
    const preset = predefinedAmounts.find((p) => p.value === value)
    return preset?.bonus || 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/80 backdrop-blur-md" />
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[440px] p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl max-h-[95vh] overflow-y-auto rounded-3xl">
        {/* Success State */}
        {paymentStatus === "APPROVED" && (
          <div className="p-8 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Pagamento Aprovado!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Seu saldo foi adicionado com sucesso</p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 mb-8">
              <div className="text-center">
                <p className="text-green-600 dark:text-green-400 text-4xl font-bold mb-2">+ R$ {amount.toFixed(2)}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Novo saldo: R$ {user?.balance?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-lg rounded-2xl shadow-lg"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Expired State */}
        {paymentStatus === "expired" && (
          <div className="p-8 text-center">
            <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-8">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">PIX Expirado</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              O tempo para pagamento expirou. Gere um novo PIX para continuar.
            </p>
            <div className="space-y-3">
              <Button
                onClick={resetModal}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl"
              >
                Gerar Novo PIX
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full h-12 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl bg-transparent"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* Pending Payment State */}
        {paymentStatus === "pending" && pixData && (
          <>
            {/* Header with Timer */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-3xl text-white">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetModal}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Verificando... #{checkCount}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{formatTime(timeLeft)}</div>
                <p className="text-white/80 text-sm mb-4">Tempo restante para pagamento</p>
                <div className="bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* QR Code Section */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 mb-6">
                  <div className="bg-green-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Escaneie o QR Code</h3>
                  <div className="bg-white rounded-2xl p-4 shadow-inner">
                    {pixData.pixQrCode ? (
                      <img
                        src={pixData.pixQrCode || "/placeholder.svg"}
                        alt="QR Code PIX"
                        className="w-full h-48 object-contain"
                      />
                    ) : (
                      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                        <span className="text-gray-500 text-sm">QR Code indisponível</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PIX Code Section */}
              {pixData.pixCode && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ou copie o código PIX:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <code className="text-sm text-gray-700 dark:text-gray-300 break-all font-mono leading-relaxed">
                      {pixData.pixCode}
                    </code>
                  </div>
                  <Button
                    onClick={copyPixCode}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Código PIX
                  </Button>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Valor:</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">R$ {amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <div className="flex items-center text-blue-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Aguardando pagamento</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Initial State */}
        {paymentStatus === "idle" && (
          <>
            {/* Header - Espaço para imagem personalizada 440x200px */}
            <div className="relative overflow-hidden rounded-t-3xl h-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700"></div>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex items-center justify-center text-center">
                <div>
                  <div className="bg-white/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2 text-white">Adicionar Saldo</h1>
                  <p className="text-white/80">Recarregue sua conta de forma rápida e segura</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount Input */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-gray-900 dark:text-white block">Valor do depósito</label>
                <div className="relative">
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 focus-within:border-blue-500 transition-colors">
                    <span className="px-4 text-gray-600 dark:text-gray-300 font-semibold">R$</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="flex-1 bg-transparent border-0 text-2xl font-bold text-gray-900 dark:text-white focus:ring-0 focus:outline-none h-16"
                      min="30"
                      max="10000"
                      placeholder="0,00"
                    />
                    <div className="flex p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                        onClick={decrementAmount}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl"
                        onClick={incrementAmount}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  {getBonus(amount) > 0 && (
                    <div className="absolute -top-2 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      +R$ {getBonus(amount)} bônus
                    </div>
                  )}
                </div>
              </div>

              {/* Predefined Amounts */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Valores populares</h3>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedAmounts.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={amount === preset.value ? "default" : "outline"}
                      className={`relative h-16 rounded-2xl transition-all duration-200 ${
                        amount === preset.value
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg scale-105"
                          : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                      onClick={() => setAmount(preset.value)}
                    >
                      <div className="text-center">
                        <div className="font-bold text-lg">{preset.label}</div>
                        {preset.bonus > 0 && <div className="text-xs opacity-80">+R$ {preset.bonus} bônus</div>}
                      </div>
                      {preset.popular && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center">
                          <Zap className="h-3 w-3 mr-1" />
                          POPULAR
                        </div>
                      )}
                      {preset.hot && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          MELHOR
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bonus Option */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="no-bonus"
                    checked={noBonus}
                    onCheckedChange={(checked) => setNoBonus(!!checked)}
                    className="border-2 border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 h-5 w-5"
                  />
                  <label htmlFor="no-bonus" className="text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                    Não quero receber bônus (processamento mais rápido)
                  </label>
                </div>
              </div>

              {/* Generate PIX Button */}
              <Button
                onClick={generatePix}
                disabled={isLoading || amount < 30}
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg rounded-2xl disabled:opacity-50 shadow-lg transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Gerando PIX...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <QrCode className="h-5 w-5 mr-3" />
                    Gerar PIX - R$ {amount.toFixed(2)}
                  </div>
                )}
              </Button>

              {/* Security Info */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>🔒 Pagamento 100% seguro via PIX</p>
                <p>⚡ Processamento instantâneo</p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
