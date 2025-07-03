"use client"

import { use, useState } from "react"
import {
  Search,
  User,
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
import ProductDetailContent from "@/components/product-detail-content"
import { AuthModal } from "@/components/auth-modal"
import RechargeModal from "@/components/recharge-modal"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { ThemeProvider, useTheme } from "@/hooks/use-theme"

const sidebarItems = [
  { icon: Home, label: "Início", action: "home" },
  { icon: Library, label: "Biblioteca", action: "library" },
  { icon: ShoppingBag, label: "Loja", action: "store" },
  { icon: Users, label: "Comunidade", action: "community" },
  { icon: Heart, label: "Lista de Desejos", action: "wishlist" },
  { icon: UserCircle, label: "Perfil", action: "profile" },
]

function ProductPageLayout({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, loading, signOut, updateBalance } = useAuth()
  const { theme, setTheme } = useTheme()
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
      case "home":
        window.location.href = "/"
        break
      default:
        // Handle other navigation
        break
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Main Container */}
      <div className="w-full h-screen glass rounded-none md:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 header-bg">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">🎮 GameVerse</div>
          </div>

          <div className="flex-1 max-w-md mx-4 md:mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar jogos..."
                className="pl-10 bg-white/50 dark:bg-black/50 border-white/20 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-auto px-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatar_url || "https://api.dicebear.com/9.x/fun-emoji/avif?seed=u1wjq3jgdqs9"}
                          alt={user.name}
                        />
                        <AvatarFallback
                          className={`text-white font-bold text-sm bg-gradient-to-br ${getLevelColor(user.level)}`}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          R$ {user.balance.toFixed(2)}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50"
                  align="end"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
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
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                        <Badge
                          className={`text-xs mt-1 bg-gradient-to-r ${getLevelColor(user.level)} text-white border-none`}
                        >
                          Nível {user.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/20 dark:to-blue-500/20 rounded-lg border border-green-200 dark:border-green-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Saldo Disponível</div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            R$ {user.balance.toFixed(2)}
                          </div>
                        </div>
                        <Button size="sm" className="btn-blue" onClick={() => setPaymentModalOpen(true)}>
                          <Wallet className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuItem onClick={() => (window.location.href = "/")}>
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
              <div className="flex items-center space-x-2">
                <Button size="sm" className="btn-blue" onClick={() => handleSidebarAction("login")}>
                  Entrar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-outline-blue bg-transparent"
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
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 fixed md:relative z-50 w-64 sidebar-bg h-full transition-transform duration-300 ease-in-out flex flex-col`}
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Info */}
              {user ? (
                <div className="bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
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
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-1">
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
                <div className="bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto mb-2">
                      <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="text-sm font-medium mb-1">Visitante</div>
                    <div className="text-xs text-muted-foreground mb-3">Faça login para acessar todos os recursos</div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-8 btn-blue"
                        onClick={() => handleSidebarAction("login")}
                      >
                        Entrar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8 btn-outline-blue bg-transparent"
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Navigation */}
              <nav className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navegação</h3>
                {sidebarItems.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={index}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-white/20 dark:hover:bg-black/20`}
                      onClick={() => handleSidebarAction(item.action)}
                    >
                      <IconComponent className="h-5 w-5" />
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
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-white/20 dark:hover:bg-black/20"
                    onClick={() => handleSidebarAction("payment")}
                  >
                    <Wallet className="h-5 w-5" />
                    <span className="font-medium">Adicionar Saldo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-white/20">
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-left transition-colors hover:bg-white/20 dark:hover:bg-black/20">
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Ajuda</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto h-full">
            <ProductDetailContent productId={resolvedParams.id} />
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

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="pfvr-ui-theme">
        <ProductPageLayout params={params} />
      </ThemeProvider>
    </AuthProvider>
  )
}
