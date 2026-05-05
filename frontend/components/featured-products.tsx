'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Product } from '@/lib/store';
import { ProductCard } from './product-card';
import { ApiGateway, type ProductRecord } from '@/app/utils/api';
import { mapApiProductToStoreProduct } from '@/lib/product-mapper';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const api = new ApiGateway();

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.searchProducts({ page: 1, limit: 200 });
        setProducts((result.items || []).map((item: ProductRecord) => mapApiProductToStoreProduct(item)));
      } catch {
        setProducts([]);
      }
    };
    load();
  }, []);

  const topSellingPerCategory = Object.values(
    products.reduce((acc, product) => {
      const existing = acc[product.category];
      if (!existing || product.soldCount > existing.soldCount) {
        acc[product.category] = product;
      }
      return acc;
    }, {} as Record<string, Product>)
  );

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground text-balance">Featured Products</h2>
            <p className="text-muted-foreground mt-2">Discover our best-selling and trending items</p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex text-foreground border-border hover:bg-muted">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topSellingPerCategory.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Button asChild className="w-full md:hidden mt-6 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold">
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    </section>
  );
}
