'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Bell, CheckCircle2, Clock3, Package, Truck, XCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApiGateway, type NotificationRecord, type OrderRecord } from '@/app/utils/api'
import { useAuth } from '@/contexts/auth-context'

const gatewayApi = new ApiGateway()
const PAGE_SIZE = 100

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string | number): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function AdminDashboardPage() {
  const { role, email } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [adminNotifications, setAdminNotifications] = useState<NotificationRecord[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (role !== 'admin' || !email) {
        setOrders([])
        setAdminNotifications([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const firstPage = await gatewayApi.readAllOrders({ page: 1, limit: PAGE_SIZE })
        const allOrders = [...(firstPage?.items || [])]
        const totalPages = Number(firstPage?.totalPages || 1)

        if (totalPages > 1) {
          for (let page = 2; page <= totalPages; page += 1) {
            const nextPage = await gatewayApi.readAllOrders({ page, limit: PAGE_SIZE })
            allOrders.push(...(nextPage?.items || []))
          }
        }

        const notificationPage = await gatewayApi.readNotifications({
          userId: email,
          channel: 'admin',
          page: 1,
          limit: 10,
        })

        setOrders(allOrders)
        setAdminNotifications(notificationPage?.items || [])
      } catch (error: any) {
        setOrders([])
        setAdminNotifications([])
        setErrorMessage(error?.message || 'Unable to load admin dashboard metrics')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [role, email])

  const metrics = useMemo(() => {
    const counts = {
      total: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      rejected: 0,
    }

    let deliveredRevenue = 0
    for (const order of orders) {
      const status = String(order.status || '').toLowerCase()
      if (status in counts) {
        ;(counts as any)[status] += 1
      }

      if (status === 'delivered') {
        deliveredRevenue += Number(order.price || 0) * Number(order.quantity || 1)
      }
    }

    return {
      ...counts,
      deliveredRevenue,
      inProgress: counts.processing + counts.shipped,
      completionRate: counts.total > 0 ? Math.round((counts.delivered / counts.total) * 100) : 0,
    }
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
          href="/profile"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Overview of order pipeline and admin notifications.</p>
          </div>
          <Link href="/admin/reports">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <BarChart3 className="w-4 h-4" />
              Revenue Reports
            </Button>
          </Link>
        </div>

        {errorMessage ? (
          <Card className="border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </Card>
        ) : null}

        {isLoading ? (
          <Card className="p-12 text-center bg-white border-0 shadow-sm">
            <p className="text-slate-600 text-lg">Loading dashboard metrics...</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <Card className="p-5 bg-white border-slate-200">
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.total}</p>
              </Card>
              <Card className="p-5 bg-white border-slate-200">
                <p className="text-sm text-slate-500">In Progress</p>
                <p className="text-3xl font-bold text-amber-600">{metrics.inProgress}</p>
              </Card>
              <Card className="p-5 bg-white border-slate-200">
                <p className="text-sm text-slate-500">Delivered Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(metrics.deliveredRevenue)}</p>
              </Card>
              <Card className="p-5 bg-white border-slate-200">
                <p className="text-sm text-slate-500">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.completionRate}%</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="p-5 bg-white border-slate-200 xl:col-span-2">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Order Status Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-slate-700 mb-1"><Clock3 className="w-4 h-4" /> Pending</div>
                    <p className="text-2xl font-bold">{metrics.pending}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-amber-700 mb-1"><Package className="w-4 h-4" /> Processing</div>
                    <p className="text-2xl font-bold">{metrics.processing}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-blue-700 mb-1"><Truck className="w-4 h-4" /> Shipped</div>
                    <p className="text-2xl font-bold">{metrics.shipped}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1"><CheckCircle2 className="w-4 h-4" /> Delivered</div>
                    <p className="text-2xl font-bold">{metrics.delivered}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-rose-700 mb-1"><XCircle className="w-4 h-4" /> Cancelled</div>
                    <p className="text-2xl font-bold">{metrics.cancelled}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-red-700 mb-1"><XCircle className="w-4 h-4" /> Rejected</div>
                    <p className="text-2xl font-bold">{metrics.rejected}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Latest Admin Notifications</h2>
                {adminNotifications.length === 0 ? (
                  <p className="text-sm text-slate-500">No admin notifications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {adminNotifications.map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-semibold text-slate-900 flex items-start gap-2">
                          <Bell className="w-4 h-4 mt-0.5 text-slate-500" />
                          <span>{item.title}</span>
                        </p>
                        <p className="text-sm text-slate-600 mt-1">{item.body}</p>
                        <p className="text-xs text-slate-400 mt-2">{formatDate(item.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/notifications" className="inline-block mt-4">
                  <Button variant="outline">Open Notifications</Button>
                </Link>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

