"use client"

import { useEffect, useState } from "react"
import { Package } from "lucide-react"
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
import { categories } from "@/components/category-grid"
import type { Product } from "@/lib/store"
import { ApiGateway, normalizeIdentifierToUuid } from "@/app/utils/api"
import { useAuth } from "@/contexts/auth-context"

interface PublishProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  shopName: string
  existingProduct?: Product | null
  onSaved?: () => void
}

const api = new ApiGateway()

export function PublishProductDialog({
  open,
  onOpenChange,
  shopId,
  shopName,
  existingProduct,
  onSaved,
}: PublishProductDialogProps) {
  const { email } = useAuth()
  const [productName, setProductName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [colors, setColors] = useState("")
  const [sizes, setSizes] = useState("")
  const [materials, setMaterials] = useState("")
  const [productImage, setProductImage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const isEditMode = Boolean(existingProduct)

  useEffect(() => {
    if (!open) {
      return
    }

    if (existingProduct) {
      setProductName(existingProduct.name)
      setPrice(String(existingProduct.price))
      setDescription(existingProduct.description)
      setCategory(existingProduct.category)
      setTags(existingProduct.tags.join(", "))
      setColors((existingProduct.properties.colors || []).join(", "))
      setSizes((existingProduct.properties.sizes || []).join(", "))
      setMaterials((existingProduct.properties.materials || []).join(", "))
      setProductImage(existingProduct.image || "")
      return
    }

    setProductName("")
    setPrice("")
    setDescription("")
    setCategory("")
    setTags("")
    setColors("")
    setSizes("")
    setMaterials("")
    setProductImage("")
  }, [existingProduct, open])

  const parseCSV = (value: string): string[] => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const handleSubmit = async () => {
    setValidationError(null)
    if (!email) {
      setValidationError("You must be signed in to publish product.")
      return
    }
    if (!productName.trim() || !price || !category || !description.trim()) {
      setValidationError("Please fill all required fields: name, price, category, description.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const parsedPrice = parseFloat(price)
    const parsedTags = parseCSV(tags)
    const parsedColors = parseCSV(colors)
    const parsedSizes = parseCSV(sizes)
    const parsedMaterials = parseCSV(materials)

    if (Number.isNaN(parsedPrice)) {
      setIsSubmitting(false)
      setValidationError("Price must be a valid number.")
      return
    }

    try {
      if (existingProduct) {
        await api.updateProduct({
          product_id: existingProduct.id,
          shop_owner: email,
          product_img_link: productImage.trim() || null,
          category,
          price: parsedPrice,
          description,
          name: productName,
          tag: parsedTags.join(", "),
          colors_list: parsedColors.join(", "),
          size_list: parsedSizes.join(", "),
          material_list: parsedMaterials.join(", "),
        })
      } else {
        await api.addProduct({
          shop_id: normalizeIdentifierToUuid(shopId),
          shop_owner: email,
          product_img_link: productImage.trim() || null,
          category,
          price: parsedPrice,
          description,
          name: productName,
          tag: parsedTags.join(", "),
          colors_list: parsedColors.join(", "),
          size_list: parsedSizes.join(", "),
          material_list: parsedMaterials.join(", "),
        })
      }
    } catch (err: any) {
      setIsSubmitting(false)
      setError(err?.message || "Failed to save product")
      return
    }

    // Reset form
    setProductName("")
    setPrice("")
    setDescription("")
    setCategory("")
    setProductImage("")
    setIsSubmitting(false)
    onSaved?.()
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
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
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
            <Label htmlFor="category">Category *</Label>
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
            <Label htmlFor="description">Description *</Label>
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
            <Label htmlFor="productImageLink">Product Image Link</Label>
            <Input
              id="productImageLink"
              type="url"
              placeholder="https://example.com/product-image.jpg"
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
            />
            {productImage ? (
              <div className="mt-3">
                <img
                  src={productImage}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = "none"
                  }}
                />
              </div>
            ) : null}
          </div>

          {validationError ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              {validationError}
            </div>
          ) : null}

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
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
