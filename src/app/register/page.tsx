
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')

  const formatWhatsApp = (value: string) => {
    const raw = value.replace(/\D/g, '')
    let formatted = raw
    if (raw.length <= 11) {
      formatted = raw
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return formatted
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setWhatsapp(formatted)
  }

  const handleRegister = async () => {
    if (!name || !email || !cpf || !password) {
      toast.error('Todos os campos são obrigatórios.')
      return
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, cpf, whatsapp: whatsapp.replace(/\D/g, ''), password }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      toast.success('Cadastro enviado com sucesso! Aguardando aprovação.')
      // Limpar formulário
      setName('')
      setEmail('')
      setCpf('')
      setWhatsapp('')
      setPassword('')
    } else {
      const data = await res.json()
      toast.error(data.message || 'Erro ao cadastrar usuário.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Cadastro</h1>

        <Input 
          placeholder="Nome completo" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <Input 
          placeholder="CPF" 
          value={cpf} 
          onChange={(e) => setCpf(e.target.value)} 
        />
        <Input 
          placeholder="E-mail" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <Input 
          placeholder="WhatsApp (00) 00000-0000" 
          value={whatsapp} 
          onChange={handleWhatsAppChange} 
        />
        <Input 
          placeholder="Senha" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />

        <Button onClick={handleRegister} className="w-full">
          Cadastrar
        </Button>
      </div>
    </div>
  )
}
