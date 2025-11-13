# 📄 Informações Técnicas - Evans Proc

> Documento para desenvolvedores que vão fazer integrações

---

## 🚀 Stack

**Linguagem**: TypeScript / JavaScript (Node.js)  
**Framework**: Next.js 15.3.1 (App Router)  
**Frontend**: React 19.0.0  
**Backend**: Next.js API Routes  
**Banco**: PostgreSQL + Prisma 6.6.0  
**Storage**: AWS S3  
**Auth**: NextAuth.js 4.24.11 (JWT)  
**Validação**: Zod 3.24.3  

---

## 🔌 API Base

```
Desenvolvimento: http://localhost:3000/api
Produção: https://evansproc.evansolucoes.com.br/api
```

---

## 🔐 Autenticação

**Método**: NextAuth.js (JWT via cookie ou headers)

### Via Cookie (Automático Next.js)
```
Cookie: next-auth.session-token=...
```

### Via Headers (Algumas rotas)
```
x-user-id: uuid
x-user-role: master|admin|consultor
```

### Exemplo de Login
```bash
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "senha123"
}
```

---

## 📡 Rotas API Principais

### Usuários
- `GET /api/user/me` - Usuário atual
- `GET /api/users` - Listar usuários
- `POST /api/create-user` - Criar usuário

### Clientes
- `GET /api/clientes` - Listar
- `POST /api/clientes` - Criar
- `PATCH /api/clientes/[id]` - Atualizar

### Lotes
- `GET /api/lotes` - Listar
- `POST /api/lotes` - Criar
- `PATCH /api/lotes/[id]` - Atualizar

### Documentos
- `GET /api/document` - Listar
- `POST /api/document` - Criar
- `PATCH /api/document/update-status` - Atualizar status

---

## 💻 Exemplo: Criar Nova Rota

```typescript
// src/app/api/minha-integracao/route.ts
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

  // Sua lógica
  return NextResponse.json({ success: true })
}

export const GET = withLogging(handler)
export const POST = withLogging(handler)
```

---

## 📊 Banco de Dados (Prisma)

### Modelos
- `User` - Usuários (master/admin/consultor)
- `Cliente` - Clientes
- `Lote` - Lotes de documentos
- `Document` - Documentos

### Acessar DB
```typescript
import { prisma } from '@/lib/prisma'

const dados = await prisma.user.findMany()
```

---

## 🔑 Variáveis de Ambiente

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="..."
```

---

## 📦 Estrutura do Projeto

```
src/
├── app/
│   └── api/          # Rotas API
├── components/       # Componentes React
├── lib/              # Utilitários
│   ├── prisma.ts     # Cliente Prisma
│   ├── auth.ts       # NextAuth config
│   └── api-handler.ts
└── hooks/            # React Hooks
```

---

## ✅ Status HTTP Padrão

- `200` - Sucesso
- `201` - Criado
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno

---

## 📚 Mais Informações

- **Detalhes Técnicos**: `docs/TECNOLOGIAS.md`
- **Guia Completo**: `docs/INTEGRACOES.md`

---

**Contato**: Ryan Figueredo - DMTN Sistemas  
**Projeto**: Evans Proc - Gestão de Documentos White Label

