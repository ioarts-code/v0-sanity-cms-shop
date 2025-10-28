import Link from "next/link"
import { sanityClient, type Product } from "@/lib/sanity"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Plus, Package, DollarSign, TrendingUp } from "lucide-react"
import { ProductList } from "@/components/product-list"
import { CsvImport } from "@/components/csv-import"

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
    console.error("Error fetching products:", error)
    return []
  }
}

export default async function AdminPage() {
  const products = await getProducts()
  const totalProducts = products.length
  const inStockProducts = products.filter((p) => p.inStock !== false).length
  const totalValue = products.reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex items-center justify-between px-4 py-6">
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Product Management</h1>
            <p className="text-muted-foreground">Manage your product catalog and inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <CsvImport />
            <Link href="/admin/products/new">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">{inStockProducts} in stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Combined product value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalProducts > 0 ? (totalValue / totalProducts).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per product</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductList products={products} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
