import { S3Client, GetBucketCorsCommand } from '@aws-sdk/client-s3'
import { config } from 'dotenv'

// Carregar variáveis de ambiente do .env.local
config({ path: '.env.local' })

console.log('🔧 Variáveis de ambiente:')
console.log('AWS_REGION:', process.env.AWS_REGION)
console.log(
  'AWS_ACCESS_KEY_ID:',
  process.env.AWS_ACCESS_KEY_ID ? 'Configurado' : 'Não configurado',
)
console.log(
  'AWS_SECRET_ACCESS_KEY:',
  process.env.AWS_SECRET_ACCESS_KEY ? 'Configurado' : 'Não configurado',
)
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET)

if (!process.env.AWS_S3_BUCKET) {
  console.error('❌ AWS_S3_BUCKET não configurado!')
  process.exit(1)
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

async function testCORS() {
  try {
    console.log('🔍 Verificando configuração CORS atual...')

    const command = new GetBucketCorsCommand({
      Bucket: process.env.AWS_S3_BUCKET,
    })

    const response = await s3.send(command)
    console.log('✅ Configuração CORS atual:')
    console.log(JSON.stringify(response.CORSConfiguration, null, 2))

    // Verificar se as origens estão corretas
    const allowedOrigins =
      response.CORSConfiguration?.CORSRules?.[0]?.AllowedOrigins || []
    console.log('\n🌐 Origens permitidas:', allowedOrigins)

    const expectedOrigins = [
      'https://evansproc.evansolucoes.com.br',
      'http://localhost:3000',
      'https://elias.vercel.app',
    ]

    const missingOrigins = expectedOrigins.filter(
      (origin) => !allowedOrigins.includes(origin),
    )
    if (missingOrigins.length > 0) {
      console.log('❌ Origens faltando:', missingOrigins)
      console.log('💡 Execute: npm run s3:configure-cors')
    } else {
      console.log('✅ Todas as origens necessárias estão configuradas!')
    }
  } catch (error) {
    console.error('❌ Erro ao verificar CORS:', error)
    if (error.name === 'NoSuchCORSConfiguration') {
      console.log('💡 CORS não configurado. Execute: npm run s3:configure-cors')
    }
  }
}

testCORS()
