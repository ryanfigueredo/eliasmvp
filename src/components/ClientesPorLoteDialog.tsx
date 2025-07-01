'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'

interface ClientesPorLoteDialogProps {
  loteId: string
  role: string
  userId: string
}

export default function ClientesPorLoteDialog({
  loteId,
  role,
  userId,
}: ClientesPorLoteDialogProps) {
  const [clientes, setClientes] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchClientes = async () => {
      const res = await fetch(`/api/clientes-por-lote?loteId=${loteId}`, {
        headers: {
          'x-user-role': role,
          'x-user-id': userId,
        },
      })
      const data = await res.json()
      console.log('[CLIENTES FETCHED]', data)
      setClientes(data)
    }

    fetchClientes()
  }, [open, loteId, role, userId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          Ver clientes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-white overflow-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Clientes do lote</DialogTitle>
        </DialogHeader>

        <table className="w-full text-sm border bg-white rounded-xl shadow mt-4">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">CPF/CNPJ</th>
              <th className="p-3 text-left">Responsável</th>
              <th className="p-3 text-left">Usuário</th>
              <th className="p-3 text-left">Valor</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="border-t">
                <td className="p-3">{cliente.nome}</td>
                <td className="p-3">{cliente.cpfCnpj}</td>
                <td className="p-3">{cliente.user?.admin?.name ?? '—'}</td>
                <td className="p-3">{cliente.user?.name ?? '—'}</td>
                <td className="p-3">
                  R${' '}
                  {cliente.valor.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  )
}
