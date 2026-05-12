"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowUpDown, Clock3, CreditCard, Filter, ShoppingCart, Tag, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { ApiGateway } from "@/app/utils/api"

type CartSortOption = "latest" | "oldest" | "price-asc" | "price-desc"

type BackendCartItem = {
  cartItemId: string
  shop?: {
    shopId?: string
    shopName?: string
  }
  productDetail?: {
    productId?: string
    productName?: string
    name?: string
    image?: string
    price?: number
    category?: string
    quantity?: number
    selectedOptions?: {
      color?: string
      size?: string
      material?: string
      [key: string]: string | undefined
    }
  }
}

type CartDisplayItem = {
  id: string
  productId: string
  quantity: number
  addedAt: Date
  selectedColor?: string
  selectedSize?: string
  selectedMaterial?: string
  name: string
  image: string
  price: number
  category: string
  shopName: string
}

const gatewayApi = new ApiGateway()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export default function CartPage() {
  const ITEMS_PER_PAGE = 6
  const { isLoggedIn, email } = useAuth()
  const [cartItems, setCartItems] = useState<BackendCartItem[]>([])
  const [sortBy, setSortBy] = useState<CartSortOption>("latest")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const fetchCart = useCallback(async (page: number) => {
    if (!email) {
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await gatewayApi.readCart(email, page, ITEMS_PER_PAGE);
      const items = (result?.items || []) as BackendCartItem[];

      setCartItems(items);
      setTotalPages(Math.max(1, Number(result?.totalPages || 1)));
      setTotalItems(Number(result?.totalItems || 0));
    } catch (error: any) {
      setCartItems([])
      setTotalPages(1)
      setTotalItems(0)
      setErrorMessage(error?.message || "Unable to load cart")
    } finally {
      setIsLoading(false)
    }
  }, [email, ITEMS_PER_PAGE])

  useEffect(() => {
    if (!isLoggedIn || !email) {
      setCartItems([])
      setTotalPages(1)
      setTotalItems(0)
      return
    }

    fetchCart(currentPage)
  }, [currentPage, isLoggedIn, email, fetchCart])

  const handleRemoveFromCart = async (cartItemId: string) => {
    if (!email) {
      return
    }

    try {
      await gatewayApi.removeItemFromCart(email, cartItemId)
      const nextPage = cartItems.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage)
      } else {
        fetchCart(currentPage)
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "Unable to remove item")
    }
  }

  const displayItems = useMemo<CartDisplayItem[]>(() => {
    return cartItems.map((item, index) => {
      const detail = item.productDetail || {}
      const options = detail.selectedOptions || {}

      return {
        id: item.cartItemId,
        productId: detail.productId || item.cartItemId,
        quantity: Number(detail.quantity || 1),
        // Backend cart item currently has no timestamp; we derive a stable display ordering from response index.
        addedAt: new Date(Date.now() - index * 1000),
        selectedColor: options.color,
        selectedSize: options.size,
        selectedMaterial: options.material,
        name: detail.productName || detail.name || "Unknown product",
        image: detail.image || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
        price: Number(detail.price || 0),
        category: detail.category || "uncategorized",
        shopName: item.shop?.shopName || "Unknown shop",
      }
    })
  }, [cartItems])

  const categories = useMemo<string[]>(() => {
    const unique = Array.from(new Set(displayItems.map((item) => item.category)))
    return ["all", ...unique]
  }, [displayItems])

  const filteredAndSortedItems = useMemo(() => {
    const filtered =
      categoryFilter === "all"
        ? displayItems
        : displayItems.filter((item) => item.category === categoryFilter)

    const sorted = [...filtered]

    sorted.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.addedAt.getTime() - b.addedAt.getTime()
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "latest":
        default:
          return b.addedAt.getTime() - a.addedAt.getTime()
      }
    })

    return sorted
  }, [categoryFilter, displayItems, sortBy])

  const cartTotal = filteredAndSortedItems.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy, categoryFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedItems = filteredAndSortedItems

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground mr-2">
            <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="bg-primary/10 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">My Cart</h1>
            </div>
            <p className="text-muted-foreground">
              See your selected products, sorted by latest added time by default.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          {!isLoggedIn ? (
            <Card className="border border-dashed border-border p-10 text-center mb-6">
              <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-foreground mb-1">Sign in to view your cart</h2>
              <p className="text-muted-foreground">You need to login before viewing cart items.</p>
            </Card>
          ) : null}

          <Card className="p-4 md:p-5 border border-border mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Filter and sort your cart items</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Category</span>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as CartSortOption)}
                    className="px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="latest">Time: Latest first</option>
                    <option value="oldest">Time: Oldest first</option>
                    <option value="price-asc">Price: Low to high</option>
                    <option value="price-desc">Price: High to low</option>
                  </select>
                </label>
              </div>
            </div>
          </Card>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedItems.length} of {totalItems} item{totalItems === 1 ? "" : "s"}
            </p>
            <p className="text-sm font-semibold text-foreground">Filtered total: {formatCurrency(cartTotal)}</p>
          </div>

          {errorMessage ? (
            <Card className="border border-destructive/40 bg-destructive/5 p-4 mb-4">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </Card>
          ) : null}

          {isLoading ? (
            <Card className="border border-border p-8 text-center mb-4">
              <p className="text-muted-foreground">Loading cart...</p>
            </Card>
          ) : null}

          {filteredAndSortedItems.length === 0 ? (
            <Card className="border border-dashed border-border p-10 text-center">
              <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-foreground mb-1">No products in this filter</h2>
              <p className="text-muted-foreground">Try another category or sorting option.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {paginatedItems.map((item) => {
                const itemTotal = item.price * item.quantity

                return (
                  <Card key={item.id} className="border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 md:p-5 flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h2 className="font-semibold text-foreground line-clamp-2">{item.name}</h2>
                          <Badge variant="secondary" className="capitalize">
                            {item.category}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">Sold by {item.shopName}</p>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.selectedColor ? <Badge variant="outline">Color: {item.selectedColor}</Badge> : null}
                          {item.selectedSize ? <Badge variant="outline">Size: {item.selectedSize}</Badge> : null}
                          {item.selectedMaterial ? <Badge variant="outline">Material: {item.selectedMaterial}</Badge> : null}
                        </div>

                        <div className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                          <Clock3 className="w-4 h-4" />
                          Added: {formatDate(item.addedAt)}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} x {item.quantity}</p>
                            <p className="font-semibold text-primary">{formatCurrency(itemTotal)}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              className="border-border text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </Button>

                            <Link
                              href={`/confirm-order?from=cart&cartItemId=${item.id}&productId=${item.productId}`}
                              className="inline-flex"
                            >
                              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <CreditCard className="w-4 h-4" />
                                Pay
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
                })}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-border"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
