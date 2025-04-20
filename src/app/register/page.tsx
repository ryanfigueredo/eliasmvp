
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async () => {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, cpf, password }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      toast.success('Cadastro enviado com sucesso! Aguardando aprovação.')
    } else {
      toast.error('Erro ao cadastrar usuário.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Cadastro</h1>

        <Input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
        <Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <Button onClick={handleRegister} className="w-full bg-[#9C66FF]">
          Cadastrar
        </Button>
      </div>
    </div>
  )
}
