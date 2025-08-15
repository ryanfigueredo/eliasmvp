// Script para testar variáveis de ambiente
console.log('🔧 Testando variáveis de ambiente...')

const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
]

const missingVars = []

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName)
    console.log(`❌ ${varName}: Não configurado`)
  } else {
    console.log(`✅ ${varName}: Configurado`)
  }
}

if (missingVars.length > 0) {
  console.log('\n❌ Variáveis de ambiente faltando:', missingVars.join(', '))
  console.log('💡 Configure essas variáveis no arquivo .env.local')
} else {
  console.log('\n✅ Todas as variáveis de ambiente estão configuradas!')
}
