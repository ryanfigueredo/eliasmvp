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
import { v4 as uuid } from 'uuid'

type Cliente = {
  id: string
  nome: string
  cpfCnpj: string
}

type Props = {
  userId: string
  loteId?: string | null
  disabled?: boolean
  disabledReason?: string
}

export default function NovoDocumentoModal({
  userId,
  loteId,
  disabled = false,
  disabledReason,
}: Props) {
  const formatCpfCnpj = useCpfCnpjMask()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [uploadProgress, setUploadProgress] = useState<string>('')

  const [nome, setNome] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [valor, setValor] = useState('')
  const [limite, setLimite] = useState('')
  const [usarLimite, setUsarLimite] = useState(false)
  const [rg, setRg] = useState<File | null>(null)
  const [consulta, setConsulta] = useState<File | null>(null)
  const [contrato, setContrato] = useState<File | null>(null)
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [documentosAdicionais, setDocumentosAdicionais] = useState<
    Array<{ file: File | null; descricao: string }>
  >(
    Array.from({ length: 6 }, () => ({
      file: null,
      descricao: '',
    })),
  )
  const [categoriaId, setCategoriaId] = useState<string>('')
  const [categorias, setCategorias] = useState<
    Array<{ id: string; nome: string; descricao: string | null }>
  >([])

  const [loteIdState, setLoteIdState] = useState(loteId || '')
  const [lotes, setLotes] = useState<Lote[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<
    string | null
  >(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    fetch('/api/lotes', {
      headers: {
        'x-user-id': userId,
        'x-user-role': 'master', // ou admin/consultor, se quiser passar por prop
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLotes(data)
        } else {
          console.error('Resposta inválida da API de lotes:', data)
          setLotes([])
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar lotes:', err)
        setLotes([])
      })

    // Buscar categorias de serviços
    fetch('/api/categorias-servico')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategorias(data)
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar categorias:', err)
        setCategorias([])
      })
  }, [userId])

  // Atualiza o loteId quando a prop mudar
  useEffect(() => {
    if (loteId) {
      setLoteIdState(loteId)
    }
  }, [loteId])

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const busca = cpfCnpj || nome
      if (busca.length < 3) {
        setClientes([])
        return
      }

      try {
        const res = await fetch(`/api/clientes?busca=${busca}`, {
          headers: {
            'x-user-id': userId,
            'x-user-role': 'master', // ou pegar do contexto de autenticação
          },
        })
        if (!res.ok) {
          console.error(
            'Erro na busca de clientes:',
            res.status,
            res.statusText,
          )
          return
        }
        const data = await res.json()
        setClientes(data)
        setShowSuggestions(true)
      } catch (err) {
        console.error('Erro ao buscar clientes:', err)
        setClientes([])
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [cpfCnpj, nome])

  const handleClienteSelect = (cliente: Cliente) => {
    setNome(cliente.nome)
    setCpfCnpj(formatCpfCnpj(cliente.cpfCnpj))
    setClienteSelecionadoId(cliente.id)
    setShowSuggestions(false)
    // Não resetamos o limite pois o usuário pode querer definir um novo
  }

  const isValidCpfCnpj = (input: string) => {
    const raw = input.replace(/\D/g, '')
    if (raw.length === 11) return !/^(\d)\1{10}$/.test(raw)
    if (raw.length === 14) return !/^(\d)\1{13}$/.test(raw)
    return false
  }

  const validateFileSize = (file: File | null, maxSizeMB: number = 50) => {
    if (!file) return true
    const maxSizeBytes = maxSizeMB * 1024 * 1024 // 50MB em bytes
    if (file.size > maxSizeBytes) {
      toast.error(
        `Arquivo ${file.name} é muito grande. Tamanho máximo: ${maxSizeMB}MB`,
      )
      return false
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (disabled) {
      toast.error(disabledReason || 'Este lote não aceita novos documentos.')
      return
    }

    if (!nome || !cpfCnpj || !valor || !loteIdState || !categoriaId) {
      return toast.error('Preencha todos os campos obrigatórios.')
    }

    if (!isValidCpfCnpj(cpfCnpj)) {
      return toast.error('CPF ou CNPJ inválido.')
    }

    // Validar limite se checkbox marcada e campo preenchido
    if (usarLimite && limite) {
      const limiteNumerico = Number(
        limite.replace(/[^\d,.-]/g, '').replace(',', '.'),
      )
      if (limiteNumerico < 500) {
        return toast.error('O limite mínimo é de R$ 500,00.')
      }
    }

    if (!rg || !contrato) {
      return toast.error('Envie pelo menos RG e Contrato.')
    }

    // Validar tamanho dos arquivos
    if (!validateFileSize(rg, 50)) return
    if (!validateFileSize(consulta, 50)) return
    if (!validateFileSize(contrato, 50)) return
    if (!validateFileSize(comprovante, 50)) return

    setUploadProgress('🚀 Iniciando upload...')
    toast.success('Documentos sendo enviados...')
    setOpen(false)

    startTransition(() => {
      ;(async () => {
        try {
          console.log('🚀 Iniciando upload de documentos...')
          console.log('📋 Dados:', {
            nome,
            cpfCnpj,
            valor,
            loteIdState,
            userId,
          })

          let finalClienteId = clienteSelecionadoId

          // Buscar cliente existente primeiro
          if (!finalClienteId) {
            console.log('🔍 Buscando cliente existente...')
            const buscaRes = await fetch(
              `/api/clientes?busca=${cpfCnpj.replace(/\D/g, '')}`,
              {
                headers: {
                  'x-user-id': userId,
                  'x-user-role': 'master',
                },
              },
            )

            if (buscaRes.ok) {
              const clientes = await buscaRes.json()
              if (clientes.length > 0) {
                finalClienteId = clientes[0].id
                console.log('✅ Cliente existente encontrado:', finalClienteId)
              }
            }
          }

          // Se cliente existe e usuário marcou para usar limite, atualizar o limite
          if (finalClienteId && usarLimite && limite) {
            console.log('🔄 Atualizando limite do cliente...')
            const limiteNumerico = Number(
              limite.replace(/[^\d,.-]/g, '').replace(',', '.'),
            )

            await fetch(`/api/clientes/${finalClienteId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': userId,
                'x-user-role': 'master',
              },
              body: JSON.stringify({ limite: limiteNumerico }),
            })
            console.log('✅ Limite atualizado')
          }

          // Se não encontrou cliente existente, criar novo
          if (!finalClienteId) {
            console.log('👤 Cliente não encontrado, criando novo...')
            const clienteData: any = {
              nome,
              cpfCnpj: cpfCnpj.replace(/\D/g, ''),
              responsavelId: userId,
              valor: Number(valor.replace(/[^\d,.-]/g, '').replace(',', '.')),
            }

            // Adicionar limite apenas se checkbox marcada e campo preenchido
            if (usarLimite && limite) {
              clienteData.limite = Number(
                limite.replace(/[^\d,.-]/g, '').replace(',', '.'),
              )
            }

            const clienteRes = await fetch('/api/clientes', {
              method: 'POST',
              body: JSON.stringify(clienteData),
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': userId,
                'x-user-role': 'master',
              },
            })

            console.log('📡 Resposta criação cliente:', clienteRes.status)

            if (clienteRes.ok) {
              const clienteData = await clienteRes.json()
              finalClienteId = clienteData.id
              console.log('✅ Cliente criado:', finalClienteId)
            } else {
              const errorData = await clienteRes.json()
              console.error('❌ Erro ao criar cliente:', errorData)
              return toast.error(errorData.message || 'Erro ao criar cliente.')
            }
          }

          const agrupadorId = uuid()
          console.log('🆔 Agrupador ID:', agrupadorId)

          // Verificar se deve usar upload direto ao S3
          const usePresignedUpload = true
          console.log('🔧 Presigned uploads enabled:', usePresignedUpload)

          if (usePresignedUpload) {
            console.log('☁️ Usando upload direto ao S3...')
            try {
              await uploadWithPresignedUrls()
            } catch (error) {
              console.error(
                '❌ Erro no upload direto, tentando upload tradicional:',
                error,
              )
              toast.error(
                'Erro no upload direto. Tentando método alternativo...',
              )
              await uploadWithFormData()
            }
          } else {
            console.log('📤 Usando upload tradicional...')
            await uploadWithFormData()
          }

          async function uploadWithPresignedUrls() {
            const files = [
              { file: rg, tipo: 'RG', descricao: 'RG' },
              { file: consulta, tipo: 'CONSULTA', descricao: 'Consulta' },
              { file: contrato, tipo: 'CONTRATO', descricao: 'Contrato' },
              { file: comprovante, tipo: 'COMPROVANTE', descricao: 'Comprovante de Pagamento' },
              ...documentosAdicionais
                .filter((doc) => doc.file)
                .map((doc, index) => ({
                  file: doc.file!,
                  tipo: `ADICIONAL_${index + 1}`,
                  descricao: doc.descricao || `Documento Adicional ${index + 1}`,
                })),
            ].filter(({ file }) => file)

            const uploadedFiles = []

            for (const { file, tipo } of files) {
              if (!file) continue

              const key = `${Date.now()}-${tipo.toLowerCase()}-${file.name}`

              // Gerar URL pré-assinada
              const presignRes = await fetch('/api/uploads/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  key,
                  contentType: file.type,
                  fileSize: file.size,
                }),
              })

              if (!presignRes.ok) {
                const error = await presignRes.json()
                throw new Error(error.error || 'Erro ao gerar URL de upload')
              }

              const { url } = await presignRes.json()

              // Upload direto ao S3
              const uploadRes = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                  'Content-Type': file.type,
                },
              })

              if (!uploadRes.ok) {
                throw new Error(`Erro no upload do arquivo ${tipo}`)
              }

              uploadedFiles.push({ key, tipo })
              console.log(`✅ ${tipo} enviado para S3:`, key)
            }

            // Salvar documentos no banco via API
            const saveRes = await fetch('/api/document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                clienteId: finalClienteId!,
                loteId: loteIdState,
                categoriaServicoId: categoriaId,
                valor: valor.replace(/[^\d,.-]/g, '').replace(',', '.'),
                responsavelId: userId,
                agrupadorId,
                uploads: uploadedFiles, // [{ key, tipo }]
              }),
            })

            if (!saveRes.ok) {
              const error = await saveRes.json().catch(() => ({}))
              throw new Error(error.message || 'Erro ao salvar documentos')
            }
          }

          async function uploadWithFormData() {
            const formData = new FormData()
            if (finalClienteId) formData.append('clienteId', finalClienteId)
            formData.append(
              'valor',
              valor.replace(/[^\d,.-]/g, '').replace(',', '.'),
            )
            formData.append('responsavelId', userId)
            formData.append('loteId', loteIdState)
            formData.append('categoriaServicoId', categoriaId)
            formData.append('agrupadorId', agrupadorId)
            if (rg) formData.append('rg', rg)
            if (consulta) formData.append('consulta', consulta)
            if (contrato) formData.append('contrato', contrato)
            if (comprovante) formData.append('comprovante', comprovante)
            
            // Adicionar documentos adicionais
            documentosAdicionais.forEach((doc, index) => {
              if (doc.file) {
                formData.append(`adicional_${index + 1}`, doc.file)
                formData.append(`adicional_${index + 1}_descricao`, doc.descricao || `Documento Adicional ${index + 1}`)
              }
            })

            console.log('📤 Enviando documentos para API...')

            // Função para tentar upload com retry
            const uploadWithRetry = async (attempts = 3) => {
              for (let i = 0; i < attempts; i++) {
                try {
                  const attemptText = `📤 Tentativa ${i + 1} de ${attempts}...`
                  console.log(attemptText)
                  setUploadProgress(attemptText)
                  const controller = new AbortController()
                  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos

                  const res = await fetch('/api/document', {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal,
                  })

                  clearTimeout(timeoutId)

                  if (res.ok) {
                    setUploadProgress('✅ Upload concluído com sucesso!')
                    return res
                  }

                  // Pode vir HTML/texto (ex.: 413). Evita erro de parse JSON
                  const raw = await res.text()
                  let errorData: any
                  try {
                    errorData = JSON.parse(raw)
                  } catch {
                    errorData = { message: raw }
                  }
                  console.error(`❌ Erro na tentativa ${i + 1}:`, errorData)

                  if (i === attempts - 1) {
                    throw new Error(errorData.message || 'Erro no upload')
                  }

                  // Aguarda antes da próxima tentativa
                  await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * (i + 1)),
                  )
                } catch (error) {
                  console.error(`❌ Erro de rede na tentativa ${i + 1}:`, error)

                  if (i === attempts - 1) {
                    throw error
                  }

                  // Aguarda antes da próxima tentativa
                  await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * (i + 1)),
                  )
                }
              }
            }

            const res = await uploadWithRetry()

            if (!res) {
              throw new Error('Falha em todas as tentativas de upload')
            }

            console.log('📡 Resposta da API:', res.status, res.statusText)

            if (res.ok) {
              const responseData = await res.json()
              console.log('✅ Sucesso:', responseData)
              toast.success('Documentos enviados com sucesso!')
              window.location.reload()
            } else {
              const errorData = await res
                .json()
                .catch(() => ({ message: 'Erro desconhecido' }))
              console.error('❌ Erro na API:', errorData)

              // Tratamento específico para erro 413
              if (res.status === 413) {
                toast.error(
                  'Arquivo muito grande. Tamanho máximo permitido: 50MB por arquivo.',
                )
              } else {
                toast.error(errorData.message ?? 'Erro ao enviar documento.')
              }
            }
          }

          // Mensagem final de sucesso é disparada nas funções de upload quando apropriado
        } catch (error) {
          console.error('💥 Erro inesperado:', error)
          toast.error('Erro inesperado ao processar documentos.')
        }
      })()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#9C66FF] hover:bg-[#8450e6] text-white"
          disabled={disabled}
          title={disabled ? disabledReason || 'Ação indisponível' : undefined}
        >
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

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="usarLimite"
                checked={usarLimite}
                onChange={(e) => {
                  setUsarLimite(e.target.checked)
                  if (!e.target.checked) {
                    setLimite('')
                  }
                }}
                className="h-4 w-4 text-[#9C66FF] focus:ring-[#9C66FF] border-gray-300 rounded"
              />
              <label
                htmlFor="usarLimite"
                className="text-sm font-medium text-zinc-700"
              >
                Definir limite de crédito
                <span className="text-xs text-zinc-500 ml-1">
                  (mín. R$ 500)
                </span>
              </label>
            </div>
            {usarLimite && (
              <Input
                type="text"
                placeholder="R$ 0,00"
                value={limite}
                onChange={(e) => setLimite(formatCurrency(e.target.value))}
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Categoria de Serviço <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            {categorias.length === 0 && (
              <p className="text-xs text-zinc-500">
                Nenhuma categoria cadastrada. Crie uma na página de configurações.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Lote</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={loteIdState}
              onChange={(e) => setLoteIdState(e.target.value)}
              required
              disabled={!!loteId}
            >
              <option value="">Selecione um lote</option>
              {Array.isArray(lotes) &&
                lotes.map((lote) => (
                  <option key={lote.id} value={lote.id}>
                    {lote.nome} ({new Date(lote.inicio).toLocaleDateString()}{' '}
                    até {new Date(lote.fim).toLocaleDateString()})
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
            <label className="text-sm font-medium">
              Comprovante de Pagamento
            </label>
            <Input
              type="file"
              onChange={(e) => setComprovante(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-3 pt-2 border-t">
            <label className="text-sm font-medium text-zinc-700">
              Documentos Adicionais
            </label>
            {documentosAdicionais.map((doc, index) => (
              <div key={index} className="space-y-1">
                <Input
                  type="text"
                  placeholder={`Descrição do documento ${index + 1} (opcional)`}
                  value={doc.descricao}
                  onChange={(e) => {
                    const novos = [...documentosAdicionais]
                    novos[index].descricao = e.target.value
                    setDocumentosAdicionais(novos)
                  }}
                  className="text-sm"
                />
                <Input
                  type="file"
                  onChange={(e) => {
                    const novos = [...documentosAdicionais]
                    novos[index].file = e.target.files?.[0] ?? null
                    setDocumentosAdicionais(novos)
                  }}
                />
              </div>
            ))}
          </div>

          {uploadProgress && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{uploadProgress}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending || disabled}>
              {isPending ? 'Enviando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
