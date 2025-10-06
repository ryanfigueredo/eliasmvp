require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.user.update({
    where: { email: 'ryan@elias.com' },
    data: { status: 'aprovado' },
  })
  console.log('✅ Status atualizado para: aprovado')
}

main()
  .catch((e) => console.error('❌ Erro:', e))
  .finally(() => prisma.$disconnect())
