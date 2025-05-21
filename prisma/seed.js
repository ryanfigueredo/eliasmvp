const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const users = [
    {
      name: 'Master Elias',
      email: 'master@elias.com',
      cpf: '00000000000',
      password: 'Master@123',
      role: 'master',
      status: 'aprovado',
    },
    {
      name: 'Admin Elias',
      email: 'admin@elias.com',
      cpf: '11111111111',
      password: 'Admin@123',
      role: 'admin',
      status: 'aprovado',
    },
    {
      name: 'Consultor Elias',
      email: 'consultor@elias.com',
      cpf: '22222222222',
      password: 'Consultor@123',
      role: 'consultor',
      status: 'aprovado',
    },
    {
      name: 'White Label Elias',
      email: 'whitelabel@elias.com',
      cpf: '33333333333',
      password: 'White@123',
      role: 'white-label',
      status: 'aprovado',
    },
  ]

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10)
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        password: hashed,
        role: user.role,
        status: user.status,
        adminId: user.role === 'consultor' ? undefined : null,
      },
    })
  }

  console.log('✅ Usuários criados com sucesso.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
