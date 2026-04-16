"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Store } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"

interface CreateShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateShopDialog({ open, onOpenChange }: CreateShopDialogProps) {
  const router = useRouter()
  const { user, addShop } = useStore()
  const [shopName, setShopName] = useState("")
  const [bankingQR, setBankingQR] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBankingQR(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!shopName.trim() || !bankingQR || !user) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newShop = {
      id: `shop-${Date.now()}`,
      name: shopName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(shopName)}&background=ee4d2d&color=fff`,
      bankingQR: bankingQR,
      ownerId: user.id,
      createdAt: new Date(),
      products: [],
      totalEarnings: 0,
      totalSold: 0,
    }

    addShop(newShop)
    setShopName("")
    setBankingQR(null)
    setIsSubmitting(false)
    onOpenChange(false)
    router.push("/my-shops")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#ee4d2d]" />
            Create Your Shop
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create your own shop on ShopHub.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              placeholder="Enter your shop name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankingQR">Banking QR Code</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {bankingQR ? (
                <div className="space-y-2">
                  <img
                    src={bankingQR}
                    alt="Banking QR"
                    className="w-32 h-32 mx-auto object-contain"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBankingQR(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="qrUpload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload QR code
                  </span>
                  <input
                    id="qrUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your banking QR code for receiving payments
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!shopName.trim() || !bankingQR || isSubmitting}
            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white"
          >
            {isSubmitting ? "Creating..." : "Create Shop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
