import { stitch } from "@google/stitch-sdk";

async function run() {
  try {
    const projects = await stitch.projects();
    console.log("=== STITCH PROJECTS ===");
    for (const project of projects) {
      console.log(`\nProject ID: ${project.projectId}`);
      console.log(`Project Data:`, project.data);
      
      const screens = await project.screens();
      console.log(`Screens count: ${screens.length}`);
      for (const screen of screens) {
        console.log(`  - Screen ID: ${screen.id}`);
        console.log(`    Screen Data:`, screen.data);
        try {
          const html = await screen.getHtml();
          console.log(`    HTML URL: ${html}`);
        } catch (e) {
          console.log(`    HTML: Error (${e.message})`);
        }
      }
    }
  } catch (err) {
    console.error("Error in Stitch Script:", err);
  }
}

run();
