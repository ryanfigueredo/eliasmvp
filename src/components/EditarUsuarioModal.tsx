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
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useTransition, useState } from 'react'
import { PencilLine } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  role: z.enum(['consultor', 'admin', 'white-label']),
  status: z.enum(['aprovado', 'aguardando', 'inativo']),
})

type FormData = z.infer<typeof schema>

type Props = {
  user: {
    id: string
    name: string
    cpf: string
    email: string
    role: string
    status: string
  }
}

export default function EditarUsuarioModal({ user }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      cpf: user.cpf,
      email: user.email,
      role: user.role as FormData['role'],
      status: user.status as FormData['status'],
    },
  })

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const res = await fetch('/api/edit-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...data }),
      })

      if (res.ok) {
        toast.success('Usuário atualizado com sucesso!')
        setOpen(false)
        window.location.reload()
      } else {
        toast.error('Erro ao atualizar usuário.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-600 hover:text-blue-600"
          title="Editar usuário"
        >
          <PencilLine className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl px-6 py-6">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Nome</label>
            <Input {...register('name')} />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">CPF</label>
            <Input {...register('cpf')} />
            {errors.cpf && (
              <p className="text-red-500 text-xs">{errors.cpf.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">E-mail</label>
            <Input type="email" {...register('email')} />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">
              Nova senha (opcional)
            </label>
            <Input type="password" {...register('password')} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Cargo</label>
            <select
              {...register('role')}
              className="w-full border rounded px-3 py-2 text-sm bg-white"
            >
              <option value="consultor">Consultor</option>
              <option value="admin">Admin</option>
              <option value="white-label">White Label</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Status</label>
            <select
              {...register('status')}
              className="w-full border rounded px-3 py-2 text-sm bg-white"
            >
              <option value="aprovado">Aprovado</option>
              <option value="aguardando">Aguardando</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="text-zinc-600 border-zinc-300"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-[#9C66FF] text-white hover:bg-[#8450e6]"
              disabled={isPending}
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
