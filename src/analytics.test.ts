import { describe, expect, it } from 'vitest'
import {
  availableStock,
  calculateWastageRisk,
  recommendedOrderQty,
  runoutDays,
  serviceLevel,
  stockHealthScore,
} from './analytics'
import { inventory, orders } from './data'

describe('inventory analytics', () => {
  it('calculates available stock after reservations', () => {
    const ceftriaxone = inventory.find((item) => item.id === 'MED-CEF-1G')

    expect(ceftriaxone).toBeDefined()
    expect(availableStock(ceftriaxone!)).toBe(3440)
  })

  it('projects runout days from 30 day demand', () => {
    const insulin = inventory.find((item) => item.id === 'MED-INS-RAP')

    expect(insulin).toBeDefined()
    expect(runoutDays(insulin!)).toBe(10)
  })

  it('recommends replenishment up to forecast plus safety stock', () => {
    const ceftriaxone = inventory.find((item) => item.id === 'MED-CEF-1G')

    expect(ceftriaxone).toBeDefined()
    expect(recommendedOrderQty(ceftriaxone!)).toBe(6060)
  })

  it('produces portfolio level operating scores', () => {
    expect(stockHealthScore(inventory)).toBeGreaterThanOrEqual(70)
    expect(calculateWastageRisk(inventory)).toBeGreaterThan(0)
    expect(serviceLevel(orders)).toBe(87)
  })
})
