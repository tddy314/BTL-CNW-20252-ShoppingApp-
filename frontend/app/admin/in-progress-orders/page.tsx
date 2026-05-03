'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Search, Package } from 'lucide-react'
import { ApiGateway, type OrderRecord } from '@/app/utils/api'
import { useAuth } from '@/contexts/auth-context'

const gatewayApi = new ApiGateway()
const PAGE_SIZE = 20

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getAllowedNextStatuses(status: OrderRecord['status']): Array<'shipped' | 'delivered'> {
  if (status === 'processing') {
    return ['shipped']
  }

  if (status === 'shipped') {
    return ['delivered']
  }

  return []
}

export default function InProgressOrdersPage() {
  const { role } = useAuth()

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [searchId, setSearchId] = useState('')
  const [searchBuyer, setSearchBuyer] = useState('')
  const [searchShopId, setSearchShopId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await gatewayApi.readAllOrders({
          page: currentPage,
          limit: PAGE_SIZE,
        })

        setOrders(result?.items || [])
        setTotalPages(Math.max(1, Number(result?.totalPages || 1)))
      } catch (error: any) {
        setOrders([])
        setTotalPages(1)
        setErrorMessage(error?.message || 'Unable to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [currentPage])

  const visibleOrders = useMemo(() => {
    return orders
      .filter((order) => order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered')
      .filter((order) => {
        const matchesId = order.order_id.toLowerCase().includes(searchId.toLowerCase())
        const matchesBuyer = order.buyer.toLowerCase().includes(searchBuyer.toLowerCase())
        const matchesShop = order.shop_id.toLowerCase().includes(searchShopId.toLowerCase())
        const matchesStatus = selectedStatus === 'all' ? true : order.status === selectedStatus

        return matchesId && matchesBuyer && matchesShop && matchesStatus
      })
  }, [orders, searchId, searchBuyer, searchShopId, selectedStatus])

  const handleStatusUpdate = async (order: OrderRecord, nextStatus: 'shipped' | 'delivered') => {
    try {
      if (nextStatus === 'shipped') {
        await gatewayApi.adminShipOrder({ order_id: order.order_id })
      }

      if (nextStatus === 'delivered') {
        await gatewayApi.adminDeliverOrder({ order_id: order.order_id })
      }

      setMessage(`Order ${order.order_id} updated to ${nextStatus}.`)

      const result = await gatewayApi.readAllOrders({
        page: currentPage,
        limit: PAGE_SIZE,
      })

      setOrders(result?.items || [])
      setTotalPages(Math.max(1, Number(result?.totalPages || 1)))
    } catch (error: any) {
      setMessage(error?.message || 'Unable to update order status')
    }
  }

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Operations Queue</h1>
          <p className="text-gray-600">Seller-approved and delivered orders are shown for shipping operations tracking.</p>
        </div>

        <Card className="p-6 mb-8 bg-white border-0 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Order ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search order id"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Buyer</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search buyer"
                  value={searchBuyer}
                  onChange={(e) => setSearchBuyer(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Shop ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search shop id"
                  value={searchShopId}
                  onChange={(e) => setSearchShopId(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {errorMessage ? (
          <Card className="border border-red-200 bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </Card>
        ) : null}

        {message ? (
          <Card className="border border-border p-4 mb-4">
            <p className="text-sm text-gray-700">{message}</p>
          </Card>
        ) : null}

        {isLoading ? (
          <Card className="p-12 text-center bg-white border-0 shadow-sm">
            <p className="text-gray-600 text-lg">Loading orders...</p>
          </Card>
        ) : null}

        {!isLoading && visibleOrders.length > 0 ? (
          <div className="space-y-4">
            {visibleOrders.map((order) => {
              const allowedStatuses = getAllowedNextStatuses(order.status)

              return (
                <Card key={order.id} className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order ID</p>
                      <p className="text-lg font-bold text-gray-900">{order.order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Buyer</p>
                      <p className="text-lg font-semibold text-gray-900">{order.buyer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Created</p>
                      <p className="text-gray-900">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-lg font-bold text-[#ee4d2d]">{formatCurrency(Number(order.price || 0))}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                      <p className="text-gray-900">{order.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                        {order.status}
                      </span>

                      <Select
                        value={order.status}
                        onValueChange={(value) => {
                          const nextStatus = value as 'shipped' | 'delivered'
                          if (allowedStatuses.includes(nextStatus)) {
                            handleStatusUpdate(order, nextStatus)
                          }
                        }}
                        disabled={allowedStatuses.length === 0}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={order.status}>{order.status}</SelectItem>
                          {allowedStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : null}

        {!isLoading && visibleOrders.length === 0 ? (
          <Card className="p-12 text-center bg-white border-0 shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No matching admin orders found</p>
          </Card>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
