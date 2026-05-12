"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface ProductComment {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  text: string
  createdAt: Date
}
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "rejected"
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
  tags: string[]
  shopAvatar?: string
  rating: number
  comments?: ProductComment[]
  properties: {
    colors?: string[];
    sizes?: string[];
    materials?: string[];
  };
  images?: string[];
  reviews?: number;
  discount?: number;
  originalPrice: number;
  shopRating: number;
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
  avatar: string
  isLoggedIn: boolean
  isAdmin: boolean
  totalSpend: number
  shops: Shop[]
  purchasedProductIds: string[]
}
export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  shopId: string
  shopName: string
  category: string
}

export interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  items: OrderItem[]
  totalPrice: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  shippingAddress: string
}
interface StoreContextType {
  user: User | null
  setUser: (user: User | null) => void
  shops: Shop[]
  addShop: (shop: Shop) => void
  getShopById: (id: string) => Shop | undefined
  getUserShops: () => Shop[]
  addProductToShop: (shopId: string, product: Product) => void
  updateProduct: (productId: string, updates: Partial<Product>) => void
  removeProduct: (productId: string) => void
  products: Product[]
  getProductsByCategory: (category: string) => Product[]
  getProductById: (id: string) => Product | undefined
  addComment: (productId: string, userId: string, userName: string, rating: number, text: string) => void
  purchaseProduct: (productId: string) => void
  getProductComments: (productId: string) => ProductComment[]
  userHasPurchased: (productId: string) => boolean
  orders: Order[]
  getOrders: () => Order[]
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  getTodayFinishedOrders: () => Order[]
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

// Sample comments
const sampleComments: ProductComment[] = [
  { id: "c1", productId: "1", userId: "user2", userName: "John Doe", rating: 5, text: "Excellent quality! Very comfortable t-shirt. Highly recommended.", createdAt: new Date("2026-02-15") },
  { id: "c2", productId: "1", userId: "user3", userName: "Jane Smith", rating: 4, text: "Good fit, a bit smaller than expected. Still satisfied with purchase.", createdAt: new Date("2026-02-20") },
  { id: "c3", productId: "1", userId: "user4", userName: "Mike Johnson", rating: 5, text: "Perfect! Great value for money.", createdAt: new Date("2026-03-01") },
  { id: "c4", productId: "2", userId: "user5", userName: "Sarah Wilson", rating: 5, text: "Amazing denim jacket! Love the style and quality.", createdAt: new Date("2026-02-25") },
  { id: "c5", productId: "4", userId: "user6", userName: "Emma Davis", rating: 5, text: "Gorgeous dress! Perfect for my event.", createdAt: new Date("2026-03-05") },
  { id: "c6", productId: "10", userId: "user7", userName: "Alex Brown", rating: 4, text: "Good headphones. Sound quality is great, a bit tight on ears.", createdAt: new Date("2026-02-28") },
]

// Sample products data
const sampleProducts: Product[] = [
  // MENS FASHION (1-3)
  {
    id: "1",
    name: "Classic Men's T-Shirt",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    category: "mens-fashion",
    shopId: "shop1",
    shopName: "Urban Style Co",
    shopAvatar: "https://i.pravatar.cc/150?u=shop1",
    description: "Premium cotton t-shirt with a tailored fit. Breathable and durable.",
    soldCount: 150,
    rating: 4.8,
    createdAt: new Date("2025-12-01"),
    tags: ["cotton", "basics", "men"],
    properties: { colors: ["White", "Black", "Navy"], sizes: ["S", "M", "L", "XL"], materials: ["100% Cotton"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "2",
    name: "Men's Denim Jacket",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    category: "mens-fashion",
    shopId: "shop1",
    shopName: "Urban Style Co",
    shopAvatar: "https://i.pravatar.cc/150?u=shop1",
    description: "Classic blue denim jacket with reinforced stitching and metal buttons.",
    soldCount: 85,
    rating: 4.7,
    createdAt: new Date("2025-11-15"),
    tags: ["denim", "outerwear", "vintage"],
    properties: { colors: ["Blue", "Light Wash"], sizes: ["M", "L", "XL"], materials: ["Denim"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "3",
    name: "Men's Casual Pants",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
    category: "mens-fashion",
    shopId: "shop1",
    shopName: "Urban Style Co",
    shopAvatar: "https://i.pravatar.cc/150?u=shop1",
    description: "Versatile chinos for work or weekend. Stretch fabric for comfort.",
    soldCount: 120,
    rating: 4.5,
    createdAt: new Date("2026-01-10"),
    tags: ["chinos", "casual", "men"],
    properties: { colors: ["Khaki", "Olive", "Black"], sizes: ["30", "32", "34"], materials: ["Cotton Blend"] },
    originalPrice: 0,
    shopRating: 0
  },

  // WOMENS FASHION (4-6)
  {
    id: "4",
    name: "Elegant Women's Dress",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
    category: "womens-fashion",
    shopId: "shop2",
    shopName: "Glamour Boutique",
    shopAvatar: "https://i.pravatar.cc/150?u=shop2",
    description: "Flowing evening dress, perfect for cocktail parties and formal events.",
    soldCount: 200,
    rating: 4.9,
    createdAt: new Date("2026-02-20"),
    tags: ["formal", "elegant", "dress"],
    properties: { colors: ["Red", "Emerald", "Black"], sizes: ["XS", "S", "M"], materials: ["Silk", "Satin"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "5",
    name: "Women's Blouse",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400",
    category: "womens-fashion",
    shopId: "shop2",
    shopName: "Glamour Boutique",
    shopAvatar: "https://i.pravatar.cc/150?u=shop2",
    description: "Professional and stylish silk blouse for the modern woman.",
    soldCount: 175,
    rating: 4.6,
    createdAt: new Date("2026-01-25"),
    tags: ["office", "blouse", "silk"],
    properties: { colors: ["White", "Pink", "Blue"], sizes: ["S", "M", "L"], materials: ["Chiffon"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "6",
    name: "Women's Handbag",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
    category: "womens-fashion",
    shopId: "shop2",
    shopName: "Glamour Boutique",
    shopAvatar: "https://i.pravatar.cc/150?u=shop2",
    description: "Spacious leather handbag with multiple compartments.",
    soldCount: 95,
    rating: 4.8,
    createdAt: new Date("2025-10-05"),
    tags: ["accessory", "leather", "bag"],
    properties: { colors: ["Brown", "Black", "Beige"], materials: ["Vegan Leather"] },
    originalPrice: 0,
    shopRating: 0
  },

  // FOOD & BEVERAGE (7-9)
  {
    id: "7",
    name: "Organic Coffee Beans",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    category: "food-beverage",
    shopId: "shop3",
    shopName: "Tasty Treats",
    shopAvatar: "https://i.pravatar.cc/150?u=shop3",
    description: "Medium roast Arabica beans from sustainable farms.",
    soldCount: 500,
    rating: 4.9,
    createdAt: new Date("2026-03-01"),
    tags: ["coffee", "organic", "drink"],
    properties: { sizes: ["250g", "500g", "1kg"], materials: ["Arabica Beans"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "8",
    name: "Artisan Chocolate Box",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400",
    category: "food-beverage",
    shopId: "shop3",
    shopName: "Tasty Treats",
    shopAvatar: "https://i.pravatar.cc/150?u=shop3",
    description: "Handcrafted truffles with premium dark and milk chocolate.",
    soldCount: 320,
    rating: 5.0,
    createdAt: new Date("2025-12-20"),
    tags: ["chocolate", "sweets", "gift"],
    properties: { sizes: ["12 pieces", "24 pieces"], materials: ["Cacao", "Milk"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "9",
    name: "Green Tea Collection",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    category: "food-beverage",
    shopId: "shop3",
    shopName: "Tasty Treats",
    shopAvatar: "https://i.pravatar.cc/150?u=shop3",
    description: "Selection of premium loose-leaf green teas from Asia.",
    soldCount: 280,
    rating: 4.7,
    createdAt: new Date("2026-02-10"),
    tags: ["tea", "healthy", "beverage"],
    properties: { sizes: ["Box of 20 bags", "100g loose leaf"] },
    originalPrice: 0,
    shopRating: 0
  },

  // ELECTRONICS (10-12)
  {
    id: "10",
    name: "Wireless Headphones",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "electronics",
    shopId: "shop4",
    shopName: "TechZone",
    shopAvatar: "https://i.pravatar.cc/150?u=shop4",
    description: "Noise-cancelling over-ear headphones with 40h battery life.",
    soldCount: 450,
    rating: 4.6,
    createdAt: new Date("2026-01-05"),
    tags: ["audio", "gadget", "wireless"],
    properties: { colors: ["Black", "Silver"], materials: ["Plastic", "Foam"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "11",
    name: "Smart Watch",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    category: "electronics",
    shopId: "shop4",
    shopName: "TechZone",
    shopAvatar: "https://i.pravatar.cc/150?u=shop4",
    description: "Health tracking, GPS, and seamless smartphone integration.",
    soldCount: 380,
    rating: 4.8,
    createdAt: new Date("2025-11-20"),
    tags: ["wearable", "smart", "tech"],
    properties: { colors: ["Space Gray", "Starlight"], materials: ["Aluminum", "Silicone"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "12",
    name: "Portable Speaker",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
    category: "electronics",
    shopId: "shop4",
    shopName: "TechZone",
    shopAvatar: "https://i.pravatar.cc/150?u=shop4",
    description: "Waterproof Bluetooth speaker with powerful 360 sound.",
    soldCount: 290,
    rating: 4.4,
    createdAt: new Date("2026-03-15"),
    tags: ["audio", "portable", "bluetooth"],
    properties: { colors: ["Red", "Black", "Blue"] },
    originalPrice: 0,
    shopRating: 0
  },

  // SHOES & FOOTWEAR (13-15)
  {
    id: "13",
    name: "Running Shoes",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    category: "shoes-footwear",
    shopId: "shop5",
    shopName: "Foot Forward",
    shopAvatar: "https://i.pravatar.cc/150?u=shop5",
    description: "Lightweight mesh running shoes with responsive cushioning.",
    soldCount: 420,
    rating: 4.8,
    createdAt: new Date("2026-02-01"),
    tags: ["sports", "running", "shoes"],
    properties: { colors: ["Red", "Blue"], sizes: ["40", "41", "42", "43", "44"], materials: ["Mesh", "Rubber"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "14",
    name: "Leather Boots",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400",
    category: "shoes-footwear",
    shopId: "shop5",
    shopName: "Foot Forward",
    shopAvatar: "https://i.pravatar.cc/150?u=shop5",
    description: "Handcrafted genuine leather boots for all-day style and durability.",
    soldCount: 180,
    rating: 4.7,
    createdAt: new Date("2025-09-15"),
    tags: ["boots", "leather", "men"],
    properties: { colors: ["Brown", "Tan"], sizes: ["41", "42", "43"], materials: ["Genuine Leather"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "15",
    name: "Canvas Sneakers",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",
    category: "shoes-footwear",
    shopId: "shop5",
    shopName: "Foot Forward",
    shopAvatar: "https://i.pravatar.cc/150?u=shop5",
    description: "Classic canvas sneakers that go with everything.",
    soldCount: 350,
    rating: 4.5,
    createdAt: new Date("2026-01-18"),
    tags: ["sneakers", "casual", "canvas"],
    properties: { colors: ["White", "Black"], sizes: ["38", "39", "40", "41"], materials: ["Canvas"] },
    originalPrice: 0,
    shopRating: 0
  },

  // BOOKS & MEDIA (16-18)
  {
    id: "16",
    name: "Best Seller Novel",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    category: "books-media",
    shopId: "shop6",
    shopName: "Book Haven",
    shopAvatar: "https://i.pravatar.cc/150?u=shop6",
    description: "A gripping tale of mystery and suspense that will keep you guessing.",
    soldCount: 800,
    rating: 4.9,
    createdAt: new Date("2025-08-10"),
    tags: ["fiction", "mystery", "reading"],
    properties: { materials: ["Paperback", "Hardcover"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "17",
    name: "Vinyl Record Collection",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400",
    category: "books-media",
    shopId: "shop6",
    shopName: "Book Haven",
    shopAvatar: "https://i.pravatar.cc/150?u=shop6",
    description: "Classic jazz collection on high-quality 180g vinyl.",
    soldCount: 120,
    rating: 5.0,
    createdAt: new Date("2026-03-20"),
    tags: ["music", "vinyl", "jazz"],
    properties: { materials: ["Vinyl"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "18",
    name: "Photography Book",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    category: "books-media",
    shopId: "shop6",
    shopName: "Book Haven",
    shopAvatar: "https://i.pravatar.cc/150?u=shop6",
    description: "Stunning landscape photography from around the world.",
    soldCount: 200,
    rating: 4.8,
    createdAt: new Date("2025-12-25"),
    tags: ["photography", "art", "book"],
    properties: { materials: ["Hardcover"] },
    originalPrice: 0,
    shopRating: 0
  },

  // HOME & LIVING (19-21)
  {
    id: "19",
    name: "Modern Table Lamp",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    category: "home-living",
    shopId: "shop7",
    shopName: "Home Decor Plus",
    shopAvatar: "https://i.pravatar.cc/150?u=shop7",
    description: "Sleek LED table lamp with adjustable brightness settings.",
    soldCount: 230,
    rating: 4.6,
    createdAt: new Date("2026-01-30"),
    tags: ["lamp", "decor", "home"],
    properties: { colors: ["Gold", "Silver", "Matte Black"], materials: ["Metal"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "20",
    name: "Decorative Cushions Set",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    category: "home-living",
    shopId: "shop7",
    shopName: "Home Decor Plus",
    shopAvatar: "https://i.pravatar.cc/150?u=shop7",
    description: "Set of 4 soft velvet cushions to brighten up your sofa.",
    soldCount: 310,
    rating: 4.5,
    createdAt: new Date("2025-11-10"),
    tags: ["cushion", "soft", "interior"],
    properties: { colors: ["Teal", "Yellow", "Grey"], materials: ["Velvet"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "21",
    name: "Ceramic Vase",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400",
    category: "home-living",
    shopId: "shop7",
    shopName: "Home Decor Plus",
    shopAvatar: "https://i.pravatar.cc/150?u=shop7",
    description: "Minimalist ceramic vase, ideal for fresh or dried flowers.",
    soldCount: 180,
    rating: 4.7,
    createdAt: new Date("2026-02-28"),
    tags: ["vase", "ceramic", "minimalist"],
    properties: { colors: ["White", "Beige"], materials: ["Ceramic"] },
    originalPrice: 0,
    shopRating: 0
  },

  // LIFESTYLE (22-24)
  {
    id: "22",
    name: "Yoga Mat",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
    category: "lifestyle",
    shopId: "shop8",
    shopName: "Wellness World",
    shopAvatar: "https://i.pravatar.cc/150?u=shop8",
    description: "Extra thick non-slip yoga mat for yoga and pilates.",
    soldCount: 400,
    rating: 4.9,
    createdAt: new Date("2026-03-05"),
    tags: ["yoga", "fitness", "lifestyle"],
    properties: { colors: ["Purple", "Green"], materials: ["TPE"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "23",
    name: "Essential Oil Set",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400",
    category: "lifestyle",
    shopId: "shop8",
    shopName: "Wellness World",
    shopAvatar: "https://i.pravatar.cc/150?u=shop8",
    description: "Pure essential oils: Lavender, Peppermint, and Eucalyptus.",
    soldCount: 280,
    rating: 4.8,
    createdAt: new Date("2025-10-20"),
    tags: ["wellness", "oils", "relax"],
    properties: { materials: ["Essential Oils"] },
    originalPrice: 0,
    shopRating: 0
  },
  {
    id: "24",
    name: "Fitness Tracker",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400",
    category: "lifestyle",
    shopId: "shop8",
    shopName: "Wellness World",
    shopAvatar: "https://i.pravatar.cc/150?u=shop8",
    description: "Track your steps, heart rate, and sleep quality.",
    soldCount: 350,
    rating: 4.3,
    createdAt: new Date("2026-01-12"),
    tags: ["fitness", "tech", "health"],
    properties: { colors: ["Black", "Rose Gold"], materials: ["Silicone"] },
    originalPrice: 0,
    shopRating: 0
  }
];
const sampleOrders: Order[] = [
  {
    id: "ORD001",
    userId: "user2",
    userName: "John Doe",
    userEmail: "john@example.com",
    items: [
      { productId: "1", productName: "Classic Men's T-Shirt", quantity: 2, price: 29.99, shopId: "shop1", shopName: "Urban Style Co", category: "mens-fashion" },
    ],
    totalPrice: 59.98,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    shippingAddress: "123 Main St, New York, NY 10001",
  },
  {
    id: "ORD002",
    userId: "user3",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    items: [
      { productId: "4", productName: "Elegant Women's Dress", quantity: 1, price: 79.99, shopId: "shop2", shopName: "Glamour Boutique", category: "womens-fashion" },
    ],
    totalPrice: 79.99,
    status: "processing",
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 1800000),
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
  },
  {
    id: "ORD003",
    userId: "user4",
    userName: "Mike Johnson",
    userEmail: "mike@example.com",
    items: [
      { productId: "10", productName: "Wireless Headphones", quantity: 1, price: 149.99, shopId: "shop4", shopName: "TechZone", category: "electronics" },
    ],
    totalPrice: 149.99,
    status: "shipped",
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 3600000),
    shippingAddress: "789 Pine Rd, Chicago, IL 60601",
  },
  {
    id: "ORD004",
    userId: "user5",
    userName: "Sarah Wilson",
    userEmail: "sarah@example.com",
    items: [
      { productId: "13", productName: "Running Shoes", quantity: 1, price: 119.99, shopId: "shop5", shopName: "Foot Forward", category: "shoes-footwear" },
    ],
    totalPrice: 119.99,
    status: "delivered",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    shippingAddress: "321 Elm St, Houston, TX 77001",
  },
  {
    id: "ORD005",
    userId: "user6",
    userName: "Emma Davis",
    userEmail: "emma@example.com",
    items: [
      { productId: "7", productName: "Organic Coffee Beans", quantity: 3, price: 19.99, shopId: "shop3", shopName: "Tasty Treats", category: "food-beverage" },
    ],
    totalPrice: 59.97,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    shippingAddress: "654 Maple Dr, Phoenix, AZ 85001",
  },
  {
    id: "ORD006",
    userId: "user7",
    userName: "Alex Brown",
    userEmail: "alex@example.com",
    items: [
      { productId: "20", productName: "Decorative Cushions Set", quantity: 1, price: 44.99, shopId: "shop7", shopName: "Home Decor Plus", category: "home-living" },
    ],
    totalPrice: 44.99,
    status: "delivered",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    shippingAddress: "987 Birch Ln, Philadelphia, PA 19101",
  },
]
export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: "user1",
    email: "ntduong.14032005@gmail.com",
    name: "Nguyen Duong",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400",
    isLoggedIn: true,
    isAdmin: true,
    totalSpend: 1250.50,
    shops: [],
    purchasedProductIds: ["1", "2", "4", "7", "10"],
  })

  const [shops, setShops] = useState<Shop[]>([])
  const [products, setProducts] = useState<Product[]>(
    sampleProducts.map((p) => ({
      ...p,
      rating: 4.5,
      comments: sampleComments.filter((c) => c.productId === p.id),
    }))
  )
  const [orders, setOrders] = useState<Order[]>(sampleOrders)

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

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              ...updates,
              properties: {
                ...product.properties,
                ...(updates.properties || {}),
              },
            }
          : product
      )
    )

    setShops((prev) =>
      prev.map((shop) => ({
        ...shop,
        products: shop.products.map((product) =>
          product.id === productId
            ? {
                ...product,
                ...updates,
                properties: {
                  ...product.properties,
                  ...(updates.properties || {}),
                },
              }
            : product
        ),
      }))
    )
  }

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId))
    setShops((prev) =>
      prev.map((shop) => ({
        ...shop,
        products: shop.products.filter((product) => product.id !== productId),
      }))
    )
  }

  const getProductsByCategory = (category: string) => {
    return products.filter((product) => product.category === category)
  }

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id)
  }

  const addComment = (
    productId: string,
    userId: string,
    userName: string,
    rating: number,
    text: string
  ) => {
    const comment: ProductComment = {
      id: `c${Date.now()}`,
      productId,
      userId,
      userName,
      rating,
      text,
      createdAt: new Date(),
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              comments: [...(p.comments || []), comment],
            }
          : p
      )
    )
  }

  const purchaseProduct = (productId: string) => {
    if (user) {
      setUser({
        ...user,
        purchasedProductIds: [
          ...new Set([...user.purchasedProductIds, productId]),
        ],
      })
    }
  }

  const getProductComments = (productId: string) => {
    const product = getProductById(productId)
    return product?.comments || []
  }

  const userHasPurchased = (productId: string) => {
    return user?.purchasedProductIds.includes(productId) || false
  }
  const getOrders = () => {
    return orders
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    )
  }

  const getTodayFinishedOrders = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return orders.filter(
      (order) =>
        (order.status === "delivered" || order.status === "cancelled" || order.status === "rejected") &&
        order.updatedAt >= today
    )
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
        updateProduct,
        removeProduct,
        products,
        getProductsByCategory,
        getProductById,
        addComment,
        purchaseProduct,
        getProductComments,
        userHasPurchased,
        orders,
        getOrders,
        updateOrderStatus,
        getTodayFinishedOrders,
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

