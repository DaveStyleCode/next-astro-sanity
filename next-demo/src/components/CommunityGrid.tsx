"use client"

import Image from "next/image"
import Link from "next/link"
import { Pagination } from "./Pagination"

interface Community {
  _id: string
  name: string
  imageLink?: string
  address?: string
  sellingStatus?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  callForPrice?: boolean
  minBeds?: number
  maxBeds?: number
  minBaths?: number
  maxBaths?: number
  minSqft?: number
  maxSqft?: number
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function CommunityCard({ community, priority = false }: { community: Community; priority?: boolean }) {
  return (
    <Link href={`/communities/${community._id}`} className="group overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all hover:border-primary-500/50 hover:bg-white/10">
      {community.imageLink && (
        <div className="relative aspect-video overflow-hidden">
          <Image src={community.imageLink} alt={community.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform group-hover:scale-105" priority={priority} />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold group-hover:text-primary-400 transition-colors">{community.name}</h2>
        {community.address && <p className="mt-1 text-sm text-secondary line-clamp-1">{community.address}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {community.sellingStatus && <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${community.sellingStatus === "Now Selling" ? "bg-green-500/20 text-green-600" : community.sellingStatus === "Coming Soon" ? "bg-yellow-500/20 text-yellow-600" : community.sellingStatus === "Grand Opening" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}`}>{community.sellingStatus}</span>}
          {community.propertyType && <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs text-secondary">{community.propertyType}</span>}
        </div>
        {!!(community.minPrice || community.maxPrice) && !community.callForPrice && <p className="mt-3 font-semibold text-primary-400">{community.minPrice && community.maxPrice ? `${formatPrice(community.minPrice)} - ${formatPrice(community.maxPrice)}` : community.minPrice ? `From ${formatPrice(community.minPrice)}` : `Up to ${formatPrice(community.maxPrice!)}`}</p>}
        {community.callForPrice && <p className="mt-3 font-semibold text-primary-400">Call for Price</p>}
        {!!(community.minBeds || community.minBaths || community.minSqft) && (
          <div className="mt-2 flex gap-3 text-sm text-secondary">
            {!!(community.minBeds || community.maxBeds) && <span>{community.minBeds === community.maxBeds ? `${community.minBeds} Beds` : `${community.minBeds}-${community.maxBeds} Beds`}</span>}
            {!!(community.minBaths || community.maxBaths) && <span>{community.minBaths === community.maxBaths ? `${community.minBaths} Baths` : `${community.minBaths}-${community.maxBaths} Baths`}</span>}
            {!!(community.minSqft || community.maxSqft) && <span>{community.minSqft === community.maxSqft ? `${community.minSqft?.toLocaleString()} sqft` : `${community.minSqft?.toLocaleString()}-${community.maxSqft?.toLocaleString()} sqft`}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}

export function CommunityGrid({ communities, itemsPerPage = 9 }: { communities: Community[]; itemsPerPage?: number }) {
  return <Pagination items={communities} itemsPerPage={itemsPerPage} emptyMessage="No communities found in this state." gridClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3" renderItem={(community, index) => <CommunityCard key={community._id} community={community} priority={index < 3} />} />
}
