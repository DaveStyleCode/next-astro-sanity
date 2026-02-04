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
const DELAY_MS = 100;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    state: null,
    community: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--state" || arg === "-s") {
      options.state = args[++i];
    } else if (arg === "--community" || arg === "-c") {
      options.community = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

function printUsage() {
  console.log(`
Usage: node scrape-floor-plans.js [options]

Options:
  -s, --state <state>       Scrape floor plans for communities in a specific state
                            (e.g., "Texas", "TX", "california")
  -c, --community <name>    Scrape floor plans for a specific community
                            (partial name match, case-insensitive)
  -h, --help                Show this help message

Examples:
  node scrape-floor-plans.js                          # Scrape all communities
  node scrape-floor-plans.js --state texas            # Scrape Texas communities only
  node scrape-floor-plans.js -s california            # Scrape California communities
  node scrape-floor-plans.js --community "Oak Grove"  # Scrape specific community
  node scrape-floor-plans.js -c ridge                 # Scrape communities with "ridge" in name
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
    } catch (e) {}
  });

  return jsonLdData;
}

function parseFloorPlanFromPage(html, planUrl) {
  const $ = cheerio.load(html);
  const jsonLdData = extractJsonLd(html);

  // Find the FloorPlan schema
  const floorPlanSchema = jsonLdData.find((d) => d["@type"] === "FloorPlan");

  // Extract plan name from URL or breadcrumb
  const urlParts = planUrl.split("/floor-plans/");
  const planSlug = urlParts[1] || "";

  // Get name from breadcrumb or page title
  const breadcrumbSchema = jsonLdData.find(
    (d) => d["@type"] === "BreadcrumbList",
  );
  const lastBreadcrumb = breadcrumbSchema?.itemListElement?.slice(-1)[0];
  let name = lastBreadcrumb?.name || planSlug;

  // Try to get full name from page
  const titleMatch = $("h1, .plan-name, .floor-plan-name")
    .first()
    .text()
    .trim();
  if (titleMatch && titleMatch.length < 50) {
    name = titleMatch;
  }

  // Also try to extract from the model JSON embedded in the page
  let modelData = null;
  const modelMatch = html.match(/var model = ({[\s\S]*?});/);
  if (modelMatch) {
    try {
      modelData = JSON.parse(modelMatch[1]);
    } catch (e) {}
  }

  // Get first item from model for additional details
  const firstItem = modelData?.Items?.[0];

  // Extract from JSON-LD
  const beds =
    floorPlanSchema?.numberOfBedrooms || firstItem?.NumberOfBedrooms || null;
  const baths =
    floorPlanSchema?.numberOfBathroomsTotal ||
    firstItem?.NumberOfBathrooms ||
    null;
  const sqft = floorPlanSchema?.floorSize || firstItem?.SquareFootage || null;
  const image = floorPlanSchema?.image || null;

  // Extract price from page
  let price = null;
  let minPrice = null;
  let maxPrice = null;

  const priceText = $(".home-price").text();
  const startingMatch = priceText.match(/starting at[^\$]*\$([\d,]+)/i);
  if (startingMatch) {
    price = parseInt(startingMatch[1].replace(/,/g, ""), 10);
    minPrice = price;
  }

  // Try "Starting in the $XXXs" format
  const rangeMatch = priceText.match(/\$([\d,]+)s/i);
  if (rangeMatch && !price) {
    minPrice = parseInt(rangeMatch[1].replace(/,/g, ""), 10) * 1000;
  }

  // Extract garage from page
  let garage = null;
  const garageMatch =
    html.match(/(\d+)\s*<span>\s*Garage/i) ||
    html.match(/(\d+)[- ]?car garage/i);
  if (garageMatch) {
    garage = parseInt(garageMatch[1], 10);
  }
  if (!garage && firstItem?.NumberOfGarages) {
    garage = firstItem.NumberOfGarages;
  }

  // Extract stories
  let stories = null;
  const storiesMatch =
    html.match(/(\d+)\s*<span>\s*Stor/i) ||
    html.match(/(\d+)[- ]?stor(?:y|ies)/i);
  if (storiesMatch) {
    stories = parseInt(storiesMatch[1], 10);
  }
  if (!stories && firstItem?.NumberOfStories) {
    stories = firstItem.NumberOfStories;
  }

  // Extract brand
  let brand = null;
  const brandMatch = html.match(
    /(Express Series|Freedom Series|Emerald Series|Tradition Series|Pacific Ridge Series)/i,
  );
  if (brandMatch) {
    brand = brandMatch[1];
    // Normalize brand names
    if (brand.toLowerCase().includes("express")) brand = "Express Series®";
    else if (brand.toLowerCase().includes("freedom")) brand = "Freedom Series℠";
    else if (brand.toLowerCase().includes("emerald")) brand = "Emerald Series®";
    else if (brand.toLowerCase().includes("tradition"))
      brand = "Tradition Series℠";
    else if (brand.toLowerCase().includes("pacific"))
      brand = "Pacific Ridge Series℠";
  }
  if (!brand && firstItem?.BrandName) {
    brand = firstItem.BrandName;
    if (brand.toLowerCase().includes("tradition")) brand = "Tradition Series℠";
  }

  // Extract description
  let description = null;
  const descEl = $(
    ".floor-plan-description, .plan-description, .community-detail-description p",
  ).first();
  if (descEl.length) {
    description = descEl.text().trim().slice(0, 1000);
  }

  // Use PlanName from model if available for better name
  if (firstItem?.PlanName) {
    name =
      firstItem.PlanName.charAt(0).toUpperCase() +
      firstItem.PlanName.slice(1).toLowerCase();
  }

  return {
    name,
    slug: sanitizeId(name || planSlug),
    pageLink: planUrl.startsWith("http") ? planUrl : BASE_URL + planUrl,
    imageLink: image?.startsWith("http")
      ? image
      : image
        ? BASE_URL + image
        : null,
    beds,
    baths,
    sqft,
    stories,
    garage,
    price,
    minPrice,
    maxPrice,
    brand,
    description,
  };
}

async function getFloorPlanLinksFromCommunity(communityUrl) {
  const html = await fetchPage(communityUrl);
  if (!html) return [];

  const $ = cheerio.load(html);
  const planLinks = new Set();

  // Find all floor plan links
  $('a[href*="/floor-plans/"]').each((i, el) => {
    const href = $(el).attr("href");
    if (
      href &&
      !href.includes("#") &&
      !href.endsWith("/floor-plans/") &&
      !href.endsWith("/floor-plans")
    ) {
      planLinks.add(href.startsWith("http") ? href : BASE_URL + href);
    }
  });

  return Array.from(planLinks);
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  console.log("Fetching communities from Sanity...\n");

  // Build query based on filters
  let query = `*[_type == "community" && defined(pageLink)`;
  const filters = [];

  if (options.state) {
    // Match state by reference name or ID (case-insensitive)
    // stateRef->name is the full state name, stateRef->_id is the slug (e.g., "texas")
    filters.push(
      `(lower(stateRef->name) match lower("${options.state}*") || lower(stateRef->_id) match lower("${options.state}*"))`,
    );
    console.log(`Filtering by state: ${options.state}`);
  }

  if (options.community) {
    // Match community name (case-insensitive partial match)
    filters.push(`lower(name) match lower("*${options.community}*")`);
    console.log(`Filtering by community name: ${options.community}`);
  }

  if (filters.length > 0) {
    query += ` && (${filters.join(" && ")})`;
  }

  query += `]{ _id, name, pageLink, "stateName": stateRef->name, "stateId": stateRef->_id }`;

  const communities = await querySanity(query);

  if (communities.length === 0) {
    console.log("No communities found matching the specified filters.");
    if (options.state) {
      console.log(`\nTip: Try a different state name or abbreviation.`);
    }
    if (options.community) {
      console.log(
        `\nTip: Try a partial community name (e.g., "oak" instead of "Oak Grove").`,
      );
    }
    process.exit(0);
  }

  console.log(`Found ${communities.length} communities with page links\n`);

  let totalPlans = 0;
  let communitiesWithPlans = 0;
  let errorCount = 0;

  for (let i = 0; i < communities.length; i++) {
    const community = communities[i];
    const progress = `[${i + 1}/${communities.length}]`;

    console.log(`${progress} ${community.name}`);

    try {
      // Get floor plan links from community page
      const planLinks = await getFloorPlanLinksFromCommunity(
        community.pageLink,
      );

      if (planLinks.length === 0) {
        console.log(`    No floor plans found`);
        await sleep(DELAY_MS);
        continue;
      }

      console.log(`    Found ${planLinks.length} floor plan links`);
      communitiesWithPlans++;

      for (const planUrl of planLinks) {
        await sleep(DELAY_MS);

        const html = await fetchPage(planUrl);
        if (!html) continue;

        const plan = parseFloorPlanFromPage(html, planUrl);

        if (!plan.name) {
          console.log(`    ⚠ Could not parse floor plan from ${planUrl}`);
          continue;
        }

        const planId = `${community._id}-plan-${plan.slug}`;

        const planDoc = {
          _id: planId,
          name: plan.name,
          slug: { _type: "slug", current: plan.slug },
          communityRef: { _type: "reference", _ref: community._id },
          pageLink: plan.pageLink,
          imageLink: plan.imageLink,
          beds: plan.beds,
          baths: plan.baths,
          sqft: plan.sqft,
          stories: plan.stories,
          garage: plan.garage,
          price: plan.price,
          minPrice: plan.minPrice,
          maxPrice: plan.maxPrice,
          brand: plan.brand,
          description: plan.description,
        };

        await upsertSanity("floorPlan", planDoc);
        totalPlans++;
      }
    } catch (error) {
      console.error(`    ❌ Error: ${error.message}`);
      errorCount++;
    }

    await sleep(DELAY_MS);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Floor plan scraping complete!");
  if (options.state) console.log(`   State filter: ${options.state}`);
  if (options.community)
    console.log(`   Community filter: ${options.community}`);
  console.log(`   Communities processed: ${communities.length}`);
  console.log(`   Communities with plans: ${communitiesWithPlans}`);
  console.log(`   Total plans scraped: ${totalPlans}`);
  console.log(`   Errors: ${errorCount}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
