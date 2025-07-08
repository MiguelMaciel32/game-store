"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Globe,
  Users,
  Package,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  SortAsc,
  Target,
  Zap,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  Settings,
  DollarSign,
  TrendingDown,
  Crown,
  Gamepad2,
} from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import WishlistButton from "./wishlist-button"

const FALLBACK_IMAGE_URL =
  "https://assets.xboxservices.com/assets/4e/bc/4ebcb533-e184-42f3-833b-9aa47a81f39e.jpg?n=153142244433_Poster-Image-1084_1920x720.jpg"

interface ValorantAccount {
  item_id: string
  title: string
  price: number
  price_currency: string
  riot_valorant_region: string
  riot_valorant_level: string
  riot_valorant_skin_count: number
  valorantLastRankTitle: string
  riot_valorant_inventory_value: number
  valorantInventory: {
    WeaponSkins: string[]
  }
}

const convertToReais = (price: number, currency: string): string => {
  if (currency === "BRL") return price.toFixed(2)
  const exchangeRate = currency.toLowerCase() === "rub" ? 0.066 : 1
  const convertedValue = price * exchangeRate * 2.5
  return convertedValue.toFixed(2)
}

const translateToPortuguese = (text: string) => {
  const translations: { [key: string]: string } = {
    "Аккаунт Valorant": "Conta Valorant",
    Скины: "Skins",
    Уровень: "Nível",
  }
  return translations[text] || text
}

const ValorantAccountCard = ({ account }: { account: ValorantAccount }) => {
  const priceInReais = convertToReais(account.price, account.price_currency)
  const translatedTitle = translateToPortuguese(account.title)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const getMainImage = () => {
    if (Array.isArray(account.valorantInventory.WeaponSkins) && account.valorantInventory.WeaponSkins.length > 0) {
      return `https://media.valorant-api.com/weaponskins/${account.valorantInventory.WeaponSkins[0]}/displayicon.png`
    }
    return FALLBACK_IMAGE_URL
  }

  const getRankColor = (rank: string) => {
    const rankLower = rank.toLowerCase()
    if (rankLower.includes("radiant")) return "from-yellow-400 to-orange-500"
    if (rankLower.includes("immortal")) return "from-purple-400 to-pink-500"
    if (rankLower.includes("diamond")) return "from-blue-400 to-cyan-500"
    if (rankLower.includes("platinum")) return "from-teal-400 to-green-500"
    return "from-gray-400 to-gray-500"
  }

  const isHighValue = Number.parseFloat(priceInReais) > 500
  const hasManySkins = account.riot_valorant_skin_count > 50

  return (
    <Card className="w-full game-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/20 rounded-xl relative">
      <CardContent className="p-0">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
          {isHighValue && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 shadow-lg">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {hasManySkins && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 shadow-lg">
              <TrendingUp className="h-3 w-3 mr-1" />
              Muitas Skins
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            gameId={account.item_id}
            gameTitle={translatedTitle}
            gamePrice={Number.parseFloat(priceInReais)}
            gameImageUrl={getMainImage()}
            gameCategory="Valorant"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/20"
          />
        </div>

        {/* Image Carousel */}
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {Array.isArray(account.valorantInventory.WeaponSkins) &&
              account.valorantInventory.WeaponSkins.length > 0 ? (
                account.valorantInventory.WeaponSkins.slice(0, 5).map((skinId, index) => (
                  <CarouselItem key={skinId}>
                    <div className="relative aspect-[16/9]">
                      <img
                        src={
                          imageError
                            ? FALLBACK_IMAGE_URL
                            : `https://media.valorant-api.com/weaponskins/${skinId}/displayicon.png`
                        }
                        alt={`Valorant skin ${index + 1}`}
                        className="w-full h-full object-contain bg-gradient-to-br from-black to-gray-900 rounded-t-xl"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-xl" />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="relative aspect-[16/9]">
                    <img
                      src={FALLBACK_IMAGE_URL || "/placeholder.svg"}
                      alt="Valorant fallback image"
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {Array.isArray(account.valorantInventory.WeaponSkins) &&
              account.valorantInventory.WeaponSkins.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 bg-white/80 hover:bg-white h-6 w-6 sm:h-8 sm:w-8" />
                  <CarouselNext className="right-2 bg-white/80 hover:bg-white h-6 w-6 sm:h-8 sm:w-8" />
                </>
              )}
          </Carousel>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-3">
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 dark:text-white line-clamp-2 mb-2">
            {translatedTitle}
          </h3>

          <div className="flex justify-between items-center mb-3">
            <Badge
              variant="secondary"
              className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 py-1 bg-green-500 text-white"
            >
              R$ {priceInReais}
            </Badge>
            <Link href={`/produto/${account.item_id}`}>
              <Button size="sm" className="btn-blue rounded-full text-xs px-2 sm:px-3 lg:px-4">
                Ver Detalhes
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Globe className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="truncate text-xs">{account.riot_valorant_region}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs">Nível {account.riot_valorant_level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="text-xs">{account.riot_valorant_skin_count} Skins</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="truncate text-xs">{translateToPortuguese(account.valorantLastRankTitle)}</span>
            </div>
          </div>

          {/* Rank Badge */}
          {account.valorantLastRankTitle && (
            <div className="mt-2">
              <Badge
                className={`bg-gradient-to-r ${getRankColor(
                  account.valorantLastRankTitle,
                )} text-white text-xs px-2 py-1 shadow-sm`}
              >
                {translateToPortuguese(account.valorantLastRankTitle)}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Pagination Component - Melhorar lógica para mostrar mais páginas
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading: boolean
}) => {
  const getVisiblePages = () => {
    const delta = 2 // Aumentar para mostrar mais páginas
    const range = []
    const rangeWithDots = []

    // Se temos poucas páginas, mostrar todas
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i)
      }
      return range
    }

    // Lógica para muitas páginas
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 py-4 sm:py-6 flex-wrap">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 px-2 sm:px-3 mb-2 sm:mb-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">Anterior</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1 flex-wrap justify-center">
        {getVisiblePages().map((page, index) => (
          <div key={index} className="mb-2 sm:mb-0">
            {page === "..." ? (
              <span className="px-2 py-2 text-gray-500 text-sm">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm ${
                  currentPage === page
                    ? "btn-blue shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                }`}
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 px-2 sm:px-3 mb-2 sm:mb-0"
      >
        <span className="hidden sm:inline mr-1">Próxima</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function ValorantPageContent() {
  const [accounts, setAccounts] = useState<ValorantAccount[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<ValorantAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("price")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Advanced filters
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(2000)
  const [minInventoryValue, setMinInventoryValue] = useState(1000)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const fetchAccounts = async (page = 1): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      console.log(`Fetching fresh accounts for page ${page}...`)

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        minInventoryValue: minInventoryValue.toString(),
        _t: Date.now().toString(), // Cache buster
      })

      const response = await fetch(`/api/valorant-accounts?${params.toString()}`, {
        cache: "no-store", // Não usar cache
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", errorText)
        throw new Error(`Failed to fetch accounts: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("Fresh API Response:", data)

      console.log("Pagination data:", {
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
      })

      setAccounts(data.items || [])
      setFilteredAccounts(data.items || [])
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.totalItems || 0)
      setCurrentPage(page)
    } catch (err) {
      console.error("Fetch error:", err)
      setError(`Erro ao buscar contas do Valorant: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts(currentPage)
  }, [currentPage, minPrice, maxPrice, minInventoryValue])

  useEffect(() => {
    const filtered = accounts.filter((account) => {
      const matchesSearch = account.title.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return (
            Number.parseFloat(convertToReais(a.price, a.price_currency)) -
            Number.parseFloat(convertToReais(b.price, b.price_currency))
          )
        case "price_desc":
          return (
            Number.parseFloat(convertToReais(b.price, b.price_currency)) -
            Number.parseFloat(convertToReais(a.price, a.price_currency))
          )
        case "level":
          return Number.parseInt(b.riot_valorant_level) - Number.parseInt(a.riot_valorant_level)
        case "skins":
          return b.riot_valorant_skin_count - a.riot_valorant_skin_count
        default:
          return 0
      }
    })

    setFilteredAccounts(filtered)
  }, [accounts, searchTerm, sortBy])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSortBy("price")
    setMinPrice(0)
    setMaxPrice(2000)
    setMinInventoryValue(1000)
    setCurrentPage(1)
  }

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg flex items-center">
            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-spin" />
            Carregando contas do Valorant...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6">
        <Card className="bg-red-100/60 dark:bg-red-900/20 backdrop-blur-sm border-red-200 dark:border-red-800 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-center space-y-4">
              <div className="flex items-center space-x-2">
                <WifiOff className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2">Erro de Conexão</h3>
                <p className="text-sm sm:text-base mb-4 max-w-md">{error}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <p>Possíveis causas:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Token da API não configurado</li>
                    <li>Problema de conectividade</li>
                    <li>API externa indisponível</li>
                  </ul>
                </div>
              </div>
              <Button
                onClick={() => fetchAccounts(1)}
                className="btn-blue font-medium py-2 px-4 rounded-full flex items-center text-sm sm:text-base"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-24">
      {/* Header Section - Cores do site (azul) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 opacity-20">
            <Gamepad2 className="h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10">
            <Crown className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
          </div>
        </div>
        <div className="relative p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 backdrop-blur-sm">
                <Target className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2">Contas Valorant</h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  Encontre a conta perfeita para dominar o jogo
                </p>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <Badge className="bg-white/20 text-white text-sm sm:text-base lg:text-lg px-3 sm:px-4 py-1 sm:py-2 mb-2 backdrop-blur-sm">
                {totalItems.toLocaleString()} contas
              </Badge>
              <div className="flex items-center text-blue-100 space-x-2">
                <div className="flex items-center">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="text-xs sm:text-sm">Entrega instantânea</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section - Apenas Avançados */}
      <Card className="game-card">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Filtros de Busca
            </h3>
            <Button
              onClick={resetFilters}
              variant="outline"
              className="rounded-xl border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white/50 dark:bg-gray-700/50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Buscar Contas
              </label>
              <Input
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 bg-white/50 dark:bg-gray-700/50"
              />
            </div>

            {/* Sort */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <SortAsc className="h-4 w-4 mr-2" />
                Ordenar Por
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 bg-white/50 dark:bg-gray-700/50">
                  <SelectValue placeholder="Escolha a ordenação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2" />💰 Menor preço
                    </div>
                  </SelectItem>
                  <SelectItem value="price_desc">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />💎 Maior preço
                    </div>
                  </SelectItem>
                  <SelectItem value="level">🎯 Maior nível</SelectItem>
                  <SelectItem value="skins">🎨 Mais skins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Ações Rápidas
              </label>
              <Button onClick={() => fetchAccounts(1)} className="w-full btn-blue rounded-xl">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Lista
              </Button>
            </div>
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Price Range */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Faixa de Preço (R$)
              </label>
              <div className="px-3">
                <Slider
                  value={[minPrice, maxPrice]}
                  onValueChange={([min, max]) => {
                    setMinPrice(min)
                    setMaxPrice(max)
                  }}
                  max={2000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">R$ {minPrice}</span>
                  <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">R$ {maxPrice}</span>
                </div>
              </div>
            </div>

            {/* Inventory Value */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Valor Mínimo do Inventário (R$)
              </label>
              <div className="px-3">
                <Slider
                  value={[minInventoryValue]}
                  onValueChange={([value]) => setMinInventoryValue(value)}
                  max={20000}
                  min={0}
                  step={500}
                  className="w-full"
                />
                <div className="text-center mt-2">
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    R$ {minInventoryValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Filtros Rápidos
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinPrice(0)
                    setMaxPrice(300)
                    setMinInventoryValue(0)
                  }}
                  className="text-sm rounded-xl"
                >
                  💸 Econômicas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinPrice(300)
                    setMaxPrice(800)
                    setMinInventoryValue(5000)
                  }}
                  className="text-sm rounded-xl"
                >
                  ⚖️ Intermediárias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinPrice(800)
                    setMaxPrice(2000)
                    setMinInventoryValue(10000)
                  }}
                  className="text-sm rounded-xl"
                >
                  💎 Premium
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinPrice(0)
                    setMaxPrice(2000)
                    setMinInventoryValue(1000)
                  }}
                  className="text-sm rounded-xl"
                >
                  🌟 Todas
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay for Page Changes */}
      {isLoading && currentPage > 1 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">Carregando página {currentPage}...</span>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <div className="flex items-center justify-center mb-4">
            <Wifi className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-base sm:text-lg lg:text-xl mb-4 text-gray-600 dark:text-gray-300">
            Nenhuma conta encontrada com os filtros aplicados.
          </p>
          <Button
            onClick={resetFilters}
            className="btn-blue font-medium py-2 px-4 rounded-full flex items-center mx-auto text-sm sm:text-base"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {filteredAccounts.map((account) => (
              <ValorantAccountCard key={account.item_id} account={account} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  )
}
