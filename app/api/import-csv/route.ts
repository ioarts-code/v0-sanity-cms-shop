import { type NextRequest, NextResponse } from "next/server"
import { sanityClient } from "@/lib/sanity"

function parseCSV(text: string) {
  const lines = text.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ""
    })
    rows.push(row)
  }

  return rows
}

async function uploadImage(url: string) {
  if (!url) return null

  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const asset = await sanityClient.assets.upload("image", Buffer.from(buffer))

    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    }
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rows = parseCSV(body.csvData)
    let count = 0

    for (const row of rows) {
      if (!row.Name) continue

      const mainImage = await uploadImage(row["Main Image"])

      const product = {
        _type: "product",
        name: row.Name,
        slug: { _type: "slug", current: row.Slug },
        description: row["Post Summary"] || "",
        price: 0,
        category: row.Categories || "",
        featured: row["Featured?"] === "true",
        inStock: true,
        image: mainImage,
      }

      await sanityClient.create(product)
      count++
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
