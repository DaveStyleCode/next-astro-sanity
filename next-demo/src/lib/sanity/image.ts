import { createImageUrlBuilder } from "@sanity/image-url"
import { client } from "./client"

const builder = createImageUrlBuilder(client)

export function urlFor(source: { asset?: unknown }) {
  return builder.image(source)
}

export function hasImageAsset<T>(image: T): image is T & { asset: unknown } {
  return !!(image && typeof image === "object" && "asset" in image && (image as Record<string, unknown>).asset)
}
