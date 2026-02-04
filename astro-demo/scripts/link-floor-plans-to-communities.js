import { createClient } from "@sanity/client";
import { groupBy, map } from "lodash-es";
import "dotenv/config";

const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: import.meta.env.SANITY_API_TOKEN,
});

async function linkFloorPlansToCommunities() {
  console.log("Starting to link floor plans to communities...\n");

  // Get all floor plans with community references
  const floorPlans = await client.fetch(`
    *[_type == "floorPlan" && defined(communityRef)] {
      _id,
      name,
      communityRef
    }
  `);

  console.log(
    `Found ${floorPlans.length} floor plans with community references`,
  );

  // Group floor plans by community using lodash
  const validFloorPlans = floorPlans.filter((fp) => fp.communityRef?._ref);
  const floorPlansByCommunity = groupBy(
    validFloorPlans,
    (fp) => fp.communityRef._ref,
  );

  console.log(
    `Found ${Object.keys(floorPlansByCommunity).length} communities with floor plans\n`,
  );

  let updated = 0;
  let failed = 0;

  // Update each community with its floor plans
  for (const [communityId, floorPlanDocs] of Object.entries(
    floorPlansByCommunity,
  )) {
    try {
      // Create reference objects for each floor plan
      const floorPlanRefs = map(floorPlanDocs, (floorPlan) => ({
        _type: "reference",
        _ref: floorPlan._id,
        _key: floorPlan._id.replace(/[^a-zA-Z0-9]/g, ""), // Generate a valid key
      }));

      await client
        .patch(communityId)
        .set({ floorPlans: floorPlanRefs })
        .commit();

      updated++;
      console.log(
        `✓ Updated community ${communityId} with ${floorPlanRefs.length} floor plans`,
      );
    } catch (error) {
      failed++;
      console.error(
        `✗ Failed to update community ${communityId}:`,
        error.message,
      );
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log("✅ Linking complete!");
  console.log(`   Communities updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total floor plans linked: ${floorPlans.length}`);
  console.log("=".repeat(50));
}

linkFloorPlansToCommunities().catch(console.error);
