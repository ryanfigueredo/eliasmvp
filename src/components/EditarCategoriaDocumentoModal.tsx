'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useTransition, useEffect } from 'react'
import { Edit } from 'lucide-react'

interface EditarCategoriaDocumentoModalProps {
  documentoId: string
  categoriaAtualId?: string | null
  categoriaAtualNome?: string | null
  onUpdated?: () => void
}

export default function EditarCategoriaDocumentoModal({
  documentoId,
  categoriaAtualId,
  categoriaAtualNome,
  onUpdated,
}: EditarCategoriaDocumentoModalProps) {
  const [open, setOpen] = useState(false)
  const [categoriaId, setCategoriaId] = useState<string>(categoriaAtualId || '')
  const [categorias, setCategorias] = useState<
    Array<{ id: string; nome: string; descricao: string | null }>
  >([])
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Carregar categorias quando o modal abrir
  useEffect(() => {
    if (open) {
      fetch('/api/categorias-servico')
        .then((res) => {
          if (res.status === 503) {
            setCategoriasDisponiveis(false)
            setCategorias([])
            return
          }
          return res.json()
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setCategorias(data)
            setCategoriasDisponiveis(true)
          }
        })
        .catch((err) => {
          console.error('Erro ao buscar categorias:', err)
          setCategorias([])
          setCategoriasDisponiveis(false)
        })
    }
  }, [open])

  // Resetar categoria quando abrir o modal
  useEffect(() => {
    if (open) {
      setCategoriaId(categoriaAtualId || '')
    }
  }, [open, categoriaAtualId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      try {
        const res = await fetch(`/api/document/${documentoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoriaServicoId: categoriaId || null,
          }),
        })

        if (res.ok) {
          toast.success('Categoria atualizada com sucesso!')
          setOpen(false)
          if (onUpdated) onUpdated()
        } else {
          const data = await res.json().catch(() => ({}))

          // Se a tabela não existir (503), fechar modal silenciosamente
          if (res.status === 503) {
            setCategoriasDisponiveis(false)
            setOpen(false)
            return
          }

          toast.error(data.message || 'Erro ao atualizar categoria.')
        }
      } catch (error) {
        console.error(error)
        toast.error('Erro inesperado ao atualizar categoria.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="w-4 h-4 text-[var(--brand-primary)]" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md border bg-white rounded-xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Editar Categoria do Documento
          </DialogTitle>
        </DialogHeader>

        {!categoriasDisponiveis ? (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-500 mb-4">
              Funcionalidade de categorias ainda não está disponível neste
              ambiente.
            </p>
            <p className="text-xs text-zinc-400">
              A migração do banco de dados precisa ser aplicada para habilitar
              esta funcionalidade.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Categoria atual:{' '}
                <span className="text-zinc-500 font-normal">
                  {categoriaAtualNome || 'Sem categoria'}
                </span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Nova Categoria</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Sem categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {categorias.length === 0 && (
                <p className="text-xs text-zinc-500">
                  Nenhuma categoria cadastrada. Crie uma na página de
                  configurações.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
