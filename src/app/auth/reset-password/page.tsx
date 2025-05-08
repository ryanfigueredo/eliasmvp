'use client'

import { Suspense } from 'react'
import ResetPasswordForm from '@/components/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center py-10">Carregando...</p>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
