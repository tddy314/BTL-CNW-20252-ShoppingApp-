"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Search, Store } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import { ApiGateway, normalizeIdentifierToUuid, type ProductRecord } from "@/app/utils/api"
import { type Product } from "@/lib/store"
import { mapApiProductToStoreProduct } from "@/lib/product-mapper"

const api = new ApiGateway()
const PAGE_SIZE = 12

type SortOption = "selling" | "price-asc" | "price-desc" | "newest"

export default function BuyerShopPage() {
  const params = useParams<{ id: string }>()
  const shopIdParam = params.id

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("selling")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setErrorMessage("")
      try {
        const result = await api.searchProducts({
          page: 1,
          limit: 500,
          shop_id: normalizeIdentifierToUuid(shopIdParam),
        })
        setProducts((result?.items || []).map((item: ProductRecord) => mapApiProductToStoreProduct(item)))
      } catch (error: any) {
        setProducts([])
        setErrorMessage(error?.message || "Unable to load shop products")
      } finally {
        setIsLoading(false)
      }
    }

    if (shopIdParam) {
      load()
    }
  }, [shopIdParam])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((product) => product.name.toLowerCase().includes(q))
    }

    switch (sortBy) {
      case "selling":
        result.sort((a, b) => b.soldCount - a.soldCount)
        break
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [products, searchQuery, sortBy])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const shopName = products[0]?.shopName || "Shop"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{shopName}</h1>
              <p className="text-muted-foreground">{filteredProducts.length} product(s)</p>
            </div>
          </div>
        </div>

        <Card className="p-4 border border-border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">Search product</label>
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="Search product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="selling">Best Selling</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </Card>

        {errorMessage ? (
          <Card className="border border-destructive/40 bg-destructive/5 p-4 mb-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </Card>
        ) : null}

        {isLoading ? (
          <Card className="p-10 text-center border border-border">
            <p className="text-muted-foreground">Loading products...</p>
          </Card>
        ) : paginatedProducts.length === 0 ? (
          <Card className="p-10 text-center border border-dashed border-border">
            <p className="text-muted-foreground">No products found.</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
        )}
      </main>
      <Footer />
    </div>
  )
}

