import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "9mua1ulx",
  dataset: "production",
  token: process.env.SANITY_TOKEN,
  apiVersion: "2024-01-01",
  useCdn: false,
});

function toTitleCase(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function updateStateNames() {
  // Get all states
  const states = await client.fetch('*[_type == "state"]{_id, name}');

  console.log(`Found ${states.length} state documents`);

  for (const state of states) {
    // Skip drafts (they'll be updated when published version is updated)
    if (state._id.startsWith("drafts.")) {
      continue;
    }

    const capitalizedName = toTitleCase(state.name);

    if (state.name !== capitalizedName) {
      console.log(`Updating "${state.name}" → "${capitalizedName}"`);

      await client.patch(state._id).set({ name: capitalizedName }).commit();
    } else {
      console.log(`"${state.name}" already capitalized`);
    }
  }

  console.log("Done!");
}

updateStateNames().catch(console.error);
