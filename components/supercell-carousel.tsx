// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import Image from "next/image"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Castle, Users, Star, AlertCircle, Loader2, RefreshCw, Crown, Phone } from "lucide-react"
// import WishlistButton from "./wishlist-button"

// interface SupercellAccount {
//   item_id: string
//   title: string
//   price: number
//   price_currency: string
//   supercell_town_hall_level: number
//   supercell_builder_hall_level: number
//   supercell_builder_hall_cup_count: number
//   supercell_magic_level: number
//   supercell_magic_trophies: number
//   supercell_king_level: number | null
//   supercell_total_heroes_level: number
//   supercell_total_troops_level: number
//   supercell_total_spells_level: number
//   supercell_total_builder_heroes_level: number
//   supercell_total_builder_troops_level: number
//   supercell_phone: number
//   description: string
// }

// const FALLBACK_IMAGE = "https://marcasmais.com.br/wp-content/uploads/2024/07/Supercell_logo_.png"

// const convertToReais = (price: number, currency: string): string => {
//   const exchangeRate = currency.toLowerCase() === "rub" ? 0.066 : 1
//   const convertedValue = price * exchangeRate * 2.3
//   return convertedValue.toFixed(2)
// }

// const translateToPortuguese = (text: string) => {
//   const translations: { [key: string]: string } = {
//     "Аккаунт Supercell": "Conta Supercell",
//     Уровень: "Nível",
//   }
//   return translations[text] || text
// }

// const SupercellAccountCard = ({ account }: { account: SupercellAccount }) => {
//   const priceInReais = convertToReais(account.price, account.price_currency)
//   const translatedTitle = translateToPortuguese(account.title)

//   return (
//     <Card className="w-full game-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/20 rounded-xl relative">
//       <CardContent className="p-0">
//         {/* Wishlist Button */}
//         <div className="absolute top-3 right-3 z-10">
//           <WishlistButton
//             gameId={account.item_id}
//             gameTitle={translatedTitle}
//             gamePrice={Number.parseFloat(priceInReais)}
//             gameImageUrl={FALLBACK_IMAGE}
//             gameCategory="Supercell"
//             className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/20"
//           />
//         </div>

//         <div className="relative aspect-[16/9]">
//           <Image
//             src={FALLBACK_IMAGE || "/placeholder.svg"}
//             alt="Supercell Game"
//             fill
//             className="object-cover bg-gradient-to-br from-orange-500 to-red-600 rounded-t-xl"
//           />
//         </div>

//         <div className="p-4 space-y-3">
//           <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate mb-2">{translatedTitle}</h3>

//           <div className="flex justify-between items-center">
//             <Badge variant="secondary" className="text-base px-3 py-1 bg-green-500 text-white">
//               R$ {priceInReais}
//             </Badge>
//             <Link href={`/produto/${account.item_id}`}>
//               <Button size="sm" className="btn-blue rounded-full">
//                 Ver Detalhes
//               </Button>
//             </Link>
//           </div>

//           <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
//             <div className="flex items-center justify-between">
//               <span className="flex items-center">
//                 <Castle className="w-4 h-4 mr-2 text-orange-500" />
//                 Centro da Vila:
//               </span>
//               <span className="font-medium">{account.supercell_town_hall_level}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="flex items-center">
//                 <Users className="w-4 h-4 mr-2 text-orange-500" />
//                 Base do Construtor:
//               </span>
//               <span className="font-medium">{account.supercell_builder_hall_level}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="flex items-center">
//                 <Star className="w-4 h-4 mr-2 text-orange-500" />
//                 Troféus:
//               </span>
//               <span className="font-medium">{account.supercell_builder_hall_cup_count}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="flex items-center">
//                 <Crown className="w-4 h-4 mr-2 text-orange-500" />
//                 Nível do Rei:
//               </span>
//               <span className="font-medium">{account.supercell_king_level || "N/A"}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="flex items-center">
//                 <Phone className="w-4 h-4 mr-2 text-orange-500" />
//                 Telefone:
//               </span>
//               <span className="font-medium">{account.supercell_phone ? "Vinculado" : "Não Vinculado"}</span>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export default function SupercellCarousel() {
//   const [accounts, setAccounts] = useState<SupercellAccount[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchAccounts = async (): Promise<void> => {
//     setIsLoading(true)
//     setError(null)
//     try {
//       const response = await fetch("/api/supercell-accounts")
//       if (!response.ok) {
//         throw new Error("Failed to fetch accounts")
//       }
//       const data = await response.json()
//       setAccounts(data.items.slice(0, 10)) // Limitar a 10 contas para o carrossel
//     } catch (err) {
//       setError("Erro ao buscar contas do Supercell. Por favor, tente novamente mais tarde.")
//       console.error(err)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchAccounts()
//   }, [])

//   if (isLoading) {
//     return (
//       <div className="mb-10">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Contas Supercell em Destaque</h2>
//         </div>
//         <div className="flex items-center justify-center py-20">
//           <div className="text-gray-600 dark:text-gray-300 text-lg flex items-center">
//             <Loader2 className="mr-2 h-6 w-6 animate-spin" />
//             Carregando contas...
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="mb-10">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Contas Supercell em Destaque</h2>
//         </div>
//         <Card className="bg-red-100/60 dark:bg-red-900/20 backdrop-blur-sm border-red-200 dark:border-red-800 rounded-xl">
//           <CardContent className="pt-6">
//             <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-center">
//               <AlertCircle className="w-12 h-12 mb-4" />
//               <p className="text-lg mb-4">{error}</p>
//               <Button onClick={fetchAccounts} className="btn-blue font-medium py-2 px-4 rounded-full flex items-center">
//                 <RefreshCw className="mr-2 h-4 w-4" />
//                 Tentar Novamente
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (accounts.length === 0) {
//     return (
//       <div className="mb-10">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Contas Supercell em Destaque</h2>
//         </div>
//         <div className="text-center py-20">
//           <p className="text-xl mb-4 text-gray-600 dark:text-gray-300">Nenhuma conta encontrada.</p>
//           <Button
//             onClick={fetchAccounts}
//             className="btn-blue font-medium py-2 px-4 rounded-full flex items-center mx-auto"
//           >
//             <RefreshCw className="mr-2 h-4 w-4" />
//             Atualizar Lista
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="mb-10">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-xl font-bold text-gray-800 dark:text-white">Contas Supercell em Destaque</h2>
//         <Link href="/supercell">
//           <Button
//             variant="ghost"
//             className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
//           >
//             Ver Todas
//           </Button>
//         </Link>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {accounts.map((account) => (
//           <SupercellAccountCard key={account.item_id} account={account} />
//         ))}
//       </div>
//     </div>
//   )
// }
