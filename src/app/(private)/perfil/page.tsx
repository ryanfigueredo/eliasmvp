'use client'

import { useState, useEffect, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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

        if (user.image) {
          console.log('[PERFIL] imagem recebida:', user.image)
          setFotoUrl(user.image)
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>

      <div className="flex items-center gap-6 mb-6">
        <Avatar className="w-20 h-20">
          <AvatarImage
            src={signedAvatarUrl || ''}
            alt="Avatar"
            className="rounded-full object-cover"
          />
          <AvatarFallback>{nome?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <Input
          name="foto"
          type="file"
          accept="image/*"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Input
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Nova senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
