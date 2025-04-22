'use client'

import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query

  const [password, setPassword] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      headers: { 'Content-Type': 'application/json' },
    })

    setIsPending(false)

    if (res.ok) {
      toast.success('Senha atualizada com sucesso!')
      router.push('/login')
    } else {
      toast.error('Erro ao atualizar a senha.')
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Redefinir Senha
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            placeholder="Nova senha"
            className="w-full px-4 py-2 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md"
          disabled={isPending}
        >
          {isPending ? 'Redefinindo...' : 'Redefinir Senha'}
        </button>
      </form>
    </div>
  )
}
