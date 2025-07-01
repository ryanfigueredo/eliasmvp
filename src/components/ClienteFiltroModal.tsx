'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import ClienteAutoComplete from './ClienteAutoComplete'
import { useState } from 'react'

export default function ClienteFiltroModal({
  admins,
  consultores,
  userId,
  role,
}: {
  admins: { id: string; name: string }[]
  consultores: { id: string; name: string }[]
  userId: string
  role: string
}) {
  const params = useSearchParams()!

  const [clienteSelecionado, setClienteSelecionado] = useState<{
    id: string
    nome: string
  } | null>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtrar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle>Filtrar clientes</DialogTitle>
        </DialogHeader>

        <form method="GET" className="space-y-4 mt-4">
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Cliente</label>
            <ClienteAutoComplete
              selected={clienteSelecionado}
              onSelect={(c) => setClienteSelecionado(c)}
            />
          </div>

          {/* Admin */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Admin</label>
            <select
              name="adminId"
              className="w-full border rounded px-3 py-2 text-sm bg-white"
              defaultValue={params.get('adminId') || ''}
            >
              <option value="">Todos</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>

          {/* Consultor */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Consultor</label>
            <select
              name="consultorId"
              className="w-full border rounded px-3 py-2 text-sm bg-white"
              defaultValue={params.get('consultorId') || ''}
            >
              <option value="">Todos</option>
              {consultores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <a
              href={`/documentos?userId=${userId}&role=${role}`}
              className="text-sm px-4 py-2 border rounded border-zinc-300 hover:bg-zinc-100 text-zinc-600 flex items-center gap-1"
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
