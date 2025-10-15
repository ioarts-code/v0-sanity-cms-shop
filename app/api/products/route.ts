import { type NextRequest, NextResponse } from "next/server"
import { sanityClient } from "@/lib/sanity"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description, category, inStock, imageUrl } = body

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Prepare product data
    const productData: any = {
      _type: "product",
      name,
      slug: { _type: "slug", current: slug },
      price,
      inStock,
    }

    if (description) productData.description = description
    if (category) productData.category = category

    // Handle image URL if provided
    if (imageUrl) {
      productData.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: await uploadImageFromUrl(imageUrl),
        },
      }
    }

    const result = await sanityClient.create(productData)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

async function uploadImageFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()

    const asset = await sanityClient.assets.upload("image", Buffer.from(buffer), {
      filename: url.split("/").pop() || "image.jpg",
    })

    return asset._id
  } catch (error) {
    console.error("[v0] Error uploading image:", error)
    throw error
  }
}
