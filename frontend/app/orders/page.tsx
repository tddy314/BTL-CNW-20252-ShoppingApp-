"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ExternalLink, ListOrdered } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPaymentLabel, readMockOrders, type MockOrder } from "@/lib/mock-order-history"

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

function statusVariant(status: MockOrder["status"]): "secondary" | "outline" {
  if (status === "pending" || status === "processing") {
    return "secondary"
  }

  return "outline"
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<MockOrder[]>([])

  useEffect(() => {
    setOrders(readMockOrders())
  }, [])

  const totalSpend = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0)
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
            <p className="text-muted-foreground">Track order status, payment status, and view order details.</p>
          </div>

          <Card className="px-4 py-3 border border-border min-w-[180px]">
            <p className="text-sm text-muted-foreground">Total spend</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalSpend)}</p>
          </Card>
        </div>

        {orders.length === 0 ? (
          <Card className="p-10 text-center border border-dashed border-border">
            <ListOrdered className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No orders yet</h2>
            <p className="text-muted-foreground">Create an order from the cart to see it here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const firstItem = order.items[0]

              return (
                <Card key={order.id} className="border border-border p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{order.id}</Badge>
                        <Badge variant={statusVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">Created: {formatDate(order.createdAt)}</p>
                      <p className="text-sm text-foreground">
                        Shop: <span className="font-medium">{firstItem?.shopName ?? "Unknown"}</span>
                      </p>
                      <p className="text-sm text-foreground">Payment: {formatPaymentLabel(order)}</p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="text-lg font-semibold text-primary">{formatCurrency(order.totalPrice)}</p>
                      <Link href={`/orders/${order.id}`} className="inline-flex">
                        <Button variant="outline" className="border-border">
                          View Details
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
