"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Loader2, Star, Users, Package, Shield, AlertCircle, TrendingUp, RefreshCw } from "lucide-react"
import WishlistButton from "./wishlist-button"

const FALLBACK_IMAGE_URL =
  "https://midias.correiobraziliense.com.br/_midias/jpg/2024/03/08/1000x1000/1_fortnite_battle_pass_1709857445360-35335611.jpg?20240308084351?20240308084351"

interface FortniteAccount {
  item_id: number
  title: string
  price: number
  price_currency: string
  fortnite_platform: string
  fortnite_register_date: number
  fortnite_last_activity: number
  fortnite_level: number
  fortnite_lifetime_wins: number
  fortnite_skin_count: number
  fortnite_balance: number
  fortniteSkins: Array<{ id: string; title: string; rarity: string; type: string; from_shop: number }>
}

const convertToReais = (price: number, currency: string): string => {
  const exchangeRate = currency.toLowerCase() === "rub" ? 0.066 : 1
  const convertedValue = price * exchangeRate * 2.5
  return convertedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const FortniteAccountCard = ({ account }: { account: FortniteAccount }) => {
  const priceInReais = convertToReais(account.price, account.price_currency)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const isHighLevel = account.fortnite_level > 200
  const hasManySkins = account.fortnite_skin_count > 100

  return (
    <Card className="w-full game-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/20 rounded-xl relative">
      <CardContent className="p-0">
       
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            gameId={String(account.item_id)}
            gameTitle={account.title}
            gamePrice={Number.parseFloat(priceInReais.replace(".", "").replace(",", "."))}
            gameImageUrl={FALLBACK_IMAGE_URL} // Using fallback as there's no dynamic image in interface
            gameCategory="Fortnite"
            className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/20"
            size="sm"
          />
        </div>
        {/* Image Carousel */}
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {account.fortniteSkins && account.fortniteSkins.length > 0 ? (
                account.fortniteSkins.slice(0, 5).map((skin, index) => (
                  <CarouselItem key={skin.id}>
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={
                          imageError
                            ? FALLBACK_IMAGE_URL
                            : `https://fortnite-api.com/images/cosmetics/br/${skin.id}/icon.png`
                        }
                        alt={`${skin.title} skin`}
                        fill
                        className="object-contain bg-gradient-to-br from-black to-gray-900 rounded-t-xl"
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
                      alt="Fortnite fallback image"
                      fill
                      className="object-cover rounded-t-xl"
                    />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {account.fortniteSkins && account.fortniteSkins.length > 1 && (
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
            {account.title}
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
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Level: {account.fortnite_level}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Wins: {account.fortnite_lifetime_wins}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Skins: {account.fortnite_skin_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">V-Bucks: {account.fortnite_balance}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FortniteCarousel() {
  const [accounts, setAccounts] = useState<FortniteAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/fortnite-accounts")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (!data || !Array.isArray(data.items)) {
        throw new Error("Estrutura de dados inválida da API")
      }
      setAccounts(data.items.slice(0, 12)) // Limit to 12 accounts for the carousel
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar contas do Fortnite"
      setError(errorMessage)
      console.error("Erro na requisição:", err)
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Fortnite em Destaque</h2>
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Fortnite em Destaque</h2>
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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Fortnite em Destaque</h2>
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
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Contas Fortnite em Destaque</h2>
        <Link href="/fortnite-marketplace">
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
              <FortniteAccountCard account={account} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 hover:bg-white border-white/20 h-8 w-8 sm:h-10 sm:w-10" />
        <CarouselNext className="right-2 bg-white/80 hover:bg-white border-white/20 h-8 w-8 sm:h-10 sm:w-10" />
      </Carousel>
    </div>
  )
}
