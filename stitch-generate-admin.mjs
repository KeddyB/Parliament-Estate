import { stitch } from "@google/stitch-sdk";
import fs from "fs";

async function run() {
  const projectId = "4292241270358724082";
  console.log(`Connecting to Stitch project: ${projectId}`);
  try {
    const project = stitch.project(projectId);
    
    const prompt = "A clean, extremely minimal, and simple admin dashboard for the Parliament Estate. It should look highly professional, clean, and modern with almost no color (monochrome/grayscale style, slate/gray accents, clean thin borders). It should feature a toggle for light and dark modes, with light mode as the default. The typography should be elegant and sharp. Layout should include a header with a sign out button and admin profile, 4 top-level statistics cards (Total Members, Pending Action, Verified Users, Administrators), and a clean modern data table displaying member details (Member Info, Address Details, Contact, Status & Roles) and action buttons (Verify, Promote, Delete).";
    
    console.log(`Generating screen with prompt: "${prompt}"...`);
    const screen = await project.generate(prompt);
    
    console.log(`Screen generated successfully! ID: ${screen.id}`);
    console.log(`Fetching HTML content...`);
    const htmlUrl = await screen.getHtml();
    console.log(`HTML Download URL: ${htmlUrl}`);
    
    // Fetch the actual HTML content
    const response = await fetch(htmlUrl);
    const htmlText = await response.text();
    
    fs.writeFileSync("stitch-generated-admin.html", htmlText);
    console.log("Saved generated HTML to stitch-generated-admin.html");
  } catch (err) {
    console.error("Error generating Stitch screen:", err);
  }
}

run();
