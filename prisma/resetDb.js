const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.documentoCliente.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧼 Banco de dados limpo com sucesso.')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao limpar o banco:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
