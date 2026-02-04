import NextImage from "next/image"
import { urlFor, hasImageAsset } from "@/lib/sanity/image"

interface ImageProps {
  value: {
    asset?: unknown
    alt?: string
    caption?: string
  }
}

export function Image({ value }: ImageProps) {
  if (!hasImageAsset(value)) return null

  const src = urlFor(value).width(800).url()

  return (
    <figure className="my-8">
      <NextImage src={src} alt={value.alt || ""} className="rounded-lg w-full h-auto" width={800} height={600} sizes="(max-width: 800px) 100vw, 800px" />
      {value.caption && <figcaption className="text-center text-sm text-secondary mt-2">{value.caption}</figcaption>}
    </figure>
  )
}
