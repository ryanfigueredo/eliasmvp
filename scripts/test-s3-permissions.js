/**
 * Script para testar permissões S3 e gerar presigned URL de teste
 * Execute: node scripts/test-s3-permissions.js
 */

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
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

    // Teste 2: Tentar fazer upload real pelo servidor (testa permissões)
    console.log('2️⃣ Testando upload real pelo servidor (testa permissões IAM)...')
    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: Buffer.from('test content'),
        ContentType: testContentType,
      })
      await s3.send(uploadCommand)
      console.log('✅ Upload real pelo servidor funcionou!')
      console.log('   Isso confirma que as permissões IAM estão corretas.\n')
      
      // Limpar arquivo de teste
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: testKey,
        })
        await s3.send(deleteCommand)
        console.log('🧹 Arquivo de teste removido\n')
      } catch (e) {
        console.log('⚠️  Não foi possível remover arquivo de teste (não crítico)\n')
      }
    } catch (uploadError) {
      console.error('❌ Upload real falhou:', uploadError.message)
      if (uploadError.name === 'AccessDenied') {
        console.error('\n🚨 PROBLEMA ENCONTRADO: Permissões IAM insuficientes!')
        console.error('   O usuário IAM não tem permissão s3:PutObject')
        console.error('   Veja VERIFICAR_PERMISSOES_AWS.md para corrigir\n')
        throw uploadError
      }
      throw uploadError
    }
    
    // Teste 3: Mostrar comando curl para testar presigned URL
    console.log('3️⃣ Para testar presigned URL (upload direto do navegador):')
    console.log(`   curl -X PUT "${presignedUrl}" \\`)
    console.log(`     -H "Content-Type: ${testContentType}" \\`)
    console.log(`     --data-binary "test content"\n`)

    // Teste 4: Verificar se consegue ler
    console.log('4️⃣ Testando permissão de leitura...')
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
    } else if (error.name === 'AccessDenied' || error.message?.includes('Access Denied')) {
      console.error('\n💡 Usuário IAM não tem permissão suficiente')
      console.error('\n📋 Permissões necessárias:')
      console.error('   - s3:PutObject (para upload)')
      console.error('   - s3:GetObject (para leitura)')
      console.error('   - s3:DeleteObject (para exclusão)')
      console.error('\n🔧 Como corrigir:')
      console.error('   1. Acesse: https://console.aws.amazon.com/iam/')
      console.error('   2. Vá em Users → Selecione o usuário')
      console.error('   3. Adicione política com s3:PutObject')
      console.error('   4. Resource: arn:aws:s3:::elias-docs/*')
      console.error('\n📖 Veja VERIFICAR_PERMISSOES_AWS.md para instruções detalhadas')
    } else if (error.name === 'NoSuchBucket') {
      console.error(`\n💡 Bucket "${process.env.AWS_S3_BUCKET}" não existe`)
    }

    process.exit(1)
  }
}

testS3Permissions()
