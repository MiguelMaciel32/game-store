"use client"

import { useState } from "react"
import {
  Search,
  User,
  Play,
  Bell,
  Home,
  Library,
  ShoppingBag,
  Users,
  Heart,
  Crown,
  Menu,
  X,
  Wallet,
  LogIn,
  HelpCircle,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  UserCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import ValorantCarousel from "@/components/valorant-carousel"

import CommunityChat from "@/components/community-chat"
import ProfilePage from "@/components/profile-page"
import WishlistPage from "@/components/wishlist-page"
import { AuthModal } from "@/components/auth-modal"
import RechargeModal from "@/components/recharge-modal"
import WishlistButton from "@/components/wishlist-button"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { ThemeProvider, useTheme } from "@/hooks/use-theme"
import Link from "next/link"

const sidebarItems = [
  { icon: Home, label: "Início", action: "home" },
  { icon: Library, label: "Biblioteca", action: "library" },
  { icon: ShoppingBag, label: "Loja", action: "store" },
  { icon: Users, label: "Comunidade", action: "community" },
  { icon: Heart, label: "Lista de Desejos", action: "wishlist" },
  { icon: UserCircle, label: "Perfil", action: "profile" },
]

const featuredGame = {
  id: "witcher3",
  title: "Compre sua Conta do Valorant",
  description:
    "Compre sua conta do valorant com skins, agentes e muito mais! Temos uma grande variedade de contas com diferentes níveis e inventários.",
  image: "/images/hero-game.jpg",
}

function GameStoreContent() {
  const { user, loading, signOut, updateBalance } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState("home")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login")
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const handleSidebarAction = (action: string) => {
    setSidebarOpen(false)
    switch (action) {
      case "payment":
        setPaymentModalOpen(true)
        break
      case "login":
        setAuthModalTab("login")
        setAuthModalOpen(true)
        break
      case "register":
        setAuthModalTab("register")
        setAuthModalOpen(true)
        break
      case "logout":
        signOut()
        break
      default:
        setActiveSection(action)
    }
  }

  const handleAuthClose = () => {
    setAuthModalOpen(false)
  }

  const getLevelColor = (level: number) => {
    if (level >= 50) return "from-purple-500 to-pink-500"
    if (level >= 30) return "from-blue-500 to-purple-500"
    if (level >= 15) return "from-green-500 to-blue-500"
    return "from-gray-500 to-gray-600"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Main Container */}
      <div className="w-full h-screen glass rounded-none lg:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        {/* Header - Versão mais responsiva */}
        <header className="flex items-center justify-between p-2 sm:p-3 lg:p-4 header-bg">
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-blue-600 dark:text-blue-400">
              <span className="hidden sm:inline">GameVerse</span>
              <span className="sm:hidden">GV</span>
            </div>
          </div>

          <div className="flex-1 max-w-[120px] sm:max-w-xs lg:max-w-md mx-1 sm:mx-2 lg:mx-4 xl:mx-8">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder="Buscar..."
                className="pl-6 sm:pl-8 lg:pl-10 bg-white/50 dark:bg-black/50 border-white/20 rounded-full text-xs sm:text-sm lg:text-base h-7 sm:h-8 lg:h-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1 lg:space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 hidden sm:flex"
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </Button>

            {/* User Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-7 w-auto sm:h-8 lg:h-10 px-1 sm:px-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors"
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8">
                        <AvatarImage
                          src={user.avatar_url || "https://api.dicebear.com/9.x/fun-emoji/avif?seed=u1wjq3jgdqs9"}
                          alt={user.name}
                        />
                        <AvatarFallback
                          className={`text-white font-bold text-xs bg-gradient-to-br ${getLevelColor(user.level)}`}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden xl:flex flex-col items-start">
                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-20">
                          {user.name}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          R$ {user.balance.toFixed(2)}
                        </div>
                      </div>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300 hidden lg:block" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 sm:w-72 lg:w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50"
                  align="end"
                >
                  <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                        <AvatarImage
                          src={user.avatar_url || "https://api.dicebear.com/9.x/fun-emoji/avif?seed=u1wjq3jgdqs9"}
                          alt={user.name}
                        />
                        <AvatarFallback
                          className={`text-white font-bold bg-gradient-to-br ${getLevelColor(user.level)}`}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 truncate text-sm sm:text-base">
                          {user.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</div>
                        <Badge
                          className={`text-xs mt-1 bg-gradient-to-r ${getLevelColor(user.level)} text-white border-none`}
                        >
                          Nível {user.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-2 sm:p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/20 dark:to-blue-500/20 rounded-lg border border-green-200 dark:border-green-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Saldo Disponível</div>
                          <div className="text-sm sm:text-base lg:text-lg font-bold text-green-600 dark:text-green-400">
                            R$ {user.balance.toFixed(2)}
                          </div>
                        </div>
                        <Button size="sm" className="btn-blue text-xs" onClick={() => setPaymentModalOpen(true)}>
                          <Wallet className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Adicionar</span>
                          <span className="sm:hidden">+</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => setActiveSection("profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPaymentModalOpen(true)}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Recarregar Saldo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
                      {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
                      {theme === "system" && <Monitor className="mr-2 h-4 w-4" />}
                      Tema
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 h-4 w-4" />
                        Claro
                        {theme === "light" && <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 h-4 w-4" />
                        Escuro
                        {theme === "dark" && <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor className="mr-2 h-4 w-4" />
                        Sistema
                        {theme === "system" && <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600 dark:text-red-400">
                    <LogIn className="mr-2 h-4 w-4 rotate-180" />
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  className="btn-blue text-xs h-6 sm:h-7 lg:h-8 px-2 sm:px-3"
                  onClick={() => handleSidebarAction("login")}
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-outline-blue bg-transparent text-xs h-6 sm:h-7 lg:h-8 px-2 sm:px-3 hidden sm:flex"
                  onClick={() => handleSidebarAction("register")}
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="flex h-full relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:relative z-50 w-64 sm:w-72 lg:w-64 sidebar-bg h-full transition-transform duration-300 ease-in-out flex flex-col`}
          >
            {/* Sidebar Header */}
            <div className="p-4 sm:p-6 border-b border-white/20">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="text-base sm:text-lg font-semibold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              {/* User Info */}
              {user ? (
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage
                          src={user.avatar_url || "https://api.dicebear.com/9.x/fun-emoji/avif?seed=u1wjq3jgdqs9"}
                          alt={user.name}
                        />
                        <AvatarFallback
                          className={`text-white font-bold bg-gradient-to-br ${getLevelColor(user.level)}`}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base truncate">
                        {user.name}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center space-x-1">
                        <Crown className="h-3 w-3 text-yellow-500" />
                        <span>Nível {user.level}</span>
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        R$ {user.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto mb-2">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="text-sm font-medium mb-1">Visitante</div>
                    <div className="text-xs text-muted-foreground mb-3">Faça login para acessar todos os recursos</div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-7 sm:h-8 btn-blue"
                        onClick={() => handleSidebarAction("login")}
                      >
                        Entrar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7 sm:h-8 btn-outline-blue bg-transparent"
                        onClick={() => handleSidebarAction("register")}
                      >
                        Cadastrar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Navigation */}
              <nav className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navegação</h3>
                {sidebarItems.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={index}
                      className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-left transition-colors text-sm sm:text-base ${
                        activeSection === item.action
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-white/20 dark:hover:bg-black/20"
                      }`}
                      onClick={() => {
                        setActiveSection(item.action)
                        setSidebarOpen(false)
                      }}
                    >
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Quick Actions */}
              {user && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ações</h3>
                  <button
                    className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-left transition-colors hover:bg-white/20 dark:hover:bg-black/20 text-sm sm:text-base"
                    onClick={() => handleSidebarAction("payment")}
                  >
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="font-medium">Adicionar Saldo</span>
                  </button>
                </div>
              )}

              {/* User Settings */}
              {user && (
                <div className="space-y-2">
                  {/* Theme Toggle */}
                  <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Tema</span>
                      <div className="flex items-center space-x-1 bg-white/30 dark:bg-black/30 rounded-lg p-1">
                        <button
                          onClick={() => setTheme("light")}
                          className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                            theme === "light" ? "bg-white shadow-sm" : "hover:bg-white/20"
                          }`}
                        >
                          <Sun className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                            theme === "dark" ? "bg-gray-800 shadow-sm" : "hover:bg-white/20"
                          }`}
                        >
                          <Moon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Minha Conta</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="text-gray-800 dark:text-gray-200 truncate ml-2 max-w-32">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nível:</span>
                        <span className="text-gray-800 dark:text-gray-200">{user.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">XP:</span>
                        <span className="text-gray-800 dark:text-gray-200">{user.experience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Membro desde:</span>
                        <span className="text-gray-800 dark:text-gray-200">
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 sm:p-6 border-t border-white/20">
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 rounded-xl text-left transition-colors hover:bg-white/20 dark:hover:bg-black/20 text-sm sm:text-base">
                  <HelpCircle className="h-4 w-4" />
                  <span className="font-medium">Ajuda</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto h-full">
            {activeSection === "community" ? (
              <CommunityChat />
            ) : activeSection === "profile" ? (
              <ProfilePage />
            ) : activeSection === "wishlist" ? (
              <WishlistPage />
            ) : (
              <>
                {/* Featured Game */}
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 bg-black/20 backdrop-blur-sm">
                  <div className="absolute inset-0">
                    <Image
                      src={featuredGame.image || "/placeholder.svg?height=400&width=800"}
                      alt={featuredGame.title}
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                  </div>
                  <div className="relative p-4 sm:p-6 lg:p-8">
                    <div className="bg-black/20 backdrop-blur-sm inline-block px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm mb-3 sm:mb-4">
                      Em Alta
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 text-white leading-tight">
                      {featuredGame.title}
                    </h1>
                    <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 max-w-xl leading-relaxed">
                      {featuredGame.description}
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <Link href={`/valorant`}>
                        <Button className="btn-blue rounded-full px-4 sm:px-6 w-full sm:w-auto">
                          <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Comprar
                        </Button>
                      </Link>
                      <WishlistButton
                        gameId={featuredGame.id}
                        gameTitle={featuredGame.title}
                        gameImageUrl={featuredGame.image}
                        className="border-white/30 text-white hover:bg-white/20 bg-transparent rounded-full w-full sm:w-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Carousels */}
                <ValorantCarousel />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={handleAuthClose} defaultTab={authModalTab} />
      <RechargeModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onRechargeSuccess={(amount) => {
          console.log(`Pagamento de R$ ${amount} aprovado!`)
          updateBalance(user ? user.balance + amount : amount)
        }}
      />
    </div>
  )
}

export default function GameStore() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="pfvr-ui-theme">
        <GameStoreContent />
      </ThemeProvider>
    </AuthProvider>
  )
}
