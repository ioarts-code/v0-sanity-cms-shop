import { createClient } from "@sanity/client"
import imageUrlBuilder from "@sanity/image-url"

export const sanityClient = createClient({
  projectId: "5xdpea1z",
  dataset: "production",
  apiVersion: "2024-01-01",
  token:
    "sklN7lgdbOtpOitYZt2JfzyPw4fzlToS7MJNFAC541bAEnYR2qMwUvgi1o1vmprHQ9RdJ80JRmxuWaMv40Dk7zogwshK70ZWF36JF07ndoKPttjCANiGLGEeuUWMQi9wyzNqrn45RisSzCITL6ilMoO7dpaBsynRiG6NwHnYryMDAJv68gtX",
  useCdn: false,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

export interface Product {
  _id: string
  name: string
  slug: { current: string }
  price: number
  description?: string
  image?: any
  category?: string
  inStock?: boolean
}
