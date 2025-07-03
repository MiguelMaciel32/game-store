"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Trash2, ShoppingCart, Search, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import WishlistButton from "./wishlist-button"

interface WishlistItem {
  id: string
  title: string
  price: number
  imageUrl?: string
  category?: string
  addedAt: string
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "price" | "date">("date")

  useEffect(() => {
    loadWishlist()

    // Listen for storage changes to update wishlist in real-time
    const handleStorageChange = () => {
      loadWishlist()
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom wishlist update events
    window.addEventListener("wishlistUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("wishlistUpdated", handleStorageChange)
    }
  }, [])

  const loadWishlist = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      console.log("Loading wishlist:", wishlist)
      setWishlistItems(wishlist)
    } catch (error) {
      console.error("Erro ao carregar wishlist:", error)
      setWishlistItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = (gameId: string) => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
      const updatedWishlist = wishlist.filter((item: any) => item.id !== gameId)
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
      setWishlistItems(updatedWishlist)
      toast.success("Removido da lista de desejos")

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("wishlistUpdated"))
    } catch (error) {
      console.error("Erro ao remover da wishlist:", error)
      toast.error("Erro ao remover da lista de desejos")
    }
  }

  const filteredItems = wishlistItems
    .filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "price":
          return a.price - b.price
        case "date":
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      }
    })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando lista de desejos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Minha Lista de Desejos</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {wishlistItems.length} {wishlistItems.length === 1 ? "jogo salvo" : "jogos salvos"}
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="game-card">
          <CardContent className="text-center p-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Lista Vazia</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Você ainda não adicionou nenhum jogo à sua lista de desejos.
            </p>
            <Button className="btn-blue" onClick={() => (window.location.href = "/")}>
              Explorar Jogos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros e Controles */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar jogos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "price" | "date")}
                className="px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 rounded-lg text-gray-700 dark:text-gray-300"
              >
                <option value="date">Mais Recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="price">Menor Preço</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "btn-blue" : "btn-outline-blue bg-transparent"}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "btn-blue" : "btn-outline-blue bg-transparent"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de Jogos */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="game-card overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
                >
                  <CardContent className="p-0">
                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistButton
                        gameId={item.id}
                        gameTitle={item.title}
                        gamePrice={item.price}
                        gameImageUrl={item.imageUrl}
                        gameCategory={item.category}
                        size="sm"
                        className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/20"
                      />
                    </div>

                    <div className="relative aspect-[16/9]">
                      <img
                        src={item.imageUrl || "/placeholder.svg?height=200&width=300"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex space-x-2">
                          <Button size="sm" className="btn-blue">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Comprar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          R$ {item.price.toFixed(2)}
                        </Badge>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" className="btn-blue flex-1">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Comprar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="btn-outline-blue bg-transparent"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="game-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl || "/placeholder.svg?height=80&width=120"}
                        alt={item.title}
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">{item.title}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            R$ {item.price.toFixed(2)}
                          </Badge>
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Adicionado em {new Date(item.addedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="btn-blue">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Comprar
                        </Button>
                        <WishlistButton
                          gameId={item.id}
                          gameTitle={item.title}
                          gamePrice={item.price}
                          gameImageUrl={item.imageUrl}
                          gameCategory={item.category}
                          size="sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
