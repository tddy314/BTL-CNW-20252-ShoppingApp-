"use client"

import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/store"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow p-0">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-foreground line-clamp-2 mb-2 hover:text-[#ee4d2d] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < 4 ? "fill-amber-400 text-amber-400" : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({product.soldCount} sold)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#ee4d2d]">
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
