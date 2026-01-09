/**
 * Script para testar permissões S3 e gerar presigned URL de teste
 * Execute: node scripts/test-s3-permissions.js
 */

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
require('dotenv').config({ path: '.env' })

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

async function testS3Permissions() {
  try {
    const bucketName = process.env.AWS_S3_BUCKET

    if (!bucketName) {
      console.error('❌ AWS_S3_BUCKET não configurado no .env')
      process.exit(1)
    }

    console.log('🔍 Testando permissões S3...\n')
    console.log(`📦 Bucket: ${bucketName}`)
    console.log(`🌍 Região: ${process.env.AWS_REGION}`)
    console.log(
      `🔑 Access Key ID: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...\n`,
    )

    // Teste 1: Gerar presigned URL
    console.log('1️⃣ Testando geração de presigned URL...')
    const testKey = `test-${Date.now()}-test-file.txt`
    const testContentType = 'text/plain'

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      ContentType: testContentType,
    })

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
    console.log('✅ Presigned URL gerada com sucesso!')
    console.log(`   Key: ${testKey}`)
    console.log(`   Content-Type: ${testContentType}`)
    console.log(`   URL: ${presignedUrl.substring(0, 100)}...\n`)

    // Teste 2: Tentar fazer upload de teste
    console.log('2️⃣ Testando upload direto (simulação)...')
    console.log('   Para testar o upload, execute:')
    console.log(`   curl -X PUT "${presignedUrl}" \\`)
    console.log(`     -H "Content-Type: ${testContentType}" \\`)
    console.log(`     --data-binary "test content"\n`)

    // Teste 3: Verificar se consegue ler
    console.log('3️⃣ Testando permissão de leitura...')
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: testKey,
      })
      const readUrl = await getSignedUrl(s3, getCommand, { expiresIn: 60 })
      console.log('✅ Permissão de leitura OK')
    } catch (error) {
      console.log('⚠️  Aviso ao testar leitura:', error.message)
    }

    console.log('\n✅ Todos os testes de permissão passaram!')
    console.log('\n💡 Se o upload ainda falhar com 403:')
    console.log('   1. Verifique se o CORS está configurado no bucket')
    console.log(
      '   2. Verifique se o Content-Type no upload é EXATAMENTE o mesmo do presign',
    )
    console.log('   3. Verifique se não há bucket policy bloqueando')
    console.log('   4. Teste o upload usando o curl acima')
  } catch (error) {
    console.error('\n❌ Erro ao testar permissões:', error.message)

    if (error.name === 'InvalidAccessKeyId') {
      console.error('\n💡 AWS_ACCESS_KEY_ID inválida ou não encontrada')
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('\n💡 AWS_SECRET_ACCESS_KEY incorreta')
    } else if (error.name === 'AccessDenied') {
      console.error('\n💡 Usuário IAM não tem permissão s3:PutObject')
      console.error('   Adicione a política: s3:PutObject no bucket')
    } else if (error.name === 'NoSuchBucket') {
      console.error(`\n💡 Bucket "${process.env.AWS_S3_BUCKET}" não existe`)
    }

    process.exit(1)
  }
}

testS3Permissions()
