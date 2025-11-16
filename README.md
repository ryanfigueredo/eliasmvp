## Evan’s Proc — Gestão de Documentos (White Label)

Projeto que uso para organizar documentos por clientes e lotes, com controle de acesso por perfil e um modo white label para personalizar marca (logo e cores) por Master. O foco é ser simples de operar no dia a dia, sem firula.

### O que tem aqui

- Autenticação com NextAuth (Credentials)
- Perfis: Master, Admin e Consultor
- Clientes, Lotes, Documentos e Categorias de Serviço
- Upload com URL pré‑assinada (S3 compatível)
- Exportações e filtros básicos
- White label: logo + cores herdadas para toda a hierarquia do Master

### Stack

- Next.js 15 (App Router) + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- AWS S3 (ou compatível) para arquivos

### Rodando o projeto

1. Dependências

```bash
npm i
```

2. Variáveis de ambiente (.env)

```bash
DATABASE_URL="postgres://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uma_chave_secreta"

# S3 / Storage
S3_BUCKET="meu-bucket"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_ENDPOINT="" # opcional se usar provider compatível
```

3. Banco de dados

```bash
npx prisma migrate dev
npx prisma generate
```

4. Dev

```bash
npm run dev
```

5. Build

```bash
npm run build && npm run start
```

### White Label (cores e logo)

- Acesse Configurações → Perfil (rota `/perfil`).
- Para o usuário Master, aparecem duas abas:
  - Atualizar Perfil Pessoal
  - Alterar Sistema (White Label)
- Em “Alterar Sistema”, dá pra:
  - Enviar a logo (fica no sidebar e telas públicas)
  - Ajustar “Cor primária” e “Cor do texto”
- As cores ficam salvas em `Config` no banco (e são herdadas por todos os usuários abaixo do Master).

### Estrutura de dados (resumo)

- `User` com hierarquia (ownerId para white label)
- `Cliente`, `Lote`, `Document`, `CategoriaServico`
- `Config` guarda `logo`, `primaryColor`, `textColor`, `sidebarBg`

### Comandos úteis

```bash
# checar migrations
npx prisma migrate status

# criar nova migration
npx prisma migrate dev --name minha_migration

# atualizar client
npx prisma generate
```

### Notas

- A home é dinâmica (usa headers) e o Next avisa que não dá pra pré‑renderizar. É esperado.
- Se o editor reclamar de `@tailwind`/`@apply`, é só hint do VS Code; o build passa normal.

### Licença

Uso pessoal/empresarial. Ajuste conforme sua necessidade.

Se tiver dúvida, abre uma issue ou chama no email ryan@dmtn.com.br. ;
