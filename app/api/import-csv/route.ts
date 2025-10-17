import { type NextRequest, NextResponse } from "next/server"
import { sanityClient } from "@/lib/sanity"

interface CsvRow {
  Name: string
  Slug: string
  "Post Summary": string
  Description: string
  "Main Image": string
  "Featured?": string
  "More images": string
  Categories: string
  "Motif Background Color": string
  "Motif Background": string
}

interface SanityImageAsset {
  _type: string
  asset: {
    _type: string
    _ref: string
  }
}

function parseCSV(csvText: string): CsvRow[] {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const rows: CsvRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values: string[] = []
    let currentValue = ""
    let insideQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === "," && !insideQuotes) {
        values.push(currentValue.trim())
        currentValue = ""
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim())

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    rows.push(row as CsvRow)
  }

  return rows
}

async function uploadImageToSanity(imageUrl: string): Promise<SanityImageAsset | null> {
  if (!imageUrl || imageUrl === "") return null

  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return null
    }

    const buffer = await response.arrayBuffer()
    if (!buffer || buffer.byteLength === 0) {
      return null
    }

    const asset = await sanityClient.assets.upload("image", Buffer.from(buffer), {
      filename: imageUrl.split("/").pop() || "image.jpg",
    })

    if (!asset || !asset._id) {
      return null
    }

    return {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
    }
  } catch (error) {
    console.error("Error uploading image:", imageUrl, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { csvData } = body

    if (!csvData) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 })
    }

    const rows = parseCSV(csvData)
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const row of rows) {
      try {
        if (!row.Name || !row.Slug) {
          continue
        }

        const mainImage = await uploadImageToSanity(row["Main Image"])
        const moreImagesUrls = row["More images"]?.split("|").filter((url) => url.trim()) || []
        const moreImages: SanityImageAsset[] = []

        for (const url of moreImagesUrls) {
          const img = await uploadImageToSanity(url.trim())
          if (img) moreImages.push(img)
        }

        const motifBackground = await uploadImageToSanity(row["Motif Background"])

        const product = {
          _type: "product",
          name: row.Name,
          slug: {
            _type: "slug",
            current: row.Slug,
          },
          description: row["Post Summary"] || row.Description || "",
          price: 0,
          category: row.Categories || "",
          featured: row["Featured?"]?.toLowerCase() === "true",
          motifBackgroundColor: row["Motif Background Color"] || "",
          inStock: true,
        }

        if (mainImage) {
          Object.assign(product, { image: mainImage })
        }
        if (moreImages.length > 0) {
          Object.assign(product, { moreImages })
        }
        if (motifBackground) {
          Object.assign(product, { motifBackground })
        }

        await sanityClient.create(product)
        successCount++
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        const errorMsg = `Error importing ${row.Name}: ${error instanceof Error ? error.message : "Unknown error"}`
        errors.push(errorMsg)
        errorCount++
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${successCount} products${errorCount > 0 ? ` (${errorCount} errors)` : ""}`,
      count: successCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 5),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to import CSV",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
