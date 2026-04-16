'use client'

import { useState } from 'react'
import Image from 'next/image'
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
import { Camera, X } from 'lucide-react'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'avatar' | 'name'
}

export function EditProfileDialog({
  open,
  onOpenChange,
  type,
}: EditProfileDialogProps) {
  const { user, setUser } = useStore()
  const [newName, setNewName] = useState(user?.name || '')
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || '')
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSaveAvatar = async () => {
    if (!user || !previewUrl) return
    setIsLoading(true)
    
    // Simulate saving
    setTimeout(() => {
      setUser({
        ...user,
        avatar: previewUrl,
      })
      setIsLoading(false)
      onOpenChange(false)
    }, 500)
  }

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return
    setIsLoading(true)
    
    // Simulate saving
    setTimeout(() => {
      setUser({
        ...user,
        name: newName.trim(),
      })
      setIsLoading(false)
      onOpenChange(false)
    }, 500)
  }

  const handleClose = () => {
    setNewName(user?.name || '')
    setPreviewUrl(user?.avatar || '')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'avatar' ? 'Update Profile Picture' : 'Edit Name'}
          </DialogTitle>
          <DialogDescription>
            {type === 'avatar'
              ? 'Upload a new profile picture'
              : 'Change your display name'}
          </DialogDescription>
        </DialogHeader>

        {type === 'avatar' ? (
          <div className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={120}
                  height={120}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#ee4d2d]"
                />
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-[#00bfa5] rounded-full cursor-pointer hover:bg-[#00a896] transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Upload Info */}
            <div className="text-center text-sm text-muted-foreground">
              Click the camera icon to upload a new image
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base">
                Full Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name"
                className="mt-2"
              />
            </div>
          </div>
        )}

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
            onClick={type === 'avatar' ? handleSaveAvatar : handleSaveName}
            disabled={isLoading || (type === 'name' && !newName.trim())}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
