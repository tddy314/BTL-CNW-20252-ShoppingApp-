export type MockPaymentMethod = "cash" | "momo" | "bank-transfer"
export type MockMomoStatus = "success" | "pending"
export type MockBankTransferStatus = "pending" | "verified"
export type MockOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "rejected"

export interface MockOrderItem {
  productId: string
  productName: string
  shopId: string
  shopName: string
  quantity: number
  unitPrice: number
}

export interface MockOrder {
  id: string
  createdAt: string
  updatedAt: string
  receiver: string
  phone: string
  address: string
  paymentMethod: MockPaymentMethod
  momoStatus?: MockMomoStatus
  bankTransferStatus?: MockBankTransferStatus
  transferProofFileName?: string
  transferProofImageDataUrl?: string
  status: MockOrderStatus
  totalPrice: number
  items: MockOrderItem[]
}

export const MOCK_ORDERS_STORAGE_KEY = "frontend-mock-orders-v1"

export function readMockOrders(): MockOrder[] {
  if (typeof window === "undefined") {
    return []
  }

  const raw = localStorage.getItem(MOCK_ORDERS_STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as MockOrder[]
  } catch {
    return []
  }
}

export function writeMockOrders(orders: MockOrder[]): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(MOCK_ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

export function appendMockOrder(order: MockOrder): void {
  const previous = readMockOrders()
  writeMockOrders([order, ...previous])
}

export function updateMockOrder(
  orderId: string,
  patch: Pick<MockOrder, "receiver" | "phone" | "address">
): MockOrder | null {
  const previous = readMockOrders()
  const index = previous.findIndex((order) => order.id === orderId)

  if (index === -1) {
    return null
  }

  const updatedOrder: MockOrder = {
    ...previous[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  const next = [...previous]
  next[index] = updatedOrder
  writeMockOrders(next)
  return updatedOrder
}

export function updateMockOrderStatus(
  orderId: string,
  status: MockOrderStatus
): MockOrder | null {
  const previous = readMockOrders()
  const index = previous.findIndex((order) => order.id === orderId)

  if (index === -1) {
    return null
  }

  const updatedOrder: MockOrder = {
    ...previous[index],
    status,
    updatedAt: new Date().toISOString(),
  }

  const next = [...previous]
  next[index] = updatedOrder
  writeMockOrders(next)
  return updatedOrder
}

export function formatPaymentLabel(order: MockOrder): string {
  if (order.paymentMethod === "cash") {
    return "Cash on Delivery"
  }

  if (order.paymentMethod === "bank-transfer") {
    return `Bank Transfer (${order.bankTransferStatus ?? "pending"})`
  }

  return `MoMo (${order.momoStatus ?? "pending"})`
}
