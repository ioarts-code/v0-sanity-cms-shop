"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { type Product, urlFor } from "@/lib/sanity"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, ArrowLeft, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminDashboardProps {
  initialProducts: Product[]
}

export function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isCreating, setIsCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    inStock: true,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      inStock: true,
    })
    setIsCreating(false)
    setEditingProduct(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      category: product.category || "",
      inStock: product.inStock !== false,
    })
    setIsCreating(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        // Update existing product
        const response = await fetch("/api/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: editingProduct._id,
            ...formData,
            price: Number.parseFloat(formData.price),
          }),
        })

        if (!response.ok) throw new Error("Failed to update product")

        const updatedProduct = await response.json()
        setProducts(products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)))

        toast({
          title: "Product updated",
          description: "The product has been successfully updated.",
        })
      } else {
        // Create new product
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            price: Number.parseFloat(formData.price),
          }),
        })

        if (!response.ok) throw new Error("Failed to create product")

        const newProduct = await response.json()
        setProducts([newProduct, ...products])

        toast({
          title: "Product created",
          description: "The product has been successfully created.",
        })
      }

      resetForm()
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: productId }),
      })

      if (!response.ok) throw new Error("Failed to delete product")

      setProducts(products.filter((p) => p._id !== productId))

      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      })
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <span className="text-xl font-semibold">Admin Dashboard</span>
            </div>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isCreating ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{editingProduct ? "Edit Product" : "Create New Product"}</CardTitle>
              <CardDescription>
                {editingProduct ? "Update product information" : "Add a new product to your store"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
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
                    placeholder="e.g., Electronics, Clothing"
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

                <div className="flex items-center justify-between">
                  <Label htmlFor="inStock">In Stock</Label>
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Products</h2>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No products yet</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={urlFor(product.image).width(80).height(80).url() || "/placeholder.svg"}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                              {product.category && (
                                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                              )}
                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(product._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                product.inStock !== false
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {product.inStock !== false ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
