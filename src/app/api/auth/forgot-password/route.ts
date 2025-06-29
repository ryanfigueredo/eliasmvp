import { prisma } from '@/lib/prisma'
import { addHours } from 'date-fns'
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json(
      { message: 'Email é obrigatório.' },
      { status: 400 },
    )
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      )
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = addHours(new Date(), 1)

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    })

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Recuperação de Senha - Sistema Elias',
      html: `
        <p>Olá ${user.name},</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para continuar:</p>
        <a href="${resetLink}" target="_blank">Redefinir Senha</a>
        <p>Se você não solicitou essa mudança, por favor, ignore este e-mail.</p>
      `,
    })

    return NextResponse.json({ message: 'Link de redefinição enviado!' })
  } catch (error) {
    console.error('[FORGOT_PASSWORD]', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    )
  }
}
