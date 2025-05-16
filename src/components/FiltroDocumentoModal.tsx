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
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Filter } from 'lucide-react'

interface FiltroDocumentoModalProps {
  role: string
  defaultOrgao?: string
  defaultStatus?: string
  defaultFile?: string
}

export default function FiltroDocumentoModal({
  role,
  defaultOrgao = '',
  defaultStatus = '',
  defaultFile = '',
}: FiltroDocumentoModalProps) {
  const [orgao, setOrgao] = useState(defaultOrgao)
  const [status, setStatus] = useState(defaultStatus)
  const [file, setFile] = useState(defaultFile)
  const [consultorId, setConsultorId] = useState('')
  const [loteId, setLoteId] = useState('')
  const [consultores, setConsultores] = useState<
    { id: string; name: string }[]
  >([])
  const [lotes, setLotes] = useState<{ id: string; nome: string }[]>([])
  const router = useRouter()

  useEffect(() => {
    async function fetchFiltros() {
      try {
        const [resUsers, resLotes] = await Promise.all([
          fetch('/api/users?role=consultor'),
          fetch('/api/lotes'),
        ])

        if (!resUsers.ok || !resLotes.ok)
          throw new Error('Erro ao buscar filtros')

        const usersData = await resUsers.json()
        const lotesData = await resLotes.json()

        setConsultores(usersData)
        setLotes(lotesData)
      } catch (err) {
        console.error('Erro ao buscar consultores/lotes:', err)
      }
    }

    if (role === 'master' || role === 'admin') {
      fetchFiltros()
    }
  }, [role])

  if (role !== 'master' && role !== 'admin') return null

  const handleSubmit = () => {
    const params = new URLSearchParams()
    if (file) params.set('file', file)
    if (orgao) params.set('orgao', orgao)
    if (status) params.set('status', status)
    if (consultorId) params.set('userId', consultorId)
    if (loteId) params.set('loteId', loteId)

    router.push(`/dashboard/master/documentos?${params.toString()}`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtrar
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-md px-6 py-6 bg-white border rounded-xl shadow-lg"
        aria-describedby="filtro-descricao"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Filtrar documentos
          </DialogTitle>
        </DialogHeader>

        <div id="filtro-descricao" className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome do arquivo</label>
            <Input
              value={file}
              onChange={(e) => setFile(e.target.value)}
              placeholder="ex: contrato.pdf"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Órgão</label>
            <select
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="">Todos</option>
              <option value="CENPROT">CENPROT</option>
              <option value="SPC">SPC</option>
              <option value="SERASA">SERASA</option>
              <option value="BOA_VISTA">BOA VISTA</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="">Todos</option>
              <option value="INICIADO">Iniciado</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Consultor</label>
            <select
              value={consultorId}
              onChange={(e) => setConsultorId(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="">Todos</option>
              {consultores.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Loja / Lote</label>
            <select
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="">Todos</option>
              {lotes.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/master/documentos')}
            >
              Limpar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#9C66FF] text-white hover:bg-[#8450e6]"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
