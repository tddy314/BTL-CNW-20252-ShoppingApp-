'use client';

import { Header } from '@/components/header';
import { HeroBanner } from '@/components/hero-banner';
import { PromoBanner } from '@/components/promo-banner';
import { CategoryGrid } from '@/components/category-grid';
import { FeaturedProducts } from '@/components/featured-products';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <PromoBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <Footer />
    </main>
  );
}
