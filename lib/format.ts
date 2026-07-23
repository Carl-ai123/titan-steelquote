/**
 * Formatting utilities for Titan SteelQuote
 */

/**
 * Return an ISO date string offset by `days` from today.
 * Positive = future, negative = past.
 */
export function offsetDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/** Format a number as GBP currency, e.g. £485,000 */
export function formatGBP(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value)
}

/** Format a number as a percentage string, e.g. "14.5%" */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/** Format a date string (ISO) as UK date, e.g. "28 Jul 2025" */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Format a date string as short UK date, e.g. "28/07/2025" */
export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB')
}

/** Calculate days from now (negative = overdue) */
export function daysFromNow(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

/** Format weight in kg, converting to tonnes when >= 1000 */
export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)}t`
  }
  return `${kg.toFixed(0)} kg`
}

/** Format a number with thousand separators */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value)
}
