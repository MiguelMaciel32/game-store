"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  CreditCard,
  Package,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  Star,
  UserPlus,
  TrendingUp,
} from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import WishlistButton from "./wishlist-button"

const FALLBACK_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRB3qrPhDtMLMdG79ua2ZSmxkUTO-XtBIpEPg&s"

interface RobloxAccount {
  item_id: number
  title: string
  price: number
  price_currency: string
  roblox_username: string
  roblox_robux: number
  roblox_subscription: string // e.g., "Premium" or null
  roblox_inventory_price: number
  roblox_register_date: number
  roblox_friends: number
  roblox_followers: number
  roblox_game_pass_total_robux: number
  roblox_limited_price: number
  roblox_ugc_limited_price: number
}

const convertToReais = (price: number, currency: string): string => {
  const exchangeRate = currency.toLowerCase() === "rub" ? 0.066 : 1
  const convertedValue = price * exchangeRate * 2.5 // Assuming 1 USD = 2.5 BRL for example
  return convertedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const RobloxAccountCard = ({ account }: { account: RobloxAccount }) => {
  const priceInReais = convertToReais(account.price, account.price_currency)
  const accountAge = Math.floor((Date.now() / 1000 - account.roblox_register_date) / (60 * 60 * 24))
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const isHighValue = account.roblox_robux > 5000 || account.roblox_inventory_price > 1000 // Example logic for high value
  const isPremium = account.roblox_subscription && account.roblox_subscription.toLowerCase() === "premium"

  return (
    <Card className="mb-12 w-full game-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/20 rounded-xl relative">
      <CardContent className="p-0">
      
        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            gameId={String(account.item_id)}
            gameTitle={account.roblox_username}
            gamePrice={Number.parseFloat(priceInReais.replace(".", "").replace(",", "."))} // Convert to number for wishlist
            gameImageUrl={FALLBACK_IMAGE_URL} // Using fallback as there's no dynamic image in interface
            gameCategory="Roblox"
            className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/20"
            size="sm"
          />
        </div>
        {/* Image */}
        <div className="relative aspect-[16/9]">
          <Image
            src={
              imageError
                ? FALLBACK_IMAGE_URL
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRB3qrPhDtMLMdG79ua2ZSmxkUTO-XtBIpEPg&s"
            }
            alt="Roblox avatar"
            fill
            className="object-cover rounded-t-xl"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-xl" />
        </div>
        {/* Content */}
        <div className="p-3 sm:p-4 space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white truncate mb-2">
            {account.roblox_username}
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
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{account.roblox_robux} Robux</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">RAP: {account.roblox_inventory_price}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Amigos: {account.roblox_friends}</span>
            </div>
            <div className="flex items-center space-x-1">
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Seguidores: {account.roblox_followers}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">Idade da Conta: {accountAge} dias</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RobloxCarousel() {
  const [accounts, setAccounts] = useState<RobloxAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/roblox-accounts")
      if (!response.ok) {
        throw new Error("Failed to fetch accounts")
      }
      const data = await response.json()
      setAccounts(data.items.slice(0, 12)) // Limit to 12 accounts for the carousel
    } catch (err) {
      setError("Erro ao buscar contas do Roblox. Por favor, tente novamente mais tarde.")
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Roblox em Destaque</h2>
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Roblox em Destaque</h2>
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Roblox em Destaque</h2>
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
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Roblox em Destaque</h2>
        <Link href="/roblox-marketplace">
          {" "}
          {/* Link to a full marketplace page if it exists */}
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
              <RobloxAccountCard account={account} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 hover:bg-white border-white/20 h-8 w-8 sm:h-10 sm:w-10" />
        <CarouselNext className="right-2 bg-white/80 hover:bg-white border-white/20 h-8 w-8 sm:h-10 sm:w-10" />
      </Carousel>
    </div>
  )
}
