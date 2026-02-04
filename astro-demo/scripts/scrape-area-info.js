import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://www.drhorton.com";
const SANITY_ENDPOINT = `https://${process.env.PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/data/mutate/${process.env.PUBLIC_SANITY_DATASET}?returnIds=true`;
const API_URL = `https://www.drhorton.com/api/comms/direct`;

// Sanitize string to be a valid Sanity document ID (alphanumeric, hyphens, underscores only)
function sanitizeId(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-_]/g, "") // Remove any invalid characters
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

async function fetchAreaLinks() {
  console.log("Fetching area links from homepage...");
  const res = await fetch(BASE_URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const areaLinks = [];
  // Find all market footer links
  $("a.market-footer-item").each((i, el) => {
    const href = $(el).attr("href");
    const name = $(el).text().trim();
    if (href && name) {
      areaLinks.push({ href, name });
    }
  });

  console.log(`Found ${areaLinks.length} area links`);
  return areaLinks;
}

async function scrapeArea(areaPath) {
  // Remove leading slash if present
  const path = areaPath.startsWith("/") ? areaPath.slice(1) : areaPath;
  const res = await fetch(`${API_URL}/${path}`);
  return res.json();
}

async function upsertSanity(type, doc) {
  const res = await fetch(SANITY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
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
  // Fetch all area links from the homepage
  const areaLinks = await fetchAreaLinks();

  console.log(`\nStarting to scrape ${areaLinks.length} areas...\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const { href, name } of areaLinks) {
    console.log(`Scraping: ${name} (${href})`);

    try {
      const data = await scrapeArea(href);

      const areaInfoData = data.MetaData?.AreaInfoData;
      const rteData = data.MetaData?.RteData;

      if (!areaInfoData) {
        console.log(`⚠ No AreaInfoData found for ${name}, skipping...`);
        skipCount++;
        continue;
      }

      // Create the area info document
      // Use the URL path as the ID (e.g., "california-bay-area")
      const docId = `area-${sanitizeId(href)}`;

      // Extract state from URL (e.g., "/california/bay-area" -> "california")
      const urlParts = href.split("/").filter(Boolean);
      const stateSlug = urlParts[0]; // First part is the state

      const areaDoc = {
        _id: docId,
        name: areaInfoData.Name,
        stateRef: stateSlug
          ? { _type: "reference", _ref: stateSlug }
          : undefined,
        title: areaInfoData.Title,
        url: areaInfoData.Url,
        itemPath: areaInfoData.ItemPath,
        owningTeam: areaInfoData.OwningTeam,
        breadcrumb: areaInfoData.Breadcrumb,
        location: {
          _type: "object",
          latitude: areaInfoData.Latitude,
          longitude: areaInfoData.Longitude,
          radius: areaInfoData.Radius,
          zoomLevel: areaInfoData.ZoomLevel,
        },
        areaInfoContent: areaInfoData.AreaInfoContent,
      };

      // Add RTE data if available
      if (rteData) {
        areaDoc.rteData = {
          _type: "object",
          status: rteData.Status || "None",
          countDown: rteData.CountDown || "",
        };
      }

      await upsertSanity("areas", areaDoc);
      successCount++;
    } catch (error) {
      console.error(`❌ Error scraping ${name}:`, error.message);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Scraping complete!");
  console.log(`   Success: ${successCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
