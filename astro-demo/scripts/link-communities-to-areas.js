import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://www.drhorton.com";
const SANITY_ENDPOINT = `https://${process.env.PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/data/mutate/${process.env.PUBLIC_SANITY_DATASET}`;
const API_URL = `https://www.drhorton.com/api/comms/direct`;

function sanitizeId(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchAreaLinks() {
  console.log("Fetching area links from homepage...");
  const res = await fetch(BASE_URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const areaLinks = [];
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
  const path = areaPath.startsWith("/") ? areaPath.slice(1) : areaPath;
  const res = await fetch(`${API_URL}/${path}`);
  return res.json();
}

async function updateCommunityArea(communityId, areaId) {
  const mutations = [
    {
      patch: {
        id: communityId,
        set: {
          areaRef: {
            _type: "reference",
            _ref: areaId,
          },
        },
      },
    },
  ];

  const res = await fetch(SANITY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("SANITY ERROR:", JSON.stringify(json, null, 2));
    return false;
  }

  return true;
}

async function main() {
  const areaLinks = await fetchAreaLinks();

  console.log(
    `\nStarting to link communities to ${areaLinks.length} areas...\n`,
  );

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const { href, name } of areaLinks) {
    console.log(`Processing: ${name} (${href})`);

    try {
      const data = await scrapeArea(href);
      const communities = data.CommunityData ?? [];

      if (communities.length === 0) {
        console.log(`  ⚠ No communities found in this area`);
        skipCount++;
        continue;
      }

      // Extract state from URL
      const urlParts = href.split("/").filter(Boolean);
      const stateSlug = urlParts[0];
      const areaId = `area-${sanitizeId(href)}`;

      console.log(`  Found ${communities.length} communities`);

      for (const com of communities) {
        const communityId = `${stateSlug}-${sanitizeId(com.commName)}`;

        const success = await updateCommunityArea(communityId, areaId);

        if (success) {
          console.log(`    ✔ Linked: ${com.commName}`);
          successCount++;
        } else {
          console.log(`    ❌ Failed: ${com.commName}`);
          errorCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${name}:`, error.message);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Linking complete!");
  console.log(`   Communities linked: ${successCount}`);
  console.log(`   Areas skipped: ${skipCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
