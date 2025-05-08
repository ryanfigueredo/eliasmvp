'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function UsuarioFiltroModal() {
  const params = useSearchParams() ?? new URLSearchParams()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtrar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl px-6 py-6">
        <DialogHeader>
          <DialogTitle>Filtrar usuários</DialogTitle>
        </DialogHeader>

        <form method="GET" className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">
              Nome ou E-mail
            </label>
            <Input
              name="search"
              placeholder="Buscar por nome ou e-mail"
              defaultValue={params.get('search') || ''}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Cargo</label>
            <select
              name="role"
              defaultValue={params.get('role') || ''}
              className="w-full border rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">Todos os cargos</option>
              <option value="consultor">Consultor</option>
              <option value="admin">Admin</option>
              <option value="white-label">White Label</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Status</label>
            <select
              name="status"
              defaultValue={params.get('status') || ''}
              className="w-full border rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">Todos os status</option>
              <option value="aprovado">Aprovado</option>
              <option value="aguardando">Aguardando</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <a
              href="/dashboard/master/usuarios"
              className="flex items-center gap-1 text-sm px-4 py-2 rounded border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
            >
              <X className="w-4 h-4" /> Limpar
            </a>
            <Button
              type="submit"
              className="bg-[#9C66FF] text-white hover:bg-[#8450e6]"
            >
              Aplicar filtros
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
