import { createClient } from "@sanity/client"

const sanityClient = createClient({
  projectId: "5xdpea1z",
  dataset: "production",
  apiVersion: "2024-01-01",
  token:
    "sklN7lgdbOtpOitYZt2JfzyPw4fzlToS7MJNFAC541bAEnYR2qMwUvgi1o1vmprHQ9RdJ80JRmxuWaMv40Dk7zogwshK70ZWF36JF07ndoKPttjCANiGLGEeuUWMQi9wyzNqrn45RisSzCITL6ilMoO7dpaBsynRiG6NwHnYryMDAJv68gtX",
  useCdn: false,
})

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ioarts%20-%20Products-rtxoQLPY921iKFNptr946xhb3aVAkE.csv"

// Parse CSV manually
function parseCSV(text) {
  const lines = text.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = []
    let current = ""
    let inQuotes = false

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]
      const nextChar = lines[i][j + 1]

      if (char === '"' && nextChar === '"') {
        current += '"'
        j++
      } else if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    rows.push(row)
  }

  return rows
}

async function uploadImageToSanity(imageUrl) {
  if (!imageUrl || imageUrl === "") return null

  try {
    console.log(`[v0] Uploading image: ${imageUrl}`)

    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`[v0] Failed to fetch image: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get content type from response or default to image/png
    const contentType = response.headers.get("content-type") || "image/png"

    // Upload using Sanity client
    const asset = await sanityClient.assets.upload("image", buffer, {
      contentType: contentType,
      filename: imageUrl.split("/").pop()?.split("?")[0] || "image.png",
    })

    console.log(`[v0] Image uploaded successfully: ${asset._id}`)
    return {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
    }
  } catch (error) {
    console.error(`[v0] Error uploading image ${imageUrl}:`, error.message)
    // Return image URL as fallback
    return {
      _type: "image",
      url: imageUrl,
    }
  }
}

// Main import function
async function importProducts() {
  try {
    console.log("[v0] Testing Sanity connection...")

    try {
      const testQuery = await sanityClient.fetch('*[_type == "product"][0...1]')
      console.log("[v0] ✓ Sanity connection successful")
    } catch (error) {
      console.error("[v0] ✗ Sanity connection failed:", error.message)
      console.log("[v0] Please check:")
      console.log("  1. Project ID is correct: 5xdpea1z")
      console.log("  2. Dataset 'production' exists")
      console.log("  3. API token has read/write permissions")
      return
    }

    console.log("[v0] Fetching CSV file...")
    const response = await fetch(CSV_URL)
    const csvText = await response.text()

    console.log("[v0] Parsing CSV data...")
    const products = parseCSV(csvText)
    console.log(`[v0] Found ${products.length} products to import`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      console.log(`\n[v0] Processing product ${i + 1}/${products.length}: ${product.Name}`)

      try {
        // Upload main image
        const mainImage = await uploadImageToSanity(product["Main Image"])

        // Upload additional images
        const moreImagesUrls = product["More images"]
          ? product["More images"]
              .split(",")
              .map((url) => url.trim())
              .filter((url) => url)
          : []
        const moreImages = []
        for (const url of moreImagesUrls) {
          const img = await uploadImageToSanity(url)
          if (img) moreImages.push(img)
        }

        // Upload motif background
        const motifBackground = await uploadImageToSanity(product["Motif Background"])

        const productDoc = {
          _type: "product",
          name: product.Name,
          slug: {
            _type: "slug",
            current: product.Slug,
          },
          description: product.Description || product["Post Summary"] || "",
          price: 0, // Default price, can be updated later
          category: product.Categories || "uncategorized",
          inStock: true,
          featured: product["Featured?"] === "true",
          image: mainImage,
          images: moreImages.length > 0 ? moreImages : undefined,
          motifBackgroundColor: product["Motif Background Color"] || undefined,
          motifBackground: motifBackground,
          archived: product.Archived === "true",
          draft: product.Draft === "true",
        }

        // Create product in Sanity
        const result = await sanityClient.create(productDoc)
        console.log(`[v0] ✓ Product created: ${result._id}`)
        successCount++
      } catch (error) {
        console.error(`[v0] ✗ Error creating product "${product.Name}":`, error.message)
        errorCount++
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log(`\n[v0] ✓ Import completed!`)
    console.log(`[v0] Success: ${successCount} products`)
    console.log(`[v0] Errors: ${errorCount} products`)
  } catch (error) {
    console.error("[v0] Import failed:", error.message)
    console.error(error)
  }
}

// Run the import
importProducts()
