"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Copy, QrCode, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
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
  const [amount, setAmount] = useState(30)
  const [noBonus, setNoBonus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "APPROVED" | "expired">("idle")
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [checkCount, setCheckCount] = useState(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const predefinedAmounts = [
    { value: 30, label: "R$ 30" },
    { value: 50, label: "R$ 50", popular: true },
    { value: 100, label: "R$ 100" },
    { value: 250, label: "R$ 250", hot: true },
    { value: 500, label: "R$ 500" },
    { value: 1000, label: "R$ 1.000", hot: true },
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

      console.log("💾 Salvando PIX no banco:", pixPaymentData)

      const { data, error } = await supabase.from("pix_payments").insert([pixPaymentData]).select().single()

      if (error) {
        console.error("❌ Erro ao salvar PIX no banco:", error)
        return null
      }

      console.log("✅ PIX salvo no banco com sucesso:", data.id)
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

      console.log(`✅ Status do PIX atualizado para: ${status}`)
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
      console.log(`Saldo atualizado: R$ ${user.balance} + R$ ${newAmount} = R$ ${newBalance}`)
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[420px] sm:w-[90vw] md:max-w-md p-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl">
        {paymentStatus === "APPROVED" && (
          <div className="p-4 sm:p-6 md:p-8 text-center">
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-500/20 rounded-full blur-xl"></div>
              <CheckCircle className="relative h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-emerald-400 mx-auto animate-bounce" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent mb-2 sm:mb-3">
              Pagamento Aprovado!
            </h2>
            <p className="text-slate-300 mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">
              Seu saldo foi adicionado com sucesso.
            </p>
            <p className="text-emerald-400 text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
              + R$ {amount.toFixed(2)}
            </p>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-xs sm:text-sm">Novo saldo:</span>
                <span className="text-emerald-400 font-bold text-base sm:text-lg">
                  R$ {user?.balance?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg"
            >
              Continuar
            </Button>
          </div>
        )}

        {paymentStatus === "expired" && (
          <div className="p-4 sm:p-6 md:p-8 text-center">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-red-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">PIX Expirado</h2>
            <p className="text-slate-300 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
              O tempo para pagamento expirou.
            </p>
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={resetModal}
                className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white h-9 sm:h-10 md:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base"
              >
                Gerar Novo PIX
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 h-9 sm:h-10 md:h-12 bg-transparent rounded-lg sm:rounded-xl text-sm sm:text-base"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {paymentStatus === "pending" && pixData && (
          <>
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50 p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetModal}
                  className="text-slate-300 hover:bg-slate-700 hover:text-white rounded-md sm:rounded-lg text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Voltar
                </Button>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs text-blue-400 font-medium">Verificando... #{checkCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  <span className="text-slate-300 text-xs sm:text-sm">Tempo restante:</span>
                </div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-blue-400">{formatTime(timeLeft)}</div>
              </div>
              <div className="bg-slate-700/50 rounded-full h-1.5 sm:h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 sm:mb-3">Escaneie o QR Code</h3>
                <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl mb-3 sm:mb-4 shadow-lg">
                  {pixData.pixQrCode ? (
                    <img
                      src={pixData.pixQrCode || "/placeholder.svg"}
                      alt="QR Code PIX"
                      className="w-full h-24 xs:h-28 sm:h-32 md:h-40 object-contain"
                    />
                  ) : (
                    <div className="h-24 xs:h-28 sm:h-32 md:h-40 bg-slate-200 rounded flex items-center justify-center">
                      <span className="text-slate-500 text-xs sm:text-sm">QR Code indisponível</span>
                    </div>
                  )}
                </div>
              </div>

              {pixData.pixCode && (
                <div>
                  <h4 className="text-white font-semibold mb-2 text-xs sm:text-sm">Ou copie o código PIX:</h4>
                  <div className="bg-slate-800/50 border border-slate-700/50 p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 backdrop-blur-sm">
                    <code className="text-[10px] sm:text-xs text-slate-300 break-all font-mono leading-relaxed">
                      {pixData.pixCode}
                    </code>
                  </div>
                  <Button
                    onClick={copyPixCode}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 h-9 sm:h-10 md:h-12 rounded-lg sm:rounded-xl shadow-lg text-xs sm:text-sm md:text-base"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Copiar Código PIX
                  </Button>
                </div>
              )}

              <div className="bg-slate-800/50 border border-slate-700/50 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-xs sm:text-sm">Valor:</span>
                    <span className="text-white font-semibold text-sm sm:text-base">R$ {amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-xs sm:text-sm">Status:</span>
                    <span className="text-blue-400 text-xs sm:text-sm flex items-center">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      Aguardando pagamento...
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-xs sm:text-sm">ID:</span>
                    <span className="text-slate-400 text-[10px] sm:text-xs font-mono">{pixData.id?.slice(-8)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {paymentStatus === "idle" && (
          <>
            <div className="relative w-full h-24 sm:h-32 md:h-40 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800"></div>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex items-center justify-center text-center">
                <div>
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">💰</div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Adicionar Saldo</h2>
                  <p className="text-blue-100 text-xs sm:text-sm">Recarregue sua conta</p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Depositar</h2>
                <p className="text-xs sm:text-sm text-slate-300">Adicione saldo à sua conta</p>
              </div>

              <div>
                <label className="text-xs sm:text-sm text-slate-300 mb-1.5 sm:mb-2 block">
                  Valor a ser depositado:
                </label>
                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <span className="px-2 sm:px-3 text-slate-300 text-sm sm:text-base">R$</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-white text-base sm:text-lg font-semibold focus:ring-0 focus:outline-none h-10 sm:h-12"
                    min="30"
                    max="10000"
                  />
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 text-slate-300 hover:text-white hover:bg-slate-700"
                      onClick={decrementAmount}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 text-slate-300 hover:text-white hover:bg-slate-700"
                      onClick={incrementAmount}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {predefinedAmounts.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={amount === preset.value ? "default" : "outline"}
                    className={`relative h-8 sm:h-10 md:h-12 text-xs sm:text-sm md:text-base rounded-lg sm:rounded-xl transition-all ${
                      amount === preset.value
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-500 shadow-lg"
                        : "bg-slate-800/50 hover:bg-slate-700 text-slate-300 border-slate-700/50 backdrop-blur-sm"
                    }`}
                    onClick={() => setAmount(preset.value)}
                  >
                    {preset.label}
                    {preset.popular && (
                      <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full font-bold shadow-lg border border-orange-400">
                        HOT
                      </span>
                    )}
                    {preset.hot && (
                      <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[8px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full font-bold shadow-lg border border-green-400">
                        HOT
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="no-bonus"
                  checked={noBonus}
                  onCheckedChange={(checked) => setNoBonus(!!checked)}
                  className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-4 w-4 sm:h-5 sm:w-5"
                />
                <label htmlFor="no-bonus" className="text-xs sm:text-sm text-slate-300 cursor-pointer">
                  Não quero receber nenhum bônus
                </label>
              </div>

              <Button
                onClick={generatePix}
                disabled={isLoading || amount < 30}
                className="w-full h-9 sm:h-10 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl disabled:opacity-50 shadow-lg transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5 sm:mr-2"></div>
                    Gerando PIX...
                  </div>
                ) : (
                  "Gerar PIX"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
