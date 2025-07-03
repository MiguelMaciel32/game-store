"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Send, Crown, Star, MessageCircle, Smile, Hash, Mic, Video, Settings, UserPlus } from "lucide-react"
import { supabase, type ChatMessage, type User } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export default function CommunityChat() {
  const { user: currentUser } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Carregar mensagens iniciais
  useEffect(() => {
    loadMessages()
    loadOnlineUsers()

    // Subscription para novas mensagens
    const channel = supabase
      .channel("chat_messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const newMessage = payload.new as ChatMessage
        loadMessageWithUser(newMessage.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Auto scroll para última mensagem
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          user:users(name, avatar_url, level)
        `)
        .order("created_at", { ascending: true })
        .limit(100)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessageWithUser = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          *,
          user:users(name, avatar_url, level)
        `)
        .eq("id", messageId)
        .single()

      if (error) throw error
      if (data) {
        setMessages((prev) => [...prev, data])
      }
    } catch (error) {
      console.error("Erro ao carregar mensagem:", error)
    }
  }

  const loadOnlineUsers = async () => {
    try {
      // Buscar usuários ativos recentemente (últimas 24h)
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .gte("last_login", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("last_login", { ascending: false })
        .limit(20)

      if (error) throw error
      setOnlineUsers(data || [])
    } catch (error) {
      console.error("Erro ao carregar usuários online:", error)
      // Fallback para usuários mock se houver erro
      const mockUsers: User[] = [
        {
          id: "1",
          name: "João Silva",
          email: "joao@email.com",
          balance: 150.75,
          level: 25,
          experience: 2500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        },
        {
          id: "2",
          name: "Maria Santos",
          email: "maria@email.com",
          balance: 89.5,
          level: 18,
          experience: 1800,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        },
        {
          id: "3",
          name: "Pedro Costa",
          email: "pedro@email.com",
          balance: 234.2,
          level: 42,
          experience: 4200,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        },
      ]
      setOnlineUsers(mockUsers)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || isSending) return

    setIsSending(true)
    try {
      const { error } = await supabase.from("chat_messages").insert([
        {
          user_id: currentUser.id,
          message: newMessage.trim(),
          message_type: "text",
        },
      ])

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getLevelColor = (level: number) => {
    if (level >= 50) return "text-purple-600"
    if (level >= 30) return "text-blue-600"
    if (level >= 15) return "text-green-600"
    return "text-gray-600"
  }

  const getLevelIcon = (level: number) => {
    if (level >= 50) return <Crown className="h-3 w-3" />
    if (level >= 30) return <Star className="h-3 w-3" />
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

  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto game-card">
          <CardContent className="text-center p-8">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-gray-800 mb-2">Chat da Comunidade</CardTitle>
            <p className="text-gray-600 mb-6">Conecte-se com outros jogadores e compartilhe suas experiências!</p>
            <div className="space-y-3">
              <Button className="w-full btn-blue">Fazer Login</Button>
              <Button variant="outline" className="w-full btn-outline-blue bg-transparent">
                Criar Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex gap-4">
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col game-card rounded-xl overflow-hidden">
        {/* Header do Chat */}
        <div className="bg-white/30 border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-gray-800">chat-geral</h3>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                {onlineUsers.length} online
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Carregando mensagens...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Smile className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-500 text-lg font-medium mb-2">Bem-vindo ao chat!</div>
                <div className="text-gray-400 text-sm">Seja o primeiro a enviar uma mensagem!</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isConsecutive =
                  index > 0 &&
                  messages[index - 1].user_id === message.user_id &&
                  new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() <
                    5 * 60 * 1000

                return (
                  <div key={message.id} className={`flex space-x-3 ${isConsecutive ? "mt-1" : "mt-4"}`}>
                    {!isConsecutive && (
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={message.user?.avatar_url || "https://api.dicebear.com/9.x/fun-emoji/avif?seed=u1wjq3jgdqs9"} />
                        <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(message.user?.name || "?")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {isConsecutive && <div className="w-10 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      {!isConsecutive && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-800 text-sm">{message.user?.name || "Usuário"}</span>
                          {message.user?.level && (
                            <Badge
                              variant="secondary"
                              className={`text-xs px-1.5 py-0.5 ${getLevelColor(message.user.level)}`}
                            >
                              <div className="flex items-center space-x-1">
                                {getLevelIcon(message.user.level)}
                                <span>{message.user.level}</span>
                              </div>
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                        </div>
                      )}
                      <div className="bg-white/60 rounded-lg p-3 text-sm text-gray-800 shadow-sm">
                        {message.message}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input de Mensagem */}
        <div className="p-4 border-t border-white/20 bg-white/20">
          <div className="flex space-x-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Mensagem #chat-geral`}
              className="flex-1 bg-white/60 border-white/30 text-gray-800 placeholder:text-gray-500 rounded-lg"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              maxLength={500}
              disabled={isSending}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="btn-blue px-4 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex justify-between">
            <span>{newMessage.length}/500</span>
            <span>Enter para enviar • Shift+Enter para nova linha</span>
          </div>
        </div>
      </div>

      {/* Sidebar de Usuários Online */}
      <div className="w-64 game-card rounded-xl overflow-hidden">
        <div className="bg-white/30 border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">Membros Online</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-full p-4">
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || "https://api.dicebear.com/9.x/fun-emoji/avif?seed=u1wjq3jgdqs9"} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{user.name}</div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className={`text-xs px-1.5 py-0.5 ${getLevelColor(user.level)}`}>
                      <div className="flex items-center space-x-1">
                        {getLevelIcon(user.level)}
                        <span>{user.level}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
