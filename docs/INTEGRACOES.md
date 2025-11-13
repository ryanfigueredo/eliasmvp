# Guia de Integrações - Evans Proc

Este documento descreve tudo o que você precisa saber para criar integrações neste projeto.

## 📋 Índice

1. [Estrutura de Rotas API](#estrutura-de-rotas-api)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Padrões de Código](#padrões-de-código)
5. [Exemplo Completo](#exemplo-completo)
6. [Integrações Externas](#integrações-externas)

---

## 🗂️ Estrutura de Rotas API

### Localização

Todas as rotas API ficam em: `src/app/api/`

### Padrão de Rotas Next.js 13+ (App Router)

```
src/app/api/
├── minha-rota/
│   └── route.ts          # GET, POST, PUT, DELETE, PATCH
├── minha-rota/
│   └── [id]/
│       └── route.ts      # Rotas dinâmicas
└── minha-rota/
    └── sub-rota/
        └── route.ts      # Sub-rotas aninhadas
```

### Exemplo Básico

```typescript
// src/app/api/minha-integracao/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withLogging } from '@/lib/api-handler'

export const runtime = 'nodejs'

async function handler(req: NextRequest) {
  // Sua lógica aqui
  return NextResponse.json({ message: 'Sucesso!' })
}

// Exportar os métodos HTTP suportados
export const GET = withLogging(handler)
export const POST = withLogging(handler)
```

---

## 🔐 Autenticação e Autorização

### 1. Verificar Autenticação

```typescript
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token?.id) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
  }

  // token.id - ID do usuário
  // token.role - papel do usuário (master, admin, consultor)
  // token.email - email do usuário
}
```

### 2. Verificar Roles (Permissões)

```typescript
const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

if (!token || token.role !== 'master') {
  return NextResponse.json(
    { message: 'Acesso negado. Apenas masters.' },
    { status: 403 },
  )
}
```

### 3. Headers de Autenticação Personalizados

O projeto também usa headers personalizados em alguns lugares:

```typescript
// Verificar headers
const userId = req.headers.get('x-user-id')
const userRole = req.headers.get('x-user-role')

if (!userId) {
  return NextResponse.json({ message: 'x-user-id requerido' }, { status: 400 })
}
```

---

## 🌍 Variáveis de Ambiente

### Arquivo `.env`

Adicione suas variáveis no arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://..."

# Autenticação
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_ACCESS_KEY_ID="sua-key"
AWS_SECRET_ACCESS_KEY="seu-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="seu-bucket"

# Configurações Opcionais
SENTRY_DSN="https://..."
LOG_LEVEL="info"
ENABLE_RATE_LIMIT="true"
```

### Validar Variáveis

O projeto usa `zod` para validar variáveis. Adicione novas variáveis em `src/lib/env.ts`:

```typescript
// src/lib/env.ts
const envSchema = z.object({
  // ... existentes
  MINHA_INTEGRACAO_API_KEY: z.string(),
  MINHA_INTEGRACAO_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

### Usar Variáveis

```typescript
import { env } from '@/lib/env'

const apiKey = env.MINHA_INTEGRACAO_API_KEY
```

---

## 📝 Padrões de Código

### 1. Logging Automático

Use `withLogging` para logging automático:

```typescript
import { withLogging } from '@/lib/api-handler'

async function handler(req: NextRequest) {
  // Sua lógica
}

export const GET = withLogging(handler)
export const POST = withLogging(handler)
```

### 2. Tratamento de Erros

```typescript
export async function POST(req: NextRequest) {
  try {
    // Sua lógica
    return NextResponse.json({ message: 'Sucesso!' })
  } catch (error: any) {
    console.error('Erro:', error)

    return NextResponse.json(
      {
        message: 'Erro ao processar requisição',
        error: error?.message,
      },
      { status: 500 },
    )
  }
}
```

### 3. Validação de Dados

Use `zod` para validação:

```typescript
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = schema.parse(body)

    // Usar dados validados
  } catch (error) {
    return NextResponse.json(
      { message: 'Dados inválidos', errors: error.errors },
      { status: 400 },
    )
  }
}
```

### 4. Acessar Banco de Dados

```typescript
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const dados = await prisma.minhaTabela.findMany({
    where: {
      // condições
    },
    include: {
      // relações
    },
  })

  return NextResponse.json(dados)
}
```

### 5. Headers CORS (se necessário)

Configure em `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/api/minha-rota/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*', // ou domínio específico
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
      ],
    },
  ]
}
```

---

## 🎯 Exemplo Completo

### Rota de Integração Completa

```typescript
// src/app/api/integracao-exemplo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withLogging } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { env } from '@/lib/env'

export const runtime = 'nodejs'

// Schema de validação
const requestSchema = z.object({
  nome: z.string().min(3),
  valor: z.number().positive(),
})

async function handler(req: NextRequest) {
  try {
    // 1. Autenticação
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.id) {
      return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    }

    // 2. Verificar método HTTP
    if (req.method === 'GET') {
      const dados = await prisma.minhaTabela.findMany({
        where: {
          userId: token.id as string,
        },
      })

      return NextResponse.json(dados)
    }

    if (req.method === 'POST') {
      // 3. Validar dados
      const body = await req.json()
      const validated = requestSchema.parse(body)

      // 4. Lógica de negócio
      const resultado = await prisma.minhaTabela.create({
        data: {
          nome: validated.nome,
          valor: validated.valor,
          userId: token.id as string,
        },
      })

      return NextResponse.json(resultado, { status: 201 })
    }

    // Método não suportado
    return NextResponse.json(
      { message: 'Método não permitido' },
      { status: 405 },
    )
  } catch (error: any) {
    console.error('Erro:', error)

    // Erro de validação
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Dados inválidos',
          errors: error.errors,
        },
        { status: 400 },
      )
    }

    // Erro genérico
    return NextResponse.json(
      {
        message: 'Erro ao processar requisição',
        error: error?.message,
      },
      { status: 500 },
    )
  }
}

export const GET = withLogging(handler)
export const POST = withLogging(handler)
```

---

## 🔌 Integrações Externas

### 1. Chamadas HTTP para APIs Externas

```typescript
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    // Chamada para API externa
    const response = await fetch(env.MINHA_INTEGRACAO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MINHA_INTEGRACAO_API_KEY}`,
      },
      body: JSON.stringify({
        // dados
      }),
    })

    if (!response.ok) {
      throw new Error(`API externa retornou erro: ${response.status}`)
    }

    const data = await response.json()

    // Processar resposta
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro na integração:', error)
    return NextResponse.json(
      { message: 'Erro na integração externa' },
      { status: 500 },
    )
  }
}
```

### 2. Webhooks

#### Receber Webhooks

```typescript
// src/app/api/webhooks/minha-integracao/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withLogging } from '@/lib/api-handler'
import crypto from 'crypto'

export const runtime = 'nodejs'

async function handler(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-signature')

    // Verificar assinatura (se necessário)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { message: 'Assinatura inválida' },
        { status: 401 },
      )
    }

    // Processar webhook
    const data = JSON.parse(body)

    // Sua lógica aqui
    console.log('Webhook recebido:', data)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { message: 'Erro ao processar webhook' },
      { status: 500 },
    )
  }
}

export const POST = withLogging(handler)
```

#### Enviar Webhooks

```typescript
// src/lib/webhooks.ts
export async function sendWebhook(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'evans-proc',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Webhook falhou: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao enviar webhook:', error)
    throw error
  }
}
```

### 3. Rate Limiting

O projeto já tem rate limiting configurado. Use em rotas sensíveis:

```typescript
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limiting: 10 requisições por minuto por IP
  const rateLimitResult = await rateLimit(req, {
    limit: 10,
    window: '1m',
  })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { message: 'Muitas requisições. Tente novamente em alguns instantes.' },
      { status: 429 },
    )
  }

  // Continua processamento...
}
```

### 4. Upload de Arquivos

```typescript
import { uploadToS3 } from '@/lib/s3'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json(
      { message: 'Arquivo não fornecido' },
      { status: 400 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const fileUrl = await uploadToS3({
    fileBuffer: buffer,
    fileName: file.name,
    contentType: file.type,
  })

  return NextResponse.json({ url: fileUrl })
}
```

---

## 📦 Dependências Úteis

### Já Instaladas

- `zod` - Validação de schemas
- `next-auth` - Autenticação
- `@prisma/client` - ORM para banco de dados
- `pino` - Logging (via `@/lib/logger`)

### Pode Precisar Adicionar

```bash
# Para requisições HTTP
npm install axios  # ou usar fetch nativo

# Para processar XML
npm install xml2js

# Para processar PDF
npm install pdf-parse

# Para filas/tarefas assíncronas
npm install bull bullmq

# Para caching
npm install node-cache
```

---

## 🚀 Checklist para Nova Integração

- [ ] Criar rota em `src/app/api/nova-integracao/route.ts`
- [ ] Adicionar autenticação/autorização se necessário
- [ ] Adicionar variáveis de ambiente em `.env` e `src/lib/env.ts`
- [ ] Validar dados de entrada com `zod`
- [ ] Tratamento de erros adequado
- [ ] Logging com `withLogging`
- [ ] Testar localmente
- [ ] Documentar a integração

---

## 📚 Recursos Adicionais

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)

---

## ❓ Dúvidas?

Consulte os exemplos existentes no projeto:

- `src/app/api/health/route.ts` - Rota simples
- `src/app/api/user/me/route.ts` - Rota autenticada
- `src/app/api/document/route.ts` - Rota complexa com upload
