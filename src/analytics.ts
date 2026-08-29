import type { CartLine, InventoryItem, Order } from './types'

export const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export const number = new Intl.NumberFormat('en-IN')

export function availableStock(item: InventoryItem) {
  return Math.max(item.quantity - item.reserved, 0)
}

export function runoutDays(item: InventoryItem) {
  const dailyDemand = item.forecast30d / 30
  if (dailyDemand <= 0) return 999
  return Math.floor(availableStock(item) / dailyDemand)
}

export function daysUntil(date: string) {
  const today = new Date('2026-08-29T00:00:00+05:30')
  const target = new Date(`${date}T00:00:00+05:30`)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

export function recommendedOrderQty(item: InventoryItem) {
  const target = item.forecast30d + item.safetyStock
  return Math.max(target - availableStock(item), 0)
}

export function statusClass(status: string) {
  return status.toLowerCase().replaceAll(' ', '-')
}

export function orderProgress(status: Order['status']) {
  const steps: Order['status'][] = ['Draft', 'Submitted', 'Approved', 'Dispatched', 'In Transit', 'Quality Check', 'Delivered']
  return ((steps.indexOf(status) + 1) / steps.length) * 100
}

export function cartTotal(lines: CartLine[], items: InventoryItem[]) {
  return lines.reduce((total, line) => {
    const item = items.find((candidate) => candidate.id === line.itemId)
    return total + (item ? line.quantity * item.unitCost : 0)
  }, 0)
}

export function stockHealthScore(items: InventoryItem[]) {
  if (items.length === 0) return 0
  const score = items.reduce((sum, item) => {
    const coverage = Math.min(runoutDays(item) / 45, 1) * 45
    const compliance = item.complianceScore * 0.35
    const freshness = Math.min(daysUntil(item.expiry) / 180, 1) * 20
    return sum + coverage + compliance + freshness
  }, 0)
  return Math.round(score / items.length)
}

export function serviceLevel(orders: Order[]) {
  if (orders.length === 0) return 0
  const weighted = orders.reduce((sum, order) => {
    if (order.status === 'Delivered') return sum + 100
    if (order.risk === 'Low') return sum + 88
    if (order.risk === 'Medium') return sum + 72
    return sum + 48
  }, 0)
  return Math.round(weighted / orders.length)
}

export function calculateWastageRisk(items: InventoryItem[]) {
  const riskUnits = items
    .filter((item) => daysUntil(item.expiry) < 90)
    .reduce((sum, item) => sum + availableStock(item), 0)

  const totalUnits = items.reduce((sum, item) => sum + availableStock(item), 0)
  return totalUnits === 0 ? 0 : Math.round((riskUnits / totalUnits) * 100)
}
