# 📚 Stack Tecnológico - Evans Proc

## Visão Geral do Projeto

**Evans Proc** é uma plataforma de gestão de documentos com arquitetura White Label, desenvolvida para gerenciar clientes, lotes e documentos com permissões avançadas por perfil de usuário.

---

## 🛠️ Stack Principal

### **Frontend & Framework**
- **Next.js 15.3.1** (App Router) - Framework React com SSR/SSG
- **React 19.0.0** - Biblioteca UI
- **TypeScript 5.8.3** - Linguagem de programação (tipagem estática)

### **Backend**
- **Next.js API Routes** - API REST integrada
- **NextAuth.js 4.24.11** - Autenticação e sessões
- **Node.js** - Runtime JavaScript

### **Banco de Dados**
- **PostgreSQL** - Banco de dados relacional
- **Prisma 6.6.0** - ORM (Object-Relational Mapping)
- **Supabase** - Plataforma de banco de dados (opcional)

### **Armazenamento**
- **AWS S3** - Armazenamento de arquivos na nuvem
- **AWS SDK v3** - Cliente oficial AWS

---

## 📦 Principais Dependências

### **UI & Componentes**
- **Radix UI** - Componentes acessíveis e sem estilo
  - Dialog, Dropdown, Select, Popover, Tooltip, Avatar
- **Tailwind CSS 3.4.1** - Framework CSS utility-first
- **Lucide React** - Biblioteca de ícones
- **Sonner** - Sistema de notificações toast

### **Validação & Formulários**
- **Zod 3.24.3** - Validação de schemas TypeScript
- **React Hook Form 7.56.0** - Gerenciamento de formulários
- **@hookform/resolvers** - Resolvers para validação

### **Gráficos & Visualização**
- **Recharts 2.15.3** - Biblioteca de gráficos React
- **jsPDF 3.0.1** - Geração de PDFs
- **jspdf-autotable** - Tabelas em PDF

### **Utilitários**
- **date-fns 4.1.0** - Manipulação de datas
- **papaparse 5.5.2** - Parsing de CSV
- **json2csv** - Conversão JSON para CSV
- **nanoid 5.1.5** - Geração de IDs únicos
- **uuid** - Geração de UUIDs

### **Logging & Monitoramento**
- **Pino 9.9.0** - Logger estruturado de alta performance
- **Sentry 10.5.0** - Monitoramento de erros

### **Email**
- **Resend 4.4.0** - Serviço de envio de emails

### **Autenticação**
- **bcrypt / bcryptjs** - Hash de senhas
- **next-auth** - Sistema completo de autenticação

### **HTTP & Fetch**
- **SWR 2.3.3** - Data fetching com cache e revalidação

---

## 🏗️ Arquitetura do Projeto

### **Estrutura de Pastas**

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # Rotas da API REST
│   │   ├── auth/             # Autenticação (NextAuth)
│   │   ├── users/            # Gestão de usuários
│   │   ├── clientes/         # Gestão de clientes
│   │   ├── lotes/            # Gestão de lotes
│   │   ├── document/         # Gestão de documentos
│   │   ├── dashboard/        # Dados do dashboard
│   │   └── ...
│   ├── (private)/            # Rotas protegidas
│   │   ├── dashboard/        # Dashboards por perfil
│   │   ├── usuarios/         # Gestão de usuários
│   │   ├── documentos/       # Visualização de documentos
│   │   └── perfil/           # Perfil do usuário
│   ├── auth/                 # Rotas de autenticação
│   ├── login/                # Página de login
│   └── page.tsx              # Landing page
├── components/               # Componentes React
│   ├── ui/                   # Componentes UI base (Radix)
│   └── ...                   # Componentes de negócio
├── lib/                      # Bibliotecas e utilitários
│   ├── prisma.ts             # Cliente Prisma
│   ├── auth.ts               # Configuração NextAuth
│   ├── s3.ts                 # Utilitários AWS S3
│   ├── api-handler.ts        # Wrapper para rotas API
│   ├── env.ts                # Validação de variáveis
│   └── ...
└── hooks/                    # React Hooks customizados
```

---

## 🗄️ Banco de Dados (Prisma Schema)

### **Modelos Principais**

- **User** - Usuários do sistema (master, admin, consultor)
- **Cliente** - Clientes cadastrados
- **Lote** - Agrupamento de documentos por período
- **Document** - Documentos enviados pelos usuários
- **Log** - Logs de ações do sistema
- **Config** - Configurações white label

### **Relacionamentos**

```
User (Master)
  ├── subUsers (Admins/Consultores)
  ├── lotesCriados
  ├── clientesCriados
  └── documentosDonos

Cliente
  ├── documentos
  └── responsavel (User)

Lote
  ├── documentos
  └── criador (User)

Document
  ├── cliente
  ├── lote
  ├── responsavel (User)
  └── owner (User Master)
```

---

## 🔌 APIs Disponíveis

### **Autenticação**
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/forgot-password` - Recuperação de senha
- `POST /api/auth/reset-password` - Reset de senha

### **Usuários**
- `GET /api/users` - Listar usuários
- `GET /api/users/[id]` - Obter usuário
- `POST /api/create-user` - Criar usuário
- `POST /api/edit-user` - Editar usuário
- `POST /api/approve-user` - Aprovar usuário
- `GET /api/user/me` - Usuário atual autenticado

### **Clientes**
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes?busca=...` - Buscar clientes
- `POST /api/clientes` - Criar cliente
- `PATCH /api/clientes/[id]` - Atualizar cliente
- `DELETE /api/clientes/[id]` - Deletar cliente

### **Lotes**
- `GET /api/lotes` - Listar lotes
- `GET /api/lotes/[id]` - Obter lote
- `POST /api/lotes` - Criar lote
- `PATCH /api/lotes/[id]` - Atualizar lote
- `PATCH /api/lotes/[id]/status` - Atualizar status

### **Documentos**
- `GET /api/document` - Listar documentos
- `POST /api/document` - Criar documento
- `DELETE /api/document/delete` - Deletar documento
- `PATCH /api/document/update-status` - Atualizar status
- `GET /api/document/get-url?key=...` - URL assinada S3

### **Dashboard & Estatísticas**
- `GET /api/dashboard/valores` - Valores agregados
- `GET /api/stats/geral` - Estatísticas gerais
- `GET /api/stats/document-status` - Status de documentos
- `GET /api/stats/consultor` - Stats por consultor

### **Uploads**
- `POST /api/uploads/presign` - URL pré-assinada S3

---

## 🔐 Sistema de Autenticação

### **NextAuth.js**
- Provider: Credentials (email/senha)
- JWT tokens
- Session management
- Middleware de proteção de rotas

### **Roles (Permissões)**
1. **master** - Acesso total
2. **admin** - Gerenciamento de consultores
3. **consultor** - Acesso limitado aos próprios dados

### **Status de Usuário**
- `aguardando` - Aguardando aprovação
- `aprovado` - Usuário ativo
- `rejeitado` - Usuário rejeitado

---

## 🌐 Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@host:port/database"

# Autenticação
NEXTAUTH_SECRET="chave-secreta-minimo-32-caracteres"
NEXTAUTH_URL="https://seu-dominio.com"

# AWS S3
AWS_ACCESS_KEY_ID="sua-access-key"
AWS_SECRET_ACCESS_KEY="seu-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="nome-do-bucket"

# Opcionais
SENTRY_DSN="https://..." # Monitoramento de erros
LOG_LEVEL="info" # debug, info, warn, error
ENABLE_RATE_LIMIT="true" # Rate limiting
ENABLE_PRESIGNED_UPLOADS="true" # Uploads diretos S3
```

---

## 📡 Como Fazer Integrações

### **1. Criar Nova Rota API**

```typescript
// src/app/api/nova-integracao/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withLogging } from '@/lib/api-handler'

export const runtime = 'nodejs'

async function handler(req: NextRequest) {
  // 1. Autenticação
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  if (!token?.id) {
    return NextResponse.json(
      { message: 'Não autenticado' }, 
      { status: 401 }
    )
  }

  // 2. Lógica da integração
  // ...

  return NextResponse.json({ success: true })
}

export const GET = withLogging(handler)
export const POST = withLogging(handler)
```

### **2. Autenticação via Header**

Algumas rotas usam headers personalizados:
```typescript
const userId = req.headers.get('x-user-id')
const userRole = req.headers.get('x-user-role')
```

### **3. Acessar Banco de Dados**

```typescript
import { prisma } from '@/lib/prisma'

const dados = await prisma.modelName.findMany({
  where: { /* condições */ },
  include: { /* relações */ }
})
```

### **4. Validar Dados**

```typescript
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email()
})

const validated = schema.parse(body)
```

---

## 🚀 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build & Deploy
npm run build        # Build de produção
npm start            # Inicia servidor de produção

# Banco de Dados
npx prisma generate  # Gera cliente Prisma
npx prisma migrate   # Aplica migrations
npx prisma studio    # Interface visual do banco

# Qualidade
npm run typecheck    # Verifica tipos TypeScript
npm run lint         # Linter ESLint
npm run verify       # Typecheck + Lint
```

---

## 🎯 Padrões do Projeto

### **Tipagem**
- TypeScript strict mode habilitado
- Tipos explícitos em todas as funções públicas
- Interfaces para models e responses

### **Estrutura de Resposta API**
```typescript
// Sucesso
{ message: string, data?: any }

// Erro
{ message: string, error?: string, errors?: ValidationError[] }
```

### **Status HTTP**
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno

### **Logging**
- Todas as rotas API usam `withLogging` wrapper
- Logs estruturados com Pino
- Request ID para rastreamento

---

## 📚 Recursos e Documentação

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org
- **Zod**: https://zod.dev
- **AWS SDK**: https://docs.aws.amazon.com/sdk-for-javascript

---

## 💡 Observações Importantes

1. **TypeScript**: Projeto 100% tipado - mantenha a tipagem
2. **Prisma**: Sempre rode `prisma generate` após mudanças no schema
3. **Next.js 15**: Usa App Router (não Pages Router)
4. **Autenticação**: Todas as rotas protegidas exigem token JWT
5. **S3**: Uploads diretos usando presigned URLs para melhor performance
6. **White Label**: Suporte a múltiplos tenants via `ownerId`

---

## 📞 Informações para Desenvolvedor

- **Linguagem**: TypeScript/JavaScript (Node.js)
- **Framework**: Next.js 15.3.1
- **ORM**: Prisma 6.6.0
- **Banco**: PostgreSQL
- **Storage**: AWS S3
- **Autenticação**: NextAuth.js (JWT)
- **Validação**: Zod

Para mais detalhes sobre como criar integrações específicas, consulte `docs/INTEGRACOES.md`.

