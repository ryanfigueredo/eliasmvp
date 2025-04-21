'use client'

import { toast } from 'sonner'
import { useTransition } from 'react'

type Props = {
  id: string
  role: string
}

export default function SelectRole({ id, role }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value

    startTransition(async () => {
      const res = await fetch('/api/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      })

      if (res.ok) {
        toast.success('Cargo atualizado com sucesso!')
      } else {
        toast.error('Erro ao atualizar cargo.')
      }
    })
  }

  return (
    <select
      name="role"
      defaultValue={role}
      className="border rounded px-2 py-1 text-sm"
      onChange={handleChange}
      disabled={isPending}
    >
      <option value="consultor">consultor</option>
      <option value="admin">admin</option>
      <option value="white-label">white-label</option>
      <option value="master" disabled>
        master
      </option>
    </select>
  )
}
