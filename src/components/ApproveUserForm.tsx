'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

export default function ApproveUserForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = async () => {
    startTransition(async () => {
      const res = await fetch('/api/approve-user', {
        method: 'POST',
        body: JSON.stringify({ id: userId }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        toast.success('Usuário aprovado com sucesso!')
        window.location.reload()
      } else {
        toast.error('Erro ao aprovar usuário.')
      }
    })
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
    >
      {isPending ? 'Aprovando...' : 'Aprovar'}
    </button>
  )
}
