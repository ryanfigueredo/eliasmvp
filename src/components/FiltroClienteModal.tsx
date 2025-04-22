'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Funnel, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type User = {
  id: string
  name: string
  role: string
}

export default function FiltroClienteModal({
  defaultNomeCpf,
  defaultResponsavel,
}: {
  defaultNomeCpf?: string
  defaultResponsavel?: string
}) {
  const [open, setOpen] = useState(false)
  const [nomeCpf, setNomeCpf] = useState(defaultNomeCpf ?? '')
  const [responsavelId, setResponsavelId] = useState(defaultResponsavel ?? '')
  const [usuarios, setUsuarios] = useState<User[]>([])

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/users/consultores')
      .then((res) => res.json())
      .then(setUsuarios)
  }, [])

  const handleFiltrar = () => {
    const query = new URLSearchParams()
    if (nomeCpf) query.set('busca', nomeCpf)
    if (responsavelId) query.set('responsavel', responsavelId)

    router.push(`/dashboard/master/clientes?${query.toString()}`)
    setOpen(false)
  }

  const handleLimpar = () => {
    setNomeCpf('')
    setResponsavelId('')
    router.push('/dashboard/master/clientes')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 text-sm">
          <Funnel className="w-4 h-4" />
          Filtrar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white border rounded-xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Filtrar Clientes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Nome ou CPF/CNPJ"
            value={nomeCpf}
            onChange={(e) => setNomeCpf(e.target.value)}
          />

          <div>
            <label className="text-sm font-medium text-zinc-700">
              Responsável
            </label>
            <select
              className="w-full mt-1 border rounded px-3 py-2 text-sm"
              value={responsavelId}
              onChange={(e) => setResponsavelId(e.target.value)}
            >
              <option value="">Todos</option>
              {usuarios.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between pt-4 gap-2">
          <Button variant="outline" onClick={handleLimpar}>
            <X className="w-4 h-4 mr-1" />
            Limpar filtros
          </Button>
          <Button onClick={handleFiltrar}>Filtrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
