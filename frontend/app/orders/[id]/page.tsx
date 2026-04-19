"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, CheckCircle2, Save } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  formatPaymentLabel,
  readMockOrders,
  updateMockOrder,
  updateMockOrderStatus,
  type MockOrder,
} from "@/lib/mock-order-history"

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

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const orderId = params.id

  const [order, setOrder] = useState<MockOrder | null>(null)
  const [receiver, setReceiver] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const found = readMockOrders().find((entry) => entry.id === orderId) ?? null
    setOrder(found)

    if (found) {
      setReceiver(found.receiver)
      setPhone(found.phone)
      setAddress(found.address)
    }
  }, [orderId])

  const totalQuantity = useMemo(() => {
    return order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  }, [order])

  const handleSave = () => {
    if (!order) {
      return
    }

    const updated = updateMockOrder(order.id, {
      receiver: receiver.trim(),
      phone: phone.trim(),
      address: address.trim(),
    })

    if (!updated) {
      setMessage("Unable to update this order right now.")
      return
    }

    setOrder(updated)
    setMessage("Order details updated successfully.")
  }

  const handleConfirmReceived = () => {
    if (!order) {
      return
    }

    const updated = updateMockOrderStatus(order.id, "delivered")

    if (!updated) {
      setMessage("Unable to confirm receipt right now.")
      return
    }

    setOrder(updated)
    setMessage("Order marked as delivered. Thank you for confirming receipt.")
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

        {!order ? (
          <Card className="p-8 text-center border border-dashed border-border">
            <h1 className="text-xl font-semibold text-foreground mb-2">Order not found</h1>
            <p className="text-muted-foreground">The requested order does not exist in the mock history.</p>
          </Card>
        ) : (
          <div className="space-y-5">
            <Card className="p-5 md:p-6 border border-border bg-gradient-to-r from-primary/5 to-background">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Order {order.id}</h1>
                  <p className="text-sm text-muted-foreground mt-1">Review your order and update delivery info if needed.</p>
                </div>

                <Badge variant="secondary" className="capitalize">{order.status}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">Created: {formatDate(order.createdAt)}</p>
              <p className="text-sm text-muted-foreground">Updated: {formatDate(order.updatedAt)}</p>

              {(order.status === "shipped" || order.status === "processing") ? (
                <div className="mt-4">
                  <Button onClick={handleConfirmReceived} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Received
                  </Button>
                </div>
              ) : null}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="p-5 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Receiver</label>
                    <Input value={receiver} onChange={(event) => setReceiver(event.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
                    <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Address</label>
                    <textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Save className="w-4 h-4" />
                      Save Delivery Info
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Payment and Price</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium text-foreground">{formatPaymentLabel(order)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Order Status</span>
                    <span className="font-medium text-foreground capitalize">{order.status}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Quantity</span>
                    <span className="font-medium text-foreground">{totalQuantity}</span>
                  </div>

                  <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="font-semibold text-primary">{formatCurrency(order.totalPrice)}</span>
                  </div>

                  {order.paymentMethod === "bank-transfer" ? (
                    <>
                      <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                        <span className="text-muted-foreground">Transfer Status</span>
                        <span className="font-medium text-foreground capitalize">{order.bankTransferStatus ?? "pending"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Transfer Proof</span>
                        <span className="font-medium text-foreground">{order.transferProofFileName ?? "Not uploaded"}</span>
                      </div>
                    </>
                  ) : null}
                </div>
              </Card>
            </div>

            {order.paymentMethod === "bank-transfer" && order.transferProofImageDataUrl ? (
              <Card className="p-5 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Transfer Proof Preview</h2>
                <img
                  src={order.transferProofImageDataUrl}
                  alt="Transfer proof"
                  className="max-h-96 rounded-md border border-border"
                />
              </Card>
            ) : null}

            <Card className="p-5 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}`} className="rounded-md border border-border p-3">
                    <p className="font-medium text-foreground">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Shop: {item.shopName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {message ? (
              <Card className="p-4 border border-border bg-muted/40">
                <p className="text-sm text-foreground">{message}</p>
              </Card>
            ) : null}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
