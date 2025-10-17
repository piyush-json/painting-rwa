import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateProgress(sharesSold: number, totalShares: number) {
  return (sharesSold / totalShares) * 100
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function calculateSharesFromAmount(
  amount: number,
  pricePerShare: number
) {
  return Math.floor(amount / pricePerShare)
}

export function calculateAmountFromShares(
  shares: number,
  pricePerShare: number
) {
  return shares * pricePerShare
}
