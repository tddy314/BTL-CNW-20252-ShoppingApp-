'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { ApiGateway } from '@/app/utils/api'
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
import { Link as LinkIcon } from 'lucide-react'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'avatar' | 'name'
  currentName?: string
  currentAvatar?: string
  onSaved?: (updated: { name?: string; avatar?: string }) => void
}

export function EditProfileDialog({
  open,
  onOpenChange,
  type,
  currentName = '',
  currentAvatar = '',
  onSaved,
}: EditProfileDialogProps) {
  const { email } = useAuth()
  const api = new ApiGateway()
  const [newName, setNewName] = useState(currentName || '')
  const [previewUrl, setPreviewUrl] = useState(currentAvatar || '')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setNewName(currentName || '')
      setPreviewUrl(currentAvatar || '')
    }
  }, [open, currentName, currentAvatar])

  const handleSaveAvatar = async () => {
    if (!email) return
    setIsLoading(true)

    try {
      await api.updateProfile({
        email,
        profile_img: previewUrl || null,
      })
      onSaved?.({ avatar: previewUrl || '' })
      setIsLoading(false)
      onOpenChange(false)
    } catch {
      setIsLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!email || !newName.trim()) return
    setIsLoading(true)

    try {
      await api.updateProfile({
        email,
        name: newName.trim(),
      })
      onSaved?.({ name: newName.trim() })
      setIsLoading(false)
      onOpenChange(false)
    } catch {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNewName(currentName || '')
    setPreviewUrl(currentAvatar || '')
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
              ? 'Set your profile picture link'
              : 'Change your display name'}
          </DialogDescription>
        </DialogHeader>

        {type === 'avatar' ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative space-y-4 w-full">
                <Image
                  src={previewUrl || '/placeholder-user.jpg'}
                  alt="Preview"
                  width={120}
                  height={120}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#ee4d2d]"
                />
                <div>
                  <Label htmlFor="avatar-link" className="text-base">Avatar Link</Label>
                  <div className="relative mt-2">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="avatar-link"
                      type="url"
                      value={previewUrl}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
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
