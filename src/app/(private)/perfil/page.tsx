'use client'

import { useState, useEffect, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Camera, Image as ImageIcon, Tags, Plus, Edit, Trash2, X } from 'lucide-react'
import Image from 'next/image'

const THEMES = ['light', 'dark'] as const
const COLORS = ['roxo', 'azul', 'verde', 'vermelho'] as const

export default function PerfilPage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'pessoal' | 'sistema'>('pessoal')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [signedAvatarUrl, setSignedAvatarUrl] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [signedLogoUrl, setSignedLogoUrl] = useState<string | null>(null)
  
  // Estados para categorias de serviço
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string; descricao: string | null }>>([])
  const [categoriaNome, setCategoriaNome] = useState('')
  const [categoriaDescricao, setCategoriaDescricao] = useState('')
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null)
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false)
  const [carregandoCategorias, setCarregandoCategorias] = useState(false)

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [primaryColor, setPrimaryColor] = useState<string>('#D4AF37')
  const [textColor, setTextColor] = useState<string>('#111111')

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/user/me')
        const user = await res.json()

        console.log('[PERFIL] /api/user/me →', user)

        setNome(user.name || '')
        setEmail(user.email || '')
        setUserRole(user.role || '')
        setUserId(user.id || '')

        if (user.image) {
          console.log('[PERFIL] imagem recebida:', user.image)
          setFotoUrl(user.image)
        }

        // Se for master, carrega logo e categorias
        if (user.role === 'master' && user.id) {
          try {
            const logoRes = await fetch(`/api/config/logo?userId=${user.id}`)
            const logoData = await logoRes.json()
            if (logoData.url) {
              setSignedLogoUrl(logoData.url)
            }
          } catch (error) {
            console.error('[PERFIL] erro ao carregar logo:', error)
          }
          
          // Carregar categorias
          loadCategorias()
        }
      } catch (error) {
        console.error('[PERFIL] erro ao carregar usuário:', error)
      }
    }

    loadUser()

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    const savedPrimary = localStorage.getItem('brand-primary') || '#D4AF37'
    const savedText = localStorage.getItem('brand-text') || '#111111'

    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(savedTheme)
    }
    setPrimaryColor(savedPrimary)
    setTextColor(savedText)
    document.documentElement.style.setProperty('--brand-primary', savedPrimary)
    document.documentElement.style.setProperty('--brand-text', savedText)
  }, [])

  useEffect(() => {
    async function fetchAvatar() {
      console.log('[PERFIL] buscando signedUrl com key:', fotoUrl)

      if (fotoUrl && fotoUrl.startsWith('avatars/')) {
        try {
          const res = await fetch(`/api/document/get-url?key=${fotoUrl}`)
          const data = await res.json()
          console.log('[PERFIL] signedAvatarUrl recebido:', data.url)
          setSignedAvatarUrl(data.url)
        } catch (error) {
          console.error('Erro ao buscar URL do avatar:', error)
        }
      }
    }

    fetchAvatar()
  }, [fotoUrl])

  // Função para carregar categorias
  const loadCategorias = async () => {
    if (userRole !== 'master') return
    
    setCarregandoCategorias(true)
    try {
      const res = await fetch('/api/categorias-servico')
      if (res.ok) {
        const data = await res.json()
        setCategorias(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('[PERFIL] erro ao carregar categorias:', error)
    } finally {
      setCarregandoCategorias(false)
    }
  }

  // Função para criar/editar categoria
  const handleSaveCategoria = async () => {
    if (!categoriaNome.trim()) {
      return toast.error('O nome da categoria é obrigatório')
    }

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
          setMostrarFormCategoria(false)
          loadCategorias()
        } else {
          const data = await res.json()
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
          setMostrarFormCategoria(false)
          loadCategorias()
        } else {
          const data = await res.json()
          toast.error(data.message || 'Erro ao criar categoria')
        }
      }
    } catch (error) {
      console.error('[PERFIL] erro ao salvar categoria:', error)
      toast.error('Erro ao salvar categoria')
    }
  }

  // Função para iniciar edição
  const handleEditCategoria = (categoria: { id: string; nome: string; descricao: string | null }) => {
    setCategoriaNome(categoria.nome)
    setCategoriaDescricao(categoria.descricao || '')
    setCategoriaEditando(categoria.id)
    setMostrarFormCategoria(true)
  }

  // Função para excluir categoria
  const handleDeleteCategoria = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return
    }

    try {
      const res = await fetch(`/api/categorias-servico/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Categoria excluída com sucesso!')
        loadCategorias()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erro ao excluir categoria')
      }
    } catch (error) {
      console.error('[PERFIL] erro ao excluir categoria:', error)
      toast.error('Erro ao excluir categoria')
    }
  }

  const handleSubmit = () => {
    const formData = new FormData()
    formData.append('nome', nome)
    formData.append('email', email)
    if (senha) formData.append('senha', senha)
    if (foto) formData.append('foto', foto)

    startTransition(async () => {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const json = await res.json()
        if (json.image) {
          setFotoUrl(json.image)
        }

        toast.success('Informações atualizadas!')
        router.refresh()
      } else {
        toast.error('Erro ao atualizar dados.')
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Perfil</h1>
        <p className="text-zinc-600 mt-1">Gerencie suas informações pessoais e credenciais</p>
      </div>

      {/* Tabs de Configurações */}
      {userRole === 'master' && (
        <div className="flex items-center gap-2 border-b">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'pessoal'
                ? 'border-[var(--brand-primary)] text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
            onClick={() => setActiveTab('pessoal')}
          >
            Atualizar Perfil Pessoal
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'sistema'
                ? 'border-[var(--brand-primary)] text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
            onClick={() => setActiveTab('sistema')}
          >
            Alterar Sistema (White Label)
          </button>
        </div>
      )}

      {/* Foto do Perfil */}
      {activeTab === 'pessoal' && (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage
            src={signedAvatarUrl || ''}
            alt="Avatar"
            className="rounded-full object-cover"
          />
                <AvatarFallback className="bg-[var(--brand-primary)] text-white text-2xl font-bold">
                  {nome?.charAt(0).toUpperCase()}
                </AvatarFallback>
        </Avatar>
              <label className="absolute bottom-0 right-0 bg-[var(--brand-primary)] text-white rounded-full p-2 cursor-pointer hover:opacity-90 transition-colors shadow-md">
                <Camera className="w-4 h-4" />
        <input
          name="foto"
          type="file"
          accept="image/*"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-900">{nome || 'Usuário'}</h3>
              <p className="text-sm text-zinc-600">{email}</p>
              <p className="text-xs text-zinc-500 mt-1">Clique no ícone da câmera para alterar sua foto</p>
            </div>
      </div>
        </CardContent>
      </Card>
      )}

      {/* Informações Pessoais */}
      {activeTab === 'pessoal' && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize seu nome e e-mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Nome completo</label>
        <Input
              placeholder="Digite seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
              className="h-11"
        />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">E-mail</label>
        <Input
              type="email"
              placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
              className="h-11"
        />
          </div>
        </CardContent>
      </Card>
      )}

      {/* Personalização da Logo (apenas Master) */}
      {userRole === 'master' && activeTab === 'sistema' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[var(--brand-primary)]" />
              Personalizar Logo da Plataforma
            </CardTitle>
            <CardDescription>
              Atualize o logo que aparece no sidebar e nas páginas públicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="relative">
                {signedLogoUrl ? (
                  <Image
                    src={signedLogoUrl}
                    alt="Logo atual"
                    width={120}
                    height={120}
                    className="rounded-lg shadow-lg object-contain border-2 border-zinc-200"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">
                    Nova logo
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="h-11"
                  />
                  <p className="text-xs text-zinc-500">
                    Formatos aceitos: JPG, PNG, GIF. Tamanho recomendado: 300x300px
                  </p>
                </div>
                {logoFile && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!logoFile || !userId) return

                      const formData = new FormData()
                      formData.append('file', logoFile)
                      formData.append('userId', userId)

                      try {
                        const res = await fetch('/api/config/logo', {
                          method: 'POST',
                          body: formData,
                        })

                        const data = await res.json()
                        if (data.config?.logo) {
                          const logoUrlRes = await fetch(
                            `/api/config/logo?userId=${userId}`,
                          )
                          const { url } = await logoUrlRes.json()
                          setSignedLogoUrl(url)
                          setLogoFile(null)
                          toast.success('Logo atualizada com sucesso!')
                          // Recarrega a página para atualizar o logo no sidebar
                          setTimeout(() => window.location.reload(), 1000)
                        } else {
                          toast.error('Erro ao atualizar logo')
                        }
                      } catch (error) {
                        console.error('[PERFIL] erro ao atualizar logo:', error)
                        toast.error('Erro ao atualizar logo')
                      }
                    }}
                    disabled={isPending}
                    className="w-full"
                  >
                    {isPending ? 'Salvando...' : 'Salvar Logo'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorias de Serviço (apenas Master) */}
      {userRole === 'master' && activeTab === 'sistema' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="w-5 h-5 text-[var(--brand-primary)]" />
                  Categorias de Serviço
                </CardTitle>
                <CardDescription>
                  Gerencie as categorias de serviços prestados
                </CardDescription>
              </div>
              {!mostrarFormCategoria && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMostrarFormCategoria(true)
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
            {mostrarFormCategoria && (
              <div className="p-4 border rounded-lg bg-zinc-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-zinc-900">
                    {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setMostrarFormCategoria(false)
                      setCategoriaEditando(null)
                      setCategoriaNome('')
                      setCategoriaDescricao('')
                    }}
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
                  <Button onClick={handleSaveCategoria} size="sm">
                    {categoriaEditando ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMostrarFormCategoria(false)
                      setCategoriaEditando(null)
                      setCategoriaNome('')
                      setCategoriaDescricao('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de categorias */}
            {carregandoCategorias ? (
              <div className="text-center py-4 text-zinc-500">
                Carregando categorias...
              </div>
            ) : categorias.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Tags className="w-12 h-12 mx-auto mb-2 text-zinc-300" />
                <p>Nenhuma categoria cadastrada</p>
                <p className="text-sm mt-1">
                  Clique em "Nova Categoria" para criar uma
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {categorias.map((categoria) => (
                  <div
                    key={categoria.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-zinc-900">
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
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4 text-zinc-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategoria(categoria.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-600"
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
      )}

      {/* Segurança */}
      {activeTab === 'pessoal' && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--brand-primary)]" />
            Segurança
          </CardTitle>
          <CardDescription>
            Altere sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Nova senha</label>
        <Input
          type="password"
              placeholder="Deixe em branco para manter a senha atual"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
              className="h-11"
        />
            <p className="text-xs text-zinc-500">
              Use no mínimo 8 caracteres com letras e números
            </p>
      </div>
        </CardContent>
      </Card>
      )}

      {/* Personalização de Cores (apenas Master) */}
      {userRole === 'master' && activeTab === 'sistema' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[var(--brand-primary)]" />
              Cores da Marca
            </CardTitle>
            <CardDescription>Defina as cores principais da sua plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Cor primária</label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-11 w-16 p-1"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Cor do texto</label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-11 w-16 p-1"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={async () => {
                  document.documentElement.style.setProperty('--brand-primary', primaryColor)
                  document.documentElement.style.setProperty('--brand-text', textColor)
                  localStorage.setItem('brand-primary', primaryColor)
                  localStorage.setItem('brand-text', textColor)
                  try {
                    if (userId) {
                      await fetch('/api/config/colors', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId,
                          primaryColor,
                          textColor,
                        }),
                      })
                    }
                    toast.success('Cores atualizadas!')
                  } catch {
                    toast.error('Não foi possível salvar as cores no servidor.')
                  }
                }}
              >
                Aplicar cores
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de Salvar */}
      {activeTab === 'pessoal' && (
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      )}
    </div>
  )
}
