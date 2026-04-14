"use client"

import Link from "next/link"
import {
  Shirt,
  UtensilsCrossed,
  Zap,
  Footprints,
  BookOpen,
  Home,
  Smile,
} from "lucide-react"

const categories = [
  {
    id: "mens-fashion",
    name: "Men's Fashion",
    icon: Shirt,
    color: "bg-cyan-500",
    bgColor: "bg-cyan-50",
  },
  {
    id: "womens-fashion",
    name: "Women's Fashion",
    icon: Shirt,
    color: "bg-pink-500",
    bgColor: "bg-pink-50",
  },
  {
    id: "food-beverage",
    name: "Food & Beverage",
    icon: UtensilsCrossed,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: Zap,
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    id: "shoes-footwear",
    name: "Shoes & Footwear",
    icon: Footprints,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    id: "books-media",
    name: "Books & Media",
    icon: BookOpen,
    color: "bg-green-500",
    bgColor: "bg-green-50",
  },
  {
    id: "home-living",
    name: "Home & Living",
    icon: Home,
    color: "bg-sky-500",
    bgColor: "bg-sky-50",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    icon: Smile,
    color: "bg-red-500",
    bgColor: "bg-red-50",
  },
]

export function Categories() {
  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className={`${category.bgColor} rounded-xl p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow cursor-pointer group`}
              >
                <div
                  className={`${category.color} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Shop Now →
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { categories }
