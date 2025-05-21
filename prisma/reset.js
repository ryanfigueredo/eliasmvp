const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Resetando banco de dados...')

  await prisma.document.deleteMany()
  await prisma.documentoCliente.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.lote.deleteMany()
  await prisma.log.deleteMany()
  await prisma.user.deleteMany()

  console.log('Banco de dados zerado.')
}

main()
  .catch((e) => {
    console.error('Erro ao resetar o banco:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
