'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mockProducts } from '@/lib/mock-products';
import { Star, ShoppingCart, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12;

export default function ShopPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = parseInt(params.shopId as string);
  
  const [currentPage, setCurrentPage] = useState(1);

  // Get all products from this shop
  const shopProducts = mockProducts.filter(p => p.shopId === shopId);
  const shop = shopProducts[0];

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Shop Not Found</h1>
          <button
            onClick={() => setTimeout(() => router.push('/products'), 0)}
            className="text-primary hover:underline"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(shopProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = shopProducts.slice(startIndex, endIndex);

  return (
    <main className="flex-1 bg-background">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => setTimeout(() => router.back(), 0)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Shop Header */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-border">
        <div className="flex items-center gap-6 mb-6">
          <img
            src={shop.shopAvatar}
            alt={shop.shopName}
            className="w-20 h-20 rounded-full object-cover border-4 border-primary"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{shop.shopName}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(shop.shopRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-muted-foreground ml-1">{shop.shopRating} rating</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{shopProducts.length} products</span>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Follow Shop
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            All Products
          </h2>
          <p className="text-muted-foreground mt-1">
            Showing {startIndex + 1} to {Math.min(endIndex, shopProducts.length)} of {shopProducts.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {paginatedProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                setTimeout(() => {
                  router.push(`/products/${product.id}`);
                }, 0);
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
                {product.isNew && (
                  <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                    NEW
                  </div>
                )}
                {product.isTrending && (
                  <div className="absolute bottom-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
                    TRENDING
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
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
                    ({product.reviews})
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
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs py-1 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-3 h-3" />
                  Add to Cart
                </Button>
              </div>
            </button>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
        )}
      </div>
    </main>
  );
}
