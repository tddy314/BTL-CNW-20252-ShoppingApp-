'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useStore } from '@/lib/store'
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
import { Upload } from 'lucide-react'

interface EditShopQRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
}

export function EditShopQRDialog({
  open,
  onOpenChange,
  shopId,
}: EditShopQRDialogProps) {
  const { shops } = useStore()
  const shop = shops.find((s) => s.id === shopId)
  const [previewUrl, setPreviewUrl] = useState(shop?.bankingQR || '')
  const [isLoading, setIsLoading] = useState(false)

  if (!shop) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!previewUrl) return
    setIsLoading(true)
    
    // Simulate saving - in real app, would update shop in store
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
    }, 500)
  }

  const handleClose = () => {
    setPreviewUrl(shop?.bankingQR || '')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Banking QR Code</DialogTitle>
          <DialogDescription>
            Upload a new banking QR code for your shop
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Preview */}
          <div className="flex justify-center">
            <div className="relative">
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Banking QR"
                  width={160}
                  height={160}
                  className="w-40 h-40 border-2 border-[#ee4d2d] rounded-lg object-cover"
                />
              )}
              <label htmlFor="qr-upload" className="absolute bottom-0 right-0 p-2 bg-[#00bfa5] rounded-lg cursor-pointer hover:bg-[#00a896] transition-colors flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </label>
              <input
                id="qr-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Info */}
          <div className="text-center text-sm text-muted-foreground">
            Click the upload icon to change the QR code
          </div>
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
            disabled={isLoading || !previewUrl}
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
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    
    // Simulate deletion
    setTimeout(() => {
      setIsLoading(false)
      onDelete()
      onOpenChange(false)
    }, 500)
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
