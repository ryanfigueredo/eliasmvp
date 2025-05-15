# Elias Document Manager - README

## Visão Geral

Elias Document Manager é um sistema de gestão de documentos em lote para empresas que precisam armazenar, consultar e auditar documentos com segurança. O sistema utiliza autenticação com NextAuth, banco de dados PostgreSQL via Prisma, e armazenamento seguro de arquivos na AWS S3.

## Tecnologias Utilizadas

- Next.js 14 + App Router
- TypeScript
- Tailwind CSS + Shadcn UI
- Prisma ORM
- PostgreSQL (Supabase / Neon ou local)
- AWS S3 para armazenamento seguro de arquivos
- NextAuth para autenticação e gestão de sessões

## Recursos do Sistema

- Cadastro de usuários com roles: `master`, `admin`, `consultor`, `white-label`
- Cadastro de lotes de documentos
- Upload de documentos com envio direto para AWS S3
- Visualização segura com Signed URLs temporários (não expõe URLs públicas)
- Consulta de documentos por lote
- Gerenciamento de documentos por orgão e status (`INICIADO`, `EM_ANDAMENTO`, `FINALIZADO`)
- Log de ações importantes (uploads, exclusões, alterações)
- Sistema responsivo, otimizado para desktop e mobile

## Instalação Local

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/elias-document-manager.git
cd elias-document-manager
```

2. Crie o arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

3. Preencha variáveis de ambiente:

- NEXTAUTH_SECRET
- NEXTAUTH_URL
- DATABASE_URL
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_S3_BUCKET

4. Instale dependências:

```bash
npm install
```

5. Rode as migrações do Prisma:

```bash
npx prisma migrate dev
```

6. Inicie o projeto:

```bash
npm run dev
```

## Comandos úteis

```bash
npx prisma studio         # Interface visual do banco de dados
npx prisma migrate dev    # Executa migrações
npm run build             # Build para produção
```

## Deploy

- Recomendado para Vercel (integração nativa com Next.js)
- Configurar variáveis de ambiente no painel da Vercel
- Garantir que o bucket da AWS S3 tenha políticas corretas (sem público)

## Considerações de Segurança

- Todos arquivos são privados no S3
- Visualização só através de URLs temporárias geradas pelo backend
- Autenticação JWT para proteger APIs privadas

## Roadmap Futuro (Versão 2.0)

- Dashboard analítico para `master`
- Exportação em CSV / PDF
- Sistema de Notificações
- Opção de escolha de orgão dinâmico no cadastro
- Melhorias no design e UX geral

## Contato

Desenvolvido por Ryan Figueredo - DMTN Sistemas

LinkedIn: [https://www.linkedin.com/in/ryanfig/](https://www.linkedin.com/in/ryanfig/)
GitHub: [https://github.com/ryanfigueredo](https://github.com/ryanfigueredo)
