'use client';

import React from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  badge?: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 79.99,
    originalPrice: 129.99,
    image: 'bg-gradient-to-br from-blue-400 to-blue-500',
    rating: 4.8,
    reviews: 234,
    category: 'Electronics',
    badge: 'Sale',
  },
  {
    id: '2',
    name: 'Classic Cotton T-Shirt',
    price: 24.99,
    originalPrice: 39.99,
    image: 'bg-gradient-to-br from-purple-400 to-purple-500',
    rating: 4.6,
    reviews: 156,
    category: "Men's Fashion",
    badge: 'Hot',
  },
  {
    id: '3',
    name: 'Organic Green Tea Set',
    price: 32.50,
    originalPrice: 45.00,
    image: 'bg-gradient-to-br from-green-400 to-green-500',
    rating: 4.9,
    reviews: 89,
    category: 'Food & Beverage',
    badge: 'New',
  },
  {
    id: '4',
    name: 'Comfortable Running Shoes',
    price: 89.99,
    originalPrice: 149.99,
    image: 'bg-gradient-to-br from-orange-400 to-orange-500',
    rating: 4.7,
    reviews: 412,
    category: 'Shoes',
    badge: 'Best',
  },
  {
    id: '5',
    name: 'Modern Desk Lamp',
    price: 45.00,
    originalPrice: 75.00,
    image: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
    rating: 4.5,
    reviews: 78,
    category: 'Home & Living',
  },
  {
    id: '6',
    name: 'Business Novel Bundle',
    price: 34.99,
    originalPrice: 59.99,
    image: 'bg-gradient-to-br from-pink-400 to-pink-500',
    rating: 4.8,
    reviews: 203,
    category: 'Books & Media',
  },
  {
    id: '7',
    name: 'Summer Collection Dress',
    price: 54.99,
    originalPrice: 89.99,
    image: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
    rating: 4.7,
    reviews: 321,
    category: "Women's Fashion",
    badge: 'Trending',
  },
  {
    id: '8',
    name: 'Essential Skincare Kit',
    price: 49.99,
    originalPrice: 85.00,
    image: 'bg-gradient-to-br from-red-400 to-red-500',
    rating: 4.6,
    reviews: 145,
    category: 'Lifestyle',
  },
];

function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
        {/* Product Image */}
        <div className="relative overflow-hidden h-48">
          <div className={`w-full h-full ${product.image} flex items-center justify-center`}></div>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
              {product.badge}
            </div>
          )}

          {/* Discount */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white text-foreground">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="mt-auto">
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
        </div>
      </div>
    </Link>
  );
}

export function FeaturedProducts() {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground text-balance">
              Featured Products
            </h2>
            <p className="text-muted-foreground mt-2">
              Discover our best-selling and trending items
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex text-foreground border-border hover:bg-muted">
            View All Products
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Button className="w-full md:hidden mt-6 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold">
          View All Products
        </Button>
      </div>
    </section>
  );
}
