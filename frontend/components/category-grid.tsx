'use client';

import React from 'react';
import { ShoppingBag, Shirt, Utensils, Zap, Footprints, BookOpen, Home, Smile } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const categories: Category[] = [
  {
    id: 'mens-fashion',
    name: "Men's Fashion",
    icon: <Shirt className="w-8 h-8" />,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'womens-fashion',
    name: "Women's Fashion",
    icon: <Shirt className="w-8 h-8" />,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'food',
    name: 'Food & Beverage',
    icon: <Utensils className="w-8 h-8" />,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'shoes',
    name: 'Shoes & Footwear',
    icon: <Footprints className="w-8 h-8" />,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'books',
    name: 'Books & Media',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: <Home className="w-8 h-8" />,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: <Smile className="w-8 h-8" />,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
  },
];

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/category/${category.id}`}>
      <div className={`${category.bgColor} rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95`}>
        <div className={`bg-gradient-to-br ${category.color} rounded-lg p-3 w-fit mx-auto mb-4 text-white`}>
          {category.icon}
        </div>
        <h3 className="font-semibold text-foreground text-sm md:text-base">
          {category.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Shop Now →</p>
      </div>
    </Link>
  );
}

export function CategoryGrid() {
  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground text-balance">
            Shop by Category
          </h2>
          <p className="text-muted-foreground mt-2">
            Explore our wide selection of products across all categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
