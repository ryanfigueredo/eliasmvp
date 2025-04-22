'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    })

    setIsPending(false)

    if (res.ok) {
      toast.success('Link de redefinição enviado para o e-mail!')
    } else {
      toast.error('Erro ao enviar link de redefinição.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-[#333]">
          Recuperação de Senha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Digite seu e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#9C66FF] text-white hover:bg-[#8450e6]"
            disabled={isPending}
          >
            {isPending ? 'Enviando...' : 'Enviar link'}
          </Button>
        </form>

        <p className="text-center text-sm mt-4">
          Já lembrou da senha?{' '}
          <a
            href="/login"
            className="text-[#9C66FF] hover:underline font-medium"
          >
            Voltar ao login
          </a>
        </p>
      </div>
    </div>
  )
}
