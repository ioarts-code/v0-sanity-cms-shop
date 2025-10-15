import Link from "next/link"
import { notFound } from "next/navigation"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "@/components/product-form"
import { sanityClient, type Product } from "@/lib/sanity"

async function getProduct(id: string): Promise<Product | null> {
  const query = `*[_type == "product" && _id == $id][0] {
    _id,
    name,
    slug,
    price,
    description,
    image,
    category,
    inStock
  }`

  try {
    const product = await sanityClient.fetch(query, { id })
    return product
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return null
  }
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xl font-semibold">Shop Admin</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition-colors">
              Storefront
            </Link>
            <Link href="/admin" className="text-sm font-medium text-primary">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm product={product} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
