import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getCommunityWithHouses, getAllCommunityIds } from "@/lib/sanity/fetch"
import { formatPrice, toSlug, toTitleCase } from "@/lib/utils"
import type { SanityHouse } from "@/lib/sanity/types"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const ids = await getAllCommunityIds()
  return ids.map((id) => ({ id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { community } = await getCommunityWithHouses(id)
  if (!community) return { title: "Community Not Found" }
  return { title: community.name, description: `${community.name} - ${community.address || "New Home Community"}` }
}

export default async function CommunityPage({ params }: Props) {
  const { id } = await params
  const { community, houses } = await getCommunityWithHouses(id)
  if (!community) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <nav className="mb-4 text-sm text-secondary">
          <Link href="/states" className="hover:text-primary-400 transition-colors">
            States
          </Link>
          {community.state && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/states/${toSlug(community.state.name)}`} className="hover:text-primary-400 transition-colors">
                {toTitleCase(community.state.name)}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span>{community.name}</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">{community.name}</h1>
            {community.address && <p className="mt-2 text-lg text-secondary">{community.address}</p>}
          </div>
          {community.sellingStatus && <span className={`rounded-full px-3 py-1 text-sm font-medium ${community.sellingStatus === "Now Selling" ? "bg-green-500/20 text-green-600" : community.sellingStatus === "Coming Soon" ? "bg-yellow-500/20 text-yellow-700" : community.sellingStatus === "Grand Opening" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}`}>{community.sellingStatus}</span>}
        </div>
      </header>

      {community.imageLink && (
        <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
          <Image src={community.imageLink} alt={community.name} fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold">Pricing</h2>
          {community.callForPrice ? <p className="text-2xl font-bold text-primary-400">Call for Price</p> : community.minPrice || community.maxPrice ? <p className="text-2xl font-bold text-primary-400">{community.minPrice && community.maxPrice ? `${formatPrice(community.minPrice)} - ${formatPrice(community.maxPrice)}` : community.minPrice ? `From ${formatPrice(community.minPrice)}` : `Up to ${formatPrice(community.maxPrice!)}`}</p> : <p className="text-secondary">Pricing not available</p>}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold">Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {community.brand && (
              <>
                <dt className="text-secondary">Brand</dt>
                <dd className="font-medium">{community.brand}</dd>
              </>
            )}
            {community.propertyType && (
              <>
                <dt className="text-secondary">Property Type</dt>
                <dd className="font-medium">{community.propertyType}</dd>
              </>
            )}
            {(community.minBeds || community.maxBeds) && (
              <>
                <dt className="text-secondary">Bedrooms</dt>
                <dd className="font-medium">{community.minBeds === community.maxBeds ? community.minBeds : `${community.minBeds} - ${community.maxBeds}`}</dd>
              </>
            )}
            {(community.minBaths || community.maxBaths) && (
              <>
                <dt className="text-secondary">Bathrooms</dt>
                <dd className="font-medium">{community.minBaths === community.maxBaths ? community.minBaths : `${community.minBaths} - ${community.maxBaths}`}</dd>
              </>
            )}
            {(community.minSqft || community.maxSqft) && (
              <>
                <dt className="text-secondary">Square Feet</dt>
                <dd className="font-medium">{community.minSqft === community.maxSqft ? community.minSqft?.toLocaleString() : `${community.minSqft?.toLocaleString()} - ${community.maxSqft?.toLocaleString()}`}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {houses.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-6 text-xl font-semibold">Available Homes ({houses.length})</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house: SanityHouse) => (
              <Link key={house._id} href={`/house/${house._id}`} className="group rounded-lg border border-white/10 bg-white/5 overflow-hidden transition-all hover:border-primary-400/50 hover:bg-white/10">
                {house.imageLink ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image src={house.imageLink} alt={house.address} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-video bg-white/5 flex items-center justify-center">
                    <span className="text-secondary text-sm">No image</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight group-hover:text-primary-400 transition-colors">{house.address}</h3>
                    {house.status && <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${house.status === "Available" || house.status === "Quick Move-In" ? "bg-green-500/20 text-green-400" : house.status === "Under Construction" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>{house.status}</span>}
                  </div>
                  {house.price && <p className="mt-2 text-lg font-bold text-primary-400">{formatPrice(house.price)}</p>}
                  {(house.beds || house.baths || house.sqft) && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-secondary">
                      {house.beds && (
                        <span>
                          {house.beds} bed{house.beds === 1 ? "" : "s"}
                        </span>
                      )}
                      {house.baths && (
                        <span>
                          {house.baths} bath{house.baths === 1 ? "" : "s"}
                        </span>
                      )}
                      {house.sqft && <span>{house.sqft.toLocaleString()} sqft</span>}
                    </div>
                  )}
                  {house.floorPlanName && <p className="mt-2 text-xs text-secondary">Plan: {house.floorPlanName}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {community.amenities && community.amenities.length > 0 && (
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {community.amenities.map((amenity) => (
              <span key={amenity} className="rounded-full bg-primary-500 px-3 py-1 text-sm text-white">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
