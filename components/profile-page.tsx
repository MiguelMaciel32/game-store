"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, Camera, Save, Crown, Star, Trophy, Gamepad2, Wallet, Edit } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const { user, updateBalance } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "")

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md mx-auto game-card">
          <CardContent className="text-center p-8">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">Você precisa estar logado para acessar seu perfil.</p>
            <Button className="btn-blue">Fazer Login</Button>
          </CardContent>
        </Card>
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
    if (level >= 50) return <Crown className="h-4 w-4" />
    if (level >= 30) return <Star className="h-4 w-4" />
    if (level >= 15) return <Trophy className="h-4 w-4" />
    return <Gamepad2 className="h-4 w-4" />
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.")
      return
    }

    setIsUploading(true)

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage.from("user-uploads").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        console.error("Erro no upload:", error)
        alert("Erro ao fazer upload da imagem. Tente novamente.")
        return
      }

      // Obter URL pública da imagem
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-uploads").getPublicUrl(filePath)

      // Atualizar avatar no banco de dados
      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Erro ao atualizar avatar:", updateError)
        alert("Erro ao salvar avatar. Tente novamente.")
        return
      }

      setAvatarUrl(publicUrl)
      console.log("✅ Avatar atualizado com sucesso!")
    } catch (error) {
      console.error("Erro no upload:", error)
      alert("Erro inesperado. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      alert("Nome é obrigatório.")
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Erro ao salvar perfil:", error)
        alert("Erro ao salvar perfil. Tente novamente.")
        return
      }

      setIsEditing(false)
      console.log("✅ Perfil atualizado com sucesso!")
      // Aqui você poderia atualizar o contexto do usuário se necessário
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      alert("Erro inesperado. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setName(user.name)
    setPhone(user.phone || "")
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header do Perfil */}
      <Card className="game-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-white/20">
                <AvatarImage src={avatarUrl || "https://api.dicebear.com/9.x/fun-emoji/avif?seed=u1wjq3jgdqs9"} alt={user.name} />
                <AvatarFallback
                  className={`text-2xl font-bold bg-gradient-to-br ${getLevelColor(user.level)} text-white`}
                >
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>

            {/* Informações do Usuário */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h1>
                  <p className="text-gray-600 mb-3">{user.email}</p>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  className={isEditing ? "btn-outline-blue bg-transparent" : "btn-blue"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancelar" : "Editar Perfil"}
                </Button>
              </div>

              {/* Badges e Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                <Badge className={`px-3 py-1 bg-gradient-to-r ${getLevelColor(user.level)} text-white border-none`}>
                  <div className="flex items-center space-x-1">
                    {getLevelIcon(user.level)}
                    <span>Nível {user.level}</span>
                  </div>
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                  <Wallet className="h-3 w-3 mr-1" />
                  R$ {user.balance.toFixed(2)}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                  {user.experience} XP
                </Badge>
              </div>

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Jogador Ativo</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">0 Conquistas</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card className="game-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/50 border-white/20"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value={user.email} disabled className="bg-gray-100 border-gray-200 text-gray-500" />
                  <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white/50 border-white/20"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="btn-blue flex-1">
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="btn-outline-blue bg-transparent">
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">E-mail:</span>
                  <span className="font-medium text-gray-800">{user.email}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Telefone:</span>
                  <span className="font-medium text-gray-800">{user.phone || "Não informado"}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Membro desde:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas do Jogador */}
        <Card className="game-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gamepad2 className="h-5 w-5" />
              <span>Estatísticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user.level}</div>
                <div className="text-sm text-gray-600">Nível</div>
              </div>
              <div className="text-center p-4 bg-white/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{user.experience}</div>
                <div className="text-sm text-gray-600">XP Total</div>
              </div>
              <div className="text-center p-4 bg-white/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">R$ {user.balance.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Saldo</div>
              </div>
              <div className="text-center p-4 bg-white/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">Jogos</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Progresso do Nível</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nível {user.level}</span>
                  <span>
                    {user.experience} / {(user.level + 1) * 1000} XP
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (user.experience / ((user.level + 1) * 1000)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
