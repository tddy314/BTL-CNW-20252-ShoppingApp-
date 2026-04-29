"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CreditCard, ReceiptText } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { ApiGateway, normalizeIdentifierToUuid } from "@/app/utils/api"

type PaymentMethod = "cash" | "bank-transfer"

type CartApiItem = {
  cartItemId: string
  shop?: {
    shopId?: string
    shopName?: string
  }
  productDetail?: {
    productId?: string
    productName?: string
    image?: string
    price?: number
    category?: string
    quantity?: number
    selectedOptions?: {
      color?: string
      size?: string
      material?: string
    }
  }
}

const gatewayApi = new ApiGateway()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function parseSizeToSmallInt(size?: string): number | null {
  if (!size) {
    return null
  }

  const parsed = Number(size)
  if (!Number.isInteger(parsed)) {
    return null
  }

  if (parsed < -32768 || parsed > 32767) {
    return null
  }

  return parsed
}

async function readCartItemById(email: string, cartItemId: string): Promise<CartApiItem | null> {
  const firstPage = await gatewayApi.readCart(email, 1, 20)
  const firstItems = (firstPage?.items || []) as CartApiItem[]
  const foundInFirstPage = firstItems.find((entry) => entry.cartItemId === cartItemId)

  if (foundInFirstPage) {
    return foundInFirstPage
  }

  const totalPages = Number(firstPage?.totalPages || 1)

  for (let page = 2; page <= totalPages; page += 1) {
    const pageData = await gatewayApi.readCart(email, page, 20)
    const pageItems = (pageData?.items || []) as CartApiItem[]
    const found = pageItems.find((entry) => entry.cartItemId === cartItemId)

    if (found) {
      return found
    }
  }

  return null
}

export default function ConfirmOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, email } = useAuth()

  const cartItemId = searchParams.get("cartItemId")

  const [cartItem, setCartItem] = useState<CartApiItem | null>(null)
  const [receiver, setReceiver] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [bankName, setBankName] = useState("")
  const [bankNumber, setBankNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const loadCartItem = async () => {
      if (!email || !cartItemId) {
        return
      }

      setIsLoading(true)
      setErrorMessage("")

      try {
        const result = await readCartItemById(email, cartItemId)
        setCartItem(result)

        if (!result) {
          setErrorMessage("Cart item not found.")
        }
      } catch (error: any) {
        setErrorMessage(error?.message || "Unable to load cart item")
      } finally {
        setIsLoading(false)
      }
    }

    loadCartItem()
  }, [email, cartItemId])

  const quantity = Number(cartItem?.productDetail?.quantity || 1)
  const unitPrice = Number(cartItem?.productDetail?.price || 0)
  const totalPrice = unitPrice * quantity

  const canSubmit = useMemo(() => {
    if (!isLoggedIn || !email || !cartItemId || !cartItem) {
      return false
    }

    if (!receiver.trim() || !phone.trim() || !address.trim()) {
      return false
    }

    if (paymentMethod === "bank-transfer") {
      return Boolean(bankName.trim() && bankNumber.trim())
    }

    return true
  }, [isLoggedIn, email, cartItemId, cartItem, receiver, phone, address, paymentMethod, bankName, bankNumber])

  const handleCreateOrder = async () => {
    if (!canSubmit || !email || !cartItemId || !cartItem) {
      return
    }

    const product = cartItem.productDetail
    const shop = cartItem.shop

    if (!product?.productId || !shop?.shopId) {
      setErrorMessage("Missing product or shop information")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      await gatewayApi.newOrder({
        product_id: normalizeIdentifierToUuid(product.productId),
        buyer: email,
        color: product.selectedOptions?.color ?? null,
        size: parseSizeToSmallInt(product.selectedOptions?.size),
        payment: paymentMethod === "cash" ? 0 : 1,
        bank: paymentMethod === "bank-transfer" ? bankName.trim() : null,
        bank_number: paymentMethod === "bank-transfer" ? bankNumber.trim() : null,
        price: Math.round(totalPrice),
        phone: phone.trim(),
        address: address.trim(),
        receiver: receiver.trim(),
        quantity,
        seller: shop.shopName || "seller",
        shop_id: normalizeIdentifierToUuid(shop.shopId),
      })

      await gatewayApi.removeItemFromCart(email, cartItemId)
      router.push("/orders")
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to create order")
    } finally {
      setIsSubmitting(false)
    }
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
                Fill in receiver information and choose a payment method.
              </p>
            </div>
          </div>

          {errorMessage ? (
            <Card className="border border-destructive/40 bg-destructive/5 p-3 mb-4">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </Card>
          ) : null}

          {!isLoggedIn ? (
            <Card className="border border-dashed border-border p-6 text-center mb-4">
              <p className="text-muted-foreground">Please sign in to create an order.</p>
            </Card>
          ) : null}

          {isLoading ? (
            <Card className="border border-border p-6 text-center mb-4">
              <p className="text-muted-foreground">Loading cart item...</p>
            </Card>
          ) : null}

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
                      value="bank-transfer"
                      checked={paymentMethod === "bank-transfer"}
                      onChange={() => setPaymentMethod("bank-transfer")}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground">Bank Transfer</span>
                  </label>
                </div>
              </div>

              {paymentMethod === "bank-transfer" ? (
                <Card className="p-4 border border-border bg-muted/30">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Bank Transfer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Bank</label>
                      <Input
                        value={bankName}
                        onChange={(event) => setBankName(event.target.value)}
                        placeholder="e.g. Vietcombank"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Bank Number</label>
                      <Input
                        value={bankNumber}
                        onChange={(event) => setBankNumber(event.target.value)}
                        placeholder="Bank account or transfer reference"
                      />
                    </div>
                  </div>
                </Card>
              ) : null}
            </div>

            <div className="space-y-4">
              <Card className="p-4 border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  {cartItem?.productDetail?.image ? (
                    <img
                      src={cartItem.productDetail.image}
                      alt={cartItem.productDetail.productName || "Product"}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : null}

                  <div className="min-w-0">
                    <p className="font-semibold text-foreground line-clamp-2">
                      {cartItem?.productDetail?.productName ?? "Product not found"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shop: {cartItem?.shop?.shopName ?? "Unknown"}
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
              {paymentMethod === "cash" ? "Create Order" : "Create Order with Bank Transfer"}
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
