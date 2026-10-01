import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string) {
  const exact = typeof value === 'string'
    ? /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(value)
    : null
  const numericValue = exact
    ? Number(BigInt(exact[2]) * 100n + BigInt((exact[3] ?? '').padEnd(2, '0') || '0')) / 100 * (exact[1] ? -1 : 1)
    : Number(value)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue)
}

export function normalizeMoneyInput(value: string) {
  const match = /^(\d{1,10})(?:\.(\d{0,2}))?$/.exec(value.trim())
  if (!match) return value
  return `${match[1]}.${(match[2] ?? '').padEnd(2, '0')}`
}

export function dateInputToUtc(value: string) {
  return `${value}T00:00:00.000Z`
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))
}
