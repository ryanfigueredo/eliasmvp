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
import { Lote } from '@prisma/client'
import { useCpfCnpjMask } from '@/hooks/useCpfCnpjMask'
import { formatCurrency } from '@/hooks/useCurrencyMask'

type Cliente = {
  id: string
  nome: string
  cpfCnpj: string
}

export default function NovoDocumentoModal({ userId }: { userId: string }) {
  const formatCpfCnpj = useCpfCnpjMask()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [nome, setNome] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [valor, setValor] = useState('')
  const [rg, setRg] = useState<File | null>(null)
  const [consulta, setConsulta] = useState<File | null>(null)
  const [contrato, setContrato] = useState<File | null>(null)
  const [loteId, setLoteId] = useState('')
  const [lotes, setLotes] = useState<Lote[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    fetch('/api/lotes')
      .then((res) => res.json())
      .then((data) => setLotes(data))
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const busca = cpfCnpj || nome
      if (busca.length < 3) {
        setClientes([])
        return
      }

      const res = await fetch(`/api/clientes?busca=${busca}`)
      const data = await res.json()
      setClientes(data)
      setShowSuggestions(true)
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [cpfCnpj, nome])

  const handleClienteSelect = (cliente: Cliente) => {
    setNome(cliente.nome)
    setCpfCnpj(formatCpfCnpj(cliente.cpfCnpj))
    setShowSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !cpfCnpj || !valor || !loteId) {
      return toast.error('Preencha todos os campos obrigatórios.')
    }

    const formData = new FormData()
    formData.append('nome', nome)
    formData.append('cpfCnpj', cpfCnpj.replace(/\D/g, ''))
    formData.append('valor', valor.replace(/[^\d,.-]/g, '').replace(',', '.'))
    formData.append('responsavelId', userId)
    formData.append('loteId', loteId)
    if (rg) formData.append('rg', rg)
    if (consulta) formData.append('consulta', consulta)
    if (contrato) formData.append('contrato', contrato)

    startTransition(async () => {
      try {
        const res = await fetch('/api/clientes', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          toast.success('Cliente/documento criado com sucesso!')
          setOpen(false)
          window.location.reload()
        } else {
          const data = await res.json()
          toast.error(data.message ?? 'Erro ao enviar documento.')
        }
      } catch (error) {
        console.error(error)
        toast.error('Erro inesperado.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#9C66FF] hover:bg-[#8450e6] text-white">
          + Novo Documento
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white border rounded-xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Novo Documento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="relative">
            <Input
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value)
                setShowSuggestions(true)
              }}
              required
            />
            {showSuggestions && clientes.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded mt-1 shadow max-h-40 overflow-auto">
                {clientes.map((cliente) => (
                  <li
                    key={cliente.id}
                    className="px-3 py-2 hover:bg-zinc-100 cursor-pointer text-sm"
                    onClick={() => handleClienteSelect(cliente)}
                  >
                    {cliente.nome} – {cliente.cpfCnpj}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Input
            placeholder="CPF ou CNPJ"
            value={cpfCnpj}
            onChange={(e) => {
              setCpfCnpj(formatCpfCnpj(e.target.value))
              setShowSuggestions(true)
            }}
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
            <label className="text-sm font-medium">Lote</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
              required
            >
              <option value="">Selecione um lote</option>
              {lotes.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.nome} ({new Date(lote.inicio).toLocaleDateString()} até{' '}
                  {new Date(lote.fim).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Documento: RG</label>
            <Input
              type="file"
              onChange={(e) => setRg(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Documento: Consulta</label>
            <Input
              type="file"
              onChange={(e) => setConsulta(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Documento: Contrato</label>
            <Input
              type="file"
              onChange={(e) => setContrato(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Adicional</label>
            <Input
              type="file"
              onChange={(e) => setContrato(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enviando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
