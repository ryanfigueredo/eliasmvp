'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useTransition, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const THEMES = ['light', 'dark'] as const
const COLORS = ['roxo', 'azul', 'verde', 'vermelho'] as const

type Props = {
  user: {
    id?: string
    name?: string | null
    email?: string | null
  }
}

export default function ConfigUsuarioModal({ user }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [nome, setNome] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [senha, setSenha] = useState('')
  const [foto, setFoto] = useState<File | null>(null)

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [color, setColor] = useState<string>('roxo')

  // Aplicar tema e cor primária ao abrir
  useEffect(() => {
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

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
  }

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    localStorage.setItem('color', newColor)
    document.documentElement.setAttribute('data-theme-color', newColor)
  }

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
        await getSession()
        toast.success('Informações atualizadas!')
        setOpen(false)
        window.location.reload()
      } else {
        toast.error('Erro ao atualizar dados.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-sm px-0 justify-start flex items-center gap-1 text-zinc-700 hover:text-[#9C66FF]"
        >
          <Settings className="w-4 h-4" />
          Configurações
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Atualizar informações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Nova senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">Tema</label>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? 'default' : 'outline'}
                  onClick={() => handleThemeChange(t)}
                >
                  {t === 'light' ? 'Claro' : 'Escuro'}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Cor principal</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <Button
                  key={c}
                  variant={color === c ? 'default' : 'outline'}
                  onClick={() => handleColorChange(c)}
                  className={`capitalize ${
                    c === 'roxo'
                      ? 'bg-[#9C66FF]'
                      : c === 'azul'
                        ? 'bg-blue-500'
                        : c === 'verde'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                  } text-white`}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
