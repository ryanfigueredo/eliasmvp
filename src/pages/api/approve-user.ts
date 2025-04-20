import { prisma } from "@/lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const { id } = req.body

  if (!id) return res.status(400).json({ message: "ID inválido." })

  try {
    await prisma.user.update({
      where: { id },
      data: { status: "aprovado" },
    })

    return res.status(200).json({ message: "Usuário aprovado." })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Erro ao aprovar usuário." })
  }
}
