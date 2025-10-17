import { type NextRequest, NextResponse } from "next/server"
import { sanityClient } from "@/lib/sanity"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, price, description, category, inStock, imageUrl } = body

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Prepare update data
    const updateData: any = {
      name,
      slug: { _type: "slug", current: slug },
      price,
      inStock,
    }

    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category

    // Handle image URL if provided
    if (imageUrl) {
      updateData.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: await uploadImageFromUrl(imageUrl),
        },
      }
    }

    const result = await sanityClient.patch(id).set(updateData).commit()

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[v0] Deleting product with ID:", id)

    await sanityClient.delete(id)

    console.log("[v0] Product deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
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
