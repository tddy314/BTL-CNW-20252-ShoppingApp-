"use client"

import Image from 'next/image'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  price: number
  quantity: number
  shopId: string
  shopName: string
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  productId,
  productName,
  price,
  quantity,
  shopId,
  shopName,
}: CheckoutDialogProps) {
  const { shops, createOrder, purchaseProduct } = useStore()
  const shop = shops.find((s) => s.id === shopId)
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setReceiptDataUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const items = [
      {
        productId,
        productName,
        quantity,
        price,
        shopId,
        shopName,
        category: '',
      },
    ]
    const totalPrice = price * quantity

    // Create order locally (in-memory store)
    createOrder({
      items,
      totalPrice,
      shippingAddress: 'Buyer will provide later',
      receiptUrl: receiptDataUrl || undefined,
      paymentMethod: 'bank-transfer',
    })

    // Mark product as purchased for basic behavior
    purchaseProduct(productId)

    setIsSubmitting(false)
    onOpenChange(false)
    alert('Order created. Seller will verify your transfer after checking the receipt.')
  }

  if (!shop) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thanh toán chuyển khoản</DialogTitle>
          <DialogDescription>
            Quét mã QR bên dưới bằng ứng dụng ngân hàng của bạn, chuyển tiền và tải ảnh hóa đơn/chứng từ chuyển khoản lên để người bán xác nhận.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">Người bán: {shopName}</div>
          <div className="flex items-center justify-center">
            {shop.bankingQR ? (
              // bankingQR is stored as data URL or external URL
              // use Image if it's an absolute URL, fallback to img
              <img src={shop.bankingQR} alt="Banking QR" className="w-48 h-48 object-contain rounded-lg border" />
            ) : (
              <div className="text-muted-foreground">Người bán chưa tải QR</div>
            )}
          </div>

          <div>
            <Label>Upload ảnh hóa đơn/chứng từ</Label>
            <div className="mt-2">
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {receiptDataUrl && (
              <div className="mt-2">
                <img src={receiptDataUrl} alt="Receipt" className="w-48 h-auto rounded-md border" />
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Tổng: ${ (price * quantity).toFixed(2) }
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary text-white">
            {isSubmitting ? 'Đang gửi...' : 'Hoàn tất và gửi hóa đơn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
