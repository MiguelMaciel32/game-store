"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Minus,
  Copy,
  QrCode,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  X,
  CreditCard,
  Smartphone,
  Gift,
  Zap,
  Star,
  Wallet,
} from "lucide-react"

interface EnhancedPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess?: (amount: number) => void
}

export default function EnhancedPaymentModal({ isOpen, onClose, onPaymentSuccess }: EnhancedPaymentModalProps) {
  const [amount, setAmount] = useState(50)
  const [bonusAmount, setBonusAmount] = useState(0)
  const [noBonus, setNoBonus] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "APPROVED" | "expired">("idle")
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [checkCount, setCheckCount] = useState(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const predefinedAmounts = [
    { value: 30, label: "R$ 30", bonus: 0, popular: false, description: "Iniciante" },
    { value: 50, label: "R$ 50", bonus: 5, popular: true, description: "Mais Escolhido" },
    { value: 100, label: "R$ 100", bonus: 15, popular: false, description: "Bom Negócio" },
    { value: 250, label: "R$ 250", bonus: 50, hot: true, description: "Super Oferta" },
    { value: 500, label: "R$ 500", bonus: 125, hot: false, description: "Investidor" },
    { value: 1000, label: "R$ 1.000", bonus: 300, hot: true, description: "VIP" },
  ]

  // Calcular bônus baseado no valor
  useEffect(() => {
    if (noBonus) {
      setBonusAmount(0)
      return
    }

    const preset = predefinedAmounts.find((p) => p.value === amount)
    if (preset) {
      setBonusAmount(preset.bonus)
    } else {
      if (amount >= 1000) setBonusAmount(Math.floor(amount * 0.3))
      else if (amount >= 500) setBonusAmount(Math.floor(amount * 0.25))
      else if (amount >= 250) setBonusAmount(Math.floor(amount * 0.2))
      else if (amount >= 100) setBonusAmount(Math.floor(amount * 0.15))
      else if (amount >= 50) setBonusAmount(Math.floor(amount * 0.1))
      else setBonusAmount(0)
    }
  }, [amount, noBonus])

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

  const generatePix = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockPixData = {
        id: "pix_" + Math.random().toString(36).substr(2, 9),
        pixCode: "00020126580014br.gov.bcb.pix0136" + Math.random().toString(36).substr(2, 32),
        pixQrCode: "/placeholder.svg?height=200&width=200&text=QR+Code+PIX",
      }

      setPixData(mockPixData)
      setPaymentStatus("pending")
      setTimeLeft(15 * 60)
      setCheckCount(0)

      // Simular aprovação após 10 segundos
      setTimeout(() => {
        setPaymentStatus("APPROVED")
        clearIntervals()
        if (onPaymentSuccess) {
          onPaymentSuccess(amount + bonusAmount)
        }
      }, 10000)
    } catch (error) {
      console.error("Erro na requisição:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (pixData && paymentStatus === "pending") {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPaymentStatus("expired")
            clearIntervals()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      checkIntervalRef.current = setInterval(() => {
        setCheckCount((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      clearIntervals()
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const copyPixCode = async () => {
    if (pixData?.pixCode) {
      try {
        await navigator.clipboard.writeText(pixData.pixCode)
        console.log("Código PIX copiado!")
      } catch (error) {
        console.error("Erro ao copiar código")
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" onClick={handleClose} />

      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white/20 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 border border-white/20 text-gray-600 hover:text-gray-800 hover:bg-white/30 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {paymentStatus === "APPROVED" && (
            <div className="p-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-full blur-xl"></div>
                <CheckCircle className="relative h-20 w-20 text-green-500 mx-auto animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent mb-3">
                Pagamento Aprovado!
              </h2>
              <p className="text-gray-600 mb-3 text-sm">Seu saldo foi adicionado com sucesso.</p>

              <div className="bg-white/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Valor depositado:</span>
                  <span className="text-green-600 font-bold">+ R$ {amount.toFixed(2)}</span>
                </div>
                {bonusAmount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Bônus recebido:</span>
                    <span className="text-yellow-600 font-bold">+ R$ {bonusAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-semibold">Total creditado:</span>
                    <span className="text-blue-600 font-bold text-lg">+ R$ {(amount + bonusAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 text-lg rounded-xl"
              >
                Continuar Jogando
              </Button>
            </div>
          )}

          {paymentStatus === "expired" && (
            <div className="p-6 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">PIX Expirado</h2>
              <p className="text-gray-600 mb-6 text-sm">O tempo para pagamento expirou.</p>
              <div className="space-y-3">
                <Button
                  onClick={resetModal}
                  className="w-full bg-white/50 hover:bg-white/70 border border-white/20 text-gray-800 h-12 rounded-xl"
                >
                  Gerar Novo PIX
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full border-white/20 text-gray-600 hover:bg-white/30 h-12 bg-transparent rounded-xl"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}

          {paymentStatus === "pending" && pixData && (
            <>
              <div className="bg-white/30 border-b border-white/20 p-4 rounded-t-lg">
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetModal}
                    className="text-gray-600 hover:bg-white/30 hover:text-gray-800 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                  </Button>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600">Verificando... #{checkCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 text-sm">Tempo restante:</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">{formatTime(timeLeft)}</div>
                </div>
                <div className="mt-2 bg-white/30 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center">
                  <QrCode className="h-5 w-5 text-green-500 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-gray-800 mb-2">Escaneie o QR Code</h3>
                  <div className="bg-white p-3 rounded-lg mb-3">
                    <img
                      src={pixData.pixQrCode || "/placeholder.svg"}
                      alt="QR Code PIX"
                      className="w-full h-40 object-contain"
                    />
                  </div>
                </div>

                {pixData.pixCode && (
                  <div>
                    <h4 className="text-gray-800 font-semibold mb-2 text-sm">Ou copie o código PIX:</h4>
                    <div className="bg-white/50 border border-white/20 p-2 rounded-lg mb-3">
                      <code className="text-xs text-gray-700 break-all">{pixData.pixCode}</code>
                    </div>
                    <Button
                      onClick={copyPixCode}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 h-12 rounded-xl"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Código PIX
                    </Button>
                  </div>
                )}

                <div className="bg-white/50 border border-white/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Valor:</span>
                    <span className="text-gray-800 font-semibold">R$ {amount.toFixed(2)}</span>
                  </div>
                  {bonusAmount > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Bônus:</span>
                      <span className="text-yellow-600 font-semibold">+ R$ {bonusAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-semibold">Total a receber:</span>
                      <span className="text-blue-600 font-bold">R$ {(amount + bonusAmount).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">Status:</span>
                    <span className="text-blue-600 text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Aguardando pagamento...
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {paymentStatus === "idle" && (
            <>
              <div className="relative w-full h-40">
                <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-t-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="flex items-center justify-center mb-2">
                      <Wallet className="h-8 w-8 mr-2" />
                      <h2 className="text-2xl font-bold">Recarregar Saldo</h2>
                    </div>
                    <p className="text-sm opacity-90">Adicione créditos à sua conta</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block font-medium">Valor do depósito:</label>
                  <div className="flex items-center bg-white/50 border border-white/20 rounded-xl">
                    <span className="px-4 text-gray-700 font-medium">R$</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="flex-1 bg-transparent border-0 text-gray-800 text-xl font-bold focus:ring-0 h-14"
                      min="30"
                      max="10000"
                    />
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-gray-600 hover:text-gray-800 hover:bg-white/30"
                        onClick={decrementAmount}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-gray-600 hover:text-gray-800 hover:bg-white/30"
                        onClick={incrementAmount}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  {bonusAmount > 0 && !noBonus && (
                    <div className="mt-2 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Gift className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Bônus incluído:</span>
                        </div>
                        <span className="text-yellow-600 font-bold">+ R$ {bonusAmount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        Total a receber: R$ {(amount + bonusAmount).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {predefinedAmounts.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={amount === preset.value ? "default" : "outline"}
                      className={`relative h-16 text-sm flex flex-col items-center justify-center ${
                        amount === preset.value
                          ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                          : "bg-white/50 hover:bg-white/70 text-gray-700 border-white/20"
                      } rounded-xl transition-all duration-200`}
                      onClick={() => setAmount(preset.value)}
                    >
                      <div className="font-bold">{preset.label}</div>
                      <div className="text-xs opacity-75">{preset.description}</div>
                      {preset.bonus > 0 && <div className="text-xs text-green-600 font-medium">+R$ {preset.bonus}</div>}
                      {preset.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {preset.hot && (
                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-0.5">
                          <Zap className="h-3 w-3 mr-1" />
                          HOT
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-bonus"
                      checked={noBonus}
                      onCheckedChange={(checked) => setNoBonus(!!checked)}
                      className="border-white/20 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <label htmlFor="no-bonus" className="text-sm text-gray-700 cursor-pointer">
                      Não quero receber bônus (apenas o valor depositado)
                    </label>
                  </div>

                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Resumo do Pagamento</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Valor do depósito:</span>
                        <span className="font-medium">R$ {amount.toFixed(2)}</span>
                      </div>
                      {bonusAmount > 0 && !noBonus && (
                        <div className="flex justify-between">
                          <span className="text-green-700">Bônus ({((bonusAmount / amount) * 100).toFixed(0)}%):</span>
                          <span className="font-medium text-green-600">+ R$ {bonusAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-blue-200 pt-1 flex justify-between font-bold">
                        <span className="text-blue-800">Total a receber:</span>
                        <span className="text-blue-600">R$ {(amount + (noBonus ? 0 : bonusAmount)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generatePix}
                  disabled={isLoading || amount < 30}
                  className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl disabled:opacity-50 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Gerando PIX...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5" />
                      <span>Gerar PIX</span>
                    </div>
                  )}
                </Button>

                <div className="text-center text-xs text-gray-500">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <div className="h-1 w-1 bg-green-500 rounded-full"></div>
                    <span>Pagamento 100% seguro</span>
                  </div>
                  <div>PIX aprovado em até 2 minutos</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
