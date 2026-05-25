"use client"

import Link from "next/link"
import { use } from "react"
import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApiGateway, normalizeIdentifierToUuid, type OrderRecord } from "@/app/utils/api"
import { useAuth } from "@/contexts/auth-context"

interface ShopOrdersPageProps {
  params: Promise<{ id: string }>
}

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

function statusVariant(status: OrderRecord["status"]): "secondary" | "outline" {
  if (status === "pending" || status === "processing") {
    return "secondary"
  }

  return "outline"
}

function paymentLabel(payment: 0 | 1): string {
  return payment === 0 ? "Cash" : "Bank Transfer"
}

export default function ShopOrdersPage({ params }: ShopOrdersPageProps) {
  const { id } = use(params)
  const { isLoggedIn, email } = useAuth()

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [rejectPurposeByOrder, setRejectPurposeByOrder] = useState<Record<string, string>>({})
  const [rejectTransferImgByOrder, setRejectTransferImgByOrder] = useState<Record<string, string>>({})

  const loadOrders = async (page: number) => {
    if (!email) {
      setOrders([])
      setTotalPages(1)
      setTotalItems(0)
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await gatewayApi.readOrdersByShop({
        shop_id: normalizeIdentifierToUuid(id),
        owner: email,
        page,
        limit: PAGE_SIZE,
      })

      setOrders(result?.items || [])
      setTotalPages(Math.max(1, Number(result?.totalPages || 1)))
      setTotalItems(Number(result?.totalItems || 0))
    } catch (error: any) {
      setOrders([])
      setTotalPages(1)
      setTotalItems(0)
      setErrorMessage(error?.message || "Unable to load shop orders")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders(currentPage)
  }, [currentPage, id, email])

  const handleAccept = async (order: OrderRecord) => {
    try {
      await gatewayApi.sellerAcceptOrder({
        order_id: order.order_id,
        seller: order.seller,
      })
      setMessage(`Order ${order.order_id} accepted.`)
      await loadOrders(currentPage)
    } catch (error: any) {
      setMessage(error?.message || "Unable to accept this order")
    }
  }

  const handleReject = async (order: OrderRecord) => {
    const purpose = String(rejectPurposeByOrder[order.order_id] || "").trim()
    if (!purpose) {
      setMessage("Please provide reject purpose before rejecting the order.")
      return
    }
    const isBankTransfer = Number(order.payment) === 1
    const transferImg = String(rejectTransferImgByOrder[order.order_id] || "").trim()
    if (isBankTransfer && !transferImg) {
      setMessage("Please provide transfer image link for bank transfer order rejection.")
      return
    }
    try {
      await gatewayApi.sellerRejectOrder({
        order_id: order.order_id,
        seller: order.seller,
        purpose,
        seller_tranfer_back_img: isBankTransfer ? transferImg : null,
      })
      setMessage(`Order ${order.order_id} rejected.`)
      setRejectPurposeByOrder((prev) => ({ ...prev, [order.order_id]: "" }))
      setRejectTransferImgByOrder((prev) => ({ ...prev, [order.order_id]: "" }))
      await loadOrders(currentPage)
    } catch (error: any) {
      setMessage(error?.message || "Unable to reject this order")
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
          <Card className="p-8 border border-dashed border-border text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Please sign in</h1>
            <p className="text-muted-foreground">Sign in to view shop orders.</p>
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
            <Link href={`/shop/${id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Shop Orders</h1>
            <p className="text-muted-foreground">Accept or reject pending orders for this shop.</p>
          </div>

          <Card className="px-4 py-3 border border-border min-w-[180px]">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-lg font-semibold text-foreground">{totalItems}</p>
          </Card>
        </div>

        {message ? (
          <Card className="p-3 border border-border bg-muted/30 mb-4">
            <p className="text-sm text-foreground">{message}</p>
          </Card>
        ) : null}

        {errorMessage ? (
          <Card className="border border-destructive/40 bg-destructive/5 p-3 mb-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </Card>
        ) : null}

        {isLoading ? (
          <Card className="p-8 border border-border text-center mb-4">
            <p className="text-muted-foreground">Loading shop orders...</p>
          </Card>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <Card className="p-10 border border-dashed border-border text-center">
            <h2 className="text-lg font-semibold text-foreground mb-1">No orders for this shop yet</h2>
            <p className="text-muted-foreground">Orders will appear here when customers buy your products.</p>
          </Card>
        ) : null}

        {!isLoading && orders.length > 0 ? (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border border-border p-4 md:p-5">
                  <div className="flex flex-col xl:flex-row gap-5 xl:items-start xl:justify-between">
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{order.order_id}</Badge>
                        <Badge variant={statusVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">Created: {formatDate(order.created_at)}</p>
                      <p className="text-sm text-foreground">Buyer: {order.buyer}</p>
                      <p className="text-sm text-foreground">Payment: {paymentLabel(order.payment)}</p>
                      {order.payment === 1 ? (
                        <p className="text-sm text-foreground">
                          Transfer Proof:{" "}
                          {order.bank_success_transfer_img ? (
                            <a
                              href={order.bank_success_transfer_img}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Image
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </p>
                      ) : null}
                      <p className="text-sm text-muted-foreground">Receiver: {order.receiver} - {order.phone}</p>
                      <Link href={`/shop/${id}/orders/${order.order_id}`} className="inline-block text-sm text-primary hover:underline">
                        View Details
                      </Link>
                    </div>

                    <div className="xl:text-right space-y-3 min-w-[260px]">
                      <p className="text-lg font-semibold text-primary">{formatCurrency(Number(order.price || 0))}</p>
                      {order.status === "pending" ? (
                        <div className="space-y-2">
                          <textarea
                            value={rejectPurposeByOrder[order.order_id] || ""}
                            onChange={(event) =>
                              setRejectPurposeByOrder((prev) => ({
                                ...prev,
                                [order.order_id]: event.target.value,
                              }))
                            }
                            rows={2}
                            placeholder="Reject purpose (required)"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {Number(order.payment) === 1 ? (
                            <input
                              type="text"
                              value={rejectTransferImgByOrder[order.order_id] || ""}
                              onChange={(event) =>
                                setRejectTransferImgByOrder((prev) => ({
                                  ...prev,
                                  [order.order_id]: event.target.value,
                                }))
                              }
                              placeholder="Refund transfer image link (required for bank transfer)"
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : null}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap xl:justify-end gap-2">
                        <Button
                          variant="outline"
                          className="border-border"
                          onClick={() => handleAccept(order)}
                          disabled={order.status !== "pending"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(order)}
                          disabled={order.status !== "pending"}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
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
