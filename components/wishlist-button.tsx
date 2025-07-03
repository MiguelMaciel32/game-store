"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface WishlistButtonProps {
  gameId: string
  gameTitle: string
  gamePrice?: number
  gameImageUrl?: string
  gameCategory?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function WishlistButton({
  gameId,
  gameTitle,
  gamePrice,
  gameImageUrl,
  gameCategory,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if item is in wishlist on component mount
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const isInList = wishlist.some((item: any) => item.id === gameId)
    setIsInWishlist(isInList)
  }, [gameId])

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)

    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")

      if (isInWishlist) {
        // Remove from wishlist
        const updatedWishlist = wishlist.filter((item: any) => item.id !== gameId)
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
        setIsInWishlist(false)
        toast.success("Removido da lista de desejos")
      } else {
        // Add to wishlist
        const newItem = {
          id: gameId,
          title: gameTitle,
          price: gamePrice,
          imageUrl: gameImageUrl,
          category: gameCategory,
          addedAt: new Date().toISOString(),
        }
        const updatedWishlist = [...wishlist, newItem]
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
        setIsInWishlist(true)
        toast.success("Adicionado à lista de desejos")
      }

      // Dispatch custom event to notify wishlist page
      window.dispatchEvent(new Event("wishlistUpdated"))
    } catch (error) {
      console.error("Wishlist error:", error)
      toast.error("Erro ao atualizar lista de desejos")
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <Button
      onClick={toggleWishlist}
      disabled={isLoading}
      variant={isInWishlist ? "default" : "outline"}
      size="icon"
      className={`${sizeClasses[size]} ${
        isInWishlist
          ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
          : "border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
      } ${className}`}
    >
      <Heart className={`${iconSizes[size]} ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
    </Button>
  )
}
