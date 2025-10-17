import Link from "next/link"
import { sanityClient, urlFor, type Product } from "@/lib/sanity"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"

async function getProducts(): Promise<Product[]> {
  const query = `*[_type == "product"] | order(_createdAt desc) {
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
    const products = await sanityClient.fetch(query)
    return products
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return []
  }
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
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
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-balance mb-4">Discover Our Collection</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Curated products powered by Sanity CMS. Browse our latest offerings and find exactly what you need.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No products found. Add products from the admin dashboard.</p>
            <Button asChild>
              <Link href="/admin">Go to Admin Dashboard</Link>
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-8">All Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.image ? (
                      <img
                        src={urlFor(product.image).width(400).height(400).url() || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full bg-[rgba(255,255,255,1)]"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    {product.category && <p className="text-xs text-muted-foreground mb-2">{product.category}</p>}
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                      {product.inStock !== false && (
                        <span className="text-xs text-green-600 dark:text-green-400">In Stock</span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full">Add to Cart</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Powered by Sanity CMS</p>
        </div>
      </footer>
    </div>
  )
}
