'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ClienteAutocomplete({
  selected,
  onSelect,
}: {
  selected: { id: string; nome: string } | null
  onSelect: (cliente: { id: string; nome: string }) => void
}) {
  const [input, setInput] = useState('')
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (input.length < 2) {
        setClientes([])
        setShowDropdown(false)
        return
      }

      const res = await fetch(`/api/clientes/filtro-busca?query=${input}`)
      const data = await res.json()
      setClientes(data)
      setShowDropdown(true)
    }, 300)

    return () => clearTimeout(delay)
  }, [input])

  return (
    <>
      <input type="hidden" name="clienteId" value={selected?.id || ''} />
      <Command className="border rounded-md">
        <CommandInput
          value={input}
          onValueChange={setInput}
          placeholder="Buscar cliente..."
          className="h-10  [&_svg]:hidden"
        />
        {showDropdown && clientes.length > 0 && (
          <CommandGroup>
            {clientes.map((c) => (
              <CommandItem
                key={c.id}
                value={c.nome}
                onSelect={() => {
                  onSelect(c)
                  setInput(c.nome)
                  setShowDropdown(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected?.id === c.id ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {c.nome}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {showDropdown && clientes.length === 0 && (
          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
        )}
      </Command>
    </>
  )
}
