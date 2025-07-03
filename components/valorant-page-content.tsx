"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Globe,
  Users,
  Package,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  SortAsc,
  Target,
  Zap,
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

  return (
    <Card className="w-full game-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/20 rounded-xl relative">
      <CardContent className="p-0">
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
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
                      className="w-full h-full object-contain bg-gradient-to-br from-black to-black rounded-t-xl"
                      onError={handleImageError}
                    />
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
          <CarouselPrevious className="left-2 bg-white/80 hover:bg-white" />
          <CarouselNext className="right-2 bg-white/80 hover:bg-white" />
        </Carousel>

        <div className="p-4 space-y-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate mb-2">{translatedTitle}</h3>

          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="text-base px-3 py-1 bg-green-500 text-white">
              R$ {priceInReais}
            </Badge>
            <Link href={`/produto/${account.item_id}`}>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                Ver Detalhes
              </Button>
            </Link>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-red-500" />
                Região:
              </span>
              <span className="font-medium">{account.riot_valorant_region}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-red-500" />
                Nível:
              </span>
              <span className="font-medium">{account.riot_valorant_level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-red-500" />
                Skins:
              </span>
              <span className="font-medium">{account.riot_valorant_skin_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-red-500" />
                Rank:
              </span>
              <span className="font-medium">{translateToPortuguese(account.valorantLastRankTitle)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ValorantPageContent() {
  const [accounts, setAccounts] = useState<ValorantAccount[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<ValorantAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("price")
  const [filterRegion, setFilterRegion] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const itemsPerPage = 12

  const fetchAccounts = async (page = 1): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/valorant-accounts?page=${page}&limit=12`)
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const data = await response.json()
      setAccounts(data.items || [])
      setFilteredAccounts(data.items || [])
      setTotalPages(data.totalPages || 1)
      setHasNextPage(data.hasNextPage || false)
      setHasPrevPage(data.hasPrevPage || false)
      setCurrentPage(page)
    } catch (err) {
      setError("Erro ao buscar contas do Valorant. Por favor, tente novamente mais tarde.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts(currentPage)
  }, [currentPage])

  useEffect(() => {
    const filtered = accounts.filter((account) => {
      const matchesSearch = account.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRegion = filterRegion === "all" || account.riot_valorant_region === filterRegion
      return matchesSearch && matchesRegion
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return convertToReais(a.price, a.price_currency) > convertToReais(b.price, b.price_currency) ? 1 : -1
        case "level":
          return Number.parseInt(b.riot_valorant_level) - Number.parseInt(a.riot_valorant_level)
        case "skins":
          return b.riot_valorant_skin_count - a.riot_valorant_skin_count
        default:
          return 0
      }
    })

    setFilteredAccounts(filtered)
  }, [accounts, searchTerm, sortBy, filterRegion])

  const regions = [...new Set(accounts.map((account) => account.riot_valorant_region))]

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600 dark:text-gray-300 text-lg flex items-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Carregando contas do Valorant...
          </div>
        </div>
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
              <Button
                onClick={() => fetchAccounts()}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-full flex items-center"
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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white rounded-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white/20 rounded-full p-3 mr-4">
                  <Target className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Contas Valorant</h1>
                  <p className="text-red-100 text-lg">Encontre a conta perfeita para dominar o jogo</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2 mb-2">{filteredAccounts.length} contas</Badge>
              <div className="flex items-center text-red-100">
                <Zap className="h-4 w-4 mr-1" />
                <span className="text-sm">Entrega instantânea</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-500 bg-white dark:bg-gray-700"
              />
            </div>

            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-500 bg-white dark:bg-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as regiões</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-500 bg-white dark:bg-gray-700">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Menor preço</SelectItem>
                <SelectItem value="level">Maior nível</SelectItem>
                <SelectItem value="skins">Mais skins</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearchTerm("")
                setFilterRegion("all")
                setSortBy("price")
              }}
              variant="outline"
              className="rounded-xl border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl mb-4 text-gray-600 dark:text-gray-300">
            Nenhuma conta encontrada com os filtros aplicados.
          </p>
          <Button
            onClick={() => {
              setSearchTerm("")
              setFilterRegion("all")
              setSortBy("price")
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-full flex items-center mx-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAccounts.map((account) => (
              <ValorantAccountCard key={account.item_id} account={account} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-6">
              <Button
                variant="outline"
                onClick={() => fetchAccounts(currentPage - 1)}
                disabled={!hasPrevPage || isLoading}
                className="rounded-xl"
              >
                Anterior
              </Button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Página {currentPage} de {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={() => fetchAccounts(currentPage + 1)}
                disabled={!hasNextPage || isLoading}
                className="rounded-xl"
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
