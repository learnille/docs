const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Define paths
const API_REFERENCE_DIR = "api-reference";
const MINT_JSON_PATH = "mint.json";
const OPENAPI_URL = "https://api-test.learnille.com/docs-json";
const NAVIGATION_JSON_PATH = path.join(API_REFERENCE_DIR, "navigation.json");

try {
    console.log("Fetching API Reference...");

    // Step 1: Run Mintlify Scraper and capture output
    const rawOutput = execSync(
        `npx @mintlify/scraping@latest openapi-file ${OPENAPI_URL} -o ${API_REFERENCE_DIR}`,
        { encoding: "utf-8" }
    ).trim();

    // Step 2: Extract only the JSON array from the output
    const jsonStart = rawOutput.indexOf("[");
    const jsonEnd = rawOutput.lastIndexOf("]") + 1; // Include the last closing bracket

    if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("Could not extract valid JSON array from output.");
    }

    const jsonString = rawOutput.slice(jsonStart, jsonEnd);

    // Step 3: Parse JSON safely
    let newNavigation;
    try {
        newNavigation = JSON.parse(jsonString);
    } catch (jsonError) {
        console.error("Error: Failed to parse extracted JSON.", jsonError.message);
        process.exit(1);
    }

    // Step 4: Save navigation.json
    fs.writeFileSync(NAVIGATION_JSON_PATH, JSON.stringify(newNavigation, null, 2));
    console.log(`Navigation saved to ${NAVIGATION_JSON_PATH}`);

    // Step 5: Update mint.json
    console.log("Updating mint.json...");
    const mintConfig = JSON.parse(fs.readFileSync(MINT_JSON_PATH, "utf-8"));
    mintConfig.navigation = newNavigation;

    fs.writeFileSync(MINT_JSON_PATH, JSON.stringify(mintConfig, null, 2));
    console.log("mint.json updated successfully.");
} catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
}
