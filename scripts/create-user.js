const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser() {
  const email = 'ryan@dmtn.com.br'
  const plainPassword = '123456'
  const hash = await bcrypt.hash(plainPassword, 10)

  try {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      console.log('⚠️ Usuário já existe. Atualizando senha...')

      // Atualizar senha e garantir que é master
      const updated = await prisma.user.update({
        where: { email },
        data: {
          password: hash,
          role: 'master',
          status: 'aprovado',
        },
      })

      console.log('✅ Usuário atualizado com sucesso!')
      console.log('📧 Email:', email)
      console.log('🔑 Senha:', plainPassword)
      console.log('🆔 ID:', updated.id)
      return
    }

    // Gerar CPF único
    const existingCpf = await prisma.user.findMany({
      select: { cpf: true },
    })
    const usedCpfs = new Set(existingCpf.map((u) => u.cpf))
    let cpf = '00000000001'
    let counter = 1
    while (usedCpfs.has(cpf)) {
      counter++
      cpf = String(counter).padStart(11, '0')
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name: 'Ryan',
        cpf,
        role: 'master',
        status: 'aprovado',
      },
    })

    console.log('✅ Usuário master criado com sucesso!')
    console.log('📧 Email:', email)
    console.log('🔑 Senha:', plainPassword)
    console.log('🆔 ID:', user.id)
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
