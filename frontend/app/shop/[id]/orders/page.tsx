"use client"

import Link from "next/link"
import { use, useEffect, useMemo, useState } from "react"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import {
  formatPaymentLabel,
  readMockOrders,
  updateMockOrderStatus,
  writeMockOrders,
  type MockOrder,
} from "@/lib/mock-order-history"

const MOCK_TRANSFER_PROOF =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='520' height='320'>
      <rect width='100%' height='100%' fill='#f8fafc'/>
      <rect x='30' y='30' width='460' height='260' rx='16' fill='#ffffff' stroke='#e2e8f0'/>
      <text x='55' y='95' font-family='Arial' font-size='22' fill='#0f172a'>Bank Transfer Receipt</text>
      <text x='55' y='145' font-family='Arial' font-size='16' fill='#334155'>Status: Success</text>
      <text x='55' y='178' font-family='Arial' font-size='16' fill='#334155'>Reference: TRX-892147</text>
      <text x='55' y='211' font-family='Arial' font-size='16' fill='#334155'>Bank: ShopHub Demo Bank</text>
      <text x='55' y='244' font-family='Arial' font-size='16' fill='#334155'>Uploaded by Customer</text>
    </svg>`
  )

interface ShopOrdersPageProps {
  params: Promise<{ id: string }>
}

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

function buildSeedOrders(
  shopId: string,
  shopName: string,
  products: Array<{ id: string; name: string; price: number }>
): MockOrder[] {
  const now = Date.now()

  const first = products[0] ?? { id: `seed-${shopId}-1`, name: "Sample Product A", price: 29.99 }
  const second = products[1] ?? { id: `seed-${shopId}-2`, name: "Sample Product B", price: 49.99 }
  const third = products[2] ?? { id: `seed-${shopId}-3`, name: "Sample Product C", price: 19.99 }

  return [
    {
      id: `ORD-SEED-${shopId}-1`,
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      receiver: "Alex Nguyen",
      phone: "0901000001",
      address: "221B Demo Street, HCMC",
      paymentMethod: "bank-transfer",
      bankTransferStatus: "verified",
      transferProofFileName: "bank-transfer-proof.png",
      transferProofImageDataUrl: MOCK_TRANSFER_PROOF,
      status: "pending",
      totalPrice: first.price * 2,
      items: [
        {
          productId: first.id,
          productName: first.name,
          shopId,
          shopName,
          quantity: 2,
          unitPrice: first.price,
        },
      ],
    },
    {
      id: `ORD-SEED-${shopId}-2`,
      createdAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
      receiver: "Minh Tran",
      phone: "0901000002",
      address: "15 Sample Avenue, Ha Noi",
      paymentMethod: "cash",
      status: "processing",
      totalPrice: second.price,
      items: [
        {
          productId: second.id,
          productName: second.name,
          shopId,
          shopName,
          quantity: 1,
          unitPrice: second.price,
        },
      ],
    },
    {
      id: `ORD-SEED-${shopId}-3`,
      createdAt: new Date(now - 15 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 15 * 60 * 60 * 1000).toISOString(),
      receiver: "Thanh Le",
      phone: "0901000003",
      address: "88 Mock Lane, Da Nang",
      paymentMethod: "momo",
      momoStatus: "success",
      status: "shipped",
      totalPrice: third.price * 3,
      items: [
        {
          productId: third.id,
          productName: third.name,
          shopId,
          shopName,
          quantity: 3,
          unitPrice: third.price,
        },
      ],
    },
  ]
}

export default function ShopOrdersPage({ params }: ShopOrdersPageProps) {
  const { id } = use(params)
  const { user, getShopById, products } = useStore()
  const [orders, setOrders] = useState<MockOrder[]>(() => readMockOrders())
  const [message, setMessage] = useState<string>("")

  const shop = getShopById(id)
  const isOwner = Boolean(shop && user?.id === shop.ownerId)

  const shopOrders = useMemo(() => {
    if (!shop) {
      return []
    }

    return orders.filter((order) =>
      order.items.some((item) => item.shopId === shop.id || item.shopName === shop.name)
    )
  }, [orders, shop])

  useEffect(() => {
    if (!shop || !isOwner || shopOrders.length > 0) {
      return
    }

    const shopProducts = products.filter((product) => product.shopId === shop.id)
    const seededOrders = buildSeedOrders(shop.id, shop.name, shopProducts)
    const merged = [...seededOrders, ...orders]
    writeMockOrders(merged)
    setOrders(merged)
    setMessage("Mock shop orders generated.")
  }, [isOwner, orders, products, shop, shopOrders.length])

  const handleAccept = (orderId: string) => {
    const updated = updateMockOrderStatus(orderId, "processing")

    if (!updated) {
      setMessage("Unable to accept this order right now.")
      return
    }

    setOrders((previous) => previous.map((order) => (order.id === updated.id ? updated : order)))
    setMessage(`Order ${updated.id} accepted.`)
  }

  const handleReject = (orderId: string) => {
    const updated = updateMockOrderStatus(orderId, "cancelled")

    if (!updated) {
      setMessage("Unable to reject this order right now.")
      return
    }

    setOrders((previous) => previous.map((order) => (order.id === updated.id ? updated : order)))
    setMessage(`Order ${updated.id} rejected.`)
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
          <Card className="p-8 border border-dashed border-border text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Shop not found</h1>
            <p className="text-muted-foreground">The requested shop does not exist.</p>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
          <Card className="p-8 border border-dashed border-border text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Access denied</h1>
            <p className="text-muted-foreground">Only the owner of this shop can manage shop orders.</p>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href={`/shop/${shop.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{shop.name} Orders</h1>
            <p className="text-muted-foreground">Accept or reject incoming orders for your shop.</p>
          </div>

          <Card className="px-4 py-3 border border-border min-w-[180px]">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-lg font-semibold text-foreground">{shopOrders.length}</p>
          </Card>
        </div>

        {message ? (
          <Card className="p-3 border border-border bg-muted/30 mb-4">
            <p className="text-sm text-foreground">{message}</p>
          </Card>
        ) : null}

        {shopOrders.length === 0 ? (
          <Card className="p-10 border border-dashed border-border text-center">
            <h2 className="text-lg font-semibold text-foreground mb-1">No orders for this shop yet</h2>
            <p className="text-muted-foreground">Orders will appear here when customers buy your products.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {shopOrders.map((order) => {
              const relatedItems = order.items.filter((item) => item.shopId === shop.id || item.shopName === shop.name)

              return (
                <Card key={order.id} className="border border-border p-4 md:p-5">
                  <div className="flex flex-col xl:flex-row gap-5 xl:items-start xl:justify-between">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{order.id}</Badge>
                        <Badge variant={statusVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">Created: {formatDate(order.createdAt)}</p>
                      <p className="text-sm text-foreground">Payment: {formatPaymentLabel(order)}</p>

                      <div className="space-y-2 pt-1">
                        {relatedItems.map((item) => (
                          <div key={`${order.id}-${item.productId}`} className="rounded-md border border-border p-2">
                            <p className="font-medium text-foreground">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.unitPrice)} x {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="xl:text-right space-y-3 min-w-[260px]">
                      <p className="text-lg font-semibold text-primary">{formatCurrency(order.totalPrice)}</p>

                      {order.paymentMethod === "bank-transfer" ? (
                        <Card className="p-3 border border-border bg-muted/30 text-left">
                          <p className="text-sm font-medium text-foreground mb-2">Transfer Proof</p>
                          {order.transferProofImageDataUrl ? (
                            <img
                              src={order.transferProofImageDataUrl}
                              alt="Transfer proof"
                              className="w-full max-h-56 object-contain rounded-md border border-border bg-white"
                            />
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {order.transferProofFileName ?? "No image preview available."}
                            </p>
                          )}
                        </Card>
                      ) : null}

                      <div className="flex flex-wrap xl:justify-end gap-2">
                        <Button
                          variant="outline"
                          className="border-border"
                          onClick={() => handleAccept(order.id)}
                          disabled={order.status === "cancelled" || order.status === "delivered"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(order.id)}
                          disabled={order.status === "cancelled" || order.status === "delivered"}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="secondary">View Detail</Button>
                        </Link>
                      </div>
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
