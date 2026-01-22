// Currency formatting utility

export function formatCurrency(amount: number): string {
  return `R${amount.toLocaleString('en-ZA')}`;
}
