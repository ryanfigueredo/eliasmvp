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
import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSession } from 'next-auth/react'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['consultor', 'admin']),
  status: z.enum(['aprovado', 'aguardando', 'inativo']),
})

type FormData = z.infer<typeof schema>

export default function NovoUsuarioModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
      password: '',
      role: 'consultor',
      status: 'aprovado',
    },
  })

  const onSubmit = async (data: FormData) => {
    const session = await getSession()

    const payload = {
      ...data,
      adminId:
        session?.user?.role === 'admin' && data.role === 'consultor'
          ? session.user.id
          : null,
    }

    startTransition(async () => {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Usuário criado com sucesso!')
        setOpen(false)
        reset()
        window.location.reload()
      } else {
        toast.error('Erro ao criar usuário.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#9C66FF] text-white hover:bg-[#8450e6]">
          + Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl px-6 py-6">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-4">
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Nome</label>
              <Input placeholder="Nome completo" {...register('name')} />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">CPF</label>
              <Input
                placeholder="CPF"
                {...register('cpf')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  let formatted = raw
                  if (raw.length <= 11) {
                    formatted = raw
                      .replace(/^(\d{3})(\d)/, '$1.$2')
                      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                      .replace(/\.(\d{3})\.(\d{3})(\d)/, '.$1.$2-$3')
                  }
                  e.target.value = formatted
                  return e
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                E-mail
              </label>
              <Input placeholder="E-mail" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Senha</label>
              <Input
                placeholder="Senha"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Cargo</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm bg-white"
                {...register('role')}
              >
                <option value="consultor">Consultor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                Status
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm bg-white"
                {...register('status')}
              >
                <option value="aprovado">Aprovado</option>
                <option value="aguardando">Aguardando</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
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
              className="bg-[#9C66FF] hover:bg-[#8450e6] text-white transition"
              disabled={isPending}
            >
              {isPending ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
