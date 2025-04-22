const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const master = await prisma.user.upsert({
    where: { email: 'ryan@dmtn.com.br' },
    update: {},
    create: {
      name: 'Ryan DMTN',
      email: 'ryan@dmtn.com.br',
      cpf: '2132131323',
      password: hashedPassword,
      role: 'master',
      status: 'aprovado',
    },
  })

  console.log('✅ Usuário Master criado com sucesso:', master)
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
