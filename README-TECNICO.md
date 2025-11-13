# 🚀 Evans Proc - Resumo Técnico para Integrações

> Documento rápido com informações técnicas essenciais do projeto para desenvolvedores que vão fazer integrações.

---

## 📋 Stack Tecnológico Resumido

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| **Linguagem** | TypeScript / JavaScript | 5.8.3 |
| **Framework** | Next.js | 15.3.1 |
| **UI Library** | React | 19.0.0 |
| **ORM** | Prisma | 6.6.0 |
| **Banco de Dados** | PostgreSQL | - |
| **Storage** | AWS S3 | SDK v3 |
| **Autenticação** | NextAuth.js | 4.24.11 |
| **Validação** | Zod | 3.24.3 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **Componentes** | Radix UI | - |

---

## 🏗️ Arquitetura

### **Tipo de Aplicação**
- **Full Stack** - Frontend e Backend na mesma aplicação
- **SSR/SSG** - Server-Side Rendering + Static Generation
- **API Routes** - API REST integrada (Next.js App Router)
- **JWT Auth** - Autenticação baseada em tokens

### **Estrutura**
```
Next.js 15 App Router
├── Frontend (React + TypeScript)
├── Backend API (Next.js API Routes)
├── Database (PostgreSQL + Prisma)
└── Storage (AWS S3)
```

---

## 🔌 APIs Principais

### **Base URL**
```
Desenvolvimento: http://localhost:3000/api
Produção: https://seu-dominio.com/api
```

### **Endpoints Principais**

#### Autenticação
- `POST /api/auth/[...nextauth]/*` - NextAuth endpoints
- `POST /api/auth/forgot-password` - Recuperar senha
- `POST /api/auth/reset-password` - Reset senha

#### Usuários
- `GET /api/users` - Listar (master/admin)
- `POST /api/create-user` - Criar
- `GET /api/user/me` - Usuário atual
- `POST /api/user/update` - Atualizar

#### Clientes
- `GET /api/clientes` - Listar
- `POST /api/clientes` - Criar
- `PATCH /api/clientes/[id]` - Atualizar
- `DELETE /api/clientes/[id]` - Deletar

#### Lotes
- `GET /api/lotes` - Listar
- `POST /api/lotes` - Criar
- `PATCH /api/lotes/[id]` - Atualizar

#### Documentos
- `GET /api/document` - Listar
- `POST /api/document` - Criar
- `PATCH /api/document/update-status` - Atualizar status
- `DELETE /api/document/delete` - Deletar

---

## 🔐 Autenticação

### **Método**
- **NextAuth.js** com JWT tokens
- Provider: **Credentials** (email + senha)

### **Como Autenticar**

#### 1. Login via NextAuth
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

#### 2. Usar Token JWT
```bash
# Cookie automático (Next.js)
GET /api/user/me
Cookie: next-auth.session-token=...

# Ou via header (algumas rotas)
GET /api/clientes
x-user-id: uuid-do-usuario
x-user-role: master|admin|consultor
```

### **Roles (Permissões)**
1. **master** - Acesso total
2. **admin** - Gerencia consultores
3. **consultor** - Acesso limitado

---

## 📊 Banco de Dados

### **Modelos Principais**

```typescript
User {
  id, email, password, role, status
  // Relações: lotes, clientes, documentos
}

Cliente {
  id, nome, cpfCnpj, valor, limite
  // Relação: documentos[]
}

Lote {
  id, nome, inicio, fim, status
  // Relação: documentos[]
}

Document {
  id, tipo, status, valor, fileUrl (S3)
  // Relações: cliente, lote, user
}
```

### **Acessar DB**
```typescript
import { prisma } from '@/lib/prisma'

const dados = await prisma.user.findMany()
```

---

## 🌐 Variáveis de Ambiente

### **Obrigatórias**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="..."
```

### **Opcionais**
```env
SENTRY_DSN="..."           # Monitoramento
LOG_LEVEL="info"          # Logs
ENABLE_RATE_LIMIT="true"  # Rate limiting
```

---

## 💻 Criar Nova Integração

### **1. Criar Rota API**
```typescript
// src/app/api/nova-integracao/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withLogging } from '@/lib/api-handler'

export const runtime = 'nodejs'

async function handler(req: NextRequest) {
  // Autenticação
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

  // Sua lógica aqui
  return NextResponse.json({ success: true })
}

export const GET = withLogging(handler)
export const POST = withLogging(handler)
```

### **2. Validar Dados**
```typescript
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email()
})

const validated = schema.parse(body)
```

### **3. Resposta Padrão**
```typescript
// Sucesso
NextResponse.json({ message: 'Sucesso', data: {...} })

// Erro
NextResponse.json(
  { message: 'Erro', error: '...' },
  { status: 400 }
)
```

---

## 📦 Principais Packages

```json
{
  "next": "15.3.1",
  "react": "19.0.0",
  "typescript": "5.8.3",
  "@prisma/client": "6.6.0",
  "next-auth": "4.24.11",
  "zod": "3.24.3",
  "@aws-sdk/client-s3": "^3.810.0",
  "tailwindcss": "3.4.1"
}
```

---

## 🛠️ Comandos Essenciais

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Banco de Dados
npx prisma generate
npx prisma migrate dev
npx prisma studio

# Qualidade
npm run typecheck
npm run lint
```

---

## 📚 Documentação Completa

- **Tecnologias Detalhadas**: `docs/TECNOLOGIAS.md`
- **Guia de Integrações**: `docs/INTEGRACOES.md`

---

## 🎯 Resumo Rápido

✅ **TypeScript** + **Next.js 15** + **React 19**  
✅ **PostgreSQL** + **Prisma ORM**  
✅ **AWS S3** para arquivos  
✅ **NextAuth.js** para autenticação  
✅ **API REST** integrada no Next.js  
✅ **Validação** com Zod  
✅ **Tailwind CSS** para UI  

---

**Projeto**: Evans Proc  
**Stack**: Full Stack TypeScript (Next.js + PostgreSQL + AWS S3)  
**Versão**: 1.0.0

