"use client"

import { useEffect, useState } from "react"
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
import type { Product } from "@/lib/store"

interface PublishProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  shopName: string
  existingProduct?: Product | null
}

export function PublishProductDialog({
  open,
  onOpenChange,
  shopId,
  shopName,
  existingProduct,
}: PublishProductDialogProps) {
  const { addProductToShop, updateProduct } = useStore()
  const [productName, setProductName] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [colors, setColors] = useState("")
  const [sizes, setSizes] = useState("")
  const [materials, setMaterials] = useState("")
  const [productImage, setProductImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = Boolean(existingProduct)

  useEffect(() => {
    if (!open) {
      return
    }

    if (existingProduct) {
      setProductName(existingProduct.name)
      setPrice(String(existingProduct.price))
      setOriginalPrice(String(existingProduct.originalPrice || existingProduct.price))
      setDescription(existingProduct.description)
      setCategory(existingProduct.category)
      setTags(existingProduct.tags.join(", "))
      setColors((existingProduct.properties.colors || []).join(", "))
      setSizes((existingProduct.properties.sizes || []).join(", "))
      setMaterials((existingProduct.properties.materials || []).join(", "))
      setProductImage(existingProduct.image)
      return
    }

    setProductName("")
    setPrice("")
    setOriginalPrice("")
    setDescription("")
    setCategory("")
    setTags("")
    setColors("")
    setSizes("")
    setMaterials("")
    setProductImage(null)
  }, [existingProduct, open])

  const parseCSV = (value: string): string[] => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }

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

    const parsedPrice = parseFloat(price)
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : parsedPrice
    const parsedTags = parseCSV(tags)
    const parsedColors = parseCSV(colors)
    const parsedSizes = parseCSV(sizes)
    const parsedMaterials = parseCSV(materials)

    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedOriginalPrice)) {
      setIsSubmitting(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const payload: Product = {
      id: existingProduct?.id ?? `product-${Date.now()}`,
      name: productName,
      price: parsedPrice,
      image: productImage,
      category: category,
      shopId: shopId,
      shopName: shopName,
      description: description,
      soldCount: existingProduct?.soldCount ?? 0,
      createdAt: existingProduct?.createdAt ?? new Date(),
      tags: parsedTags,
      rating: existingProduct?.rating ?? 0,
      properties: {
        colors: parsedColors,
        sizes: parsedSizes,
        materials: parsedMaterials,
      },
      originalPrice: parsedOriginalPrice,
      shopRating: existingProduct?.shopRating ?? 0,
      shopAvatar: existingProduct?.shopAvatar,
      comments: existingProduct?.comments,
      images: existingProduct?.images,
      reviews: existingProduct?.reviews,
      discount:
        parsedOriginalPrice > 0 && parsedOriginalPrice > parsedPrice
          ? Math.round(((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100)
          : 0,
    }

    if (existingProduct) {
      updateProduct(existingProduct.id, payload)
    } else {
      addProductToShop(shopId, payload)
    }

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
            {isEditMode ? "Edit Product" : "Publish New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update product information and save your changes."
              : "Add a new product to your shop. Fill in all the details below."}
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
            <Label htmlFor="originalPrice">Original Price ($)</Label>
            <Input
              id="originalPrice"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
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
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="example: cotton, basic, summer"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="colors">Colors</Label>
              <Input
                id="colors"
                placeholder="Red, Blue"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes</Label>
              <Input
                id="sizes"
                placeholder="S, M, L"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="materials">Materials</Label>
              <Input
                id="materials"
                placeholder="Cotton, Denim"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
              />
            </div>
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
            {isSubmitting
              ? isEditMode
                ? "Saving..."
                : "Publishing..."
              : isEditMode
              ? "Save Product"
              : "Publish Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
