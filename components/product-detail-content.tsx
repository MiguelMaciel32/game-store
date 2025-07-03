"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Shield,
  User,
  Package,
  AlertCircle,
  Gamepad2,
  Coins,
  Loader2,
  Copy,
  Castle,
  ArrowLeft,
  Star,
  Globe,
  Users,
  Target,
  Crown,
} from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import WishlistButton from "./wishlist-button"
import { useAuth } from "@/hooks/use-auth"

interface GameAccount {
  item_id: number
  title: string
  price: number
  price_currency: string
  supercell_town_hall_level?: number
  supercell_builder_hall_level?: number
  supercell_magic_level?: number
  supercell_magic_trophies?: number
  supercell_total_heroes_level?: number
  supercell_total_troops_level?: number
  supercell_total_spells_level?: number
  supercell_builder_hall_cup_count?: number
  supercell_brawler_count?: number
  supercellBrawlers?: string[]
  riot_valorant_level?: string
  riot_valorant_region?: string
  riot_valorant_skin_count?: number
  valorantLastRankTitle?: string
  valorantInventory?: {
    WeaponSkins?: string[]
    Buddy?: string[]
    Agent?: string[]
  }
  fortnite_level?: number
  fortnite_lifetime_wins?: number
  fortnite_skin_count?: number
  fortnite_balance?: number
  fortniteSkins?: any[]
  fortnitePickaxe?: any[]
  fortniteGliders?: any[]
  fortniteDance?: any[]
  steam_game_count?: number
  steam_level?: number
  steam_cs2_rank_id?: string
  steam_balance?: string
  steam_full_games?: {
    list: any
  }
  accountLinks?: Array<{
    link: string
    text: string
    iconClass: string
  }>
  descriptionHtml?: string
  supercell_arena?: string
  supercell_scroll_level?: number
  supercell_scroll_trophies?: number
  supercell_scroll_victories?: number
  supercell_laser_trophies?: number
  supercell_laser_victories?: number
  supercell_legendary_brawler_count?: number
  [key: string]: any
}

interface ApiResponse {
  item: GameAccount
  error?: string
}

interface FastBuyResponse {
  status: string
  item?: any
  message?: string
}

interface ApiErrorResponse {
  error?: string
  message?: string
}

// Type guard para verificar se é um erro do axios
function isAxiosError(error: unknown): error is { response?: { status?: number; data?: any } } {
  return error !== null && typeof error === "object" && "response" in error
}

const convertToReais = (price: number, currency: string): number => {
  const exchangeRate = currency === "rub" ? 0.066 : 1
  return price * exchangeRate * 2.5
}

interface ProductDetailContentProps {
  productId: string
}

export default function ProductDetailContent({ productId }: ProductDetailContentProps) {
  const { user } = useAuth()
  const [account, setAccount] = useState<GameAccount | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showLoadingDialog, setShowLoadingDialog] = useState(false)
  const [loginData, setLoginData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get<ApiResponse>(`/api/product?id=${productId}`)
        setAccount(response.data.item)
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          if (err.response?.status === 429) {
            setError("Muitas requisições. Por favor, tente novamente mais tarde.")
          } else {
            const errorData = err.response?.data as ApiErrorResponse
            setError(errorData?.error || "Erro ao buscar dados da conta.")
          }
        } else {
          setError("Erro inesperado ao buscar dados da conta.")
        }
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchData()
    }
  }, [productId])

  const handlePurchase = async () => {
    if (!account || !user) {
      toast.error("Faça login para realizar a compra")
      return
    }

    const priceInReais = convertToReais(account.price, account.price_currency)
    if (user.balance < priceInReais) {
      toast.error("Saldo insuficiente para realizar a compra")
      return
    }

    setShowLoadingDialog(true)

    try {
      const response = await axios.post<FastBuyResponse>("/api/fast-buy", { id: productId })
      const data = response.data

      if (data && data.status === "ok") {
        setLoginData(data.item)
        setShowLoadingDialog(false)
        setShowLoginDialog(true)
        toast.success("Compra realizada com sucesso!")
      } else {
        throw new Error(data.message || "Falha na compra")
      }
    } catch (err: unknown) {
      console.error("Erro ao processar a compra:", err)

      if (isAxiosError(err)) {
        const errorData = err.response?.data as ApiErrorResponse
        toast.error(errorData?.error || errorData?.message || "Ocorreu um erro ao processar a compra")
      } else if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error("Ocorreu um erro ao processar a compra")
      }
    } finally {
      setShowLoadingDialog(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Copiado para a área de transferência!")
      },
      (err) => {
        console.error("Erro ao copiar texto: ", err)
        toast.error("Erro ao copiar texto")
      },
    )
  }

  const getGameType = () => {
    if (account?.fortnite_level) return "fortnite"
    if (account?.riot_valorant_skin_count) return "valorant"
    if (account?.steam_full_games) return "steam"
    if (account?.supercell_town_hall_level) return "supercell"
    return "unknown"
  }

  const getGameIcon = () => {
    const gameType = getGameType()
    switch (gameType) {
      case "fortnite":
        return <Gamepad2 className="h-8 w-8" />
      case "valorant":
        return <Target className="h-8 w-8" />
      case "steam":
        return <Gamepad2 className="h-8 w-8" />
      case "supercell":
        return <Castle className="h-8 w-8" />
      default:
        return <Package className="h-8 w-8" />
    }
  }

  const getGameColor = () => {
    const gameType = getGameType()
    switch (gameType) {
      case "fortnite":
        return "from-purple-600 to-blue-600"
      case "valorant":
        return "from-blue-600 to-indigo-600" // Mudança aqui: de red-orange para blue-indigo
      case "steam":
        return "from-blue-600 to-indigo-600"
      case "supercell":
        return "from-orange-600 to-red-500"
      default:
        return "from-gray-600 to-gray-700"
    }
  }

  const renderGameSpecificInfo = () => {
    if (!account) return null

    const gameType = getGameType()

    switch (gameType) {
      case "fortnite":
        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <User className="w-6 h-6 mb-2 text-purple-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Nível</p>
                <p className="font-bold text-lg">{account.fortnite_level}</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6 mb-2 text-purple-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Vitórias</p>
                <p className="font-bold text-lg">{account.fortnite_lifetime_wins}</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <Package className="w-6 h-6 mb-2 text-purple-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Skins</p>
                <p className="font-bold text-lg">{account.fortnite_skin_count}</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <Coins className="w-6 h-6 mb-2 text-purple-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">V-Bucks</p>
                <p className="font-bold text-lg">{account.fortnite_balance}</p>
              </div>
            </div>
            <Tabs defaultValue="skins" className="w-full mb-12">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 dark:bg-black/20">
                <TabsTrigger value="skins">Skins</TabsTrigger>
                <TabsTrigger value="pickaxes">Picaretas</TabsTrigger>
                <TabsTrigger value="gliders">Planadores</TabsTrigger>
                <TabsTrigger value="emotes">Emotes</TabsTrigger>
              </TabsList>
              <TabsContent value="skins">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {account.fortniteSkins?.map((skin: any) => (
                    <div
                      key={skin.id}
                      className="bg-white/10 dark:bg-black/20 p-3 rounded-xl text-center backdrop-blur-sm"
                    >
                      <Image
                        src={`https://fortnite-api.com/images/cosmetics/br/${skin.id}/smallicon.png`}
                        alt={skin.title}
                        width={80}
                        height={80}
                        className="mx-auto mb-2 rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      <p className="text-xs truncate font-medium">{skin.title}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              {/* Add other tabs content similarly */}
            </Tabs>
          </>
        )

      case "valorant":
        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <Globe className="w-6 h-6 mb-2 text-blue-400" /> {/* red-400 -> blue-400 */}
                <p className="text-sm text-gray-600 dark:text-gray-400">Região</p>
                <p className="font-bold text-lg">{account.riot_valorant_region}</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <Users className="w-6 h-6 mb-2 text-blue-400" /> {/* red-400 -> blue-400 */}
                <p className="text-sm text-gray-600 dark:text-gray-400">Nível</p>
                <p className="font-bold text-lg">{account.riot_valorant_level}</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <Package className="w-6 h-6 mb-2 text-blue-400" /> {/* red-400 -> blue-400 */}
                <p className="text-sm text-gray-600 dark:text-gray-400">Skins</p>
                <p className="font-bold text-lg">{account.riot_valorant_skin_count}</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6 mb-2 text-blue-400" /> {/* red-400 -> blue-400 */}
                <p className="text-sm text-gray-600 dark:text-gray-400">Rank</p>
                <p className="font-bold text-lg">{account.valorantLastRankTitle}</p>
              </div>
            </div>
            <Tabs defaultValue="weapons" className="w-full mb-12">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 dark:bg-black/20">
                <TabsTrigger value="weapons">Armas ({account.valorantInventory?.WeaponSkins?.length || 0})</TabsTrigger>
                <TabsTrigger value="buddies">Chaveiros ({account.valorantInventory?.Buddy?.length || 0})</TabsTrigger>
                <TabsTrigger value="agents">Agentes ({account.valorantInventory?.Agent?.length || 0})</TabsTrigger>
              </TabsList>
              <TabsContent value="weapons">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {account.valorantInventory?.WeaponSkins?.map((skin: string, index: number) => (
                    <div
                      key={skin}
                      className="bg-white/10 dark:bg-black/20 p-3 rounded-xl text-center backdrop-blur-sm"
                    >
                      <Image
                        src={`https://media.valorant-api.com/weaponskins/${skin}/displayicon.png`}
                        alt={`Skin ${index + 1}`}
                        width={80}
                        height={80}
                        className="mx-auto mb-2 rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      <p className="text-xs truncate font-medium">Skin {index + 1}</p>
                    </div>
                  ))}
                </div>
                {(!account.valorantInventory?.WeaponSkins || account.valorantInventory.WeaponSkins.length === 0) && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">Nenhuma skin de arma encontrada</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="buddies">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {account.valorantInventory?.Buddy?.map((buddy: string, index: number) => (
                    <div
                      key={buddy}
                      className="bg-white/10 dark:bg-black/20 p-3 rounded-xl text-center backdrop-blur-sm"
                    >
                      <Image
                        src={`https://media.valorant-api.com/buddies/${buddy}/displayicon.png`}
                        alt={`Chaveiro ${index + 1}`}
                        width={80}
                        height={80}
                        className="mx-auto mb-2 rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      <p className="text-xs truncate font-medium">Chaveiro {index + 1}</p>
                    </div>
                  ))}
                </div>
                {(!account.valorantInventory?.Buddy || account.valorantInventory.Buddy.length === 0) && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">Nenhum chaveiro encontrado</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="agents">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {account.valorantInventory?.Agent?.map((agent: string, index: number) => (
                    <div
                      key={agent}
                      className="bg-white/10 dark:bg-black/20 p-3 rounded-xl text-center backdrop-blur-sm"
                    >
                      <Image
                        src={`https://media.valorant-api.com/agents/${agent}/displayicon.png`}
                        alt={`Agente ${index + 1}`}
                        width={80}
                        height={80}
                        className="mx-auto mb-2 rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      <p className="text-xs truncate font-medium">Agente {index + 1}</p>
                    </div>
                  ))}
                </div>
                {(!account.valorantInventory?.Agent || account.valorantInventory.Agent.length === 0) && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">Nenhum agente encontrado</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )

      case "supercell":
        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {/* Clash of Clans Info */}
              {account.supercell_town_hall_level || 0 > 0 && (
                <>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Castle className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Centro da Vila</p>
                    <p className="font-bold text-lg">{account.supercell_town_hall_level}</p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Users className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Base do Construtor</p>
                    <p className="font-bold text-lg">{account.supercell_builder_hall_level}</p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Star className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Troféus</p>
                    <p className="font-bold text-lg">{account.supercell_builder_hall_cup_count}</p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Crown className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nível Mágico</p>
                    <p className="font-bold text-lg">{account.supercell_magic_level}</p>
                  </div>
                </>
              )}

              {/* Clash Royale Info */}
              {account.supercell_scroll_level || 0 > 0 && (
                <>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Crown className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nível do Rei</p>
                    <p className="font-bold text-lg">
                      {account.supercell_king_level || account.supercell_scroll_level}
                    </p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Star className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Troféus</p>
                    <p className="font-bold text-lg">{account.supercell_scroll_trophies}</p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Shield className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vitórias</p>
                    <p className="font-bold text-lg">{account.supercell_scroll_victories}</p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Target className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Arena</p>
                    <p className="font-bold text-lg">{account.supercell_arena || "N/A"}</p>
                  </div>
                </>
              )}

              {/* Brawl Stars Info */}
              {account.supercell_brawler_count||0 > 0 && (
                <>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Users className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Brawlers</p>
                    <p className="font-bold text-lg">{account.supercell_brawler_count}</p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Crown className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lendários</p>
                    <p className="font-bold text-lg">{account.supercell_legendary_brawler_count}</p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Star className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Troféus</p>
                    <p className="font-bold text-lg">{account.supercell_laser_trophies}</p>
                  </div>
                  <div className="flex flex-col items-center bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                    <Shield className="w-6 h-6 mb-2 text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vitórias</p>
                    <p className="font-bold text-lg">{account.supercell_laser_victories}</p>
                  </div>
                </>
              )}
            </div>

            {/* Account Links */}
            {account.accountLinks && account.accountLinks.length > 0 && (
              <div className="mt-6 bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Links da Conta</h3>
                <div className="space-y-2">
                  {account.accountLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/10 dark:bg-black/20 p-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <Gamepad2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{link.text}</span>
                      </div>
                      <a
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                      >
                        Ver Perfil →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description HTML */}
            {account.descriptionHtml && (
              <div className="mt-6 bg-white/10 dark:bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Detalhes da Conta</h3>
                <div dangerouslySetInnerHTML={{ __html: account.descriptionHtml }} className="max-w-full h-auto" />
              </div>
            )}

            {/* Brawlers List (if available) */}
            {account.supercellBrawlers && account.supercellBrawlers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Brawlers Disponíveis</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {account.supercellBrawlers.map((brawler, index) => (
                    <div
                      key={index}
                      className="bg-white/10 dark:bg-black/20 p-3 rounded-xl text-center backdrop-blur-sm"
                    >
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs truncate font-medium">{brawler}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )

      default:
        return (
          <div className="text-center py-8">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">Informações específicas do jogo não disponíveis</p>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Card className="game-card">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-100/60 dark:bg-red-900/20 backdrop-blur-sm border-red-200 dark:border-red-800 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-center">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="text-lg mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="p-6">
        <Card className="game-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg text-gray-600 dark:text-gray-300">Produto não encontrado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const priceInReais = convertToReais(account.price, account.price_currency)

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Detalhes do Produto</h1>
      </div>

      {/* Product Header */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${getGameColor()} text-white rounded-2xl`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">{getGameIcon()}</div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{account.title}</h2>
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">R$ {priceInReais.toFixed(2)}</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <WishlistButton
                gameId={account.item_id.toString()}
                gameTitle={account.title}
                gamePrice={priceInReais}
                gameImageUrl="/placeholder.svg"
                gameCategory={getGameType()}
                size="lg"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/20"
              />
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8"
                onClick={handlePurchase}
                disabled={!user || (user && user.balance < priceInReais)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Comprar Agora
              </Button>
            </div>
          </div>
          {user && (
            <div className="mt-4 text-white/80">
              <p className="text-sm">Saldo disponível: R$ {user.balance.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <Card className="game-card">
        <CardContent className="p-6">{renderGameSpecificInfo()}</CardContent>
      </Card>

      {/* Loading Dialog */}
      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">Processando Compra</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Por favor, aguarde enquanto processamos sua compra.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-center text-sm text-blue-600 dark:text-blue-400">Verificando Conta!</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Success Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-green-600 dark:text-green-400">Compra Realizada com Sucesso!</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Detalhes da sua compra e informações de login.
            </DialogDescription>
          </DialogHeader>
          {loginData && (
            <div className="mt-4 space-y-4">
              {/* Account Login Data */}
              {loginData.loginData && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold mb-3 text-gray-800 dark:text-white">Dados de Login da Conta:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Login: {loginData.loginData.login}</span>
                      <Button
                        onClick={() => copyToClipboard(loginData.loginData.login)}
                        size="sm"
                        variant="outline"
                        className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Senha: {loginData.loginData.password}</span>
                      <Button
                        onClick={() => copyToClipboard(loginData.loginData.password)}
                        size="sm"
                        variant="outline"
                        className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Login Data */}
              {loginData.emailLoginData && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold mb-3 text-gray-800 dark:text-white">Dados de Login do Email:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">Email: {loginData.emailLoginData.login}</span>
                      <Button
                        onClick={() => copyToClipboard(loginData.emailLoginData.login)}
                        size="sm"
                        variant="outline"
                        className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Senha do Email: {loginData.emailLoginData.password}
                      </span>
                      <Button
                        onClick={() => copyToClipboard(loginData.emailLoginData.password)}
                        size="sm"
                        variant="outline"
                        className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Details */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700">
                <h3 className="font-bold mb-3 text-green-800 dark:text-green-400">Detalhes da Compra:</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">ID do Item: {loginData.item_id}</p>
                  <p className="text-gray-600 dark:text-gray-300">Título: {loginData.title}</p>
                  <p className="text-gray-600 dark:text-gray-300">Preço: R$ {priceInReais.toFixed(2)}</p>
                  <p className="text-gray-600 dark:text-gray-300">Data da Compra: {new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Email Link */}
              {loginData.emailLoginUrl && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Link para acessar o email:{" "}
                  <a
                    href={loginData.emailLoginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline font-medium"
                  >
                    {loginData.emailLoginUrl}
                  </a>
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
