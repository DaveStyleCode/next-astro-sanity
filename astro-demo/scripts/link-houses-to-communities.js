import { createClient } from "@sanity/client";
import { groupBy, map } from "lodash-es";
import "dotenv/config";

const client = createClient({
  projectId: "9mua1ulx",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function linkHousesToCommunities() {
  console.log("Starting to link houses to communities...\n");

  // Get all houses with community references
  const houses = await client.fetch(`
    *[_type == "house" && defined(communityRef)] {
      _id,
      address,
      communityRef
    }
  `);

  console.log(`Found ${houses.length} houses with community references`);

  // Group houses by community using lodash
  const validHouses = houses.filter((h) => h.communityRef?._ref);
  const housesByCommunity = groupBy(validHouses, (h) => h.communityRef._ref);

  console.log(
    `Found ${Object.keys(housesByCommunity).length} communities with houses\n`,
  );

  let updated = 0;
  let failed = 0;

  // Update each community with its houses
  for (const [communityId, houseDocs] of Object.entries(housesByCommunity)) {
    try {
      // Create reference objects for each house
      const houseRefs = map(houseDocs, (house) => ({
        _type: "reference",
        _ref: house._id,
        _key: house._id.replace(/[^a-zA-Z0-9]/g, ""), // Generate a valid key
      }));

      await client.patch(communityId).set({ houses: houseRefs }).commit();

      updated++;
      console.log(
        `✓ Updated community ${communityId} with ${houseRefs.length} houses`,
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
  console.log(`   Total houses linked: ${houses.length}`);
  console.log("=".repeat(50));
}

linkHousesToCommunities().catch(console.error);
