import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Running: ${scriptPath}`);
    console.log("=".repeat(60) + "\n");

    const child = spawn("node", [scriptPath], {
      stdio: "inherit",
      cwd: join(__dirname, ".."),
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function main() {
  const startTime = Date.now();

  console.log("🚀 Starting full D.R. Horton data scrape...\n");
  console.log("This will run the following scripts in order:");
  console.log("  1. scrape-and-save.js (States & Communities)");
  console.log("  2. scrape-area-info.js (Area details)");
  console.log("  3. link-communities-to-areas.js (Link communities to areas)");
  console.log("  4. scrape-floor-plans.js (Floor plans)");
  console.log("  5. scrape-houses.js (QMI/Available homes)");

  try {
    // Step 1: Scrape states and communities
    await runScript(join(__dirname, "scrape-and-save.js"));

    // Step 2: Scrape area details
    await runScript(join(__dirname, "scrape-area-info.js"));

    // Step 3: Link communities to areas
    await runScript(join(__dirname, "link-communities-to-areas.js"));

    // Step 4: Scrape floor plans
    await runScript(join(__dirname, "scrape-floor-plans.js"));

    // Step 5: Scrape houses/QMIs
    await runScript(join(__dirname, "scrape-houses.js"));

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL SCRAPING COMPLETE!");
    console.log(`   Total time: ${duration} minutes`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ Scraping failed:", error.message);
    process.exit(1);
  }
}

main();
