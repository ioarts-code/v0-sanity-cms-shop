"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart"
import type { Product } from "@/lib/sanity"

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    console.log("[v0] Add to cart clicked for:", product.name)
    console.log("[v0] Product data:", {
      _id: product._id,
      name: product.name,
      price: product.price,
      slug: product.slug,
    })

    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug.current,
    })

    console.log("[v0] Item added to cart")
  }

  return (
    <Button
      size="lg"
      className="px-8 h-12 text-base transition-all duration-300 hover:scale-105 hover:shadow-lg"
      onClick={handleAddToCart}
      disabled={product.inStock === false}
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      {product.inStock === false ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
