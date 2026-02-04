import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const SANITY_ENDPOINT = `https://${process.env.PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/data/mutate/${process.env.PUBLIC_SANITY_DATASET}`;
const QUERY_ENDPOINT = `https://${process.env.PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/data/query/${process.env.PUBLIC_SANITY_DATASET}`;

async function getAreaInfoDocs() {
  const query = encodeURIComponent('*[_type == "areas"]{ _id }');
  const url = `${QUERY_ENDPOINT}?query=${query}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
    },
  });

  const json = await res.json();
  return json.result || [];
}

async function deleteDocs(docIds) {
  const mutations = docIds.map((id) => ({ delete: { id } }));

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
  console.log("Fetching documents with type 'areas'...");

  const docs = await getAreaInfoDocs();

  if (docs.length === 0) {
    console.log("✅ No 'areas' documents found to delete.");
    return;
  }

  console.log(`Found ${docs.length} documents to delete.`);

  const docIds = docs.map((doc) => doc._id);

  console.log("Deleting documents...");

  const success = await deleteDocs(docIds);

  if (success) {
    console.log(`✅ Successfully deleted ${docs.length} documents!`);
  } else {
    console.log("❌ Failed to delete documents.");
  }
}

main().catch(console.error);
