'use client'

import { useState, useEffect, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Tags, Plus, Edit, Trash2, X } from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<
    Array<{ id: string; nome: string; descricao: string | null }>
  >([])
  const [carregandoCategorias, setCarregandoCategorias] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Estados para criar/editar
  const [mostrarForm, setMostrarForm] = useState(false)
  const [categoriaNome, setCategoriaNome] = useState('')
  const [categoriaDescricao, setCategoriaDescricao] = useState('')
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null)

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    setCarregandoCategorias(true)
    try {
      const res = await fetch('/api/categorias-servico')
      if (res.ok) {
        const data = await res.json()
        setCategorias(Array.isArray(data) ? data : [])
      } else {
        toast.error('Erro ao carregar categorias')
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setCarregandoCategorias(false)
    }
  }

  const handleSaveCategoria = async () => {
    if (!categoriaNome.trim()) {
      return toast.error('O nome da categoria é obrigatório')
    }

    startTransition(async () => {
      try {
        if (categoriaEditando) {
          // Editar categoria existente
          const res = await fetch(`/api/categorias-servico/${categoriaEditando}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: categoriaNome.trim(),
              descricao: categoriaDescricao.trim() || null,
            }),
          })

          if (res.ok) {
            toast.success('Categoria atualizada com sucesso!')
            setCategoriaNome('')
            setCategoriaDescricao('')
            setCategoriaEditando(null)
            setMostrarForm(false)
            loadCategorias()
          } else {
            const data = await res.json().catch(() => ({}))
            
            if (res.status === 503) {
              toast.error(
                'Funcionalidade de categorias ainda não está disponível neste ambiente.',
                { duration: 5000 }
              )
              return
            }
            
            toast.error(data.message || 'Erro ao atualizar categoria')
          }
        } else {
          // Criar nova categoria
          const res = await fetch('/api/categorias-servico', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: categoriaNome.trim(),
              descricao: categoriaDescricao.trim() || null,
            }),
          })

          if (res.ok) {
            toast.success('Categoria criada com sucesso!')
            setCategoriaNome('')
            setCategoriaDescricao('')
            setMostrarForm(false)
            loadCategorias()
          } else {
            const data = await res.json().catch(() => ({}))
            
            if (res.status === 503) {
              toast.error(
                'Funcionalidade de categorias ainda não está disponível neste ambiente.',
                { duration: 5000 }
              )
              return
            }
            
            toast.error(data.message || 'Erro ao criar categoria')
          }
        }
      } catch (error) {
        console.error('Erro ao salvar categoria:', error)
        toast.error('Erro ao salvar categoria')
      }
    })
  }

  const handleEditCategoria = (categoria: {
    id: string
    nome: string
    descricao: string | null
  }) => {
    setCategoriaNome(categoria.nome)
    setCategoriaDescricao(categoria.descricao || '')
    setCategoriaEditando(categoria.id)
    setMostrarForm(true)
  }

  const handleDeleteCategoria = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os documentos associados terão sua categoria removida.')) {
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/categorias-servico/${id}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          toast.success('Categoria excluída com sucesso!')
          loadCategorias()
        } else {
          const data = await res.json().catch(() => ({}))
          
          if (res.status === 503) {
            toast.error(
              'Funcionalidade de categorias ainda não está disponível neste ambiente.',
              { duration: 5000 }
            )
            return
          }
          
          toast.error(data.message || 'Erro ao excluir categoria')
        }
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
        toast.error('Erro ao excluir categoria')
      }
    })
  }

  const handleCancel = () => {
    setMostrarForm(false)
    setCategoriaEditando(null)
    setCategoriaNome('')
    setCategoriaDescricao('')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Categorias de Serviço</h1>
        <p className="text-zinc-600 mt-1">
          Gerencie as categorias de serviços prestados
        </p>
      </div>

      {/* Card Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tags className="w-5 h-5 text-[#9C66FF]" />
                Categorias
              </CardTitle>
              <CardDescription>
                Crie, edite e exclua categorias de serviços
              </CardDescription>
            </div>
            {!mostrarForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMostrarForm(true)
                  setCategoriaEditando(null)
                  setCategoriaNome('')
                  setCategoriaDescricao('')
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Categoria
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulário de criar/editar categoria */}
          {mostrarForm && (
            <div className="p-4 border rounded-lg bg-zinc-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-zinc-900">
                  {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Nome da Categoria <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Ex: Limpa Nome, Rating/Score"
                  value={categoriaNome}
                  onChange={(e) => setCategoriaNome(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  Descrição (opcional)
                </label>
                <Input
                  placeholder="Descrição da categoria"
                  value={categoriaDescricao}
                  onChange={(e) => setCategoriaDescricao(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveCategoria}
                  className="bg-[#9C66FF] hover:bg-[#8450e6] text-white"
                  size="sm"
                  disabled={isPending}
                >
                  {isPending
                    ? 'Salvando...'
                    : categoriaEditando
                      ? 'Atualizar'
                      : 'Criar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de categorias */}
          {carregandoCategorias ? (
            <div className="text-center py-8 text-zinc-500">
              <div className="animate-pulse">
                <div className="h-4 bg-zinc-200 rounded w-1/4 mx-auto mb-2" />
                <div className="h-4 bg-zinc-200 rounded w-1/2 mx-auto" />
              </div>
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Tags className="w-16 h-16 mx-auto mb-4 text-zinc-300" />
              <p className="text-lg font-medium mb-2">
                Nenhuma categoria cadastrada
              </p>
              <p className="text-sm">
                Clique em "Nova Categoria" para criar sua primeira categoria
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-zinc-900 text-lg">
                      {categoria.nome}
                    </h4>
                    {categoria.descricao && (
                      <p className="text-sm text-zinc-500 mt-1">
                        {categoria.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategoria(categoria)}
                      className="h-9 w-9"
                      disabled={isPending}
                    >
                      <Edit className="w-4 h-4 text-zinc-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategoria(categoria.id)}
                      className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

