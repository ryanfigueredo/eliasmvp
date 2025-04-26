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
import { useState, useTransition } from 'react'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
        await getSession() // 🆕 Atualiza a session do NextAuth automaticamente
        toast.success('Informações atualizadas!')
        setOpen(false)
        router.refresh() // Atualiza a tela pra carregar novos dados visuais
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
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
