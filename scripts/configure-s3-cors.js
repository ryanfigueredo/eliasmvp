import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'https://evansproc.evansolucoes.com.br',
        'http://localhost:3000',
        'https://elias.vercel.app'
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ],
}

async function configureCORS() {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      CORSConfiguration: corsConfig,
    })

    await s3.send(command)
    console.log('✅ CORS configurado com sucesso no bucket S3!')
  } catch (error) {
    console.error('❌ Erro ao configurar CORS:', error)
  }
}

configureCORS()
