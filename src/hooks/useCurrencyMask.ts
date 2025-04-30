export function formatCurrency(value: string): string {
  const numeric = value.replace(/\D/g, '')
  const number = (parseInt(numeric, 10) / 100).toFixed(2)
  return 'R$ ' + number.replace('.', ',')
}
