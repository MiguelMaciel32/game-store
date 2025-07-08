"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Users, Package, Shield, AlertCircle, Loader2, RefreshCw, Star, TrendingUp } from "lucide-react"
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

  const getRankColor = (rank: string) => {
    const rankLower = rank.toLowerCase()
    if (rankLower.includes("radiant")) return "from-yellow-400 to-orange-500"
    if (rankLower.includes("immortal")) return "from-purple-400 to-pink-500"
    if (rankLower.includes("diamond")) return "from-blue-400 to-cyan-500"
    if (rankLower.includes("platinum")) return "from-teal-400 to-green-500"
    return "from-gray-400 to-gray-500"
  }

  const isHighValue = Number.parseFloat(priceInReais) > 200
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
            className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/20"
            size="sm"
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
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white truncate mb-2">
            {translatedTitle}
          </h3>

          <div className="flex justify-between items-center mb-3">
            <Badge variant="secondary" className="text-sm sm:text-base px-2 sm:px-3 py-1 bg-green-500 text-white">
              R$ {priceInReais}
            </Badge>
            <Link href={`/produto/${account.item_id}`}>
              <Button size="sm" className="btn-blue rounded-full text-xs sm:text-sm px-3 sm:px-4">
                Ver Detalhes
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{account.riot_valorant_region}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span>Nível {account.riot_valorant_level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span>{account.riot_valorant_skin_count} Skins</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{translateToPortuguese(account.valorantLastRankTitle)}</span>
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

export default function ValorantCarousel() {
  const [accounts, setAccounts] = useState<ValorantAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/valorant-accounts?page=1`)
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const data = await response.json()
      setAccounts(data.items.slice(0, 12)) // Aumentar para 12 contas
    } catch (err) {
      setError("Erro ao buscar contas do Valorant. Por favor, tente novamente mais tarde.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  if (isLoading) {
    return (
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Valorant em Destaque</h2>
        </div>
        <div className="flex items-center justify-center py-16 sm:py-20">
          <div className="text-gray-600 dark:text-gray-300 text-base sm:text-lg flex items-center">
            <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            Carregando contas...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Valorant em Destaque</h2>
        </div>
        <Card className="bg-red-100/60 dark:bg-red-900/20 backdrop-blur-sm border-red-200 dark:border-red-800 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mb-4" />
              <p className="text-base sm:text-lg mb-4">{error}</p>
              <Button
                onClick={fetchAccounts}
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

  if (accounts.length === 0) {
    return (
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Valorant em Destaque</h2>
        </div>
        <div className="text-center py-16 sm:py-20">
          <p className="text-lg sm:text-xl mb-4 text-gray-600 dark:text-gray-300">Nenhuma conta encontrada.</p>
          <Button
            onClick={fetchAccounts}
            className="btn-blue font-medium py-2 px-4 rounded-full flex items-center mx-auto text-sm sm:text-base"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar Lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Valorant em Destaque</h2>
        <Link href="/valorant">
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm sm:text-base"
          >
            Ver Todas
          </Button>
        </Link>
      </div>

      {/* Single Carousel - Fixed the duplication issue */}
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {accounts.map((account) => (
            <CarouselItem
              key={account.item_id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
            >
              <ValorantAccountCard account={account} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 hover:bg-white border-white/20 h-8 w-8 sm:h-10 sm:w-10" />
        <CarouselNext className="right-2 bg-white/80 hover:bg-white border-white/20 h-8 w-8 sm:h-10 sm:w-10" />
      </Carousel>
    </div>
  )
}
