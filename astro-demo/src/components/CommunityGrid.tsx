import { Pagination } from "./Pagination";
import { formatPrice } from "../lib/utils";

interface Community {
  _id: string;
  name: string;
  imageLink?: string;
  address?: string;
  sellingStatus?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  callForPrice?: boolean;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
}

interface CommunityGridProps {
  communities: Community[];
  itemsPerPage?: number;
}

interface CommunityCardProps {
  community: Community;
  priority?: boolean;
}

function CommunityCard({ community, priority = false }: CommunityCardProps) {
  return (
    <a
      href={`/communities/${community._id}`}
      className="group hover:border-primary-500/50 overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-all hover:bg-white/10"
    >
      {community.imageLink && (
        <div className="aspect-video overflow-hidden">
          <img
            src={community.imageLink}
            alt={community.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="group-hover:text-primary-400 text-lg font-semibold transition-colors">
          {community.name}
        </h2>

        {community.address && (
          <p className="text-secondary mt-1 line-clamp-1 text-sm">
            {community.address}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {community.sellingStatus && (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                community.sellingStatus === "Now Selling"
                  ? "bg-green-500/20 text-green-600"
                  : community.sellingStatus === "Coming Soon"
                    ? "bg-yellow-500/20 text-yellow-600"
                    : community.sellingStatus === "Grand Opening"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-orange-500/20 text-orange-400"
              }`}
            >
              {community.sellingStatus}
            </span>
          )}
          {community.propertyType && (
            <span className="text-secondary inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs">
              {community.propertyType}
            </span>
          )}
        </div>

        {(community.minPrice || community.maxPrice) &&
          !community.callForPrice && (
            <p className="text-primary-400 mt-3 font-semibold">
              {community.minPrice && community.maxPrice
                ? `${formatPrice(community.minPrice)} - ${formatPrice(community.maxPrice)}`
                : community.minPrice
                  ? `From ${formatPrice(community.minPrice)}`
                  : `Up to ${formatPrice(community.maxPrice!)}`}
            </p>
          )}
        {community.callForPrice && (
          <p className="text-primary-400 mt-3 font-semibold">Call for Price</p>
        )}

        {(community.minBeds || community.minBaths || community.minSqft) && (
          <div className="text-secondary mt-2 flex gap-3 text-sm">
            {(community.minBeds || community.maxBeds) && (
              <span>
                {community.minBeds === community.maxBeds
                  ? `${community.minBeds} Beds`
                  : `${community.minBeds}-${community.maxBeds} Beds`}
              </span>
            )}
            {(community.minBaths || community.maxBaths) && (
              <span>
                {community.minBaths === community.maxBaths
                  ? `${community.minBaths} Baths`
                  : `${community.minBaths}-${community.maxBaths} Baths`}
              </span>
            )}
            {(community.minSqft || community.maxSqft) && (
              <span>
                {community.minSqft === community.maxSqft
                  ? `${community.minSqft?.toLocaleString()} sqft`
                  : `${community.minSqft?.toLocaleString()}-${community.maxSqft?.toLocaleString()} sqft`}
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}

export function CommunityGrid({
  communities,
  itemsPerPage = 9,
}: CommunityGridProps) {
  return (
    <Pagination
      items={communities}
      itemsPerPage={itemsPerPage}
      emptyMessage="No communities found in this state."
      gridClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      renderItem={(community, index) => (
        <CommunityCard
          key={community._id}
          community={community}
          priority={index < 3} // Eager load first 3 images for LCP
        />
      )}
    />
  );
}
