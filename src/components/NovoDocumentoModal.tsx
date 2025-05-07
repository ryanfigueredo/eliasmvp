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
import { useEffect, useState, useTransition } from 'react'
import { User } from '@prisma/client'
import { useCpfCnpjMask } from '@/hooks/useCpfCnpjMask'
import { formatCurrency } from '@/hooks/useCurrencyMask'

export default function NovoClienteModal() {
  const formatCpfCnpj = useCpfCnpjMask()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [nome, setNome] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [valor, setValor] = useState('')
  const [responsavelId, setResponsavelId] = useState('')
  const [usuarios, setUsuarios] = useState<User[]>([])

  const [rg, setRg] = useState<File | null>(null)
  const [cnh, setCnh] = useState<File | null>(null)
  const [contrato, setContrato] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/users/consultores')
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !cpfCnpj || !valor || !responsavelId) {
      return toast.error('Preencha todos os campos obrigatórios.')
    }

    const formData = new FormData()
    formData.append('nome', nome)
    formData.append('cpfCnpj', cpfCnpj.replace(/\D/g, ''))
    formData.append('valor', valor)
    formData.append('responsavelId', responsavelId)
    if (rg) formData.append('rg', rg)
    if (cnh) formData.append('cnh', cnh)
    if (contrato) formData.append('contrato', contrato)

    startTransition(async () => {
      try {
        const res = await fetch('/api/clientes', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          toast.success('Cliente criado com sucesso!')
          setOpen(false)
          window.location.reload()
        } else {
          toast.error('Erro ao criar cliente.')
        }
      } catch (error) {
        console.error(error)
        toast.error('Erro inesperado ao enviar os dados.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#9C66FF] hover:bg-[#8450e6] text-white">
          + Novo Cliente
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white border rounded-xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Novo Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            placeholder="CPF ou CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
          />
          <Input
            type="text"
            placeholder="Valor"
            value={valor}
            onChange={(e) => {
              const formatted = formatCurrency(e.target.value)
              setValor(formatted)
            }}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">Responsável</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={responsavelId}
              onChange={(e) => setResponsavelId(e.target.value)}
            >
              <option value="">Selecione</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">RG</label>
            <Input
              type="file"
              onChange={(e) => setRg(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">CNH</label>
            <Input
              type="file"
              onChange={(e) => setCnh(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Contrato</label>
            <Input
              type="file"
              onChange={(e) => setContrato(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
