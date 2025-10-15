"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/sanity"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price?.toString() || "",
    description: product?.description || "",
    category: product?.category || "",
    inStock: product?.inStock !== false,
    imageUrl: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = product ? `/api/products/${product._id}` : "/api/products"
      const method = product ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: Number.parseFloat(formData.price),
          description: formData.description,
          category: formData.category,
          inStock: formData.inStock,
          imageUrl: formData.imageUrl,
        }),
      })

      if (response.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        console.error("[v0] Failed to save product")
      }
    } catch (error) {
      console.error("[v0] Error saving product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Electronics, Clothing, Books"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter product description"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">Enter a URL to an image for this product</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="inStock">In Stock</Label>
          <p className="text-sm text-muted-foreground">Product is available for purchase</p>
        </div>
        <Switch
          id="inStock"
          checked={formData.inStock}
          onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
