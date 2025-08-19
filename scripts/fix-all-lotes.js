import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function fixAllLotes() {
  try {
    console.log('🔍 Verificando todos os lotes...')
    
    // Buscar todos os lotes
    const lotes = await prisma.lote.findMany({
      select: {
        id: true,
        nome: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📋 Encontrados ${lotes.length} lotes:`)
    lotes.forEach(lote => {
      console.log(`   - ${lote.nome} (${lote.status})`)
    })
    
    // Verificar lotes sem status
    const lotesSemStatus = lotes.filter(lote => !lote.status || lote.status === '')
    
    if (lotesSemStatus.length > 0) {
      console.log(`\n⚠️  ${lotesSemStatus.length} lotes sem status, corrigindo...`)
      
      for (const lote of lotesSemStatus) {
        await prisma.lote.update({
          where: { id: lote.id },
          data: { status: 'INICIADO' }
        })
        console.log(`   ✅ ${lote.nome} → INICIADO`)
      }
    }
    
    // Verificar lotes com status incorreto
    const statusValidos = ['INICIADO', 'EM_ANDAMENTO', 'FINALIZADO']
    const lotesComStatusIncorreto = lotes.filter(lote => 
      lote.status && !statusValidos.includes(lote.status.toUpperCase())
    )
    
    if (lotesComStatusIncorreto.length > 0) {
      console.log(`\n⚠️  ${lotesComStatusIncorreto.length} lotes com status incorreto, corrigindo...`)
      
      for (const lote of lotesComStatusIncorreto) {
        await prisma.lote.update({
          where: { id: lote.id },
          data: { status: 'INICIADO' }
        })
        console.log(`   ✅ ${lote.nome} (${lote.status}) → INICIADO`)
      }
    }
    
    console.log('\n✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAllLotes()
