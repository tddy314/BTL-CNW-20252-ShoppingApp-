"use client"

import { use, useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { 
  ChevronRight,
  ChevronLeft,
  Search, 
  X,
  ArrowUpDown,
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  Store,
  ArrowLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { categories } from "@/components/category-grid"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

type SortOption = "popular" | "newest" | "oldest" | "price-low" | "price-high"

const sortOptions: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: "popular", label: "Popular", icon: Flame },
  { value: "newest", label: "Newest", icon: Clock },
  { value: "oldest", label: "Oldest", icon: Clock },
  { value: "price-low", label: "Price: Low to High", icon: TrendingUp },
  { value: "price-high", label: "Price: High to Low", icon: TrendingDown },
]

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params)
  const { getProductsByCategory } = useStore()

  const [sortBy, setSortBy] = useState<SortOption>("popular")
  const [shopSearch, setShopSearch] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const PRODUCTS_PER_PAGE = 8

  const category = categories.find((c) => c.id === slug)
  const allProducts = getProductsByCategory(slug)

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...allProducts]

    // Filter by shop name
    if (shopSearch.trim()) {
      products = products.filter((product) =>
        product.shopName.toLowerCase().includes(shopSearch.toLowerCase())
      )
    }

    // Sort products
    switch (sortBy) {
      case "popular":
        products.sort((a, b) => b.soldCount - a.soldCount)
        break
      case "newest":
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        products.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "price-low":
        products.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        products.sort((a, b) => b.price - a.price)
        break
    }

    return products
  }, [allProducts, sortBy, shopSearch])

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy, shopSearch])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE)
  }, [filteredProducts, currentPage, PRODUCTS_PER_PAGE])

  // Page number range for rendering (show at most 5 page buttons)
  const pageRange = useMemo(() => {
    const delta = 2
    const left = Math.max(1, currentPage - delta)
    const right = Math.min(totalPages, currentPage + delta)
    const range: number[] = []
    for (let i = left; i <= right; i++) range.push(i)
    return range
  }, [currentPage, totalPages])

  // Get unique shop names for suggestions
  const uniqueShops = useMemo(() => {
    const shops = [...new Set(allProducts.map((p) => p.shopName))]
    return shops.sort()
  }, [allProducts])

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Link href="/" className="text-[#ee4d2d] hover:underline mt-4 inline-block">
            Go back to home
          </Link>
        </main>
      </div>
    )
  }

  const Icon = category.icon

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{category.name}</span>
            </div>
          </div>
        </div>

        {/* Category Header */}
        <div className={`${category.bgColor} py-8`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className={`${category.color} w-16 h-16 rounded-xl flex items-center justify-center`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
                <p className="text-muted-foreground">
                  {filteredProducts.length} of {allProducts.length} products
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Products */}
        <div className="container mx-auto px-4 py-8">
          {/* Filter Section */}
          <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
            {/* Desktop Filters */}
            <div className="hidden md:flex flex-col gap-4">
              {/* Sort Options */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort by:</span>
                </div>
                <div className="flex items-center gap-2">
                  {sortOptions.map((option) => {
                    const OptionIcon = option.icon
                    const isActive = sortBy === option.value
                    return (
                      <Button
                        key={option.value}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy(option.value)}
                        className={`gap-2 ${
                          isActive 
                            ? "bg-[#ee4d2d] hover:bg-[#d73211] text-white border-[#ee4d2d]" 
                            : "hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                        }`}
                      >
                        <OptionIcon className="w-4 h-4" />
                        {option.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Shop Search */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Store className="w-4 h-4" />
                  <span>Shop:</span>
                </div>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by shop name..."
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {shopSearch && (
                    <button
                      onClick={() => setShopSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* Quick shop suggestions */}
                {uniqueShops.length > 0 && !shopSearch && (
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {uniqueShops.slice(0, 4).map((shop) => (
                      <Button
                        key={shop}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShopSearch(shop)}
                        className="text-xs whitespace-nowrap text-muted-foreground hover:text-[#ee4d2d]"
                      >
                        {shop}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Filters Toggle */}
            <div className="md:hidden">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Filters & Sort
                </span>
                <span className="text-xs text-muted-foreground">
                  {sortOptions.find(o => o.value === sortBy)?.label}
                </span>
              </Button>

              {/* Mobile Filters Panel */}
              {showMobileFilters && (
                <div className="mt-4 space-y-4">
                  {/* Sort Options */}
                  <div>
                    <p className="text-sm font-medium mb-2">Sort by</p>
                    <div className="grid grid-cols-2 gap-2">
                      {sortOptions.map((option) => {
                        const OptionIcon = option.icon
                        const isActive = sortBy === option.value
                        return (
                          <Button
                            key={option.value}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy(option.value)}
                            className={`gap-2 justify-start ${
                              isActive 
                                ? "bg-[#ee4d2d] hover:bg-[#d73211] text-white border-[#ee4d2d]" 
                                : ""
                            }`}
                          >
                            <OptionIcon className="w-4 h-4" />
                            {option.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shop Search */}
                  <div>
                    <p className="text-sm font-medium mb-2">Search by Shop</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by shop name..."
                        value={shopSearch}
                        onChange={(e) => setShopSearch(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {shopSearch && (
                        <button
                          onClick={() => setShopSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {uniqueShops.length > 0 && !shopSearch && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uniqueShops.map((shop) => (
                          <Button
                            key={shop}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShopSearch(shop)}
                            className="text-xs text-muted-foreground hover:text-[#ee4d2d]"
                          >
                            {shop}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(shopSearch) && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {shopSearch && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShopSearch("")}
                  className="gap-1 h-7"
                >
                  <Store className="w-3 h-3" />
                  Shop: {shopSearch}
                  <X className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShopSearch("")
                  setSortBy("popular")
                }}
                className="text-[#ee4d2d] hover:text-[#d73211] h-7"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {Math.min((currentPage - 1) * PRODUCTS_PER_PAGE + 1, filteredProducts.length)}
                –
                {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{filteredProducts.length}</span> results
              {shopSearch && (
                <span> from shop &ldquo;{shopSearch}&rdquo;</span>
              )}
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
              </p>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1">
                {/* First page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  aria-label="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Left ellipsis */}
                {pageRange[0] > 1 && (
                  <span className="w-9 h-9 flex items-center justify-center text-sm text-muted-foreground">
                    …
                  </span>
                )}

                {/* Page numbers */}
                {pageRange.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-[#ee4d2d] text-white border-[#ee4d2d] hover:bg-[#d73211]"
                        : "hover:bg-gray-100"
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}

                {/* Right ellipsis */}
                {pageRange[pageRange.length - 1] < totalPages && (
                  <span className="w-9 h-9 flex items-center justify-center text-sm text-muted-foreground">
                    …
                  </span>
                )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Last page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                  aria-label="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {shopSearch 
                  ? `No products found from shop "${shopSearch}" in this category.` 
                  : "No products available in this category."}
              </p>
              <div className="flex items-center justify-center gap-2">
                {shopSearch && (
                  <Button
                    variant="outline"
                    onClick={() => setShopSearch("")}
                  >
                    Clear shop filter
                  </Button>
                )}
                <Link href="/">
                  <Button variant="outline">
                    Browse all products
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Other Categories */}
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-6">Browse Other Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories
                .filter((c) => c.id !== slug)
                .slice(0, 4)
                .map((cat) => {
                  const CatIcon = cat.icon
                  return (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      className={`${cat.bgColor} rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow`}
                    >
                      <div className={`${cat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                        <CatIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{cat.name}</span>
                    </Link>
                  )
                })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
