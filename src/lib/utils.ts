import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A'
  return score.toFixed(1)
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US').format(num)
}

export function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" | "warning" {
  if (score >= 80) return 'default' // High score - green
  if (score >= 60) return 'warning' // Medium score - yellow
  if (score >= 40) return 'secondary' // Low-medium score - gray
  return 'destructive' // Low score - red
}

export function getScoreBadge(score: number): { variant: "default" | "secondary" | "destructive" | "outline" | "warning", label: string } {
  if (score >= 80) return { variant: 'default', label: 'Excellent' }
  if (score >= 60) return { variant: 'warning', label: 'Good' }
  if (score >= 40) return { variant: 'secondary', label: 'Fair' }
  return { variant: 'destructive', label: 'Poor' }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'SaaS': 'bg-blue-500',
    'E-commerce': 'bg-green-500',
    'Mobile App': 'bg-purple-500',
    'Web App': 'bg-orange-500',
    'AI/ML': 'bg-red-500',
    'Fintech': 'bg-yellow-500',
    'Health': 'bg-pink-500',
    'Education': 'bg-indigo-500',
    'default': 'bg-gray-500'
  }
  return colors[category] || colors.default
}