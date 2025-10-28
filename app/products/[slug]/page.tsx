import { notFound } from "next/navigation"
import Link from "next/link"
import { sanityClient, urlFor, type Product } from "@/lib/sanity"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { SiteHeader } from "@/components/site-header"

async function getProduct(slug: string): Promise<Product | null> {
  const query = `*[_type == "product" && slug.current == $slug][0] {
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
    const product = await sanityClient.fetch(query, { slug })
    return product
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return null
  }
}

async function getRelatedProducts(category: string | undefined, currentId: string): Promise<Product[]> {
  if (!category) return []

  const query = `*[_type == "product" && category == $category && _id != $currentId][0...3] {
    _id,
    name,
    slug,
    price,
    image,
    category
  }`

  try {
    const products = await sanityClient.fetch(query, { category, currentId })
    return products
  } catch (error) {
    console.error("[v0] Error fetching related products:", error)
    return []
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category, product._id)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Product Detail */}
      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          {/* Product Image */}
          <div className="relative aspect-square bg-muted/30 rounded-2xl overflow-hidden">
            {product.image ? (
              <img
                src={urlFor(product.image).width(800).height(800).url() || "/placeholder.svg"}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No Image Available</div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center space-y-8">
            {product.category && (
              <p className="text-sm font-medium tracking-wider uppercase text-muted-foreground">{product.category}</p>
            )}

            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-balance leading-tight">{product.name}</h1>
              <p className="text-4xl font-semibold">${product.price.toFixed(2)}</p>
            </div>

            {product.description && (
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-prose">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-4 pt-4">
              <AddToCartButton product={product} />
              {product.inStock !== false ? (
                <span className="text-sm text-muted-foreground">In Stock</span>
              ) : (
                <span className="text-sm text-destructive">Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-balance">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/products/${relatedProduct.slug.current}`}
                  className="group space-y-4"
                >
                  <div className="relative aspect-square bg-muted/30 rounded-xl overflow-hidden">
                    {relatedProduct.image ? (
                      <img
                        src={urlFor(relatedProduct.image).width(400).height(400).url() || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-muted-foreground">${relatedProduct.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
