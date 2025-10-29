import Link from "next/link"
import { sanityClient, urlFor, type Product } from "@/lib/sanity"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"

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
    <div className="min-h-screen bg-[rgba(255,255,255,1)]">
      {/* Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="border-b border-border/40 bg-[rgba(255,255,255,1)]">
        <div className="container mx-auto px-4 py-24 text-center bg-[rgba(39,39,39,1)]">
          <h1 className="text-6xl font-bold text-balance mb-6 leading-tight text-[rgba(171,171,171,1)] font-display tracking-wider">
            Sanity CMS
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-pretty leading-relaxed text-[rgba(148,148,148,1)]">
            Detta är ett grundtema som jag modifierat i V0 för att använda Sanity som CMS. Nextjs är grunden.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-20">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No products found. Add products from the admin dashboard.</p>
            <Button asChild>
              <Link href="/admin">Go to Admin Dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link key={product._id} href={`/products/${product.slug.current}`} className="group">
                <div className="space-y-4">
                  <div className="aspect-square bg-muted/30 relative overflow-hidden rounded-xl">
                    {product.image ? (
                      <img
                        src={urlFor(product.image).width(500).height(500).url() || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 bg-background"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {product.category && (
                      <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                        {product.category}
                      </p>
                    )}
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors text-balance">
                      {product.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Powered by Sanity CMS</p>
        </div>
      </footer>
    </div>
  )
}
