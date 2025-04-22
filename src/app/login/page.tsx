'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const result = await signIn('credentials', {
      redirect: false,
      cpf,
      email,
      password,
    })

    if (result?.ok) {
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard/master')
    } else {
      toast.error('Erro ao fazer login. Verifique suas credenciais.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-[#333]">Login</h1>

        <div className="space-y-2">
          <Input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a
            href="/auth/forgot-password"
            className="text-[#9C66FF] hover:underline text-[12px] font-medium"
          >
            Esqueci minha senha
          </a>
        </div>

        <Button
          onClick={handleLogin}
          className="w-full bg-[#9C66FF] text-white hover:bg-[#8450e6]"
        >
          Entrar
        </Button>

        <p className="text-center text-sm mt-4">
          Ainda não tem conta?{' '}
          <Link
            href="/register"
            className="text-[#9C66FF] hover:underline font-medium"
          >
            Cadastre-se aqui
          </Link>
        </p>

        <div className="mt-4 text-center"></div>
      </div>
    </div>
  )
}
