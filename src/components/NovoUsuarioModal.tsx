'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useTransition } from 'react'

export default function NovoUsuarioModal() {
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('consultor')
  const [status, setStatus] = useState('aprovado')
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async () => {
    startTransition(async () => {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cpf, email, password, role, status }),
      })

      if (res.ok) {
        toast.success('Usuário criado com sucesso!')
        setOpen(false)
        setName('')
        setCpf('')
        setEmail('')
        setPassword('')
        setRole('consultor')
        setStatus('aprovado')
        window.location.reload()
      } else {
        toast.error('Erro ao criar usuário.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#9C66FF] hover:bg-[#8450e6]">
          + Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="consultor">consultor</option>
            <option value="admin">admin</option>
            <option value="white-label">white-label</option>
          </select>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="aprovado">aprovado</option>
            <option value="aguardando">aguardando</option>
            <option value="inativo">inativo</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Criando...' : 'Criar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
