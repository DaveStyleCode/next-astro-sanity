import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://www.drhorton.com";
const SANITY_ENDPOINT = `https://${process.env.PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/data/mutate/${process.env.PUBLIC_SANITY_DATASET}?returnIds=true`;
const API_URL = `https://www.drhorton.com/api/comms/direct/`;

const STATUSES = {
  NOW_SELLING: "Now Selling",
  COMING_SOON: "Coming Soon",
  GRAND_OPENING: "Grand Opening",
  FINAL_OPPORTUNITIES: "Final Opportunities",
};

const STATES = [
  "alabama",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maryland",
  "minnesota",
  "mississippi",
  "missouri",
  "nebraska",
  "nevada",
  "new-jersey",
  "new-mexico",
  "north-carolina",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "south-carolina",
  "tennessee",
  "texas",
  "utah",
  "virginia",
  "washington",
  "west-virginia",
  "wisconsin",
];

// Sanitize string to be a valid Sanity document ID (alphanumeric, hyphens, underscores only)
function sanitizeId(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-_]/g, "") // Remove any invalid characters
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

async function scrapeState(state) {
  const res = await fetch(`${API_URL}${state}`);
  return res.json();
}

async function upsertSanity(type, doc) {
  const res = await fetch(SANITY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SANITY_TOKEN}`,
    },
    body: JSON.stringify({
      mutations: [
        {
          createOrReplace: {
            _type: type,
            ...doc,
          },
        },
      ],
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("SANITY ERROR:", JSON.stringify(json, null, 2));
  } else {
    console.log(`✔ ${type}: ${doc._id}`);
  }

  return json;
}

async function main() {
  for (const state of STATES) {
    console.log("Scraping:", state);

    const data = await scrapeState(state);

    // Upsert the state
    const stateName = data.MetaData?.AreaInfoData?.Name ?? state;
    await upsertSanity("state", {
      _id: state,
      name: stateName.charAt(0).toUpperCase() + stateName.slice(1),
    });

    const communities = data.CommunityData ?? [];

    for (const com of communities) {
      const status = STATUSES[com.commSellingStatus] ?? STATUSES.NOW_SELLING;

      await upsertSanity("community", {
        _id: `${state}-${sanitizeId(com.commName)}`,
        name: com.commName,
        stateRef: { _type: "reference", _ref: state },
        address: com.commAddress,
        brand: com.commBrand,
        pageLink: com.commPageLink ? BASE_URL + com.commPageLink : null,
        imageLink: com.commImageLink ? BASE_URL + com.commImageLink : null,
        sellingStatus: status,
        availableHomes: com.commAvailableHomes,
        minBeds: com.commMinBeds,
        maxBeds: com.commMaxBeds,
        minBaths: com.commMinBaths,
        maxBaths: com.commMaxBaths,
        minCars: com.commMinCars,
        maxCars: com.commMaxCars,
        minStories: com.commMinStories,
        maxStories: com.commMaxStories,
        minSqft: com.commMinSqft,
        maxSqft: com.commMaxSqft,
        minPrice: com.commMinPrice,
        maxPrice: com.commMaxPrice,
        callForPrice: com.commCallForPrice,
        amenities: com.commAmenitiesList ?? [],
        propertyType: com.commPropertyType,
      });
    }
  }
}

main().catch(console.error);
