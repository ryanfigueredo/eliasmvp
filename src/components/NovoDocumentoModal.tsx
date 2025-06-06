'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
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
  const [comprovante, setComprovante] = useState<File | null>(null)

  const [loteId, setLoteId] = useState('')
  const [lotes, setLotes] = useState<Lote[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<
    string | null
  >(null)
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
    setClienteSelecionadoId(cliente.id)
    setShowSuggestions(false)
  }

  const isValidCpfCnpj = (input: string) => {
    const raw = input.replace(/\D/g, '')
    if (raw.length === 11) return !/^(\d)\1{10}$/.test(raw)
    if (raw.length === 14) return !/^(\d)\1{13}$/.test(raw)
    return false
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !cpfCnpj || !valor || !loteId) {
      return toast.error('Preencha todos os campos obrigatórios.')
    }

    if (!isValidCpfCnpj(cpfCnpj)) {
      return toast.error('CPF ou CNPJ inválido.')
    }

    if (!rg || !contrato) {
      return toast.error('Envie pelo menos RG e Contrato.')
    }

    toast.success('Documentos sendo enviados...')
    setOpen(false) // ← fecha o modal imediatamente

    startTransition(() => {
      ;(async () => {
        try {
          let finalClienteId = clienteSelecionadoId

          if (!finalClienteId) {
            const clienteRes = await fetch('/api/clientes', {
              method: 'POST',
              body: JSON.stringify({
                nome,
                cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                responsavelId: userId,
                valor: Number(valor.replace(/[^\d,.-]/g, '').replace(',', '.')),
              }),
              headers: { 'Content-Type': 'application/json' },
            })

            if (clienteRes.status === 400) {
              // cliente já existe → buscar o ID
              const buscaRes = await fetch(
                `/api/clientes?busca=${cpfCnpj.replace(/\D/g, '')}`,
              )
              const clientes = await buscaRes.json()
              finalClienteId = clientes?.[0]?.id
            } else {
              const clienteData = await clienteRes.json()
              if (!clienteRes.ok || !clienteData.id) {
                return toast.error(
                  clienteData.message || 'Erro ao criar cliente.',
                )
              }
              finalClienteId = clienteData.id
            }
          }

          const formData = new FormData()
          if (finalClienteId) formData.append('clienteId', finalClienteId)
          formData.append(
            'valor',
            valor.replace(/[^\d,.-]/g, '').replace(',', '.'),
          )
          formData.append('responsavelId', userId)
          formData.append('loteId', loteId)
          if (rg) formData.append('rg', rg)
          if (consulta) formData.append('consulta', consulta)
          if (contrato) formData.append('contrato', contrato)
          if (comprovante) formData.append('comprovante', comprovante)

          const res = await fetch('/api/document', {
            method: 'POST',
            body: formData,
          })

          if (res.ok) {
            toast.success('Documentos enviados com sucesso!')
            window.location.reload()
          } else {
            const data = await res.json()
            toast.error(data.message ?? 'Erro ao enviar documento.')
          }
        } catch (error) {
          console.error(error)
          toast.error('Erro inesperado.')
        }
      })()
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
          <DialogDescription>
            Preencha os dados para envio dos documentos
          </DialogDescription>
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

          {/* <div className="space-y-1">
            <label className="text-sm font-medium">Órgão</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
              required
            >
              <option value="">Selecione um órgão</option>
              <option value="SERASA">SERASA</option>
              <option value="SPC">SPC</option>
              <option value="CENPROT">CENPROT</option>
              <option value="BOA_VISTA">BOA VISTA</option>
            </select>
          </div> */}

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
            <label className="text-sm font-medium">
              Comprovante de Pagamento
            </label>
            <Input
              type="file"
              onChange={(e) => setComprovante(e.target.files?.[0] ?? null)}
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
