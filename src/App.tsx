import { useMemo, useState, useEffect, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
// Local aliases to avoid TypeScript peer-typing issues across React versions
const MotionDiv: any = motion.div
const MotionButton: any = motion.button

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
}

const itemHover = { scale: 1.02, y: -3 }

const ForecastArea = lazy(() => import('./components/charts/ForecastArea'))
const CategoryBarChart = lazy(() => import('./components/charts/CategoryBarChart'))
import clsx from 'clsx'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Factory,
  FileText,
  Filter,
  IndianRupee,
  LayoutDashboard,
  LineChart,
  LockKeyhole,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Thermometer,
  Truck,
  UserCheck,
  Warehouse,
} from 'lucide-react'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  availableStock,
  calculateWastageRisk,
  cartTotal,
  currency,
  daysUntil,
  number,
  orderProgress,
  recommendedOrderQty,
  runoutDays,
  serviceLevel,
  statusClass,
  stockHealthScore,
} from './analytics'
import { alerts, forecast, inventory, moduleTiles, orders, roles, vendors, workflow } from './data'
import Sparkline from './components/Sparkline'
import SimpleBars from './components/SimpleBars'
import type { CartLine, InventoryItem, Role } from './types'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'orders', label: 'Orders', icon: PackageCheck },
  { id: 'store', label: 'Store', icon: ShoppingCart },
  { id: 'forecasting', label: 'Forecasting', icon: LineChart },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'delivery', label: 'Delivery Plan', icon: ClipboardCheck },
] as const

type Section = (typeof navItems)[number]['id']

const rolePermissions: Record<Role, Section[]> = {
  'Command Center': navItems.map((n) => n.id),
  Hospital: ['overview', 'inventory', 'orders', 'store', 'forecasting'],
  Vendor: ['overview', 'inventory', 'orders', 'delivery'],
  Distributor: ['overview', 'inventory', 'orders', 'delivery'],
}

const statusOptions = ['All', 'Healthy', 'Reorder', 'Critical', 'Expiry Watch', 'Cold Chain Alert']

const roleCopy: Record<Role, string> = {
  'Command Center': 'National view for availability, risk, demand forecasting, and governance controls.',
  Hospital: 'Procurement workspace for stores, invoices, receiving, and medicine availability.',
  Vendor: 'Manufacturer and supplier workspace for batches, licenses, billing, and dispatch readiness.',
  Distributor: 'Regional fulfillment workspace for stock movement, received orders, dispatch, and SLA.',
}

import { useToast } from './components/ToastContext'

function App() {
  const [activeRole, setActiveRole] = useState<Role>('Command Center')
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [cart, setCart] = useState<CartLine[]>([
    { itemId: 'MED-CEF-1G', quantity: 1200 },
    { itemId: 'MED-INS-RAP', quantity: 120 },
  ])
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0].id)
  const [simulationCount, setSimulationCount] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const toastApi = useToast()
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setShowLoader(false), 700)
    return () => clearTimeout(t)
  }, [])

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesQuery = [item.name, item.genericName, item.vendor, item.batch, item.category, item.state]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter])

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0]
  const totalAvailable = inventory.reduce((sum, item) => sum + availableStock(item), 0)
  const atRiskItems = inventory.filter((item) => item.status !== 'Healthy').length
  const coldChainAlerts = inventory.filter((item) => item.status === 'Cold Chain Alert').length
  const cartValue = cartTotal(cart, inventory)
  const stockScore = stockHealthScore(inventory)
  const sla = serviceLevel(orders)
  const wastageRisk = calculateWastageRisk(inventory)

  function addToCart(item: InventoryItem, quantity = Math.min(200, availableStock(item))) {
    const canStore = activeRole === 'Hospital' || activeRole === 'Command Center'
    if (!canStore) {
      // Prevent non-store roles from adding items to procurement cart and show toast
      try {
        toastApi.show({ type: 'error', message: 'Action blocked — only Hospital or Command Center can add to procurement cart' })
      } catch (e) {
        setToast('Action blocked — only Hospital or Command Center can add to procurement cart')
        window.setTimeout(() => setToast(null), 3500)
      }
      return
    }

    setCart((current) => {
      const existing = current.find((line) => line.itemId === item.id)
      if (existing) {
        return current.map((line) =>
          line.itemId === item.id
            ? { ...line, quantity: Math.min(line.quantity + quantity, availableStock(item)) }
            : line,
        )
      }
      return [...current, { itemId: item.id, quantity }]
    })
    setActiveSection('store')
    try {
      toastApi.show({ type: 'success', message: 'Added to procurement cart' })
    } catch (e) {
      setToast('Added to procurement cart')
      window.setTimeout(() => setToast(null), 2500)
    }
  }

  useEffect(() => {
    const allowed = rolePermissions[activeRole] || ['overview']
    if (!allowed.includes(activeSection)) {
      setActiveSection(allowed[0])
    }
  }, [activeRole])

  function updateCartLine(itemId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((current) => current.filter((line) => line.itemId !== itemId))
      return
    }
    setCart((current) => current.map((line) => (line.itemId === itemId ? { ...line, quantity } : line)))
  }

  if (showLoader) {
    return (
      <MotionDiv className="app-shell app-loader" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
        <MotionDiv className="loader-card" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="brand-mark">L</div>
          <div style={{ marginLeft: 12 }}>
            <strong>Laksh MedChain</strong>
            <div style={{ color: 'var(--muted)' }}>Starting UI…</div>
          </div>
        </MotionDiv>
      </MotionDiv>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">L</div>
          <div>
            <strong>Laksh MedChain</strong>
            <span>SIH1627 · Team 161</span>
          </div>
        </div>

        <div className="role-panel">
          <span className="eyebrow">Workspace</span>
          <div className="role-grid" role="tablist" aria-label="Role selector">
            {roles.map((role) => (
              <MotionButton
                key={role}
                className={clsx('role-chip', activeRole === role && 'active')}
                onClick={() => setActiveRole(role)}
                type="button"
                whileHover={itemHover}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.18 }}
              >
                {role}
              </MotionButton>
            ))}
          </div>
          <p>{roleCopy[activeRole]}</p>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {navItems
            .filter((item) => rolePermissions[activeRole]?.includes(item.id))
            .map((item) => {
            const Icon = item.icon
            return (
              <MotionButton
                key={item.id}
                className={clsx('nav-item', activeSection === item.id && 'active')}
                onClick={() => setActiveSection(item.id)}
                type="button"
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.16 }}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </MotionButton>
            )
          })}
        </nav>

        <div className="security-card">
          <LockKeyhole size={18} aria-hidden="true" />
          <div>
            <strong>Security posture</strong>
            <span>RBAC, audit trails, batch traceability, and encrypted records planned for production.</span>
          </div>
        </div>
      </aside>

      <MotionDiv className="main" variants={pageVariants} initial="hidden" animate="visible">
        <header className="topbar">
          <div>
            <span className="eyebrow">Drug Inventory and Supply Chain Tracking System</span>
            <h1>Real-time medicine availability command center</h1>
          </div>
          <div className="topbar-actions">
            <MotionButton className="icon-button" type="button" title="Sync live data" onClick={() => setSimulationCount((c) => c + 1)} whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }}>
              <RefreshCw size={18} aria-hidden="true" />
            </MotionButton>
            <MotionButton className="icon-button" type="button" title="Notifications" whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }}>
              <Bell size={18} aria-hidden="true" />
            </MotionButton>
            <div className="profile-pill">
              <UserCheck size={16} aria-hidden="true" />
              <span>{activeRole}</span>
            </div>
          </div>
        </header>

        <div className="context-strip">
          <Metric icon={Package} label="Available units" value={number.format(totalAvailable + simulationCount * 27)} tone="blue" />
          <Metric icon={AlertTriangle} label="Items needing action" value={atRiskItems.toString()} tone="amber" />
          <Metric icon={Thermometer} label="Cold-chain alerts" value={coldChainAlerts.toString()} tone="red" />
          <Metric icon={BadgeCheck} label="Network service level" value={`${sla}%`} tone="green" />
        </div>

        {activeSection === 'overview' && (
          <Overview
            stockScore={stockScore}
            wastageRisk={wastageRisk}
            cartValue={cartValue}
            onNavigate={setActiveSection}
            addToCart={addToCart}
          />
        )}
        {activeSection === 'inventory' && (
          <InventoryView
            items={filteredInventory}
            query={query}
            statusFilter={statusFilter}
            onQueryChange={setQuery}
            onStatusChange={setStatusFilter}
            onAddToCart={addToCart}
          />
        )}
        {activeSection === 'orders' && (
          <OrdersView selectedOrderId={selectedOrder.id} onSelect={setSelectedOrderId} selectedOrder={selectedOrder} />
        )}
        {activeSection === 'store' && (
          <StoreView cart={cart} onUpdateLine={updateCartLine} onAddToCart={addToCart} cartValue={cartValue} />
        )}
        {activeSection === 'forecasting' && <ForecastingView />}
        {activeSection === 'compliance' && <ComplianceView />}
        {activeSection === 'delivery' && <DeliveryPlanView />}
      </MotionDiv>
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  )
}

interface MetricProps {
  icon: typeof Package
  label: string
  value: string
  tone: 'blue' | 'green' | 'amber' | 'red'
}

function Metric({ icon: Icon, label, value, tone }: MetricProps) {
  return (
    <MotionDiv
      className={clsx('metric-card', tone)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Icon size={20} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </MotionDiv>
  )
}

function Overview({
  stockScore,
  wastageRisk,
  cartValue,
  onNavigate,
  addToCart,
}: {
  stockScore: number
  wastageRisk: number
  cartValue: number
  onNavigate: (section: Section) => void
  addToCart: (item: InventoryItem) => void
}) {
  const allocationQueue = inventory
    .map((item) => ({ ...item, recommended: recommendedOrderQty(item), days: runoutDays(item) }))
    .filter((item) => item.recommended > 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 4)

  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader
          icon={LayoutDashboard}
          title="Executive snapshot"
          actionLabel="Open inventory"
          onAction={() => onNavigate('inventory')}
        />
        <div className="snapshot-grid">
          <div className="score-block">
            <span>Stock health</span>
            <strong>{stockScore}%</strong>
            <p>Blends stock coverage, compliance score, and expiry freshness across active batches.</p>
            <div style={{ marginTop: 10 }}>
              <Sparkline data={forecast.map((f) => f.essential + f.chronic + f.emergency)} />
            </div>
          </div>
          <div className="score-block">
            <span>Wastage risk</span>
            <strong>{wastageRisk}%</strong>
            <p>Share of available units that need redistribution before short-dated expiry windows.</p>
            <div style={{ marginTop: 10 }}>
              <SimpleBars values={allocationQueue.slice(0, 6).map((a) => a.recommended)} />
            </div>
          </div>
          <div className="score-block">
            <span>Draft PO value</span>
            <strong>{currency.format(cartValue)}</strong>
            <p>Current hospital cart value with verified suppliers and stock-aware limits.</p>
            <div style={{ marginTop: 10 }}>
              <Sparkline data={forecast.map((f) => f.essential)} stroke="#0f766e" />
            </div>
          </div>
        </div>
        <Suspense fallback={<div className="chart-skeleton" /> }>
          <ForecastArea data={forecast} />
        </Suspense>
      </section>

      <section className="panel">
        <PanelHeader icon={AlertTriangle} title="Decision alerts" />
        <div className="alert-list">
          {alerts.map((alert) => (
            <article className={clsx('alert-item', alert.severity.toLowerCase())} key={alert.id}>
              <div>
                <strong>{alert.title}</strong>
                <span>{alert.createdAt}</span>
              </div>
              <p>{alert.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={Route} title="Supply chain control tower" />
        <div className="network-map" aria-label="Supply chain path from vendors to hospitals">
          <Node icon={Factory} label="Vendors" value="4 verified" />
          <ArrowRight size={18} aria-hidden="true" />
          <Node icon={Warehouse} label="Regional hubs" value="6 active" />
          <ArrowRight size={18} aria-hidden="true" />
          <Node icon={Truck} label="Distribution" value="3 live routes" />
          <ArrowRight size={18} aria-hidden="true" />
          <Node icon={Building2} label="Hospitals" value="42 linked" />
        </div>
        <div className="route-stack">
          {orders.map((order) => (
            <div className="route-row" key={order.id}>
              <span>{order.source}</span>
              <div className="route-progress">
                <i style={{ width: `${orderProgress(order.status)}%` }} />
              </div>
              <span>{order.destination}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader icon={Sparkles} title="AI replenishment recommendations" />
        <div className="allocation-list">
          {allocationQueue.map((item) => (
            <article className="allocation-row" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>
                  {item.warehouse} · {item.days} days cover · {item.vendor}
                </span>
              </div>
              <div className="allocation-number">
                <span>Suggested order</span>
                <strong>{number.format(item.recommended)} units</strong>
              </div>
              <button type="button" className="secondary-button" onClick={() => addToCart(item)}>
                <Plus size={16} aria-hidden="true" />
                Queue PO
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function InventoryView({
  items,
  query,
  statusFilter,
  onQueryChange,
  onStatusChange,
  onAddToCart,
}: {
  items: InventoryItem[]
  query: string
  statusFilter: string
  onQueryChange: (value: string) => void
  onStatusChange: (value: string) => void
  onAddToCart: (item: InventoryItem) => void
}) {
  const categoryData = Object.entries(
    inventory.reduce<Record<string, number>>((groups, item) => {
      groups[item.category] = (groups[item.category] ?? 0) + availableStock(item)
      return groups
    }, {}),
  ).map(([category, units]) => ({ category, units }))

  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader icon={Boxes} title="Batch inventory" />
        <div className="toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search drug, batch, vendor, state" />
          </label>
          <label className="select-field">
            <Filter size={17} aria-hidden="true" />
            <select value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Available</th>
                <th>Coverage</th>
                <th>Expiry</th>
                <th>Storage</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="table-title">
                      <strong>{item.name}</strong>
                      <span>
                        {item.batch} · {item.vendor}
                      </span>
                    </div>
                  </td>
                  <td>{number.format(availableStock(item))}</td>
                  <td>{runoutDays(item)} days</td>
                  <td>
                    <span className={clsx(daysUntil(item.expiry) < 90 && 'text-warning')}>
                      {item.expiry} · {daysUntil(item.expiry)}d
                    </span>
                  </td>
                  <td>
                    {item.temperatureBand} · {item.temperatureNow}C
                  </td>
                  <td>
                    <span className={clsx('status-pill', statusClass(item.status))}>{item.status}</span>
                  </td>
                  <td>
                    <MotionButton type="button" className="icon-button table-action" title="Add to procurement cart" onClick={() => onAddToCart(item)} whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }}>
                      <ShoppingCart size={16} aria-hidden="true" />
                    </MotionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={BarChart3} title="Stock by category" />
        <Suspense fallback={<div className="chart-skeleton" />}>
          <CategoryBarChart data={categoryData} />
        </Suspense>
      </section>

      <section className="panel">
        <PanelHeader icon={Thermometer} title="Cold-chain queue" />
        <div className="compact-list">
          {inventory
            .filter((item) => item.temperatureBand !== 'Ambient')
            .map((item) => (
              <article key={item.id} className="compact-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.temperatureNow}C · target {item.temperatureBand}
                  </span>
                </div>
                <span className={clsx('status-pill', statusClass(item.status))}>{item.status}</span>
              </article>
            ))}
        </div>
      </section>
    </div>
  )
}

function OrdersView({
  selectedOrderId,
  selectedOrder,
  onSelect,
}: {
  selectedOrderId: string
  selectedOrder: (typeof orders)[number]
  onSelect: (id: string) => void
}) {
  return (
    <div className="page-grid">
      <section className="panel">
        <PanelHeader icon={PackageCheck} title="Order queue" />
        <div className="order-list">
          {orders.map((order) => (
            <button
              type="button"
              key={order.id}
              className={clsx('order-card', selectedOrderId === order.id && 'active')}
              onClick={() => onSelect(order.id)}
            >
              <div>
                <strong>{order.id}</strong>
                <span>{order.drug}</span>
              </div>
              <span className={clsx('status-pill', statusClass(order.status))}>{order.status}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader icon={Truck} title="Order tracking" />
        <div className="order-detail">
          <div className="order-summary">
            <div>
              <span>Buyer</span>
              <strong>{selectedOrder.buyer}</strong>
            </div>
            <div>
              <span>Seller</span>
              <strong>{selectedOrder.seller}</strong>
            </div>
            <div>
              <span>Value</span>
              <strong>{currency.format(selectedOrder.value)}</strong>
            </div>
            <div>
              <span>ETA</span>
              <strong>{selectedOrder.eta}</strong>
            </div>
          </div>
          <div className="tracking-line">
            <i style={{ width: `${orderProgress(selectedOrder.status)}%` }} />
          </div>
          <div className="timeline">
            {selectedOrder.timeline.map((event) => (
              <article className={clsx('timeline-event', event.done && 'done')} key={event.label}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <div>
                  <strong>{event.label}</strong>
                  <span>{event.at}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel wide">
        <PanelHeader icon={FileText} title="Dispatch intelligence" />
        <div className="dispatch-grid">
          <DispatchTile label="Source" value={selectedOrder.source} />
          <DispatchTile label="Destination" value={selectedOrder.destination} />
          <DispatchTile label="Quantity" value={`${number.format(selectedOrder.quantity)} units`} />
          <DispatchTile label="Temperature band" value={selectedOrder.temperatureBand} />
          <DispatchTile label="Risk score" value={selectedOrder.risk} />
        </div>
      </section>
    </div>
  )
}

function StoreView({
  cart,
  onUpdateLine,
  onAddToCart,
  cartValue,
}: {
  cart: CartLine[]
  onUpdateLine: (itemId: string, quantity: number) => void
  onAddToCart: (item: InventoryItem) => void
  cartValue: number
}) {
  const preferredItems = inventory
    .filter((item) => item.status !== 'Cold Chain Alert')
    .sort((a, b) => b.complianceScore - a.complianceScore)
    .slice(0, 5)

  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader icon={ShoppingCart} title="Verified procurement store" />
        <div className="store-grid">
          {preferredItems.map((item) => (
            <MotionDiv
              className="product-card"
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.36 }}
            >
              <div className="product-top">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.vendor}</span>
                </div>
                <span className="score-badge">{item.complianceScore}% QA</span>
              </div>
              <div className="product-stats">
                <span>{number.format(availableStock(item))} available</span>
                <span>{item.leadTimeDays}d lead</span>
                <span>{currency.format(item.unitCost)}/unit</span>
              </div>
              <button type="button" className="primary-button" onClick={() => onAddToCart(item)}>
                <Plus size={16} aria-hidden="true" />
                Add to cart
              </button>
            </MotionDiv>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={IndianRupee} title="Purchase order" />
        <div className="cart-list">
          {cart.map((line) => {
            const item = inventory.find((candidate) => candidate.id === line.itemId)
            if (!item) return null
            return (
              <article className="cart-line" key={line.itemId}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{currency.format(item.unitCost)} per unit</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={availableStock(item)}
                  value={line.quantity}
                  onChange={(event) => onUpdateLine(line.itemId, Number(event.target.value))}
                  aria-label={`Quantity for ${item.name}`}
                />
              </article>
            )
          })}
        </div>
        <div className="invoice-box">
          <div>
            <span>Subtotal</span>
            <strong>{currency.format(cartValue)}</strong>
          </div>
          <div>
            <span>Estimated GST</span>
            <strong>{currency.format(cartValue * 0.12)}</strong>
          </div>
          <div>
            <span>Total PO value</span>
            <strong>{currency.format(cartValue * 1.12)}</strong>
          </div>
        </div>
        <MotionButton type="button" className="primary-button full" whileTap={{ scale: 0.995 }} whileHover={{ y: -2 }}>
          <FileText size={16} aria-hidden="true" />
          Generate PO
        </MotionButton>
      </section>

      <section className="panel wide">
        <PanelHeader icon={BadgeCheck} title="Supplier comparison" />
        <div className="vendor-grid">
          {vendors.map((vendor) => (
            <article className="vendor-card" key={vendor.id}>
              <div>
                <strong>{vendor.name}</strong>
                <span>{vendor.license}</span>
              </div>
              <div className="vendor-metrics">
                <span>{vendor.reliability}% reliable</span>
                <span>{vendor.fillRate}% fill rate</span>
                <span>{vendor.avgLeadTime}d lead</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function ForecastingView() {
  const latest = forecast[forecast.length - 1]
  const previous = forecast[forecast.length - 2]
  const increase = Math.round(((latest.predictedDemand - previous.predictedDemand) / previous.predictedDemand) * 100)

  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader icon={Sparkles} title="AI demand forecast" />
        <div className="forecast-grid">
          <div className="forecast-model">
            <span>Next month projected demand</span>
            <strong>{number.format(latest.predictedDemand)} units</strong>
            <p>{increase}% increase driven by monsoon diseases, antibiotic consumption, and chronic refill regularity.</p>
          </div>
          <div className="forecast-model">
            <span>Recommended procurement window</span>
            <strong>7 days</strong>
            <p>Open POs now for critical antibiotics and cold-chain products with lead time above 6 days.</p>
          </div>
          <div className="forecast-model">
            <span>Redistribution target</span>
            <strong>10,600 ORS</strong>
            <p>Move short-dated stock from South Hub to high-consumption Karnataka districts.</p>
          </div>
        </div>
        <MotionDiv className="chart-wrap tall" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.46 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7dee8" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
              <Tooltip formatter={(value) => number.format(Number(value))} />
              <Line type="monotone" dataKey="predictedDemand" stroke="#2563eb" strokeWidth={3} dot={false} name="Predicted" isAnimationActive={true} animationDuration={900} />
              <Line type="monotone" dataKey="actualDemand" stroke="#0f766e" strokeWidth={3} dot={false} name="Actual" isAnimationActive={true} animationDuration={900} />
            </ReLineChart>
          </ResponsiveContainer>
        </MotionDiv>
      </section>

      <section className="panel">
        <PanelHeader icon={AlertTriangle} title="Forecast drivers" />
        <div className="driver-list">
          <Driver label="Disease outbreak signal" value="High" score={82} />
          <Driver label="Historical consumption" value="Stable" score={73} />
          <Driver label="Supplier lead-time volatility" value="Medium" score={58} />
          <Driver label="Expiry redistribution need" value="High" score={76} />
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={Package} title="Coverage mix" />
        <div className="chart-wrap donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Healthy', value: inventory.filter((item) => item.status === 'Healthy').length },
                  { name: 'Reorder', value: inventory.filter((item) => item.status === 'Reorder').length },
                  { name: 'Critical', value: inventory.filter((item) => item.status === 'Critical').length },
                  { name: 'Watch', value: inventory.filter((item) => item.status.includes('Watch') || item.status.includes('Alert')).length },
                ]}
                innerRadius={58}
                outerRadius={88}
                dataKey="value"
                nameKey="name"
                isAnimationActive={false}
              >
                {['#0f766e', '#d97706', '#dc2626', '#2563eb'].map((color) => (
                  <Cell key={color} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

function ComplianceView() {
  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader icon={ShieldCheck} title="Security, compliance, and traceability" />
        <div className="module-grid">
          {moduleTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <article className="module-card" key={tile.title}>
                <Icon size={22} aria-hidden="true" />
                <div>
                  <strong>{tile.title}</strong>
                  <span>{tile.owner}</span>
                  <p>{tile.detail}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={FileText} title="License registry" />
        <div className="compact-list">
          {vendors.map((vendor) => (
            <article key={vendor.id} className="compact-row">
              <div>
                <strong>{vendor.name}</strong>
                <span>{vendor.license}</span>
              </div>
              <span className="status-pill healthy">Verified</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={ClipboardCheck} title="Audit trail" />
        <div className="audit-list">
          <Audit event="PO-2026-0829-042 QA accepted" actor="District Hospital Pune" />
          <Audit event="BCG24C12 quarantined" actor="Central Immunization Vault" />
          <Audit event="Aarogya Pharma license renewed" actor="Compliance Admin" />
          <Audit event="ORS redistribution recommendation issued" actor="Forecast Engine" />
        </div>
      </section>
    </div>
  )
}

function DeliveryPlanView() {
  const roadmap = [
    { phase: 'Sprint 1', title: 'Foundation and demo data', status: 'Done', detail: 'Role shell, seeded inventory, order tracking, charts, and SIH storyline.' },
    { phase: 'Sprint 2', title: 'Operational workflows', status: 'Ready', detail: 'Procurement cart, invoice generation, batch receiving, and distributor dispatch events.' },
    { phase: 'Sprint 3', title: 'Production backend', status: 'Planned', detail: 'PostgreSQL schema, REST APIs, auth, audit log, and integration adapters.' },
    { phase: 'Sprint 4', title: 'AI and governance', status: 'Planned', detail: 'Forecast model service, anomaly alerts, policy dashboards, and compliance reports.' },
  ]

  return (
    <div className="page-grid">
      <section className="panel wide">
        <PanelHeader icon={ClipboardCheck} title="Senior PM delivery blueprint" />
        <div className="roadmap">
          {roadmap.map((item) => (
            <article className="roadmap-item" key={item.phase}>
              <span>{item.phase}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
              <span className={clsx('status-pill', statusClass(item.status))}>{item.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={AlertTriangle} title="Top risks" />
        <div className="compact-list">
          <Risk title="Data accuracy" detail="Mitigate with barcode scans, reconciliation jobs, and maker-checker approvals." />
          <Risk title="System integration" detail="Mitigate with adapter layer for hospital ERP, e-procurement, and logistics APIs." />
          <Risk title="Cybersecurity" detail="Mitigate with RBAC, encryption, audit trails, and periodic vulnerability testing." />
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={Route} title="Workflow map" />
        <div className="workflow-list">
          {workflow.map((step) => {
            const Icon = step.icon
            return (
              <article className="workflow-row" key={step.title}>
                <Icon size={18} aria-hidden="true" />
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.description}</span>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function PanelHeader({
  icon: Icon,
  title,
  actionLabel,
  onAction,
}: {
  icon: typeof Package
  title: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="panel-header">
      <div>
        <Icon size={19} aria-hidden="true" />
        <h2>{title}</h2>
      </div>
      {actionLabel && (
        <button type="button" className="link-button" onClick={onAction}>
          {actionLabel}
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

function Node({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="map-node">
      <Icon size={20} aria-hidden="true" />
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  )
}

function DispatchTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="dispatch-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Driver({ label, value, score }: { label: string; value: string; score: number }) {
  return (
    <article className="driver-row">
      <div>
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
      <div className="mini-bar">
        <i style={{ width: `${score}%` }} />
      </div>
    </article>
  )
}

function Audit({ event, actor }: { event: string; actor: string }) {
  return (
    <article className="audit-row">
      <CheckCircle2 size={17} aria-hidden="true" />
      <div>
        <strong>{event}</strong>
        <span>{actor}</span>
      </div>
    </article>
  )
}

function Risk({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="risk-row">
      <AlertTriangle size={17} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </article>
  )
}

export default App
