'use client';

import React from 'react';
import { Truck, Shield, Zap } from 'lucide-react';

export function PromoBanner() {
  return (
    <section className="bg-secondary/10 py-8 border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Shipping */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-secondary/20 p-3 rounded-full flex-shrink-0">
              <Truck className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On orders over $50</p>
            </div>
          </div>

          {/* Secure Checkout */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-primary/20 p-3 rounded-full flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">100% safe transactions</p>
            </div>
          </div>

          {/* Fast Delivery */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-accent/20 p-3 rounded-full flex-shrink-0">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Usually within 3-5 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
