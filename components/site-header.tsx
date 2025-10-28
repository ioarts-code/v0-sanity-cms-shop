"use client"

import Link from "next/link"
import { ShoppingBag, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const { totalItems } = useCart()

  return (
    <header className="border-b border-border/40 bg-card sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xl font-semibold">Shop</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/admin" className="text-sm hover:text-primary transition-colors">
            Admin
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
