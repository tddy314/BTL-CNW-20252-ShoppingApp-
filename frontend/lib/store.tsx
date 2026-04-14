"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  shopId: string
  shopName: string
  description: string
  soldCount: number
  createdAt: Date
}

export interface Shop {
  id: string
  name: string
  avatar: string
  bankingQR: string
  ownerId: string
  createdAt: Date
  products: Product[]
  totalEarnings: number
  totalSold: number
}

export interface User {
  id: string
  email: string
  name: string
  isLoggedIn: boolean
  shops: Shop[]
}

interface StoreContextType {
  user: User | null
  setUser: (user: User | null) => void
  shops: Shop[]
  addShop: (shop: Shop) => void
  getShopById: (id: string) => Shop | undefined
  getUserShops: () => Shop[]
  addProductToShop: (shopId: string, product: Product) => void
  products: Product[]
  getProductsByCategory: (category: string) => Product[]
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

// Sample products data
const sampleProducts: Product[] = [
  { id: "1", name: "Classic Men's T-Shirt", price: 29.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", category: "mens-fashion", shopId: "shop1", shopName: "Urban Style Co", description: "Comfortable cotton t-shirt for men", soldCount: 150, createdAt: new Date("2025-12-01") },
  { id: "2", name: "Men's Denim Jacket", price: 89.99, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", category: "mens-fashion", shopId: "shop1", shopName: "Urban Style Co", description: "Stylish denim jacket", soldCount: 85, createdAt: new Date("2025-11-15") },
  { id: "3", name: "Men's Casual Pants", price: 49.99, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400", category: "mens-fashion", shopId: "shop1", shopName: "Urban Style Co", description: "Comfortable casual pants", soldCount: 120, createdAt: new Date("2026-01-10") },
  { id: "4", name: "Elegant Women's Dress", price: 79.99, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", category: "womens-fashion", shopId: "shop2", shopName: "Glamour Boutique", description: "Beautiful evening dress", soldCount: 200, createdAt: new Date("2026-02-20") },
  { id: "5", name: "Women's Blouse", price: 39.99, image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400", category: "womens-fashion", shopId: "shop2", shopName: "Glamour Boutique", description: "Elegant silk blouse", soldCount: 175, createdAt: new Date("2026-01-25") },
  { id: "6", name: "Women's Handbag", price: 59.99, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", category: "womens-fashion", shopId: "shop2", shopName: "Glamour Boutique", description: "Stylish leather handbag", soldCount: 95, createdAt: new Date("2025-10-05") },
  { id: "7", name: "Organic Coffee Beans", price: 19.99, image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400", category: "food-beverage", shopId: "shop3", shopName: "Tasty Treats", description: "Premium organic coffee", soldCount: 500, createdAt: new Date("2026-03-01") },
  { id: "8", name: "Artisan Chocolate Box", price: 34.99, image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400", category: "food-beverage", shopId: "shop3", shopName: "Tasty Treats", description: "Handmade chocolates", soldCount: 320, createdAt: new Date("2025-12-20") },
  { id: "9", name: "Green Tea Collection", price: 24.99, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400", category: "food-beverage", shopId: "shop3", shopName: "Tasty Treats", description: "Premium green tea set", soldCount: 280, createdAt: new Date("2026-02-10") },
  { id: "10", name: "Wireless Headphones", price: 149.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", category: "electronics", shopId: "shop4", shopName: "TechZone", description: "High-quality wireless headphones", soldCount: 450, createdAt: new Date("2026-01-05") },
  { id: "11", name: "Smart Watch", price: 299.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", category: "electronics", shopId: "shop4", shopName: "TechZone", description: "Feature-rich smartwatch", soldCount: 380, createdAt: new Date("2025-11-20") },
  { id: "12", name: "Portable Speaker", price: 79.99, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", category: "electronics", shopId: "shop4", shopName: "TechZone", description: "Bluetooth portable speaker", soldCount: 290, createdAt: new Date("2026-03-15") },
  { id: "13", name: "Running Shoes", price: 119.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", category: "shoes-footwear", shopId: "shop5", shopName: "Foot Forward", description: "Professional running shoes", soldCount: 420, createdAt: new Date("2026-02-01") },
  { id: "14", name: "Leather Boots", price: 159.99, image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400", category: "shoes-footwear", shopId: "shop5", shopName: "Foot Forward", description: "Classic leather boots", soldCount: 180, createdAt: new Date("2025-09-15") },
  { id: "15", name: "Canvas Sneakers", price: 69.99, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400", category: "shoes-footwear", shopId: "shop5", shopName: "Foot Forward", description: "Casual canvas sneakers", soldCount: 350, createdAt: new Date("2026-01-18") },
  { id: "16", name: "Best Seller Novel", price: 14.99, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", category: "books-media", shopId: "shop6", shopName: "Book Haven", description: "Award-winning fiction", soldCount: 800, createdAt: new Date("2025-08-10") },
  { id: "17", name: "Vinyl Record Collection", price: 49.99, image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400", category: "books-media", shopId: "shop6", shopName: "Book Haven", description: "Classic vinyl records", soldCount: 120, createdAt: new Date("2026-03-20") },
  { id: "18", name: "Photography Book", price: 39.99, image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400", category: "books-media", shopId: "shop6", shopName: "Book Haven", description: "Beautiful photography collection", soldCount: 200, createdAt: new Date("2025-12-25") },
  { id: "19", name: "Modern Table Lamp", price: 89.99, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", category: "home-living", shopId: "shop7", shopName: "Home Decor Plus", description: "Minimalist table lamp", soldCount: 230, createdAt: new Date("2026-01-30") },
  { id: "20", name: "Decorative Cushions Set", price: 44.99, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", category: "home-living", shopId: "shop7", shopName: "Home Decor Plus", description: "Set of 4 cushions", soldCount: 310, createdAt: new Date("2025-11-10") },
  { id: "21", name: "Ceramic Vase", price: 59.99, image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400", category: "home-living", shopId: "shop7", shopName: "Home Decor Plus", description: "Handcrafted ceramic vase", soldCount: 180, createdAt: new Date("2026-02-28") },
  { id: "22", name: "Yoga Mat", price: 39.99, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400", category: "lifestyle", shopId: "shop8", shopName: "Wellness World", description: "Premium yoga mat", soldCount: 400, createdAt: new Date("2026-03-05") },
  { id: "23", name: "Essential Oil Set", price: 54.99, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400", category: "lifestyle", shopId: "shop8", shopName: "Wellness World", description: "Aromatherapy essential oils", soldCount: 280, createdAt: new Date("2025-10-20") },
  { id: "24", name: "Fitness Tracker", price: 79.99, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400", category: "lifestyle", shopId: "shop8", shopName: "Wellness World", description: "Activity and sleep tracker", soldCount: 350, createdAt: new Date("2026-01-12") },
]

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: "user1",
    email: "ntduong.14032005@gmail.com",
    name: "Nguyen Duong",
    isLoggedIn: true,
    shops: [],
  })

  const [shops, setShops] = useState<Shop[]>([])
  const [products, setProducts] = useState<Product[]>(sampleProducts)

  const addShop = (shop: Shop) => {
    setShops((prev) => [...prev, shop])
    if (user) {
      setUser({
        ...user,
        shops: [...user.shops, shop],
      })
    }
  }

  const getShopById = (id: string) => {
    return shops.find((shop) => shop.id === id)
  }

  const getUserShops = () => {
    if (!user) return []
    return shops.filter((shop) => shop.ownerId === user.id)
  }

  const addProductToShop = (shopId: string, product: Product) => {
    setProducts((prev) => [...prev, product])
    setShops((prev) =>
      prev.map((shop) =>
        shop.id === shopId
          ? { ...shop, products: [...shop.products, product] }
          : shop
      )
    )
  }

  const getProductsByCategory = (category: string) => {
    return products.filter((product) => product.category === category)
  }

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        shops,
        addShop,
        getShopById,
        getUserShops,
        addProductToShop,
        products,
        getProductsByCategory,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
