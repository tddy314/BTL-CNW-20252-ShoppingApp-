'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Search,
  Package,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import type { OrderStatus } from '@/lib/store'
import { useEffect } from 'react'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
function SafeDate({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Trả về chuỗi rỗng hoặc placeholder để khớp với cấu trúc server
    return <span className="opacity-0">Loading...</span>;
  }

  return (
    <>
      {date.toLocaleDateString()} {date.toLocaleTimeString()}
    </>
  );
}
export default function InProgressOrdersPage() {
  const { user, getOrders, updateOrderStatus, getTodayFinishedOrders } = useStore()
  const [searchId, setSearchId] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [searchShopId, setSearchShopId] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [currentPageInProgress, setCurrentPageInProgress] = useState(1)
  const [currentPageFinished, setCurrentPageFinished] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')
  const ORDERS_PER_PAGE = 10

  if (!user || !user.isAdmin) {
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

  const allOrders = getOrders()
  const inProgressOrders = allOrders.filter((o) => ['pending', 'processing', 'shipped'].includes(o.status))
  const finishedOrders = getTodayFinishedOrders()

  // Filter in-progress orders
  const filteredInProgress = useMemo(() => {
    return inProgressOrders.filter((order) => {
      const matchesId = order.id.toLowerCase().includes(searchId.toLowerCase())
      const matchesCategory = searchCategory === '' || order.items.some((item) => item.category === searchCategory)
      const matchesShopId = searchShopId === '' || order.items.some((item) => item.shopId === searchShopId)
      const matchesCustomer = order.userName.toLowerCase().includes(searchCustomer.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus

      return matchesId && matchesCategory && matchesShopId && matchesCustomer && matchesStatus
    })
  }, [inProgressOrders, searchId, searchCategory, searchShopId, searchCustomer, selectedStatus])

  // Filter finished orders
  const filteredFinished = useMemo(() => {
    return finishedOrders.filter((order) => {
      const matchesId = order.id.toLowerCase().includes(searchId.toLowerCase())
      const matchesCategory = searchCategory === '' || order.items.some((item) => item.category === searchCategory)
      const matchesShopId = searchShopId === '' || order.items.some((item) => item.shopId === searchShopId)
      const matchesCustomer = order.userName.toLowerCase().includes(searchCustomer.toLowerCase())

      return matchesId && matchesCategory && matchesShopId && matchesCustomer
    })
  }, [finishedOrders, searchId, searchCategory, searchShopId, searchCustomer])

  // Pagination
  const totalPagesInProgress = Math.ceil(filteredInProgress.length / ORDERS_PER_PAGE)
  const totalPagesFinished = Math.ceil(filteredFinished.length / ORDERS_PER_PAGE)

  const paginatedInProgress = useMemo(() => {
    const start = (currentPageInProgress - 1) * ORDERS_PER_PAGE
    return filteredInProgress.slice(start, start + ORDERS_PER_PAGE)
  }, [filteredInProgress, currentPageInProgress])

  const paginatedFinished = useMemo(() => {
    const start = (currentPageFinished - 1) * ORDERS_PER_PAGE
    return filteredFinished.slice(start, start + ORDERS_PER_PAGE)
  }, [filteredFinished, currentPageFinished])

  // Get unique categories and shops
  const categories = Array.from(new Set(allOrders.flatMap((o) => o.items.map((i) => i.category))))
  const shops = Array.from(new Set(allOrders.flatMap((o) => o.items.map((i) => i.shopId))))

  const PaginationControls = ({ currentPage, totalPages, onPageChange }: any) => {
    return totalPages > 1 ? (
      <div className="flex items-center justify-center gap-1 mt-6">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-[#ee4d2d] text-white border-[#ee4d2d] hover:bg-[#d73211]'
                : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    ) : null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">In-Progress Orders</h1>
          <p className="text-gray-600">Manage shipments and track order status</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 bg-white border-0 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search Order ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="e.g. ORD001"
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value)
                    setCurrentPageInProgress(1)
                    setCurrentPageFinished(1)
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <Select value={searchCategory} onValueChange={(value) => {
                setSearchCategory(value)
                setCurrentPageInProgress(1)
                setCurrentPageFinished(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Shop</label>
              <Select value={searchShopId} onValueChange={(value) => {
                setSearchShopId(value)
                setCurrentPageInProgress(1)
                setCurrentPageFinished(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All shops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All shops</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop} value={shop}>
                      {shop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Customer</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Customer name"
                  value={searchCustomer}
                  onChange={(e) => {
                    setSearchCustomer(e.target.value)
                    setCurrentPageInProgress(1)
                    setCurrentPageFinished(1)
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={(value: any) => {
                setSelectedStatus(value)
                setCurrentPageInProgress(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList className="bg-white border-b border-gray-200 p-0 h-auto gap-0 rounded-none">
            <TabsTrigger
              value="in-progress"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#ee4d2d] data-[state=active]:bg-transparent px-4 py-3"
            >
              <Clock className="w-4 h-4 mr-2" />
              In Progress ({filteredInProgress.length})
            </TabsTrigger>
            <TabsTrigger
              value="finished"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#00bfa5] data-[state=active]:bg-transparent px-4 py-3"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Today's Finished ({filteredFinished.length})
            </TabsTrigger>
          </TabsList>

          {/* In Progress Tab */}
          <TabsContent value="in-progress" className="space-y-4">
            {paginatedInProgress.length > 0 ? (
              <>
                {paginatedInProgress.map((order) => (
                  <Card key={order.id} className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order ID</p>
                        <p className="text-lg font-bold text-gray-900">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Customer</p>
                        <p className="text-lg font-semibold text-gray-900">{order.userName}</p>
                        <p className="text-sm text-gray-500">{order.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Created</p>
                        <p className="text-gray-900">
                            <SafeDate date={order.createdAt} />
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-lg font-bold text-[#ee4d2d]">${order.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-gray-600">{item.shopName} • {item.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">x{item.quantity}</p>
                              <p className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                        <p className="text-gray-900">{order.shippingAddress}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                        <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
                <PaginationControls
                  currentPage={currentPageInProgress}
                  totalPages={totalPagesInProgress}
                  onPageChange={setCurrentPageInProgress}
                />
              </>
            ) : (
              <Card className="p-12 text-center bg-white border-0 shadow-sm">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No in-progress orders found</p>
              </Card>
            )}
          </TabsContent>

          {/* Finished Tab */}
          <TabsContent value="finished" className="space-y-4">
            {paginatedFinished.length > 0 ? (
              <>
                {paginatedFinished.map((order) => (
                  <Card key={order.id} className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order ID</p>
                        <p className="text-lg font-bold text-gray-900">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Customer</p>
                        <p className="text-lg font-semibold text-gray-900">{order.userName}</p>
                        <p className="text-sm text-gray-500">{order.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Completed</p>
                        <p className="text-gray-900">{order.updatedAt.toLocaleDateString()} {order.updatedAt.toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-lg font-bold text-[#ee4d2d]">${order.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-gray-600">{item.shopName} • {item.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">x{item.quantity}</p>
                              <p className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                        <p className="text-gray-900">{order.shippingAddress}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </Card>
                ))}
                <PaginationControls
                  currentPage={currentPageFinished}
                  totalPages={totalPagesFinished}
                  onPageChange={setCurrentPageFinished}
                />
              </>
            ) : (
              <Card className="p-12 text-center bg-white border-0 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No finished orders from today</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
