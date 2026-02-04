import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getHouseById, getAllHouseIds } from "@/lib/sanity/fetch"
import { formatPrice, toSlug } from "@/lib/utils"

interface Props {
  params: Promise<{ house: string }>
}

export async function generateStaticParams() {
  const ids = await getAllHouseIds()
  return ids.map((id) => ({ house: id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { house: houseId } = await params
  const h = await getHouseById(houseId)
  if (!h) return { title: "House Not Found" }
  return { title: h.address, description: `${h.address} - ${h.floorPlanName || "Home for Sale"}` }
}

function formatMoveInDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export default async function HousePage({ params }: Props) {
  const { house: houseId } = await params
  const houseData = await getHouseById(houseId)
  if (!houseData) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <nav className="mb-4 text-sm text-secondary">
          <Link href="/states" className="hover:text-primary-400 transition-colors">
            States
          </Link>
          {houseData.community?.state && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/states/${toSlug(houseData.community.state.name)}`} className="hover:text-primary-400 transition-colors">
                {houseData.community.state.name}
              </Link>
            </>
          )}
          {houseData.community && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/communities/${houseData.community._id}`} className="hover:text-primary-400 transition-colors">
                {houseData.community.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span>{houseData.address}</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">{houseData.address}</h1>
            {houseData.community && (
              <p className="mt-2 text-lg text-secondary">
                {houseData.community.name}
                {houseData.lot && <span> &bull; Lot {houseData.lot}</span>}
              </p>
            )}
          </div>
          {houseData.status && <span className={`rounded-full px-3 py-1 text-sm font-medium ${houseData.status === "Available" || houseData.status === "Quick Move-In" ? "bg-green-500/20 text-green-400" : houseData.status === "Under Construction" ? "bg-yellow-500/20 text-yellow-400" : houseData.status === "Model Home" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}>{houseData.status}</span>}
        </div>
      </header>

      {houseData.imageLink && (
        <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
          <Image src={houseData.imageLink} alt={houseData.address} fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>{houseData.price ? <p className="text-3xl font-bold text-primary-400">{formatPrice(houseData.price)}</p> : <p className="text-2xl font-bold text-secondary">Call for Price</p>}</div>
          <div className="text-right">
            {houseData.moveInStatus && <p className="text-sm text-secondary">{houseData.moveInStatus}</p>}
            {houseData.moveInDate && <p className="font-medium">Move-in: {formatMoveInDate(houseData.moveInDate)}</p>}
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        {houseData.beds && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">{houseData.beds}</p>
            <p className="text-sm text-secondary">Beds</p>
          </div>
        )}
        {houseData.baths && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">
              {houseData.baths}
              {houseData.halfBaths ? `.${houseData.halfBaths}` : ""}
            </p>
            <p className="text-sm text-secondary">Baths</p>
          </div>
        )}
        {houseData.sqft && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">{houseData.sqft.toLocaleString()}</p>
            <p className="text-sm text-secondary">Sq Ft</p>
          </div>
        )}
        {houseData.stories && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">{houseData.stories}</p>
            <p className="text-sm text-secondary">Stories</p>
          </div>
        )}
        {houseData.garage && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">{houseData.garage}</p>
            <p className="text-sm text-secondary">Car Garage</p>
          </div>
        )}
        {houseData.lot && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold">{houseData.lot}</p>
            <p className="text-sm text-secondary">Lot</p>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold">Home Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {houseData.floorPlanName && (
              <>
                <dt className="text-secondary">Floor Plan</dt>
                <dd className="font-medium">{houseData.floorPlanName}</dd>
              </>
            )}
            {houseData.brand && (
              <>
                <dt className="text-secondary">Builder</dt>
                <dd className="font-medium">{houseData.brand}</dd>
              </>
            )}
            {houseData.community && (
              <>
                <dt className="text-secondary">Community</dt>
                <dd className="font-medium">
                  <Link href={`/communities/${houseData.community._id}`} className="text-primary-400 hover:underline">
                    {houseData.community.name}
                  </Link>
                </dd>
              </>
            )}
            {houseData.status && (
              <>
                <dt className="text-secondary">Status</dt>
                <dd className="font-medium">{houseData.status}</dd>
              </>
            )}
          </dl>
        </div>
        {houseData.floorPlan && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold">Floor Plan</h2>
            <p className="font-semibold text-primary-400">{houseData.floorPlan.name}</p>
            {(houseData.floorPlan.beds || houseData.floorPlan.baths || houseData.floorPlan.sqft) && <p className="mt-1 text-sm text-secondary">{[houseData.floorPlan.beds && `${houseData.floorPlan.beds} beds`, houseData.floorPlan.baths && `${houseData.floorPlan.baths} baths`, houseData.floorPlan.sqft && `${houseData.floorPlan.sqft.toLocaleString()} sqft`].filter(Boolean).join(" • ")}</p>}
          </div>
        )}
      </div>

      {houseData.features && houseData.features.length > 0 && (
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold">Features & Upgrades</h2>
          <div className="flex flex-wrap gap-2">
            {houseData.features.map((f) => (
              <span key={f} className="rounded-full bg-primary-500/20 px-3 py-1 text-sm text-primary-400">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {houseData.photos && houseData.photos.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Photos</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {houseData.photos.map((photo, i) => (
              <div key={i} className="relative aspect-video overflow-hidden rounded-lg">
                <Image src={photo} alt={`${houseData.address} - Photo ${i + 1}`} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
