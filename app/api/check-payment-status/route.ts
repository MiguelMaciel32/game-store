import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("id")

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "ID da transação é obrigatório" }, { status: 400 })
    }

    const secretKey = process.env.GHOST_PAY_SECRET_KEY

    // Se não tiver a chave configurada, usar mock para teste
    if (!secretKey || secretKey === "YOUR_TEST_SECRET_KEY") {
      return mockStatusResponse(transactionId)
    }

    // URL real da Ghost Pay para verificar status
    const ghostPayUrl = `https://app.ghostspaysv1.com/api/v1/transaction.getPaymentDetails?id=${transactionId}`

    // Consultar status na API real da Ghost Pay
    const response = await fetch(ghostPayUrl, {
      method: "GET",
      headers: {
        Authorization: secretKey,
      },
    })

    if (!response.ok) {
      console.error("❌ Erro ao consultar status:", response.status)
      return NextResponse.json({ success: false, error: "Erro ao consultar status" }, { status: response.status })
    }

    const result = await response.json()

    // Se o pagamento foi aprovado, processar no banco de dados
    if (result.status === "APPROVED") {
      await processApprovedPayment(transactionId, result)
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      data: result,
    })
  } catch (error) {
    console.error("💥 Erro ao verificar status:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Processar pagamento aprovado
async function processApprovedPayment(transactionId: string, paymentData: any) {
  try {
    // Verificar se já foi processado
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("external_id", transactionId)
      .eq("status", "completed")
      .single()

    if (existingTransaction) {
      console.log("✅ Transação já processada:", transactionId)
      return
    }

    // Buscar a transação pendente
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("external_id", transactionId)
      .eq("status", "pending")
      .single()

    if (transactionError || !transaction) {
      console.error("❌ Transação não encontrada:", transactionId)
      return
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", transaction.user_id)
      .single()

    if (userError || !userData) {
      console.error("❌ Usuário não encontrado:", transaction.user_id)
      return
    }

    // Calcular novo saldo
    const rechargeAmount = transaction.amount
    const newBalance = userData.balance + rechargeAmount

    // Atualizar saldo do usuário
    const { error: balanceError } = await supabase
      .from("users")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.user_id)

    if (balanceError) {
      console.error("❌ Erro ao atualizar saldo:", balanceError)
      return
    }

    // Marcar transação como concluída
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id)

    if (updateError) {
      console.error("❌ Erro ao atualizar transação:", updateError)
      return
    }

    console.log("🎉 Pagamento processado com sucesso:", {
      transactionId,
      userId: transaction.user_id,
      amount: rechargeAmount,
      newBalance,
    })
  } catch (error) {
    console.error("💥 Erro ao processar pagamento aprovado:", error)
  }
}

// Mock storage para simular mudanças de status
const mockTransactions = new Map<string, { status: string; approvedAt?: string }>()

// Mock para simular mudança de status (apenas para teste local)
function mockStatusResponse(transactionId: string) {
  // Simular que após 30 segundos o pagamento é aprovado
  const transaction = mockTransactions.get(transactionId)

  if (!transaction) {
    // Primeira verificação - criar transação pendente
    mockTransactions.set(transactionId, { status: "PENDING" })

    // Simular aprovação após 30 segundos
    setTimeout(async () => {
      mockTransactions.set(transactionId, {
        status: "APPROVED",
        approvedAt: new Date().toISOString(),
      })
      console.log("🎉 Mock: Pagamento aprovado automaticamente para", transactionId)

      // Processar o pagamento mock
      await processApprovedPayment(transactionId, {
        id: transactionId,
        status: "APPROVED",
        amount: 5000, // R$ 50,00 em centavos
        method: "PIX",
        customer: {
          name: "Ana Pereira",
          email: "ana.pereira@example.com",
          cpf: "52634731841",
          phone: "11948710683",
        },
        approvedAt: new Date().toISOString(),
      })
    }, 30000) // 30 segundos

    return NextResponse.json({
      success: true,
      status: "PENDING",
      data: {
        id: transactionId,
        status: "PENDING",
        amount: 5000,
        method: "PIX",
        customer: {
          name: "Ana Pereira",
          email: "ana.pereira@example.com",
          cpf: "52634731841",
          phone: "11948710683",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  }

  return NextResponse.json({
    success: true,
    status: transaction.status,
    data: {
      id: transactionId,
      status: transaction.status,
      amount: 5000,
      method: "PIX",
      customer: {
        name: "Ana Pereira",
        email: "ana.pereira@example.com",
        cpf: "52634731841",
        phone: "11948710683",
      },
      approvedAt: transaction.approvedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })
}