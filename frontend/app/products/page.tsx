'use client';

// Products page with advanced filtering and sorting
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, ShoppingCart, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { SearchFilter } from '@/components/search-filter';
import { Footer } from '@/components/footer';
import { useStore, type Product } from '@/lib/store';

const ITEMS_PER_PAGE = 12;

function ProductsContent() {
  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest', value: 'newest' },
    { label: 'Popularity', value: 'popularity' },
  ];
  const { products } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  // Get filter parameters from URL
  const category = searchParams.get('category');
  const shopName = searchParams.get('shop');
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    // Filter products based on search params
    let results = [...products];

    if (category && category !== 'All Categories' && category !== 'all') {
      results = results.filter((p) => p.category === category);
    }

    if (shopName) {
      results = results.filter((p) =>
        p.shopName.toLowerCase().includes(shopName.toLowerCase())
      );
    }

    if (searchQuery) {
      results = results.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    const sorted = [...results];
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popularity':
        sorted.sort((a, b) => b.soldCount - a.soldCount);
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
    setCurrentPage(1); // Reset to first page when filters change
  }, [category, shopName, searchQuery, sortBy, products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Back to Home Button */}
        <div className="bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <button
              onClick={() => {
                setTimeout(() => {
                  router.push('/');
                }, 0);
              }}
              className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Search Filter Section */}
        <div className="bg-gradient-to-b from-primary/5 to-secondary/5 py-6">
          <SearchFilter />
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filter Summary */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {category && category !== 'All Categories' ? category : 'All Products'}
              </h1>
              <p className="text-muted-foreground">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            {(category || searchQuery) && (
              <button
                onClick={() => {
                  setTimeout(() => {
                    router.push('/products');
                  }, 0);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Sort and Results Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mr-3">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </div>
          </div>

          {/* Products Grid */}
          {currentProducts.length > 0 ? (
            <>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
  {currentProducts.map((product) => (
    <div
      key={product.id}
      onClick={() => {
        router.push(`/products/${product.id}`);
      }}
      className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer text-left"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100 h-48">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}
        {product.tags.includes('new') && (
          <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
            NEW
          </div>
        )}
        {product.tags.includes('trending') && (
          <div className="absolute bottom-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
            TRENDING
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground mb-1">
          {product.shopName}
        </p>
        <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.soldCount} sold)
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs py-1 flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation(); // Ngăn việc nhảy vào trang chi tiết khi bấm nút này
            // Thêm logic handleAddToCart(product) của bạn ở đây
          }}
        >
          <ShoppingCart className="w-3 h-3" />
          Add to Cart
        </Button>
      </div>
    </div>
  ))}
</div>


              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 mb-8">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="text-foreground border-border"
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    const isCurrentPage = pageNum === currentPage;
                    const isVisible =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1;

                    if (!isVisible) return null;

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          isCurrentPage
                            ? 'bg-primary text-white'
                            : 'bg-white text-foreground border border-border hover:bg-muted'
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="text-foreground border-border"
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No products found matching your filters.
              </p>
              <Button onClick={() => window.location.href = '/products'} className="bg-primary hover:bg-primary/90 text-white">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}