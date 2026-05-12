"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Save, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ApiGateway, type OrderRecord } from "@/app/utils/api"
import { useAuth } from "@/contexts/auth-context"

const gatewayApi = new ApiGateway()
const PAGE_SIZE = 20

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

async function readOrderByOrderId(buyer: string, orderId: string): Promise<OrderRecord | null> {
  const firstPage = await gatewayApi.readOrdersByBuyer({ buyer, page: 1, limit: PAGE_SIZE })
  const firstItems = firstPage?.items || []
  const foundOnFirstPage = firstItems.find((item) => item.order_id === orderId)

  if (foundOnFirstPage) {
    return foundOnFirstPage
  }

  const totalPages = Number(firstPage?.totalPages || 1)

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await gatewayApi.readOrdersByBuyer({ buyer, page, limit: PAGE_SIZE })
    const found = (response?.items || []).find((item) => item.order_id === orderId)

    if (found) {
      return found
    }
  }

  return null
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const orderId = params.id
  const { isLoggedIn, email } = useAuth()

  const [order, setOrder] = useState<OrderRecord | null>(null)
  const [receiver, setReceiver] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [message, setMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isCancelling, setIsCancelling] = useState<boolean>(false)

  const loadOrder = async () => {
    if (!email || !orderId || !isLoggedIn) {
      setOrder(null)
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const found = await readOrderByOrderId(email, orderId)
      setOrder(found)

      if (found) {
        setReceiver(found.receiver)
        setPhone(found.phone)
        setAddress(found.address)
      } else {
        setMessage("Order not found.")
      }
    } catch (error: any) {
      setOrder(null)
      setMessage(error?.message || "Unable to load order")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [orderId, email, isLoggedIn])

  const canEdit = Boolean(order && !["shipped", "delivered", "cancelled", "rejected"].includes(order.status))
  const canCancel = Boolean(order && !["shipped", "delivered", "cancelled", "rejected"].includes(order.status))

  const handleSave = async () => {
    if (!order || !email || !canEdit) {
      return
    }

    setIsSaving(true)
    setMessage("")

    try {
      const updated = await gatewayApi.modifyOrder({
        order_id: order.order_id,
        buyer: email,
        receiver: receiver.trim(),
        phone: phone.trim(),
        address: address.trim(),
      })

      setOrder(updated || order)
      setMessage("Order details updated successfully.")
      await loadOrder()
    } catch (error: any) {
      setMessage(error?.message || "Unable to update this order")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!order || !email || !canCancel) {
      return
    }

    setIsCancelling(true)
    setMessage("")

    try {
      const updated = await gatewayApi.cancelOrder({
        order_id: order.order_id,
        buyer: email,
      })

      setOrder(updated || { ...order, status: "cancelled" })
      setMessage("Order cancelled successfully.")
      await loadOrder()
    } catch (error: any) {
      setMessage(error?.message || "Unable to cancel this order")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="mb-5">
          <Link href="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>

        {!isLoggedIn ? (
          <Card className="p-8 text-center border border-dashed border-border mb-4">
            <h1 className="text-xl font-semibold text-foreground mb-2">Please sign in</h1>
            <p className="text-muted-foreground">You need to login before viewing order details.</p>
          </Card>
        ) : null}

        {isLoading ? (
          <Card className="p-8 text-center border border-border mb-4">
            <p className="text-muted-foreground">Loading order...</p>
          </Card>
        ) : null}

        {!isLoading && !order ? (
          <Card className="p-8 text-center border border-dashed border-border">
            <h1 className="text-xl font-semibold text-foreground mb-2">Order not found</h1>
            <p className="text-muted-foreground">The requested order does not exist.</p>
          </Card>
        ) : null}

        {!isLoading && order ? (
          <div className="space-y-5">
            <Card className="p-5 md:p-6 border border-border bg-gradient-to-r from-primary/5 to-background">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Order {order.order_id}</h1>
                  <p className="text-sm text-muted-foreground mt-1">You can update receiver info while order is not shipped/delivered/cancelled/rejected.</p>
                </div>

                <Badge variant="secondary" className="capitalize">{order.status}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">Created: {formatDate(order.created_at)}</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="p-5 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Receiver</label>
                    <Input value={receiver} onChange={(event) => setReceiver(event.target.value)} disabled={!canEdit} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
                    <Input value={phone} onChange={(event) => setPhone(event.target.value)} disabled={!canEdit} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Address</label>
                    <textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      rows={4}
                      disabled={!canEdit}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={handleSave} disabled={!canEdit || isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Save className="w-4 h-4" />
                      Save Delivery Info
                    </Button>

                    <Button onClick={handleCancel} disabled={!canCancel || isCancelling} variant="destructive">
                      <XCircle className="w-4 h-4" />
                      Cancel Order
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium text-foreground">{paymentLabel(order.payment)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Order Status</span>
                    <span className="font-medium text-foreground capitalize">{order.status}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium text-foreground">{order.quantity}</span>
                  </div>

                  <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="font-semibold text-primary">{formatCurrency(Number(order.price || 0))}</span>
                  </div>

                  {order.payment === 1 ? (
                    <>
                      <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                        <span className="text-muted-foreground">Bank</span>
                        <span className="font-medium text-foreground">{order.bank || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bank Number</span>
                        <span className="font-medium text-foreground">{order.bank_number || "N/A"}</span>
                      </div>
                    </>
                  ) : null}
                </div>
              </Card>
            </div>

            {message ? (
              <Card className="p-4 border border-border bg-muted/40">
                <p className="text-sm text-foreground">{message}</p>
              </Card>
            ) : null}
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
