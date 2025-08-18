import { globby } from 'globby'
import fs from 'node:fs'
import path from 'node:path'

async function analyzeRoutes() {
  console.log('🔍 Analisando tamanho das rotas...\n')
  
  try {
    // Buscar arquivos de rota
    const routeFiles = await globby([
      'src/app/**/route.ts',
      'src/app/**/route.tsx',
      'src/pages/api/**/*.ts',
      'src/pages/api/**/*.tsx'
    ])
    
    if (routeFiles.length === 0) {
      console.log('❌ Nenhuma rota encontrada')
      return
    }
    
    const routeSizes = routeFiles.map(file => {
      const stats = fs.statSync(file)
      const sizeKB = (stats.size / 1024).toFixed(1)
      const relativePath = path.relative(process.cwd(), file)
      
      return {
        route: relativePath,
        sizeKB: parseFloat(sizeKB),
        method: getMethodFromPath(file)
      }
    }).sort((a, b) => b.sizeKB - a.sizeKB)
    
    console.log('📊 Top 10 maiores rotas:')
    console.table(routeSizes.slice(0, 10))
    
    const totalSize = routeSizes.reduce((sum, route) => sum + route.sizeKB, 0)
    console.log(`\n📈 Total: ${routeSizes.length} rotas, ${totalSize.toFixed(1)}KB`)
    
    // Identificar rotas potencialmente problemáticas
    const largeRoutes = routeSizes.filter(route => route.sizeKB > 10)
    if (largeRoutes.length > 0) {
      console.log('\n⚠️  Rotas grandes (>10KB):')
      largeRoutes.forEach(route => {
        console.log(`   - ${route.route} (${route.sizeKB}KB)`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao analisar rotas:', error.message)
  }
}

function getMethodFromPath(filePath) {
  if (filePath.includes('/api/')) {
    return 'API'
  }
  return 'PAGE'
}

analyzeRoutes()
