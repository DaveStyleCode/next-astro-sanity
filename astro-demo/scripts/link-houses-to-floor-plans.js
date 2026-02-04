import { createClient } from "@sanity/client";
import "dotenv/config";

const client = createClient({
  projectId: "9mua1ulx",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Normalize floor plan name for matching
function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "") // Remove "The " prefix
    .replace(/\s+/g, " "); // Normalize whitespace
}

async function linkHousesToFloorPlans() {
  // Get all houses that have a floorPlanName but no floorPlanRef
  const houses = await client.fetch(`
    *[_type == "house" && defined(floorPlanName) && !defined(floorPlanRef)] {
      _id,
      floorPlanName,
      communityRef
    }
  `);

  console.log(`Found ${houses.length} houses without floor plan references`);

  // Get all floor plans
  const floorPlans = await client.fetch(`
    *[_type == "floorPlan"] {
      _id,
      name,
      communityRef
    }
  `);

  console.log(`Found ${floorPlans.length} floor plans`);

  // Create a map of floor plans by community and normalized name
  const floorPlanMap = new Map();
  for (const fp of floorPlans) {
    if (fp.communityRef?._ref && fp.name) {
      const normalizedName = normalizeName(fp.name);
      const key = `${fp.communityRef._ref}:${normalizedName}`;
      floorPlanMap.set(key, fp._id);
    }
  }

  let linked = 0;
  let notFound = 0;
  const notFoundNames = new Set();

  for (const house of houses) {
    if (!house.communityRef?._ref || !house.floorPlanName) {
      continue;
    }

    const normalizedName = normalizeName(house.floorPlanName);
    const key = `${house.communityRef._ref}:${normalizedName}`;
    const floorPlanId = floorPlanMap.get(key);

    if (floorPlanId) {
      await client
        .patch(house._id)
        .set({ floorPlanRef: { _type: "reference", _ref: floorPlanId } })
        .commit();
      linked++;
      console.log(`✓ Linked house ${house._id} to floor plan ${floorPlanId}`);
    } else {
      notFound++;
      notFoundNames.add(
        `${house.floorPlanName} (community: ${house.communityRef._ref})`,
      );
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Linked: ${linked}`);
  console.log(`Not found: ${notFound}`);

  if (notFoundNames.size > 0) {
    console.log(`\nFloor plans not found:`);
    for (const name of [...notFoundNames].slice(0, 20)) {
      console.log(`  - ${name}`);
    }
    if (notFoundNames.size > 20) {
      console.log(`  ... and ${notFoundNames.size - 20} more`);
    }
  }
}

linkHousesToFloorPlans().catch(console.error);
