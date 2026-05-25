"use client"

import Link from "next/link"
import { use } from "react"
import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ApiGateway, normalizeIdentifierToUuid, type OrderRecord } from "@/app/utils/api"
import { useAuth } from "@/contexts/auth-context"

interface SellerOrderDetailPageProps {
  params: Promise<{ id: string; orderId: string }>
}

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

async function readShopOrderByOrderId(shopId: string, orderId: string, owner: string): Promise<OrderRecord | null> {
  const firstPage = await gatewayApi.readOrdersByShop({
    shop_id: normalizeIdentifierToUuid(shopId),
    owner,
    page: 1,
    limit: PAGE_SIZE,
  })
  const firstItems = firstPage?.items || []
  const foundOnFirstPage = firstItems.find((item) => item.order_id === orderId)
  if (foundOnFirstPage) return foundOnFirstPage

  const totalPages = Number(firstPage?.totalPages || 1)
  for (let page = 2; page <= totalPages; page += 1) {
    const result = await gatewayApi.readOrdersByShop({
      shop_id: normalizeIdentifierToUuid(shopId),
      owner,
      page,
      limit: PAGE_SIZE,
    })
    const found = (result?.items || []).find((item) => item.order_id === orderId)
    if (found) return found
  }

  return null
}

export default function SellerOrderDetailPage({ params }: SellerOrderDetailPageProps) {
  const { id, orderId } = use(params)
  const { isLoggedIn, email } = useAuth()
  const [order, setOrder] = useState<OrderRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [refundProofLink, setRefundProofLink] = useState("")
  const [rejectPurpose, setRejectPurpose] = useState("")
  const [rejectTransferBackImg, setRejectTransferBackImg] = useState("")
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false)
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false)

  const canProcessCancelled = Boolean(order && order.status === "cancelled")
  const isBankTransfer = Number(order?.payment || 0) === 1

  const loadOrder = async () => {
    if (!email) {
      setOrder(null)
      return
    }
    setIsLoading(true)
    setMessage("")
    try {
      const result = await readShopOrderByOrderId(id, orderId, email)
      setOrder(result)
      setRefundProofLink(result?.seller_tranfer_back_img || "")
      if (!result) setMessage("Order not found.")
    } catch (error: any) {
      setOrder(null)
      setMessage(error?.message || "Unable to load order detail")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return
    loadOrder()
  }, [id, orderId, isLoggedIn, email])

  const handleProcessCancellation = async () => {
    if (!order || !canProcessCancelled) return
    if (isBankTransfer && !refundProofLink.trim()) {
      setMessage("Refund transfer image link is required for bank transfer orders.")
      return
    }

    setIsSubmittingRefund(true)
    setMessage("")
    try {
      const updated = await gatewayApi.sellerRefundCancelledOrder({
        order_id: order.order_id,
        seller: order.seller,
        seller_tranfer_back_img: isBankTransfer ? refundProofLink.trim() : null,
      })
      setOrder(updated || order)
      setMessage(isBankTransfer ? "Refund proof sent to buyer." : "Cancellation confirmed and buyer notified.")
      await loadOrder()
    } catch (error: any) {
      setMessage(error?.message || "Unable to process cancellation")
    } finally {
      setIsSubmittingRefund(false)
    }
  }

  const handleAccept = async () => {
    if (!order) return
    setIsSubmittingDecision(true)
    setMessage("")
    try {
      const updated = await gatewayApi.sellerAcceptOrder({
        order_id: order.order_id,
        seller: order.seller,
      })
      setOrder(updated || order)
      setMessage("Order accepted successfully.")
      await loadOrder()
    } catch (error: any) {
      setMessage(error?.message || "Unable to accept order")
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  const handleReject = async () => {
    if (!order) return
    const purpose = rejectPurpose.trim()
    if (!purpose) {
      setMessage("Reject purpose is required.")
      return
    }
    if (isBankTransfer && !rejectTransferBackImg.trim()) {
      setMessage("Refund transfer image link is required for bank transfer rejection.")
      return
    }

    setIsSubmittingDecision(true)
    setMessage("")
    try {
      const updated = await gatewayApi.sellerRejectOrder({
        order_id: order.order_id,
        seller: order.seller,
        purpose,
        seller_tranfer_back_img: isBankTransfer ? rejectTransferBackImg.trim() : null,
      })
      setOrder(updated || order)
      setMessage("Order rejected successfully.")
      await loadOrder()
    } catch (error: any) {
      setMessage(error?.message || "Unable to reject order")
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
          <Card className="p-8 border border-dashed border-border text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Please sign in</h1>
            <p className="text-muted-foreground">Sign in to view this page.</p>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <Link href={`/shop/${id}/orders`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-5">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop Orders
        </Link>

        {isLoading ? (
          <Card className="p-8 text-center border border-border">
            <p className="text-muted-foreground">Loading order detail...</p>
          </Card>
        ) : null}

        {!isLoading && !order ? (
          <Card className="p-8 text-center border border-dashed border-border">
            <p className="text-muted-foreground">Order not found.</p>
          </Card>
        ) : null}

        {!isLoading && order ? (
          <div className="space-y-5">
            <Card className="p-5 border border-border">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">Order {order.order_id}</h1>
                <Badge variant="secondary" className="capitalize">{order.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Created: {formatDate(order.created_at)}</p>
            </Card>

            <Card className="p-5 border border-border space-y-2">
              <p className="text-sm text-foreground">Buyer: <span className="font-medium">{order.buyer}</span></p>
              <p className="text-sm text-foreground">Receiver: <span className="font-medium">{order.receiver}</span></p>
              <p className="text-sm text-foreground">Phone: <span className="font-medium">{order.phone}</span></p>
              <p className="text-sm text-foreground">Address: <span className="font-medium">{order.address}</span></p>
              <p className="text-sm text-foreground">Payment: <span className="font-medium">{order.payment === 1 ? "Bank Transfer" : "Cash"}</span></p>
              <p className="text-sm text-foreground">Total: <span className="font-medium">{formatCurrency(Number(order.price || 0))}</span></p>
              {order.reject_or_cancel_purpose ? (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-foreground">Cancel/Reject Purpose</p>
                  <p className="font-medium text-foreground">{order.reject_or_cancel_purpose}</p>
                </div>
              ) : null}
              {order.bank_success_transfer_img ? (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-foreground mb-1">Buyer Transfer Proof</p>
                  <img
                    src={order.bank_success_transfer_img}
                    alt="Buyer transfer proof"
                    className="w-full max-w-sm rounded-md border border-border object-cover mb-2"
                  />
                  <a
                    href={order.bank_success_transfer_img}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Image
                  </a>
                </div>
              ) : null}
              {order.seller_tranfer_back_img ? (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-foreground mb-1">Seller Refund Proof</p>
                  <img
                    src={order.seller_tranfer_back_img}
                    alt="Seller refund proof"
                    className="w-full max-w-sm rounded-md border border-border object-cover mb-2"
                  />
                  <a
                    href={order.seller_tranfer_back_img}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Image
                  </a>
                </div>
              ) : null}
            </Card>

            {order.status === "pending" ? (
              <Card className="p-5 border border-border space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Order Decision</h2>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Reject Purpose</label>
                  <textarea
                    value={rejectPurpose}
                    onChange={(event) => setRejectPurpose(event.target.value)}
                    rows={3}
                    placeholder="Required if you reject this order"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {isBankTransfer ? (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Refund Transfer Image Link (for reject)</label>
                    <Input
                      value={rejectTransferBackImg}
                      onChange={(event) => setRejectTransferBackImg(event.target.value)}
                      placeholder="https://... (required for bank transfer reject)"
                    />
                  </div>
                ) : null}
                <div className="flex items-center gap-3">
                  <Button onClick={handleAccept} disabled={isSubmittingDecision}>
                    Accept Order
                  </Button>
                  <Button onClick={handleReject} disabled={isSubmittingDecision} variant="destructive">
                    Reject Order
                  </Button>
                </div>
              </Card>
            ) : null}

            {canProcessCancelled ? (
              <Card className="p-5 border border-border space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Cancellation Processing</h2>
                {isBankTransfer ? (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Refund Transfer Image Link</label>
                    <Input
                      value={refundProofLink}
                      onChange={(event) => setRefundProofLink(event.target.value)}
                      placeholder="https://... (required for bank transfer)"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">This is a cash order. Click button to confirm cancellation to buyer.</p>
                )}
                <Button onClick={handleProcessCancellation} disabled={isSubmittingRefund}>
                  {isBankTransfer ? "Send Refund Proof to Buyer" : "Confirm Cancellation to Buyer"}
                </Button>
              </Card>
            ) : null}

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
