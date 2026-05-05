'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/contexts/auth-context'
import { ApiGateway } from '@/app/utils/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { Building2, CreditCard, Image as ImageIcon, Store } from 'lucide-react'

const api = new ApiGateway()

interface EditShopInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  currentShopName?: string
  currentShopImg?: string
  onSaved?: () => void
}

export function EditShopInfoDialog({
  open,
  onOpenChange,
  shopId,
  currentShopName = '',
  currentShopImg = '',
  onSaved,
}: EditShopInfoDialogProps) {
  const { email } = useAuth()
  const [shopName, setShopName] = useState(currentShopName)
  const [shopImg, setShopImg] = useState(currentShopImg)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!email) return
    if (!shopName.trim() && !shopImg.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      await api.updateShopInfo({
        shop_id: Number(shopId),
        owner: email,
        shop_name: shopName.trim() || undefined,
        shop_img: shopImg.trim() || null,
      })
      onSaved?.()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update shop info')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setShopName(currentShopName)
    setShopImg(currentShopImg)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Shop Information</DialogTitle>
          <DialogDescription>
            Update your shop name and image link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="editShopName" className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              Shop Name
            </Label>
            <Input
              id="editShopName"
              placeholder="Enter your shop name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editShopImg" className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Shop Image Link
            </Label>
            <Input
              id="editShopImg"
              placeholder="https://example.com/shop-image.jpg"
              value={shopImg}
              onChange={(e) => setShopImg(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface EditShopBankDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  currentBankAccount?: string
  currentBankAccountNumber?: string
}

export function EditShopBankDialog({
  open,
  onOpenChange,
  shopId,
  currentBankAccount = '',
  currentBankAccountNumber = '',
}: EditShopBankDialogProps) {
  const { email } = useAuth()
  const [bankAccount, setBankAccount] = useState(currentBankAccount)
  const [bankAccountNumber, setBankAccountNumber] = useState(currentBankAccountNumber)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!bankAccount.trim() && !bankAccountNumber.trim()) return
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      await api.updateShopBankInfo({
        shop_id: Number(shopId),
        owner: email,
        shop_bank_account: bankAccount.trim() || undefined,
        shop_bank_account_number: bankAccountNumber.trim() || undefined,
      })
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update bank info')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setBankAccount(currentBankAccount)
    setBankAccountNumber(currentBankAccountNumber)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Bank Information</DialogTitle>
          <DialogDescription>
            Update your shop&apos;s bank account details for receiving payments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="editBankAccount" className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Bank Name
            </Label>
            <Input
              id="editBankAccount"
              placeholder="e.g. Vietcombank, MB Bank, Techcombank"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editBankAccountNumber" className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Bank Account Number
            </Label>
            <Input
              id="editBankAccountNumber"
              placeholder="Enter your bank account number"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white"
            onClick={handleSave}
            disabled={isLoading || (!bankAccount.trim() && !bankAccountNumber.trim())}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteShopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  shopName: string
  onDelete: () => void
}

export function DeleteShopDialog({
  open,
  onOpenChange,
  shopId,
  shopName,
  onDelete,
}: DeleteShopDialogProps) {
  const { email } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      await api.deleteShop({
        shop_id: Number(shopId),
        owner: email,
      })
      onDelete()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to delete shop')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shop</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{shopName}&rdquo;? This action cannot be undone.
            All products in this shop will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
          <span className="font-semibold">Warning:</span> This will permanently delete your shop and all its data.
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Deleting...' : 'Delete Shop'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
