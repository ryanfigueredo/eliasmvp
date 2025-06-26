import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id || typeof token.id !== 'string') {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const agrupadorId = searchParams.get('agrupadorId')

  try {
    if (id) {
      const documento = await prisma.document.delete({
        where: { id },
      })

      await prisma.log.create({
        data: {
          userId: token.id,
          acao: 'EXCLUSÃO DE DOCUMENTO',
          detalhes: `Excluiu o documento ${documento.fileUrl}`,
        },
      })

      return NextResponse.json(
        { message: 'Documento excluído com sucesso.' },
        { status: 200 },
      )
    }

    if (agrupadorId) {
      const documentos = await prisma.document.findMany({
        where: { agrupadorId },
      })

      if (documentos.length === 0) {
        return NextResponse.json(
          { message: 'Nenhum documento encontrado para o grupo.' },
          { status: 404 },
        )
      }

      await prisma.document.deleteMany({
        where: { agrupadorId },
      })

      await prisma.log.create({
        data: {
          userId: token.id,
          acao: 'EXCLUSÃO EM LOTE',
          detalhes: `Excluiu ${documentos.length} documentos do grupo ${agrupadorId}`,
        },
      })

      return NextResponse.json(
        { message: 'Documentos do grupo excluídos com sucesso.' },
        { status: 200 },
      )
    }

    return NextResponse.json(
      { message: 'ID ou agrupadorId é obrigatório.' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Erro ao excluir documentos:', error)
    return NextResponse.json(
      { message: 'Erro interno ao excluir.' },
      { status: 500 },
    )
  }
}
