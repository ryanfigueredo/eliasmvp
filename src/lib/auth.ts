import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const prisma = new PrismaClient()

import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string
      role: string
      image?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    image?: string
  }

  interface JWT {
    id: string
    role: string
    image?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as any

        const user = await prisma.user.findUnique({ where: { email } })

        console.log('[AUTH] email:', email)
        console.log('[AUTH] user:', user)

        if (!user) return null
        if (user.status !== 'aprovado') {
          console.log('[AUTH] Usuário com status não aprovado:', user.status)
          return null
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        console.log('[AUTH] bcrypt.compare:', isPasswordCorrect)

        if (!isPasswordCorrect) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image ?? undefined,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.image = user.image
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.image = token.image as string
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
