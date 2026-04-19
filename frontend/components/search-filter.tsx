'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';

interface SearchFilterProps {
  onSearch?: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  category: string;
  shopName: string;
  searchQuery: string;
}

export function SearchFilter({ onSearch }: SearchFilterProps) {
  const { products } = useStore();
  const [category, setCategory] = useState('All Categories');
  const [shopName, setShopName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const categoryOptions = ['All Categories', ...Array.from(new Set(products.map((product) => product.category)))];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const filters: SearchFilters = {
      category,
      shopName,
      searchQuery,
    };

    if (onSearch) {
      onSearch(filters);
    }

    const queryParams = new URLSearchParams();
    if (category !== 'All Categories') queryParams.append('category', category);
    if (shopName) queryParams.append('shop', shopName);
    if (searchQuery) queryParams.append('q', searchQuery);

    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    setTimeout(() => {
      router.push(url);
    }, 0);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto px-4 py-4">
      <div className="bg-white rounded-lg border border-border shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Shop Name Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Shop Name
            </label>
            <Input
              type="text"
              placeholder="Search shop..."
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Product Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Product Name
            </label>
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Search Button */}
          <div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
