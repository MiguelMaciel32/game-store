"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Globe,
  Users,
  Package,
  Shield,
  CreditCard,
  AlertCircle,
  Loader2,
  Gamepad,
  RefreshCw,
  Star,
  TrendingUp,
} from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import WishlistButton from "./wishlist-button"

const FALLBACK_IMAGE_URL = "/placeholder.svg?height=400&width=800" // Generic fallback

interface SteamAccount {
  item_id: string
  title: string
  price: number
  price_currency: string
  steam_country: string
  steam_level: string
  steam_game_count: number
  steam_cs2_profile_rank: number
  steam_balance: string
  steam_inv_value: number
  steam_full_games: {
    list: {
      [key: string]: {
        appid: number
        title: string
        img: string
      }
    }
  }
}

const convertToReais = (price: number, currency: string): string => {
  const exchangeRate = currency.toLowerCase() === "rub" ? 0.066 : 1
  const convertedValue = price * exchangeRate * 2.5
  return convertedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const translateToPortuguese = (text: string) => {
  const translations: { [key: string]: string } = {
    "Steam Account": "Conta Steam",
    Games: "Jogos",
    Level: "Nível",
  }
  return translations[text] || text
}

const SteamAccountCard = ({ account }: { account: SteamAccount }) => {
  const priceInReais = convertToReais(account.price, account.price_currency)
  const translatedTitle = translateToPortuguese(account.title)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const isHighLevel = Number.parseInt(account.steam_level) > 100
  const hasManyGames = account.steam_game_count > 500

  const gameImages = Object.values(account.steam_full_games.list)
    .slice(0, 5)
    .map((game) => game.img)

  return (
    <Card className="w-full game-card  mb-12 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/20 rounded-xl relative">
      <CardContent className="p-0">
      
        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            gameId={String(account.item_id)}
            gameTitle={translatedTitle}
            gamePrice={Number.parseFloat(priceInReais.replace(".", "").replace(",", "."))}
            gameImageUrl={gameImages[0] || FALLBACK_IMAGE_URL}
            gameCategory="Steam"
            className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/20"
            size="sm"
          />
        </div>
        {/* Image Carousel */}
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {gameImages.length > 0 ? (
                gameImages.map((imgUrl, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={imageError ? FALLBACK_IMAGE_URL : imgUrl}
                        alt={`Steam game ${index + 1}`}
                        fill
                        className="object-cover rounded-t-xl"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-xl" />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={FALLBACK_IMAGE_URL || "/placeholder.svg"}
                      alt="Steam fallback image"
                      fill
                      className="object-cover rounded-t-xl"
                    />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {gameImages.length > 1 && (
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
              <span className="truncate">País: {account.steam_country}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Nível: {account.steam_level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Gamepad className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Jogos: {account.steam_game_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Rank CS:GO: {account.steam_cs2_profile_rank}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Saldo: {account.steam_balance}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Inv. Valor: R$ {convertToReais(account.steam_inv_value, "USD")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SteamCarousel() {
  const [accounts, setAccounts] = useState<SteamAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/steam-accounts")
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const data = await response.json()
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Estrutura de dados inválida da API")
      }
      setAccounts(data.items.slice(0, 12)) // Limit to 12 accounts for the carousel
    } catch (err) {
      console.error("Error fetching accounts:", err)
      setError("Erro ao buscar contas do Steam. Por favor, tente novamente mais tarde.")
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Steam em Destaque</h2>
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Steam em Destaque</h2>
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Steam em Destaque</h2>
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
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Steam em Destaque</h2>
        <Link href="/steam-marketplace">
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm sm:text-base"
          >
            Ver Todas
          </Button>
        </Link>
      </div>
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {accounts.map((account) => (
            <CarouselItem
              key={account.item_id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
            >
              <SteamAccountCard account={account} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 hover:bg-white border-white/20 h-8 w-8 sm:h-10 sm:w-10" />
        <CarouselNext className="right-2 bg-white/80 hover:bg-white border-white/20 h-8 w-8 sm:h-10 sm:w-10" />
      </Carousel>
    </div>
  )
}
