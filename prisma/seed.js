const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const lotes = [
    {
      nome: 'Lote 05-09 Maio',
      inicio: new Date('2025-05-05T00:00:00'),
      fim: new Date('2025-05-09T17:00:00'),
    },
    {
      nome: 'Lote 12-16 Maio',
      inicio: new Date('2025-05-12T00:00:00'),
      fim: new Date('2025-05-16T17:00:00'),
    },
  ]

  for (const lote of lotes) {
    const createdLote = await prisma.lote.upsert({
      where: { nome: lote.nome },
      update: {},
      create: lote,
    })
    console.log(`✅ Lote criado: ${createdLote.nome}`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
