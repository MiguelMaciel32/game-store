import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("🚀 Criando transação PIX:", body)

    // URL real da Ghost Pay
    const ghostPayUrl = "https://app.ghostspaysv1.com/api/v1/transaction.purchase"
    const secretKey = process.env.GHOST_PAY_SECRET_KEY

    // Se não tiver a chave configurada, usar mock para teste
    if (!secretKey || secretKey === "YOUR_TEST_SECRET_KEY") {
      console.log("🧪 Usando mock da API para teste")
      return mockPixResponse(body)
    }

    // Dados fixos conforme especificado
    const transactionData = {
      name: "Ana Pereira",
      email: "ana.pereira@example.com",
      cpf: "52634731841",
      phone: "11948710683",
      paymentMethod: "PIX",
      amount: body.amount, // Valor já vem em centavos
      traceable: true,
      items: [
        {
          unitPrice: body.amount,
          title: "Recarga de Saldo",
          quantity: 1,
          tangible: false,
        },
      ],
    }

    console.log("📤 Enviando para Ghost Pay:", transactionData)

    // Fazer requisição para a API real da Ghost Pay
    const response = await fetch(ghostPayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: secretKey,
      },
      body: JSON.stringify(transactionData),
    })

    console.log("📡 Status da resposta Ghost Pay:", response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error("❌ Erro da API Ghost Pay:", errorData)
      return NextResponse.json({ success: false, error: "Erro ao criar transação PIX" }, { status: response.status })
    }

    const result = await response.json()
    console.log("✅ Transação criada com sucesso:", result.id)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("💥 Erro ao criar transação PIX:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Mock para teste local (quando não tiver chave configurada)
function mockPixResponse(body: any) {
  const mockTransaction = {
    id: `txn_${Date.now()}`,
    customId: `GHO${Date.now()}`,
    installments: null,
    expiresAt: null,
    dueAt: null,
    approvedAt: null,
    refundedAt: null,
    rejectedAt: null,
    chargebackAt: null,
    availableAt: null,
    pixQrCode:
      "data:image/png;base64,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",
    pixCode:
      "00020126870014br.gov.bcb.pix2565pix.primepag.com.br/qr/v3/at/c961fa6f-355c-4e3a-8443-61853099593b5204000053039865802BR5916TRANSACAO_SEGURA6009SAO_PAULO62070503***6304F6AA",
    billetUrl: null,
    billetCode: null,
    status: "PENDING",
    address: "",
    district: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    zipCode: "",
    amount: body.amount,
    taxSeller: Math.floor(body.amount * 0.045), // 4.5%
    taxPlatform: Math.floor(body.amount * 0.01), // 1%
    amountSeller: body.amount - Math.floor(body.amount * 0.055),
    amountGarantee: 0,
    taxGarantee: 0,
    traceable: true,
    method: "PIX",
    deliveryStatus: "WAITING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    utmQuery: "",
    checkoutUrl: "",
    referrerUrl: "",
    externalId: "",
    postbackUrl: "",
  }

  console.log("🎭 Mock: Transação PIX criada:", mockTransaction.id)

  return NextResponse.json({
    success: true,
    data: mockTransaction,
  })
}