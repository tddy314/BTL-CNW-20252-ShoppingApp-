"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ListOrdered } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiGateway, type OrderRecord } from "@/app/utils/api"
import { useAuth } from "@/contexts/auth-context"

const gatewayApi = new ApiGateway()
const PAGE_SIZE = 10

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function paymentLabel(payment: 0 | 1): string {
  return payment === 0 ? "Cash on Delivery" : "Bank Transfer"
}

function statusVariant(status: OrderRecord["status"]): "secondary" | "outline" {
  if (status === "pending" || status === "processing") {
    return "secondary"
  }

  return "outline"
}

export default function OrdersPage() {
  const { isLoggedIn, email } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const loadOrders = async () => {
      if (!email || !isLoggedIn) {
        setOrders([])
        setTotalPages(1)
        setTotalItems(0)
        return
      }

      setIsLoading(true)
      setErrorMessage("")

      try {
        const result = await gatewayApi.readOrdersByBuyer({
          buyer: email,
          page: currentPage,
          limit: PAGE_SIZE,
        })

        setOrders(result?.items || [])
        setTotalPages(Math.max(1, Number(result?.totalPages || 1)))
        setTotalItems(Number(result?.totalItems || 0))
      } catch (error: any) {
        setOrders([])
        setTotalPages(1)
        setTotalItems(0)
        setErrorMessage(error?.message || "Unable to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [isLoggedIn, email, currentPage])

  const pageSpend = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.price || 0), 0)
  }, [orders])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
            </div>
            <p className="text-muted-foreground">Track your order status and payments.</p>
          </div>

          <Card className="px-4 py-3 border border-border min-w-[220px]">
            <p className="text-sm text-muted-foreground">This page total</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(pageSpend)}</p>
          </Card>
        </div>

        {!isLoggedIn ? (
          <Card className="p-10 text-center border border-dashed border-border">
            <ListOrdered className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">Please sign in</h2>
            <p className="text-muted-foreground">You need to log in before viewing your orders.</p>
          </Card>
        ) : null}

        {errorMessage ? (
          <Card className="border border-destructive/40 bg-destructive/5 p-3 mb-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </Card>
        ) : null}

        {isLoading ? (
          <Card className="p-8 text-center border border-border mb-4">
            <p className="text-muted-foreground">Loading orders...</p>
          </Card>
        ) : null}

        {!isLoading && isLoggedIn && orders.length === 0 ? (
          <Card className="p-10 text-center border border-dashed border-border">
            <ListOrdered className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No orders yet</h2>
            <p className="text-muted-foreground">Create an order from cart to see it here.</p>
          </Card>
        ) : null}

        {!isLoading && orders.length > 0 ? (
          <>
            <div className="mb-3 text-sm text-muted-foreground">Showing {orders.length} of {totalItems} orders</div>

            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border border-border p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{order.order_id}</Badge>
                        <Badge variant={statusVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">Created: {formatDate(order.created_at)}</p>
                      <p className="text-sm text-foreground">Seller: <span className="font-medium">{order.seller}</span></p>
                      <p className="text-sm text-foreground">Payment: {paymentLabel(order.payment)}</p>
                      <p className="text-sm text-muted-foreground">Ship to: {order.receiver} - {order.phone}</p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="text-lg font-semibold text-primary">{formatCurrency(Number(order.price || 0))}</p>
                      <p className="text-sm text-muted-foreground">Qty: {order.quantity}</p>
                      <Link href={`/orders/${order.order_id}`} className="inline-flex">
                        <Button variant="outline" className="border-border">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-border"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="border-border"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
