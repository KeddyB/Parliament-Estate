import { stitch } from "@google/stitch-sdk";
import fs from "fs";

async function run() {
  const projectId = "4292241270358724082";
  console.log(`Connecting to Stitch project: ${projectId}`);
  try {
    const project = stitch.project(projectId);

    const prompt = "A clean, minimalist, low-color registration portal for the Parliament Estate. It should look highly professional and modern with minimal color. It MUST implement a prominent light and dark theme toggle button (with light mode as the default option). The typography should be elegant and sharp. Layout should be centered, beautiful form fields for Full Name, Landlord Name (optional), Road Number (select 1-12), House Number, Close (optional), Email, Phone Number, Password, and a clear 'Submit Registration' button. Includes header (with a clean 'P' logo and 'Parliament Estate' title, and a link to 'Admin Portal ->') and footer.";

    console.log(`Generating screen with prompt: "${prompt}"...`);
    const screen = await project.generate(prompt);

    console.log(`Screen generated successfully! ID: ${screen.id}`);
    console.log(`Fetching HTML content...`);
    const htmlUrl = await screen.getHtml();
    console.log(`HTML Download URL: ${htmlUrl}`);

    // Fetch the actual HTML content
    const response = await fetch(htmlUrl);
    const htmlText = await response.text();

    fs.writeFileSync("stitch-generated-home.html", htmlText);
    console.log("Saved generated HTML to stitch-generated-home.html");
  } catch (err) {
    console.error("Error generating Stitch screen:", err);
  }
}

run();
