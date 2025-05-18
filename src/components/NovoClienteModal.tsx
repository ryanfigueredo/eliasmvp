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
import { useCpfCnpjMask } from '@/hooks/useCpfCnpjMask'
import { formatCurrency } from '@/hooks/useCurrencyMask'

export default function NovoClienteModal({ userId }: { userId: string }) {
  const formatCpfCnpj = useCpfCnpjMask()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [nome, setNome] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [valor, setValor] = useState('')
  const [clienteExistente, setClienteExistente] = useState(false)

  const [rg, setRg] = useState<File | null>(null)
  const [cnh, setCnh] = useState<File | null>(null)
  const [contrato, setContrato] = useState<File | null>(null)
  const [docExtra, setDocExtra] = useState<File | null>(null)

  useEffect(() => {
    const buscarCliente = async () => {
      const cleanCpf = cpfCnpj.replace(/\D/g, '')
      if (cleanCpf.length >= 11) {
        const res = await fetch(`/api/clientes?busca=${cleanCpf}`)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setNome(data[0].nome)
          setClienteExistente(true)
        } else {
          setClienteExistente(false)
          setNome('')
        }
      }
    }

    buscarCliente()
  }, [cpfCnpj])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !cpfCnpj || !valor) {
      return toast.error('Preencha todos os campos obrigatórios.')
    }

    const formData = new FormData()
    formData.append('nome', nome)
    formData.append('cpfCnpj', cpfCnpj.replace(/\D/g, ''))
    const rawValor = valor.replace(/\D/g, '')
    const parsedValor = parseFloat(rawValor) / 100
    formData.append('valor', String(parsedValor))
    formData.append('responsavelId', userId)
    if (rg) formData.append('rg', rg)
    if (cnh) formData.append('cnh', cnh)
    if (contrato) formData.append('contrato', contrato)
    if (docExtra) formData.append('documentoExtra', docExtra)

    startTransition(async () => {
      const res = await fetch('/api/clientes/create', {
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
            placeholder="CPF ou CNPJ"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
            required
          />
          <Input
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={clienteExistente}
            required
          />
          <Input
            type="text"
            placeholder="Valor"
            value={valor}
            onChange={(e) => setValor(formatCurrency(e.target.value))}
            required
          />

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

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Documentos Adicionais (opcional)
            </label>
            <Input
              type="file"
              onChange={(e) => setDocExtra(e.target.files?.[0] || null)}
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
