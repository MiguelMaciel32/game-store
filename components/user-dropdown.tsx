"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Settings,
  LogOut,
  Wallet,
  Crown,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  Star,
  Trophy,
  Gift,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
} from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { useAuth } from "@/hooks/use-auth"

interface UserDropdownProps {
  onOpenPayment: () => void
}

export default function UserDropdown({ onOpenPayment }: UserDropdownProps) {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
      </div>
    )
  }

  const getLevelColor = (level: number) => {
    if (level >= 50) return "from-purple-500 to-pink-500"
    if (level >= 30) return "from-blue-500 to-purple-500"
    if (level >= 15) return "from-green-500 to-blue-500"
    return "from-gray-500 to-gray-600"
  }

  const getLevelIcon = (level: number) => {
    if (level >= 50) return <Crown className="h-3 w-3" />
    if (level >= 30) return <Star className="h-3 w-3" />
    if (level >= 15) return <Trophy className="h-3 w-3" />
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-auto px-2 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || "https://api.dicebear.com/9.x/fun-emoji/avif?seed=u1wjq3jgdqs9"} alt={user.name} />
              <AvatarFallback className={`text-white font-bold text-sm bg-gradient-to-br ${getLevelColor(user.level)}`}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">R$ {user.balance.toFixed(2)}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50"
        align="end"
      >
        {/* User Info Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className={`text-white font-bold bg-gradient-to-br ${getLevelColor(user.level)}`}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`text-xs px-2 py-1 bg-gradient-to-r ${getLevelColor(user.level)} text-white border-none`}
                >
                  <div className="flex items-center space-x-1">
                    {getLevelIcon(user.level)}
                    <span>Nível {user.level}</span>
                  </div>
                </Badge>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user.experience} XP</div>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="mt-3 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/20 dark:to-blue-500/20 rounded-lg border border-green-200 dark:border-green-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Saldo Disponível</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">R$ {user.balance.toFixed(2)}</div>
              </div>
              <Button
                size="sm"
                onClick={onOpenPayment}
                className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 rounded-full"
              >
                <Wallet className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-2">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Ações Rápidas
          </DropdownMenuLabel>

          <DropdownMenuItem onClick={onOpenPayment} className="cursor-pointer">
            <CreditCard className="mr-3 h-4 w-4 text-green-500" />
            <span>Recarregar Saldo</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Gift className="mr-3 h-4 w-4 text-purple-500" />
            <span>Resgatar Código</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Trophy className="mr-3 h-4 w-4 text-yellow-500" />
            <span>Minhas Conquistas</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Settings */}
        <div className="p-2">
          
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-3 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Bell className="mr-3 h-4 w-4" />
            <span>Notificações</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Shield className="mr-3 h-4 w-4" />
            <span>Privacidade</span>
          </DropdownMenuItem>

          {/* Theme Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <div className="flex items-center">
                {theme === "light" && <Sun className="mr-3 h-4 w-4" />}
                {theme === "dark" && <Moon className="mr-3 h-4 w-4" />}
                {theme === "system" && <Monitor className="mr-3 h-4 w-4" />}
                <span>Tema</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50">
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Claro</span>
                {theme === "light" && <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Escuro</span>
                {theme === "dark" && <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                <Monitor className="mr-2 h-4 w-4" />
                <span>Sistema</span>
                {theme === "system" && <div className="ml-auto h-2 w-2 bg-blue-500 rounded-full" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

        </div>

        <DropdownMenuSeparator />

        {/* Help & Support */}
        <div className="p-2">
          <DropdownMenuItem className="cursor-pointer">
            <HelpCircle className="mr-3 h-4 w-4" />
            <span>Ajuda e Suporte</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        {/* Logout */}
        <div className="p-2">
          <DropdownMenuItem
            onClick={signOut}
            className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Sair da Conta</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
