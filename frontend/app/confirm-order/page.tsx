"use client"

import Link from "next/link"
import { useMemo, useState, type ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CreditCard, ReceiptText } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { appendMockOrder, type MockOrder, type MockPaymentMethod } from "@/lib/mock-order-history"
import { readMockCartItems, removeMockCartItem, type MockCartItem } from "@/lib/mock-cart"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function createOrderId(): string {
  return `ORD-${Date.now()}`
}

function buildMockMomoUrl(orderId: string, amount: number): string {
  return `https://test-payment.momo.vn/pay?orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(
    amount.toFixed(2)
  )}`
}

function buildSellerQrUrl(shopId: string, amount: number): string {
  const payload = `BANK_TRANSFER|shop=${shopId}|amount=${amount.toFixed(2)}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payload)}`
}

function readCartItem(cartItemId: string | null): MockCartItem | null {
  if (!cartItemId) {
    return null
  }

  return readMockCartItems().find((item) => item.id === cartItemId) ?? null
}

export default function ConfirmOrderPlaceholderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { products } = useStore()
  const cartItemId = searchParams.get("cartItemId")
  const productId = searchParams.get("productId")

  const [receiver, setReceiver] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<MockPaymentMethod>("cash")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transferProofFileName, setTransferProofFileName] = useState<string>("")
  const [transferProofImageDataUrl, setTransferProofImageDataUrl] = useState<string>("")

  const selectedProduct = useMemo(() => {
    if (!productId) {
      return undefined
    }

    return products.find((product) => product.id === productId)
  }, [productId, products])

  const selectedCartItem = useMemo(() => {
    return readCartItem(cartItemId)
  }, [cartItemId])

  const quantity = selectedCartItem?.quantity ?? 1
  const unitPrice = selectedProduct?.price ?? 0
  const totalPrice = unitPrice * quantity
  const sellerQrUrl = selectedProduct ? buildSellerQrUrl(selectedProduct.shopId, totalPrice) : ""

  const hasRequiredTransferProof = paymentMethod !== "bank-transfer" || Boolean(transferProofFileName)
  const canSubmit = receiver.trim() && phone.trim() && address.trim() && selectedProduct && hasRequiredTransferProof

  const handleTransferProofChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setTransferProofFileName("")
      setTransferProofImageDataUrl("")
      return
    }

    setTransferProofFileName(file.name)

    if (!file.type.startsWith("image/")) {
      setTransferProofImageDataUrl("")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") {
        setTransferProofImageDataUrl(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCreateOrder = () => {
    if (!canSubmit || !selectedProduct) {
      return
    }

    setIsSubmitting(true)

    const orderId = createOrderId()
    const now = new Date().toISOString()
    const momoStatus = paymentMethod === "momo" ? (Math.random() > 0.5 ? "success" : "pending") : undefined
    const bankTransferStatus = paymentMethod === "bank-transfer" ? "pending" : undefined

    const order: MockOrder = {
      id: orderId,
      createdAt: now,
      updatedAt: now,
      receiver: receiver.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod,
      momoStatus,
      bankTransferStatus,
      transferProofFileName: paymentMethod === "bank-transfer" ? transferProofFileName : undefined,
      transferProofImageDataUrl: paymentMethod === "bank-transfer" ? transferProofImageDataUrl : undefined,
      status: "pending",
      totalPrice,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          shopId: selectedProduct.shopId,
          shopName: selectedProduct.shopName,
          quantity,
          unitPrice,
        },
      ],
    }

    appendMockOrder(order)

    if (cartItemId) {
      removeMockCartItem(cartItemId)
    }

    if (paymentMethod === "momo") {
      const momoUrl = buildMockMomoUrl(order.id, order.totalPrice)
      window.open(momoUrl, "_blank", "noopener,noreferrer")
    }

    router.push("/orders")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <Card className="p-6 md:p-8 border border-border mb-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Confirm Order and Payment</h1>
              <p className="text-muted-foreground mt-1">
                Fill in receiver information and choose how you want to pay.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Receiver</label>
                <Input
                  value={receiver}
                  onChange={(event) => setReceiver(event.target.value)}
                  placeholder="Enter receiver full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Address</label>
                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Enter delivery address"
                  rows={4}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-foreground">Payment Method</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/40">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground">Cash on Delivery</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/40">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === "momo"}
                      onChange={() => setPaymentMethod("momo")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground">MoMo Payment Gateway</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/40">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank-transfer"
                      checked={paymentMethod === "bank-transfer"}
                      onChange={() => setPaymentMethod("bank-transfer")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground">Bank Transfer (Scan Seller QR)</span>
                  </label>
                </div>
              </div>

              {paymentMethod === "bank-transfer" ? (
                <Card className="p-4 border border-border bg-muted/30">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Seller QR for Bank Transfer</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={sellerQrUrl}
                      alt="Seller bank transfer QR"
                      className="w-44 h-44 rounded-md border border-border bg-white"
                    />
                    <div className="text-sm text-foreground">
                      <p>Shop: <span className="font-medium">{selectedProduct?.shopName ?? "Unknown"}</span></p>
                      <p>Amount: <span className="font-medium">{formatCurrency(totalPrice)}</span></p>
                      <p className="text-muted-foreground mt-2">Scan and transfer to seller, then upload transfer proof below.</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-foreground">Transfer Proof (required)</label>
                    <Input type="file" accept="image/*,.pdf" onChange={handleTransferProofChange} />
                    {transferProofFileName ? (
                      <p className="text-xs text-muted-foreground mt-2">Uploaded: {transferProofFileName}</p>
                    ) : (
                      <p className="text-xs text-destructive mt-2">Please upload transfer proof to create order.</p>
                    )}
                  </div>
                </Card>
              ) : null}
            </div>

            <div className="space-y-4">
              <Card className="p-4 border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  {selectedProduct ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : null}

                  <div className="min-w-0">
                    <p className="font-semibold text-foreground line-clamp-2">
                      {selectedProduct?.name ?? "Product not found"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shop: {selectedProduct?.shopName ?? "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-border">
                <h2 className="font-semibold text-foreground mb-3">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Unit Price</span>
                    <span>{formatCurrency(unitPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Quantity</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-border bg-muted/30 text-sm text-foreground">
                <p><span className="font-medium">Source:</span> Cart page</p>
                <p><span className="font-medium">Cart Item ID:</span> {cartItemId ?? "N/A"}</p>
                <p><span className="font-medium">Product ID:</span> {productId ?? "N/A"}</p>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <Link href="/cart" className="inline-flex">
              <Button variant="outline" className="border-border">
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </Button>
            </Link>

            <Button
              onClick={handleCreateOrder}
              disabled={!canSubmit || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ReceiptText className="w-4 h-4" />
              {paymentMethod === "cash"
                ? "Create Order"
                : paymentMethod === "momo"
                ? "Create Order and Pay with MoMo"
                : "Create Order with Bank Transfer"}
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
