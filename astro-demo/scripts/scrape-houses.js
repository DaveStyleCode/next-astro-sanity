import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://www.drhorton.com";
const SANITY_PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;
const SANITY_ENDPOINT = `https://${SANITY_PROJECT_ID}.api.sanity.io/v1/data/mutate/${SANITY_DATASET}?returnIds=true`;
const SANITY_QUERY_ENDPOINT = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}`;

// Rate limiting
const DELAY_MS = 100; // 100ms between requests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    state: null,
    area: null,
    help: false,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg.startsWith("--state=")) {
      options.state = arg.split("=")[1];
    } else if (arg.startsWith("--area=")) {
      options.area = arg.split("=")[1];
    } else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Usage: node scrape-houses.js [options]

Options:
  --state=NAME    Scrape houses only from communities in the specified state
                  Example: --state=Texas, --state="New Mexico"
  
  --area=NAME     Scrape houses only from communities in the specified area
                  Example: --area=Austin, --area="Bay Area"
  
  --help, -h      Show this help message

Examples:
  node scrape-houses.js                          # Scrape all communities
  node scrape-houses.js --state=Texas            # Scrape only Texas communities
  node scrape-houses.js --area=Austin            # Scrape only Austin area
  node scrape-houses.js --state=Texas --area=Austin  # Combine filters
`);
}

// Sanitize string to be a valid Sanity document ID
function sanitizeId(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function querySanity(query) {
  const res = await fetch(
    `${SANITY_QUERY_ENDPOINT}?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${SANITY_TOKEN}`,
      },
    },
  );
  const json = await res.json();
  return json.result;
}

async function upsertSanity(type, doc) {
  const res = await fetch(SANITY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SANITY_TOKEN}`,
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
    console.log(`    ✔ ${type}: ${doc._id}`);
  }

  return json;
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    console.error(`    Failed to fetch ${url}: ${e.message}`);
    return null;
  }
}

function extractJsonLd(html) {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  const jsonLdData = [];

  scripts.each((i, el) => {
    try {
      const text = $(el).html();
      if (text) {
        jsonLdData.push(JSON.parse(text));
      }
    } catch (e) {
      // Ignore parse errors
    }
  });

  return jsonLdData;
}

function parseHouseFromPage(html, qmiUrl) {
  const $ = cheerio.load(html);
  const jsonLdData = extractJsonLd(html);

  // Find the House schema (fallback)
  const houseSchema = jsonLdData.find((d) => d["@type"] === "House");

  // Extract address from URL (fallback)
  const urlParts = qmiUrl.split("/qmis/");
  const addressSlug = urlParts[1] || "";
  const addressFromUrl = addressSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Extract address from page - look for .qmiAddressOne
  let address = null;
  const qmiAddressOne = $(".qmiAddressOne").clone();
  qmiAddressOne.find(".qmiAddressTwo").remove(); // Remove city/state portion
  const addressText = qmiAddressOne.text().trim();
  // Remove "Home for sale at" prefix
  const addressMatch = addressText.match(/(?:Home for sale at\s*)?(.+)/i);
  if (addressMatch && addressMatch[1]) {
    address = addressMatch[1].trim();
  }
  // Fallbacks
  if (!address) {
    address =
      houseSchema?.address?.streetAddress ||
      houseSchema?.name?.split("|")[0]?.trim() ||
      addressFromUrl;
  }

  // Extract city, state, zip from .qmiAddressTwo
  let city = $(".qmiAddressTwo .city").text().trim() || null;
  let stateZip = $(".qmiAddressTwo .state-zip").text().trim() || null;
  let state = null;
  let zip = null;
  if (stateZip) {
    // Parse ", MO 64157" format
    const stateZipMatch = stateZip.match(/,?\s*([A-Z]{2})\s*(\d{5})?/);
    if (stateZipMatch) {
      state = stateZipMatch[1];
      zip = stateZipMatch[2] || null;
    }
  }

  // Extract brand/series from #brand-name
  let brandName = $("#brand-name").text().trim() || null;
  // Clean up any superscript markers
  if (brandName) {
    brandName = brandName.replace(/SM$/, "").trim();
  }

  // Parse price from .home-price div
  let price = null;
  const priceText =
    $(".home-price div").first().text().trim() ||
    $(".home-price").text().trim();
  const priceMatch = priceText.match(/\$([\d,]+)/);
  if (priceMatch) {
    price = parseInt(priceMatch[1].replace(/,/g, ""), 10);
  }
  // Fallback to JSON-LD
  if (!price && houseSchema?.description) {
    const fallbackMatch = houseSchema.description.match(/\$([\d,]+)/);
    if (fallbackMatch) {
      price = parseInt(fallbackMatch[1].replace(/,/g, ""), 10);
    }
  }

  // Extract property details from .property-details
  // Format: "4 Bed | 2.5 Bath | 2 Garage | 2 Story"
  const propertyDetails = $(".property-details").text();

  let beds = null;
  const bedsMatch = propertyDetails.match(/([\d.]+)\s*Bed/i);
  if (bedsMatch) {
    beds = parseFloat(bedsMatch[1]);
    if (Number.isInteger(beds)) beds = parseInt(bedsMatch[1], 10);
  }

  let baths = null;
  const bathsMatch = propertyDetails.match(/([\d.]+)\s*Bath/i);
  if (bathsMatch) {
    baths = parseFloat(bathsMatch[1]);
  }

  let garage = null;
  const garageMatch = propertyDetails.match(/(\d+)\s*Garage/i);
  if (garageMatch) {
    garage = parseInt(garageMatch[1], 10);
  }

  let stories = null;
  const storiesMatch = propertyDetails.match(/(\d+)\s*Stor(?:y|ies)/i);
  if (storiesMatch) {
    stories = parseInt(storiesMatch[1], 10);
  }

  // Extract sqft and lot from .sqf-number
  // Format: "2,053 Sq. Ft. | Lot 305"
  const sqfText = $(".sqf-number").text();

  let sqft = null;
  const sqftMatch = sqfText.match(/([\d,]+)\s*Sq\.?\s*Ft/i);
  if (sqftMatch) {
    sqft = parseInt(sqftMatch[1].replace(/,/g, ""), 10);
  }

  let lotNumber = null;
  const lotMatch = sqfText.match(/Lot\s+(\S+)/i);
  if (lotMatch) {
    lotNumber = lotMatch[1].trim();
  }

  // Extract floor plan from .floorplan-link span
  let floorPlanName = null;
  const floorPlanLink = $(".floorplan-link span").text().trim();
  if (floorPlanLink) {
    floorPlanName = floorPlanLink;
  } else {
    // Try other selectors
    const floorPlanMatch = $('a[href*="floor-plans"]')
      .text()
      .match(/(\w+)\s*floor plan/i);
    if (floorPlanMatch) {
      floorPlanName = floorPlanMatch[1];
    }
  }

  // Extract status from .home-info__community-status
  let status = "Available";
  const statusText = $(".home-info__community-status").text().toLowerCase();
  if (statusText.includes("sold")) status = "Sold";
  else if (statusText.includes("contract")) status = "Under Contract";
  else if (statusText.includes("model")) status = "Model Home";

  // Extract move-in status
  let moveInStatus = null;
  const moveInText =
    $(".move-in-date").text().trim() ||
    $('[class*="move-in"]').first().text().trim();
  if (moveInText && moveInText.length < 50) {
    moveInStatus = moveInText;
  }

  // Extract image - try JSON-LD first, then look for og:image or card images
  let image = houseSchema?.image || null;
  if (!image) {
    image = $('meta[property="og:image"]').attr("content") || null;
  }

  // Fallbacks if page selectors didn't work - use JSON-LD data
  if (!beds && houseSchema?.numberOfBedrooms) {
    beds = houseSchema.numberOfBedrooms;
  }
  if (!baths && houseSchema?.numberOfBathroomsTotal) {
    baths = houseSchema.numberOfBathroomsTotal;
  }
  if (!sqft && houseSchema?.floorSize) {
    sqft = houseSchema.floorSize;
  }

  return {
    address: address
      ? address.replace(/^Home For Sale (?:in|at)\s*/i, "").trim()
      : null,
    city,
    state,
    zip,
    pageLink: qmiUrl.startsWith("http") ? qmiUrl : BASE_URL + qmiUrl,
    imageLink: image?.startsWith("http")
      ? image
      : image
        ? BASE_URL + image
        : null,
    price,
    status,
    moveInStatus,
    floorPlanName,
    brandName,
    beds,
    baths,
    sqft,
    garage,
    stories,
    lotNumber,
  };
}

async function getQmiLinksFromCommunity(communityUrl) {
  const html = await fetchPage(communityUrl);
  if (!html) return [];

  const $ = cheerio.load(html);
  const qmiLinks = new Set();

  // Find all QMI links
  $('a[href*="/qmis/"]').each((i, el) => {
    const href = $(el).attr("href");
    if (href && !href.includes("#")) {
      qmiLinks.add(href.startsWith("http") ? href : BASE_URL + href);
    }
  });

  return Array.from(qmiLinks);
}

// Build GROQ query with optional state/area filters
function buildCommunityQuery(stateFilter, areaFilter) {
  let filters = ['_type == "community"', "defined(pageLink)"];

  if (stateFilter) {
    // Case-insensitive match on state name
    filters.push(`stateRef->name match "${stateFilter}*"`);
  }

  if (areaFilter) {
    // Case-insensitive match on area name
    filters.push(`areaRef->name match "${areaFilter}*"`);
  }

  const query = `*[${filters.join(" && ")}]{ _id, name, pageLink, "stateName": stateRef->name, "areaName": areaRef->name }`;
  return query;
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Build description of what we're scraping
  let scopeDesc = "all communities";
  if (options.state && options.area) {
    scopeDesc = `communities in ${options.area}, ${options.state}`;
  } else if (options.state) {
    scopeDesc = `communities in ${options.state}`;
  } else if (options.area) {
    scopeDesc = `communities in ${options.area} area`;
  }

  console.log(`Fetching ${scopeDesc} from Sanity...\n`);

  // Get communities with optional filters
  const query = buildCommunityQuery(options.state, options.area);
  const communities = await querySanity(query);

  if (communities.length === 0) {
    console.log("No communities found matching the specified filters.");
    if (options.state || options.area) {
      console.log("\nTip: Check the exact state/area names in Sanity.");
      console.log("Available states can be queried with:");
      console.log('  *[_type == "state"]{ name }');
      console.log("Available areas can be queried with:");
      console.log('  *[_type == "areas"]{ name }');
    }
    process.exit(0);
  }

  console.log(`Found ${communities.length} communities with page links\n`);

  // Get all floor plans to build a lookup map
  const floorPlans = await querySanity(
    `*[_type == "floorPlan"]{ _id, name, communityRef }`,
  );
  console.log(`Found ${floorPlans.length} floor plans\n`);

  // Build floor plan lookup map by community
  const floorPlansByComm = {};
  for (const plan of floorPlans) {
    const commId = plan.communityRef?._ref;
    if (commId) {
      if (!floorPlansByComm[commId]) {
        floorPlansByComm[commId] = {};
      }
      floorPlansByComm[commId][sanitizeId(plan.name)] = plan._id;
    }
  }

  let totalHouses = 0;
  let communitiesWithHouses = 0;
  let errorCount = 0;

  for (let i = 0; i < communities.length; i++) {
    const community = communities[i];
    const progress = `[${i + 1}/${communities.length}]`;
    const locationInfo = [community.areaName, community.stateName]
      .filter(Boolean)
      .join(", ");

    console.log(
      `${progress} ${community.name}${locationInfo ? ` (${locationInfo})` : ""}`,
    );

    try {
      // Get QMI links from community page
      const qmiLinks = await getQmiLinksFromCommunity(community.pageLink);

      if (qmiLinks.length === 0) {
        console.log(`    No QMIs found`);
        await sleep(DELAY_MS);
        continue;
      }

      console.log(`    Found ${qmiLinks.length} QMI links`);
      communitiesWithHouses++;

      // Get floor plan map for this community
      const floorPlanMap = floorPlansByComm[community._id] || {};

      for (const qmiUrl of qmiLinks) {
        await sleep(DELAY_MS);

        const html = await fetchPage(qmiUrl);
        if (!html) continue;

        const house = parseHouseFromPage(html, qmiUrl);

        if (!house.address) {
          console.log(`    ⚠ Could not parse house from ${qmiUrl}`);
          continue;
        }

        const houseId = `${community._id}-house-${sanitizeId(house.address)}`;

        // Try to match floor plan
        let floorPlanRef = null;
        if (
          house.floorPlanName &&
          floorPlanMap[sanitizeId(house.floorPlanName)]
        ) {
          floorPlanRef = {
            _type: "reference",
            _ref: floorPlanMap[sanitizeId(house.floorPlanName)],
          };
        }

        const houseDoc = {
          _id: houseId,
          address: house.address,
          city: house.city,
          state: house.state,
          zip: house.zip,
          communityRef: { _type: "reference", _ref: community._id },
          pageLink: house.pageLink,
          imageLink: house.imageLink,
          price: house.price,
          status: house.status,
          moveInStatus: house.moveInStatus,
          floorPlanName: house.floorPlanName,
          brand: house.brandName,
          beds: house.beds,
          baths: house.baths,
          sqft: house.sqft,
          garage: house.garage,
          stories: house.stories,
          lot: house.lotNumber,
        };

        if (floorPlanRef) {
          houseDoc.floorPlanRef = floorPlanRef;
        }

        await upsertSanity("house", houseDoc);
        totalHouses++;
      }
    } catch (error) {
      console.error(`    ❌ Error: ${error.message}`);
      errorCount++;
    }

    await sleep(DELAY_MS);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ House/QMI scraping complete!");
  console.log(`   Scope: ${scopeDesc}`);
  console.log(`   Total houses scraped: ${totalHouses}`);
  console.log(`   Communities with houses: ${communitiesWithHouses}`);
  console.log(`   Errors: ${errorCount}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
