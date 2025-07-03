"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Castle,
  Users,
  Star,
  AlertCircle,
  Loader2,
  RefreshCw,
  Crown,
  Phone,
  Search,
  Filter,
  SortAsc,
  Gamepad2,
  Zap,
} from "lucide-react"
import WishlistButton from "./wishlist-button"

interface SupercellAccount {
  item_id: string
  title: string
  price: number
  price_currency: string
  supercell_town_hall_level: number
  supercell_builder_hall_level: number
  supercell_builder_hall_cup_count: number
  supercell_magic_level: number
  supercell_magic_trophies: number
  supercell_king_level: number | null
  supercell_total_heroes_level: number
  supercell_total_troops_level: number
  supercell_total_spells_level: number
  supercell_total_builder_heroes_level: number
  supercell_total_builder_troops_level: number
  supercell_phone: number
  description: string
}

const FALLBACK_IMAGE = "https://marcasmais.com.br/wp-content/uploads/2024/07/Supercell_logo_.png"

const convertToReais = (price: number, currency: string): string => {
  const exchangeRate = currency.toLowerCase() === "rub" ? 0.066 : 1
  const convertedValue = price * exchangeRate * 2.3
  return convertedValue.toFixed(2)
}

const translateToPortuguese = (text: string) => {
  const translations: { [key: string]: string } = {
    "Аккаунт Supercell": "Conta Supercell",
    Уровень: "Nível",
  }
  return translations[text] || text
}

const SupercellAccountCard = ({ account }: { account: SupercellAccount }) => {
  const priceInReais = convertToReais(account.price, account.price_currency)
  const translatedTitle = translateToPortuguese(account.title)

  return (
    <Card className="w-full game-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/20 rounded-xl relative">
      <CardContent className="p-0">
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton
            gameId={account.item_id}
            gameTitle={translatedTitle}
            gamePrice={Number.parseFloat(priceInReais)}
            gameImageUrl={FALLBACK_IMAGE}
            gameCategory="Supercell"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/20"
          />
        </div>

        <div className="relative aspect-[16/9]">
          <Image
            src={FALLBACK_IMAGE || "/placeholder.svg"}
            alt="Supercell Game"
            fill
            className="object-cover bg-gradient-to-br from-orange-500 to-red-600 rounded-t-xl"
          />
        </div>

        <div className="p-4 space-y-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate mb-2">{translatedTitle}</h3>

          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="text-base px-3 py-1 bg-green-500 text-white">
              R$ {priceInReais}
            </Badge>
            <Link href={`/produto/${account.item_id}`}>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                Ver Detalhes
              </Button>
            </Link>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Castle className="w-4 h-4 mr-2 text-orange-500" />
                Centro da Vila:
              </span>
              <span className="font-medium">{account.supercell_town_hall_level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-orange-500" />
                Base do Construtor:
              </span>
              <span className="font-medium">{account.supercell_builder_hall_level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-orange-500" />
                Troféus:
              </span>
              <span className="font-medium">{account.supercell_builder_hall_cup_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Crown className="w-4 h-4 mr-2 text-orange-500" />
                Nível do Rei:
              </span>
              <span className="font-medium">{account.supercell_king_level || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-orange-500" />
                Telefone:
              </span>
              <span className="font-medium">{account.supercell_phone ? "Vinculado" : "Não Vinculado"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SupercellPageContent() {
  const [accounts, setAccounts] = useState<SupercellAccount[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<SupercellAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("price")
  const [filterTownHall, setFilterTownHall] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const itemsPerPage = 12

  const fetchAccounts = async (page = 1): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/supercell-accounts?page=${page}&limit=12`)
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
      setError("Erro ao buscar contas do Supercell. Por favor, tente novamente mais tarde.")
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
      const matchesTownHall =
        filterTownHall === "all" || account.supercell_town_hall_level.toString() === filterTownHall
      return matchesSearch && matchesTownHall
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return convertToReais(a.price, a.price_currency) > convertToReais(b.price, b.price_currency) ? 1 : -1
        case "townhall":
          return b.supercell_town_hall_level - a.supercell_town_hall_level
        case "trophies":
          return b.supercell_builder_hall_cup_count - a.supercell_builder_hall_cup_count
        default:
          return 0
      }
    })

    setFilteredAccounts(filtered)
  }, [accounts, searchTerm, sortBy, filterTownHall])

  const townHallLevels = [...new Set(accounts.map((account) => account.supercell_town_hall_level.toString()))].sort(
    (a, b) => Number.parseInt(b) - Number.parseInt(a),
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600 dark:text-gray-300 text-lg flex items-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Carregando contas do Supercell...
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
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-full flex items-center"
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
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white rounded-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white/20 rounded-full p-3 mr-4">
                  <Gamepad2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Contas Supercell</h1>
                  <p className="text-orange-100 text-lg">Clash of Clans, Clash Royale e muito mais</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white text-lg px-4 py-2 mb-2">{filteredAccounts.length} contas</Badge>
              <div className="flex items-center text-orange-100">
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
                className="pl-10 rounded-xl border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500 bg-white dark:bg-gray-700"
              />
            </div>

            <Select value={filterTownHall} onValueChange={setFilterTownHall}>
              <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500 bg-white dark:bg-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Centro da Vila" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {townHallLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    Nível {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500 bg-white dark:bg-gray-700">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Menor preço</SelectItem>
                <SelectItem value="townhall">Maior Centro da Vila</SelectItem>
                <SelectItem value="trophies">Mais troféus</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearchTerm("")
                setFilterTownHall("all")
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
              setFilterTownHall("all")
              setSortBy("price")
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-full flex items-center mx-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAccounts.map((account) => (
              <SupercellAccountCard key={account.item_id} account={account} />
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
