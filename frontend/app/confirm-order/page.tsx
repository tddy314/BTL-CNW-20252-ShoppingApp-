"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
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

type ShopBankInfo = {
  shop_bank_account?: string | null
  shop_bank_account_number?: string | null
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

async function readShopBankInfo(cartItem: CartApiItem): Promise<ShopBankInfo | null> {
  const rawShopId = cartItem.shop?.shopId
  const productId = cartItem.productDetail?.productId

  if (!rawShopId) {
    return null
  }

  const numericShopId = Number(rawShopId)
  if (Number.isFinite(numericShopId)) {
    return await gatewayApi.getShopById({ shop_id: numericShopId })
  }

  if (!productId) {
    return null
  }

  const product = await gatewayApi.getProductById({ product_id: productId })
  const shopOwner = product?.shop_owner

  if (!shopOwner) {
    return null
  }

  const shopsPage = await gatewayApi.getShopsByOwner({
    owner: shopOwner,
    page: 1,
    limit: 100,
  })
  const shops = (shopsPage?.items || []) as Array<ShopBankInfo & { id?: number | string }>
  const normalizedTargetShopId = normalizeIdentifierToUuid(rawShopId)

  return shops.find((shop) => normalizeIdentifierToUuid(String(shop.id || "")) === normalizedTargetShopId) || null
}

function ConfirmOrderPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, email, role } = useAuth()
  const isAdmin = role === "admin"

  const cartItemId = searchParams.get("cartItemId")
  const from = searchParams.get("from")
  const isBuyNowFlow = from === "buy-now"

  const buyNowProductId = searchParams.get("productId") || ""
  const buyNowProductName = searchParams.get("productName") || ""
  const buyNowImage = searchParams.get("image") || ""
  const buyNowPrice = Number(searchParams.get("price") || 0)
  const buyNowCategory = searchParams.get("category") || ""
  const buyNowQuantity = Math.max(1, Number(searchParams.get("quantity") || 1))
  const buyNowShopId = searchParams.get("shopId") || ""
  const buyNowShopName = searchParams.get("shopName") || ""
  const buyNowColor = searchParams.get("color") || ""
  const buyNowSize = searchParams.get("size") || ""
  const buyNowMaterial = searchParams.get("material") || ""

  const [cartItem, setCartItem] = useState<CartApiItem | null>(null)
  const [receiver, setReceiver] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [bankName, setBankName] = useState("")
  const [bankNumber, setBankNumber] = useState("")
  const [bankTransferImageLink, setBankTransferImageLink] = useState("")
  const [shopBankInfo, setShopBankInfo] = useState<ShopBankInfo | null>(null)
  const [isShopBankLoading, setIsShopBankLoading] = useState(false)
  const [shopBankError, setShopBankError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (isBuyNowFlow) {
      const syntheticItem: CartApiItem = {
        cartItemId: "buy-now",
        shop: {
          shopId: buyNowShopId || undefined,
          shopName: buyNowShopName || undefined,
        },
        productDetail: {
          productId: buyNowProductId || undefined,
          productName: buyNowProductName || undefined,
          image: buyNowImage || undefined,
          price: buyNowPrice || 0,
          category: buyNowCategory || undefined,
          quantity: buyNowQuantity,
          selectedOptions: {
            color: buyNowColor || undefined,
            size: buyNowSize || undefined,
            material: buyNowMaterial || undefined,
          },
        },
      }

      setCartItem(syntheticItem)
      return
    }

    const loadCartItem = async () => {
    if (!email || !cartItemId || isAdmin) {
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
  }, [
    email,
    isAdmin,
    cartItemId,
    isBuyNowFlow,
    buyNowShopId,
    buyNowShopName,
    buyNowProductId,
    buyNowProductName,
    buyNowImage,
    buyNowPrice,
    buyNowCategory,
    buyNowQuantity,
    buyNowColor,
    buyNowSize,
    buyNowMaterial,
  ])

  useEffect(() => {
    const loadShopBankInfo = async () => {
      if (!cartItem?.shop?.shopId || !cartItem?.productDetail?.productId) {
        setShopBankInfo(null)
        setShopBankError("")
        return
      }

      setIsShopBankLoading(true)
      setShopBankError("")

      try {
        const result = await readShopBankInfo(cartItem)
        setShopBankInfo(result)

        if (!result) {
          setShopBankError("Shop bank information is not available.")
        }
      } catch (error: any) {
        setShopBankInfo(null)
        setShopBankError(error?.message || "Unable to load shop bank information.")
      } finally {
        setIsShopBankLoading(false)
      }
    }

    if (paymentMethod === "bank-transfer") {
      loadShopBankInfo()
    }
  }, [cartItem, paymentMethod])

  const quantity = Number(cartItem?.productDetail?.quantity || 1)
  const unitPrice = Number(cartItem?.productDetail?.price || 0)
  const totalPrice = unitPrice * quantity

  const canSubmit = useMemo(() => {
    if (!isLoggedIn || !email || !cartItem) {
      return false
    }

    if (!receiver.trim() || !phone.trim() || !address.trim()) {
      return false
    }

    if (paymentMethod === "bank-transfer") {
      return Boolean(bankName.trim() && bankNumber.trim() && bankTransferImageLink.trim())
    }

    return true
  }, [isLoggedIn, email, cartItem, receiver, phone, address, paymentMethod, bankName, bankNumber, bankTransferImageLink])

  const handleCreateOrder = async () => {
    if (!canSubmit || !email || !cartItem || isAdmin) {
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
        bank_success_transfer_img: paymentMethod === "bank-transfer" ? bankTransferImageLink.trim() : null,
        price: Math.round(totalPrice),
        phone: phone.trim(),
        address: address.trim(),
        receiver: receiver.trim(),
        quantity,
        seller: shop.shopName?.trim() || "Unknown shop",
        shop_id: normalizeIdentifierToUuid(shop.shopId),
      })

      if (!isBuyNowFlow && cartItemId) {
        await gatewayApi.removeItemFromCart(email, cartItemId)
      }
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
          {isLoggedIn && isAdmin ? (
            <Card className="border border-dashed border-border p-6 text-center mb-4">
              <p className="text-muted-foreground">Admin cannot use buyer checkout features.</p>
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
                    <div className="rounded-md border border-border bg-background p-3">
                      <p className="text-sm font-medium text-foreground mb-2">Shop Bank Information</p>
                      {isShopBankLoading ? (
                        <p className="text-sm text-muted-foreground">Loading shop bank information...</p>
                      ) : shopBankInfo ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Bank</p>
                            <p className="font-medium text-foreground">
                              {shopBankInfo.shop_bank_account || "Not set"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Account Number</p>
                            <p className="font-medium text-foreground">
                              {shopBankInfo.shop_bank_account_number || "Not set"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {shopBankError || "Shop bank information is not available."}
                        </p>
                      )}
                    </div>

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
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Transfer Proof Image Link</label>
                      <Input
                        value={bankTransferImageLink}
                        onChange={(event) => setBankTransferImageLink(event.target.value)}
                        placeholder="https://... (required)"
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
                <p><span className="font-medium">Source:</span> {isBuyNowFlow ? "Buy Now" : "Cart page"}</p>
                <p><span className="font-medium">Cart Item ID:</span> {isBuyNowFlow ? "N/A" : (cartItemId ?? "N/A")}</p>
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
              disabled={!canSubmit || isSubmitting || isAdmin}
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

export default function ConfirmOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
            <Card className="p-6 md:p-8 border border-border mb-6">
              <p className="text-muted-foreground">Loading checkout...</p>
            </Card>
          </main>
          <Footer />
        </div>
      }
    >
      <ConfirmOrderPageContent />
    </Suspense>
  )
}
