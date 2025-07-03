"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Copy, QrCode, Clock, CheckCircle, AlertCircle, ArrowLeft, X } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess?: (amount: number) => void
}

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
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

  const generatePix = async () => {
    setIsLoading(true)
    try {
      // Simular geração de PIX
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockPixData = {
        id: "pix_" + Math.random().toString(36).substr(2, 9),
        pixCode:
          "00020126580014br.gov.bcb.pix0136" +
          Math.random().toString(36).substr(2, 32) +
          "5204000053039865802BR5925PFVR GAMES LTDA6009SAO PAULO62070503***6304",
        pixQrCode: "/placeholder.svg?height=200&width=200&text=QR+Code+PIX",
      }

      setPixData(mockPixData)
      setPaymentStatus("pending")
      setTimeLeft(15 * 60)
      setCheckCount(0)

      // Simular aprovação após 10 segundos para demonstração
      setTimeout(() => {
        setPaymentStatus("APPROVED")
        clearIntervals()
        if (onPaymentSuccess) {
          onPaymentSuccess(amount)
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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
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

      <div className="relative w-full max-w-sm mx-auto">
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
                <CheckCircle className="relative h-16 w-16 text-green-500 mx-auto animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent mb-3">
                Pagamento Aprovado!
              </h2>
              <p className="text-gray-600 mb-3 text-sm">Seu saldo foi adicionado com sucesso.</p>
              <p className="text-green-500 text-xl font-bold mb-6 drop-shadow-lg">+ R$ {amount.toFixed(2)}</p>
              <Button
                onClick={handleClose}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 text-lg rounded-xl"
              >
                Continuar
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
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Valor:</span>
                    <span className="text-gray-800 font-semibold">R$ {amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-700">Status:</span>
                    <span className="text-blue-600 text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Aguardando pagamento...
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-700">ID:</span>
                    <span className="text-gray-600 text-xs font-mono">{pixData.id?.slice(-8)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {paymentStatus === "idle" && (
            <>
              <div className="relative w-full h-32">
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-xl font-bold">💰 Adicionar Saldo</h2>
                    <p className="text-sm opacity-90">Recarregue sua conta</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Depositar</h2>
                  <p className="text-sm text-gray-600">Adicione saldo à sua conta</p>
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">Valor a ser depositado:</label>
                  <div className="flex items-center bg-white/50 border border-white/20 rounded-lg">
                    <span className="px-3 text-gray-700">R$</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="flex-1 bg-transparent border-0 text-gray-800 text-lg font-semibold focus:ring-0"
                      min="30"
                      max="10000"
                    />
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:text-gray-800 hover:bg-white/30"
                        onClick={decrementAmount}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:text-gray-800 hover:bg-white/30"
                        onClick={incrementAmount}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {predefinedAmounts.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={amount === preset.value ? "default" : "outline"}
                      className={`relative h-12 text-sm ${
                        amount === preset.value
                          ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                          : "bg-white/50 hover:bg-white/70 text-gray-700 border-white/20"
                      } rounded-xl`}
                      onClick={() => setAmount(preset.value)}
                    >
                      {preset.label}
                      {preset.popular && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded text-[10px] font-bold">
                          HOT
                        </span>
                      )}
                      {preset.hot && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded text-[10px] font-bold">
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
                    className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label htmlFor="no-bonus" className="text-sm text-gray-700 cursor-pointer">
                    Não quero receber nenhum bônus
                  </label>
                </div>

                <Button
                  onClick={generatePix}
                  disabled={isLoading || amount < 30}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl disabled:opacity-50"
                >
                  {isLoading ? "Gerando PIX..." : "Gerar PIX"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
