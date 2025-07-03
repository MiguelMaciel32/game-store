import { NextResponse } from "next/server"
import axios from "axios"

interface FastBuyResponse {
  status: string
  item?: any
  message?: string
}

interface ApiErrorResponse {
  message?: string
  error?: string
  errors?: any
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID do item é obrigatório." }, { status: 400 })
    }

    console.log("🔍 Tentando comprar item:", id)
    console.log("🔑 Token disponível:", process.env.API_BEARER_TOKEN ? "Sim" : "Não")

    // Chamada para o endpoint da LZT Market
    const response = await axios.post(
      `https://api.lzt.market/${id}/fast-buy`,
      {}, // Corpo vazio
      {
        headers: {
          Authorization: `Bearer ${process.env.API_BEARER_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 segundos de timeout
      },
    )

    const data = response.data as FastBuyResponse
    console.log("✅ Resposta da API:", data)

    if (data && data.status === "ok") {
      return NextResponse.json({
        status: "ok",
        item: data.item,
      })
    } else {
      return NextResponse.json({ error: data?.message || "Falha ao realizar a compra." }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Erro detalhado ao realizar a compra:", error)

    // Handle axios error specifically
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any
      const errorData = axiosError.response?.data as ApiErrorResponse

      console.error("📊 Status do erro:", axiosError.response?.status)
      console.error("📋 Dados do erro:", errorData)
      console.error("🔗 URL chamada:", axiosError.config?.url)
      console.error("🔑 Headers enviados:", axiosError.config?.headers)

      // Tratamento específico para erro 403
      if (axiosError.response?.status === 403) {
        return NextResponse.json(
          {
            error:
              "Acesso negado. Verifique se você tem permissão para comprar este item ou se o token de autorização está válido.",
            details: errorData?.message || errorData?.error || "Erro 403 - Forbidden",
          },
          { status: 403 },
        )
      }

      return NextResponse.json(
        {
          error: errorData?.message || errorData?.error || "Erro ao comunicar-se com a API externa.",
          status: axiosError.response?.status,
          details: errorData,
        },
        { status: axiosError.response?.status || 500 },
      )
    }

    return NextResponse.json({ error: "Erro ao comunicar-se com a API externa." }, { status: 500 })
  }
}
