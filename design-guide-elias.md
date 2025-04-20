
# 🎨 Design Guide – Sistema Elias

## 🟦 1. Paleta de Cores

| Elemento         | Cor         | Classe Tailwind                     |
|------------------|-------------|-------------------------------------|
| **Primária**     | #333333     | `bg-[#333333]` ou `text-[#333333]` |
| **Secundária**   | #9C66FF     | `bg-[#9C66FF]` ou `text-[#9C66FF]` |
| **Sucesso**      | #22C55E     | `text-green-500`                    |
| **Aviso**        | #FACC15     | `text-yellow-400`                   |
| **Erro**         | #EF4444     | `text-red-500`                      |
| **Plano de fundo** | #F9FAFB   | `bg-gray-50`                        |

---

## 🔠 2. Tipografia

- **Fonte Base**: Inter, sans-serif (padrão do Shadcn)
- **Tamanhos recomendados**:
  - `text-xl font-bold`: títulos de cards
  - `text-sm text-muted-foreground`: textos auxiliares
  - `text-base`: conteúdo normal

---

## 📦 3. Componentes Padrão (Shadcn)

### ✅ Botão primário
```tsx
<Button className="bg-[#9C66FF] text-white hover:bg-[#8450e6]">Salvar</Button>
```

### ✅ Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Status de Baixas</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Tabela ou conteúdo */}
  </CardContent>
</Card>
```

### ✅ Tabela (Exemplo inicial)
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>CPF/CNPJ</TableHead>
      <TableHead>CENPROT</TableHead>
      <TableHead>SPC</TableHead>
      <TableHead>SERASA</TableHead>
      <TableHead>BOA VISTA</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Mario Sérgio</TableCell>
      <TableCell>***</TableCell>
      <TableCell>Baixado 12/04</TableCell>
      <TableCell>Baixado 12/04</TableCell>
      <TableCell>?</TableCell>
      <TableCell>Baixado 12/04</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-yellow-400 border-yellow-400">Parcial</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🚦 4. Faróis de Status (Componentes)

| Status       | Cor Tailwind         | Exibição UI                    |
|--------------|----------------------|--------------------------------|
| Iniciado     | `bg-yellow-400`      | 🟡 Badge “Iniciado”            |
| Em Andamento | `bg-blue-500`        | 🔵 Badge “Em andamento”        |
| Finalizado   | `bg-green-500`       | 🟢 Badge “Finalizado”          |

```tsx
<Badge className="bg-yellow-400 text-white">Iniciado</Badge>
```

---

## ⌨️ 5. Layout Base

```tsx
<div className="min-h-screen bg-gray-50 p-6">
  <h1 className="text-2xl font-bold mb-4">Dashboard Master</h1>
  {/* Conteúdo principal */}
</div>
```
