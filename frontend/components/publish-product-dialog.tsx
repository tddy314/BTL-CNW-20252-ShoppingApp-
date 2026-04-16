"use client"

import { useState } from "react"
import { Upload, Package } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { categories } from "@/components/category-grid"

interface PublishProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  shopName: string
}

export function PublishProductDialog({
  open,
  onOpenChange,
  shopId,
  shopName,
}: PublishProductDialogProps) {
  const { addProductToShop } = useStore()
  const [productName, setProductName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [productImage, setProductImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProductImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!productName.trim() || !price || !category || !productImage) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newProduct = {
      id: `product-${Date.now()}`,
      name: productName,
      price: parseFloat(price),
      image: productImage,
      category: category,
      shopId: shopId,
      shopName: shopName,
      description: description,
      soldCount: 0,
      createdAt: new Date(),
      tags: [],
      rating: 0,
      properties: {

      },
      originalPrice: 0,
      shopRating: 0
    }

    addProductToShop(shopId, newProduct)

    // Reset form
    setProductName("")
    setPrice("")
    setDescription("")
    setCategory("")
    setProductImage(null)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ee4d2d]" />
            Publish New Product
          </DialogTitle>
          <DialogDescription>
            Add a new product to your shop. Fill in all the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {productImage ? (
                <div className="space-y-2">
                  <img
                    src={productImage}
                    alt="Product preview"
                    className="w-32 h-32 mx-auto object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProductImage(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload product image
                  </span>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !productName.trim() ||
              !price ||
              !category ||
              !productImage ||
              isSubmitting
            }
            className="bg-[#ee4d2d] hover:bg-[#d73211] text-white"
          >
            {isSubmitting ? "Publishing..." : "Publish Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
