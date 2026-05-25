'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApiGateway, type OrderRecord, type OrderStatus } from '@/app/utils/api'
import { useAuth } from '@/contexts/auth-context'

const gatewayApi = new ApiGateway()
const PAGE_SIZE = 100
const REVENUE_WINDOW_DAYS = 30
const TOP_SHOPS_LIMIT = 5

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#94a3b8',
  processing: '#f59e0b',
  shipped: '#3b82f6',
  delivered: '#10b981',
  cancelled: '#f43f5e',
  rejected: '#ef4444',
}

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'rejected',
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatShortDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

function toDayKey(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildLastNDayKeys(days: number): string[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const result: string[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    result.push(toDayKey(d.toISOString()))
  }
  return result
}

export default function AdminReportsPage() {
  const { role } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadAllOrders = async () => {
      if (role !== 'admin') {
        setOrders([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const firstPage = await gatewayApi.readAllOrders({ page: 1, limit: PAGE_SIZE })
        const all: OrderRecord[] = [...(firstPage?.items || [])]
        const totalPages = Number(firstPage?.totalPages || 1)

        for (let page = 2; page <= totalPages; page += 1) {
          const next = await gatewayApi.readAllOrders({ page, limit: PAGE_SIZE })
          all.push(...(next?.items || []))
        }

        setOrders(all)
      } catch (error: any) {
        setOrders([])
        setErrorMessage(error?.message || 'Unable to load report data')
      } finally {
        setIsLoading(false)
      }
    }

    loadAllOrders()
  }, [role])

  const summary = useMemo(() => {
    const delivered = orders.filter((order) => order.status === 'delivered')
    const deliveredRevenue = delivered.reduce(
      (sum, order) => sum + Number(order.price || 0),
      0,
    )
    const uniqueBuyers = new Set(orders.map((order) => order.buyer)).size

    return {
      totalOrders: orders.length,
      deliveredCount: delivered.length,
      deliveredRevenue,
      avgOrderValue: delivered.length > 0 ? deliveredRevenue / delivered.length : 0,
      uniqueBuyers,
    }
  }, [orders])

  const revenueByDay = useMemo(() => {
    const dayKeys = buildLastNDayKeys(REVENUE_WINDOW_DAYS)
    const totals = new Map<string, number>()
    for (const key of dayKeys) totals.set(key, 0)

    for (const order of orders) {
      if (order.status !== 'delivered') continue
      const key = toDayKey(order.created_at)
      if (!totals.has(key)) continue
      totals.set(key, (totals.get(key) || 0) + Number(order.price || 0))
    }

    return dayKeys.map((key) => ({
      day: formatShortDate(`${key}T00:00:00`),
      revenue: totals.get(key) || 0,
    }))
  }, [orders])

  const topShops = useMemo(() => {
    const byShop = new Map<string, number>()
    for (const order of orders) {
      if (order.status !== 'delivered') continue
      const label = String(order.seller || order.shop_id || 'Unknown')
      byShop.set(label, (byShop.get(label) || 0) + Number(order.price || 0))
    }

    return Array.from(byShop.entries())
      .map(([shop, revenue]) => ({ shop, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, TOP_SHOPS_LIMIT)
  }, [orders])

  const statusDistribution = useMemo(() => {
    const counts = new Map<OrderStatus, number>()
    for (const status of STATUS_ORDER) counts.set(status, 0)
    for (const order of orders) {
      const status = order.status as OrderStatus
      if (counts.has(status)) counts.set(status, (counts.get(status) || 0) + 1)
    }
    return STATUS_ORDER.map((status) => ({
      status,
      count: counts.get(status) || 0,
    })).filter((entry) => entry.count > 0)
  }, [orders])

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-8">Only admins can access this page</p>
            <Link href="/" className="inline-block">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Revenue Reports</h1>
          <p className="text-slate-600">
            Revenue and order analytics across the platform. Revenue counts only delivered orders.
          </p>
        </div>

        {errorMessage ? (
          <Card className="border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </Card>
        ) : null}

        {isLoading ? (
          <Card className="p-12 text-center bg-white border-0 shadow-sm">
            <p className="text-slate-600 text-lg">Loading report data...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <Card className="p-5 bg-white border-slate-200">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <p className="text-sm text-slate-500">Delivered Revenue</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(summary.deliveredRevenue)}
                </p>
              </Card>
              <Card className="p-5 bg-white border-slate-200">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <p className="text-sm text-slate-500">Delivered Orders</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{summary.deliveredCount}</p>
              </Card>
              <Card className="p-5 bg-white border-slate-200">
                <div className="flex items-center gap-2 text-amber-700 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-sm text-slate-500">Avg Order Value</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  {formatCurrency(summary.avgOrderValue)}
                </p>
              </Card>
              <Card className="p-5 bg-white border-slate-200">
                <div className="flex items-center gap-2 text-violet-700 mb-1">
                  <Users className="w-4 h-4" />
                  <p className="text-sm text-slate-500">Unique Buyers</p>
                </div>
                <p className="text-3xl font-bold text-violet-600">{summary.uniqueBuyers}</p>
              </Card>
            </div>

            <Card className="p-5 bg-white border-slate-200 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Revenue (Last {REVENUE_WINDOW_DAYS} Days)
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Delivered revenue grouped by order creation date.
              </p>
              {revenueByDay.every((entry) => entry.revenue === 0) ? (
                <p className="text-sm text-slate-500 py-12 text-center">
                  No delivered revenue in this window.
                </p>
              ) : (
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByDay} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value))} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(Number(value))}
                        labelStyle={{ color: '#0f172a' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="p-5 bg-white border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  Top {TOP_SHOPS_LIMIT} Shops by Revenue
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Aggregated from delivered orders.
                </p>
                {topShops.length === 0 ? (
                  <p className="text-sm text-slate-500 py-12 text-center">
                    No delivered orders yet.
                  </p>
                ) : (
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topShops}
                        layout="vertical"
                        margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => formatCurrency(Number(value))}
                        />
                        <YAxis
                          type="category"
                          dataKey="shop"
                          tick={{ fontSize: 12 }}
                          width={120}
                        />
                        <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              <Card className="p-5 bg-white border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Order Status Distribution</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Share of orders across all statuses.
                </p>
                {statusDistribution.length === 0 ? (
                  <p className="text-sm text-slate-500 py-12 text-center">No orders yet.</p>
                ) : (
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={(entry: any) => `${entry.status} (${entry.count})`}
                        >
                          {statusDistribution.map((entry) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
