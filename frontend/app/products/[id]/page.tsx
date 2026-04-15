'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
//import { mockProducts } from '@/lib/mock-products';
import { Star, Heart, ShoppingCart, ChevronLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store'
import { Header } from '@/components/header';
import { ProductComments } from '@/components/product-comment';

export default function ProductDetailPage() {
  const { products, getProductById, getProductsByCategory, addComment, purchaseProduct, userHasPurchased, user } = useStore()
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.id as string);
  
  const product = getProductById(productId.toString());
  if(!product) return
  const [selectedColor, setSelectedColor] = useState<string>(product?.properties.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(product?.properties.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const handleAddComment = (rating: number, text: string) => {
    if (user) {
      addComment(product.id, user.id, user.name, rating, text)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
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

  const relatedProducts = getProductsByCategory(product.category).filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <main className="flex-1 bg-background">
      <Header />
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

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-96 lg:h-96">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
            {product.images && (
              <div className="flex gap-2">
                {product.images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reviews) • {product.soldCount.toLocaleString()} sold
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="border-y border-border py-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.discount && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{product.discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Properties */}
            {product.properties.colors && product.properties.colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Color: <span className="text-primary">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.properties.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border text-foreground hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.properties.sizes && product.properties.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Size: <span className="text-primary">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.properties.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all min-w-12 ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border text-foreground hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-muted"
                >
                  −
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-muted"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  // Add to cart logic
                  alert(`Added ${quantity} ${product.name}(s) to cart with ${selectedColor} color and ${selectedSize} size`);
                }}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-3 flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
              <Button
                onClick={() => {
                  // Buy now logic
                  alert(`Proceeding to checkout for ${quantity} ${product.name}(s)`);
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 text-lg font-semibold"
              >
                Buy Now
              </Button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-colors ${
                  isFavorite
                    ? 'bg-red-50 border-red-500 text-red-500'
                    : 'border-border text-foreground hover:border-primary'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Share */}
            <button className="flex items-center justify-center gap-2 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              Share Product
            </button>
          </div>
        </div>

       
        {/* Seller Section */}
        <div className="bg-white rounded-lg border border-border p-6 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={product.shopAvatar}
                alt={product.shopName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground">{product.shopName}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.shopRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{product.shopRating} shop rating</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setTimeout(() => {
                  router.push(`/shop/${product.shopId}`);
                }, 0);
              }}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Visit Shop
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-12 mt-12 pb-20">
        {/* Description */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product Description</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{product.description}</p>
          <p className="text-muted-foreground leading-relaxed">
            This product is sourced from our trusted suppliers and meets our quality standards. Returns are accepted within 30 days of purchase in original condition.
          </p>
        </div>

        <ProductComments
          comments={product.comments || []}
          productRating={product.rating || 4.5}
          onAddComment={handleAddComment}
          userCanComment={userHasPurchased(product.id)}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map(relProduct => (
                <button
                  key={relProduct.id}
                  onClick={() => {
                    setTimeout(() => {
                      router.push(`/products/${relProduct.id}`);
                    }, 0);
                  }}
                  className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden bg-gray-100 h-48">
                    <img
                      src={relProduct.image}
                      alt={relProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">
                      {relProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(relProduct.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({relProduct.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        ${relProduct.price.toFixed(2)}
                      </span>
                      {relProduct.originalPrice > relProduct.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${relProduct.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
