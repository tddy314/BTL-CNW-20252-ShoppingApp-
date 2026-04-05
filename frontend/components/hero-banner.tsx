'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-36 -mb-36"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
        <div className="text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">New Arrivals Daily</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
            Your One-Stop Shopping Destination
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 text-balance">
            Discover amazing deals on fashion, electronics, food, and everything in between. Fast shipping, great prices, trusted sellers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Start Shopping
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              View Deals
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-12 text-center">
            <div className="bg-white/10 rounded-lg backdrop-blur-sm p-4">
              <p className="text-2xl font-bold">1M+</p>
              <p className="text-sm text-white/80">Happy Customers</p>
            </div>
            <div className="bg-white/10 rounded-lg backdrop-blur-sm p-4">
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-sm text-white/80">Products</p>
            </div>
            <div className="bg-white/10 rounded-lg backdrop-blur-sm p-4">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-white/80">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
