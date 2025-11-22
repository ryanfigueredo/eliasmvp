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
import { useTransition, useState, useEffect } from 'react'
import { PencilLine } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  role: z.enum(['consultor', 'admin']),
  status: z.enum(['aprovado', 'aguardando', 'inativo']),
  whatsapp: z.string().optional(),
  ownerId: z.string().optional(),
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
    whatsapp?: string | null
    ownerId?: string | null
  }
  isMaster?: boolean
}

export default function EditarUsuarioModal({ user, isMaster = false }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [masters, setMasters] = useState<
    Array<{ id: string; name: string; email: string }>
  >([])

  useEffect(() => {
    if (isMaster) {
      // Buscar lista de masters
      fetch('/api/users?role=master&status=aprovado')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMasters(data)
          }
        })
        .catch((err) => {
          console.error('Erro ao buscar masters:', err)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaster])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      cpf: user.cpf,
      email: user.email,
      role: user.role as FormData['role'],
      status: user.status as FormData['status'],
      whatsapp: user.whatsapp || '',
      ownerId: user.ownerId || '',
    },
  })

  const selectedStatus = watch('status')
  const showOwnerSelect = isMaster && (!user.ownerId || selectedStatus === 'aprovado')

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

          {showOwnerSelect && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                Vincular ao Master:
              </label>
              <select
                {...register('ownerId')}
                className="w-full border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="">Selecione um master</option>
                {masters.map((master) => (
                  <option key={master.id} value={master.id}>
                    {master.name || master.email} ({master.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">
                Selecione o master responsável por este usuário
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">
              WhatsApp
            </label>
            <Input
              placeholder="(00) 00000-0000"
              {...register('whatsapp')}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '')
                let formatted = raw
                if (raw.length <= 11) {
                  formatted = raw
                    .replace(/^(\d{2})(\d)/, '($1) $2')
                    .replace(/(\d{5})(\d)/, '$1-$2')
                }
                e.target.value = formatted
                return e
              }}
            />
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
              variant="default"
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
