import { stitch } from "@google/stitch-sdk";
import fs from "fs";

async function run() {
  const projectId = "4292241270358724082";
  console.log(`Connecting to Stitch project: ${projectId}`);
  try {
    const project = stitch.project(projectId);

    const prompt = "A clean, extremely minimal, and simple member registration form for the Parliament Estate. It should look highly professional, clean, and modern with almost no color (monochrome/grayscale style, slate/gray accents, clean thin borders). It should feature a toggle for light and dark modes, with light mode as the default. The typography should be elegant and sharp. Layout should be centered, beautiful form fields for Full Name, Landlord Name (optional), Road Number (select 1-12), House Number, Close (optional), Email, Phone Number, Password, and a clear Submit button. Includes header and footer.";

    console.log(`Generating screen with prompt: "${prompt}"...`);
    const screen = await project.generate(prompt);

    console.log(`Screen generated successfully! ID: ${screen.id}`);
    console.log(`Fetching HTML content...`);
    const htmlUrl = await screen.getHtml();
    console.log(`HTML Download URL: ${htmlUrl}`);

    // Fetch the actual HTML content
    const response = await fetch(htmlUrl);
    const htmlText = await response.text();

    fs.writeFileSync("stitch-generated-registration.html", htmlText);
    console.log("Saved generated HTML to stitch-generated-registration.html");
  } catch (err) {
    console.error("Error generating Stitch screen:", err);
  }
}

run();
