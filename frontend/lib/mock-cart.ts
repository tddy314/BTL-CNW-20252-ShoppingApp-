import type { Product } from "@/lib/store"

export type CartSortOption = "latest" | "oldest" | "price-asc" | "price-desc"
export const MOCK_CART_STORAGE_KEY = "frontend-mock-cart-v1"

export interface MockCartItem {
  id: string
  productId: string
  quantity: number
  addedAt: string
  selectedColor?: string
  selectedSize?: string
}

function pickOption(options: string[] | undefined, index: number): string | undefined {
  if (!options || options.length === 0) {
    return undefined
  }

  return options[index % options.length]
}

export function createMockCartItems(products: Product[]): MockCartItem[] {
  return products.slice(0, 10).map((product, index) => ({
    id: `cart-${product.id}-${index + 1}`,
    productId: product.id,
    quantity: (index % 3) + 1,
    addedAt: new Date(Date.now() - index * 6 * 60 * 60 * 1000).toISOString(),
    selectedColor: pickOption(product.properties.colors, index),
    selectedSize: pickOption(product.properties.sizes, index),
  }))
}

export function readMockCartItems(): MockCartItem[] {
  if (typeof window === "undefined") {
    return []
  }

  const raw = localStorage.getItem(MOCK_CART_STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as MockCartItem[]
  } catch {
    return []
  }
}

export function writeMockCartItems(items: MockCartItem[]): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(MOCK_CART_STORAGE_KEY, JSON.stringify(items))
}

export function removeMockCartItem(cartItemId: string): MockCartItem[] {
  const current = readMockCartItems()
  const next = current.filter((item) => item.id !== cartItemId)
  writeMockCartItems(next)
  return next
}
