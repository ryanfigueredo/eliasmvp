'use client'

import { useState, useEffect, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Camera, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

const THEMES = ['light', 'dark'] as const
const COLORS = ['roxo', 'azul', 'verde', 'vermelho'] as const

export default function PerfilPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [signedAvatarUrl, setSignedAvatarUrl] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [signedLogoUrl, setSignedLogoUrl] = useState<string | null>(null)

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [color, setColor] = useState<string>('roxo')

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/user/me')
        const user = await res.json()

        console.log('[PERFIL] /api/user/me →', user)

        setNome(user.name || '')
        setEmail(user.email || '')
        setUserRole(user.role || '')
        setUserId(user.id || '')

        if (user.image) {
          console.log('[PERFIL] imagem recebida:', user.image)
          setFotoUrl(user.image)
        }

        // Se for master, carrega logo
        if (user.role === 'master' && user.id) {
          try {
            const logoRes = await fetch(`/api/config/logo?userId=${user.id}`)
            const logoData = await logoRes.json()
            if (logoData.url) {
              setSignedLogoUrl(logoData.url)
            }
          } catch (error) {
            console.error('[PERFIL] erro ao carregar logo:', error)
          }
        }
      } catch (error) {
        console.error('[PERFIL] erro ao carregar usuário:', error)
      }
    }

    loadUser()

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    const savedColor = localStorage.getItem('color') || 'roxo'

    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(savedTheme)
    }
    if (savedColor) {
      setColor(savedColor)
      document.documentElement.setAttribute('data-theme-color', savedColor)
    }
  }, [])

  useEffect(() => {
    async function fetchAvatar() {
      console.log('[PERFIL] buscando signedUrl com key:', fotoUrl)

      if (fotoUrl && fotoUrl.startsWith('avatars/')) {
        try {
          const res = await fetch(`/api/document/get-url?key=${fotoUrl}`)
          const data = await res.json()
          console.log('[PERFIL] signedAvatarUrl recebido:', data.url)
          setSignedAvatarUrl(data.url)
        } catch (error) {
          console.error('Erro ao buscar URL do avatar:', error)
        }
      }
    }

    fetchAvatar()
  }, [fotoUrl])

  const handleSubmit = () => {
    const formData = new FormData()
    formData.append('nome', nome)
    formData.append('email', email)
    if (senha) formData.append('senha', senha)
    if (foto) formData.append('foto', foto)

    startTransition(async () => {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const json = await res.json()
        if (json.image) {
          setFotoUrl(json.image)
        }

        toast.success('Informações atualizadas!')
        router.refresh()
      } else {
        toast.error('Erro ao atualizar dados.')
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Perfil</h1>
        <p className="text-zinc-600 mt-1">Gerencie suas informações pessoais e credenciais</p>
      </div>

      {/* Foto do Perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage
                  src={signedAvatarUrl || ''}
                  alt="Avatar"
                  className="rounded-full object-cover"
                />
                <AvatarFallback className="bg-[#9C66FF] text-white text-2xl font-bold">
                  {nome?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-[#9C66FF] text-white rounded-full p-2 cursor-pointer hover:bg-[#8450e6] transition-colors shadow-md">
                <Camera className="w-4 h-4" />
                <input
                  name="foto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-900">{nome || 'Usuário'}</h3>
              <p className="text-sm text-zinc-600">{email}</p>
              <p className="text-xs text-zinc-500 mt-1">Clique no ícone da câmera para alterar sua foto</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#9C66FF]" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize seu nome e e-mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Nome completo</label>
            <Input
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Personalização da Logo (apenas Master) */}
      {userRole === 'master' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#9C66FF]" />
              Personalizar Logo da Plataforma
            </CardTitle>
            <CardDescription>
              Atualize o logo que aparece no sidebar e nas páginas públicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                {signedLogoUrl ? (
                  <Image
                    src={signedLogoUrl}
                    alt="Logo atual"
                    width={120}
                    height={120}
                    className="rounded-lg shadow-lg object-contain border-2 border-zinc-200"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">
                    Nova logo
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="h-11"
                  />
                  <p className="text-xs text-zinc-500">
                    Formatos aceitos: JPG, PNG, GIF. Tamanho recomendado: 300x300px
                  </p>
                </div>
                {logoFile && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!logoFile || !userId) return

                      const formData = new FormData()
                      formData.append('file', logoFile)
                      formData.append('userId', userId)

                      try {
                        const res = await fetch('/api/config/logo', {
                          method: 'POST',
                          body: formData,
                        })

                        const data = await res.json()
                        if (data.config?.logo) {
                          const logoUrlRes = await fetch(
                            `/api/config/logo?userId=${userId}`,
                          )
                          const { url } = await logoUrlRes.json()
                          setSignedLogoUrl(url)
                          setLogoFile(null)
                          toast.success('Logo atualizada com sucesso!')
                          // Recarrega a página para atualizar o logo no sidebar
                          setTimeout(() => window.location.reload(), 1000)
                        } else {
                          toast.error('Erro ao atualizar logo')
                        }
                      } catch (error) {
                        console.error('[PERFIL] erro ao atualizar logo:', error)
                        toast.error('Erro ao atualizar logo')
                      }
                    }}
                    disabled={isPending}
                    className="w-full"
                  >
                    {isPending ? 'Salvando...' : 'Salvar Logo'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#9C66FF]" />
            Segurança
          </CardTitle>
          <CardDescription>
            Altere sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Nova senha</label>
            <Input
              type="password"
              placeholder="Deixe em branco para manter a senha atual"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="h-11"
            />
            <p className="text-xs text-zinc-500">
              Use no mínimo 8 caracteres com letras e números
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isPending}
          className="bg-[#9C66FF] hover:bg-[#8450e6] text-white"
        >
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}
