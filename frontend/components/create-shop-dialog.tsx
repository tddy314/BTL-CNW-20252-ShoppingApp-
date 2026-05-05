"use client"

import { useState } from "react"
import { Store, Building2, CreditCard } from "lucide-react"
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

import { useAuth } from "@/contexts/auth-context"
import { ApiGateway } from "@/app/utils/api"

interface CreateShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const api = new ApiGateway()

export function CreateShopDialog({ open, onOpenChange }: CreateShopDialogProps) {
  const { email } = useAuth()
  const [shopName, setShopName] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!shopName.trim() || !bankAccount.trim() || !bankAccountNumber.trim() || !email) return

    setIsSubmitting(true)
    setError(null)

    try {
      await api.createShop({
        owner: email,
        shop_name: shopName.trim(),
        shop_bank_account: bankAccount.trim(),
        shop_bank_account_number: bankAccountNumber.trim(),
      })

      setShopName("")
      setBankAccount("")
      setBankAccountNumber("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to create shop")
    } finally {
      setIsSubmitting(false)
    }
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
            <Label htmlFor="bankAccount" className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Bank Name
            </Label>
            <Input
              id="bankAccount"
              placeholder="e.g. Vietcombank, MB Bank, Techcombank"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber" className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Bank Account Number
            </Label>
            <Input
              id="bankAccountNumber"
              placeholder="Enter your bank account number"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your bank info will be used for receiving payments from orders.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!shopName.trim() || !bankAccount.trim() || !bankAccountNumber.trim() || isSubmitting}
            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white"
          >
            {isSubmitting ? "Creating..." : "Create Shop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
