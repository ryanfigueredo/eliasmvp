import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function fixLoteStatus() {
  try {
    console.log('🔍 Procurando lote "Segunda"...')
    
    // Buscar o lote pelo nome
    const lote = await prisma.lote.findFirst({
      where: {
        nome: {
          contains: 'Segunda',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nome: true,
        status: true
      }
    })

    if (!lote) {
      console.log('❌ Lote "Segunda" não encontrado')
      console.log('📋 Lotes disponíveis:')
      const todosLotes = await prisma.lote.findMany({
        select: { id: true, nome: true, status: true }
      })
      todosLotes.forEach(l => console.log(`   - ${l.nome} (${l.status})`))
      return
    }

    console.log('📋 Lote encontrado:', lote)
    console.log('🔄 Alterando status para INICIADO...')

    const loteAtualizado = await prisma.lote.update({
      where: { id: lote.id },
      data: { status: 'INICIADO' },
      select: { id: true, nome: true, status: true }
    })

    console.log('✅ Status alterado com sucesso:', loteAtualizado)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixLoteStatus()
