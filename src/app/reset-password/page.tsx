'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Token inválido.')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirm) {
      toast.error('As senhas não coincidem.')
      return
    }

    setIsPending(true)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      headers: { 'Content-Type': 'application/json' },
    })

    setIsPending(false)

    if (res.ok) {
      toast.success('Senha redefinida com sucesso!')
      router.push('/login')
    } else {
      const data = await res.json()
      toast.error(data.message || 'Erro ao redefinir a senha.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-[#333]">
          Nova Senha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nova senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            placeholder="Confirmar nova senha"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <Button
            type="submit"
            className="w-full bg-[#9C66FF] text-white hover:bg-[#8450e6]"
            disabled={isPending}
          >
            {isPending ? 'Enviando...' : 'Redefinir senha'}
          </Button>
        </form>
      </div>
    </div>
  )
}
