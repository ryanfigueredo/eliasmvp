import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'
import { resend } from '@/lib/resend'
import { addHours } from 'date-fns'
import crypto from 'crypto'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body

  // Verifica se o email foi fornecido
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' })
  }

  try {
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }

    // Gera um token único para a redefinição de senha
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = addHours(new Date(), 1) // Token válido por 1 hora

    // Salva o token e a data de expiração no banco de dados
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Cria o link de recuperação
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    // Envia o e-mail via Resend
    await resend.emails.send({
      from: 'no-reply@elias.com',
      to: email,
      subject: 'Recuperação de Senha - Sistema Elias',
      html: `<p>Olá ${user.name},</p>
             <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para continuar:</p>
             <a href="${resetLink}" target="_blank">Redefinir Senha</a>
             <p>Se você não solicitou essa mudança, por favor, ignore este e-mail.</p>`,
    })

    return res.status(200).json({ message: 'Link de redefinição enviado!' })
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}
