import { Resend } from 'resend'

// Inicializa Resend apenas se a API key estiver disponível
export const resend: Resend | null = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null
