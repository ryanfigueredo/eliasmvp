/**
 * Script para configurar CORS no bucket S3
 * Execute: node scripts/configure-s3-cors.js
 */

const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3')
require('dotenv').config({ path: '.env.local' })

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

async function configureCORS() {
  try {
    const bucketName = process.env.AWS_S3_BUCKET

    if (!bucketName) {
      console.error('❌ AWS_S3_BUCKET não configurado no .env.local')
      process.exit(1)
    }

    console.log(`🔧 Configurando CORS para o bucket: ${bucketName}`)

    // Configuração CORS que permite uploads diretos de qualquer origem
    // Em produção, você pode restringir para domínios específicos
    const corsConfig = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'], // Em produção, substitua por ['https://evansproc.evansolucoes.com.br']
            ExposeHeaders: ['ETag', 'x-amz-server-side-encryption', 'x-amz-request-id', 'x-amz-id-2'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }

    await s3.send(new PutBucketCorsCommand(corsConfig))

    console.log('✅ CORS configurado com sucesso!')
    console.log('\n📝 Nota: Em produção, considere restringir AllowedOrigins para:')
    console.log('   - https://evansproc.evansolucoes.com.br')
    console.log('   - https://eliasmvp-*.vercel.app (para previews)')
  } catch (error) {
    console.error('❌ Erro ao configurar CORS:', error.message)
    if (error.name === 'AccessDenied') {
      console.error('\n💡 Verifique se o usuário IAM tem permissão: s3:PutBucketCors')
    }
    process.exit(1)
  }
}

configureCORS()

