import type { LucideIcon } from 'lucide-react'

export type Role = 'Command Center' | 'Hospital' | 'Vendor' | 'Distributor'

export type InventoryStatus =
  | 'Healthy'
  | 'Reorder'
  | 'Critical'
  | 'Expiry Watch'
  | 'Cold Chain Alert'

export type OrderStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Dispatched'
  | 'In Transit'
  | 'Quality Check'
  | 'Delivered'

export type TemperatureBand = 'Ambient' | '2-8C' | '-20C'

export interface InventoryItem {
  id: string
  name: string
  genericName: string
  category: string
  batch: string
  vendor: string
  manufacturer: string
  warehouse: string
  state: string
  quantity: number
  reserved: number
  reorderPoint: number
  safetyStock: number
  forecast30d: number
  leadTimeDays: number
  unitCost: number
  mrp: number
  expiry: string
  temperatureBand: TemperatureBand
  temperatureNow: number
  complianceScore: number
  status: InventoryStatus
  consumption: number[]
}

export interface TimelineEvent {
  label: string
  at: string
  done: boolean
}

export interface Order {
  id: string
  buyer: string
  seller: string
  drug: string
  quantity: number
  value: number
  status: OrderStatus
  eta: string
  source: string
  destination: string
  temperatureBand: TemperatureBand
  risk: 'Low' | 'Medium' | 'High'
  timeline: TimelineEvent[]
}

export interface Vendor {
  id: string
  name: string
  license: string
  state: string
  reliability: number
  fillRate: number
  avgLeadTime: number
  qualityScore: number
  activeBatches: number
}

export interface Alert {
  id: string
  title: string
  detail: string
  severity: 'Info' | 'Warning' | 'Critical'
  owner: Role
  createdAt: string
}

export interface ForecastPoint {
  month: string
  essential: number
  chronic: number
  emergency: number
  predictedDemand: number
  actualDemand: number
}

export interface WorkflowStep {
  title: string
  description: string
  icon: LucideIcon
}

export interface CartLine {
  itemId: string
  quantity: number
}
