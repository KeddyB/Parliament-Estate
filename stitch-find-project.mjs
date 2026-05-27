import { stitch } from "@google/stitch-sdk";

async function run() {
  try {
    const projects = await stitch.projects();
    console.log("=== SCANNING FOR PARLIAMENT ESTATE PROJECT ===");
    for (const project of projects) {
      if (project.data && project.data.title && project.data.title.includes("Parliament Estate")) {
        console.log(`\nFOUND PROJECT!`);
        console.log(`ID: ${project.projectId}`);
        console.log(`Title: ${project.data.title}`);
        console.log(`Project Data:`, JSON.stringify(project.data, null, 2));
        
        const screens = await project.screens();
        console.log(`Screens count: ${screens.length}`);
        for (const screen of screens) {
          console.log(`\n  - Screen ID: ${screen.id}`);
          console.log(`    Title: ${screen.data.title}`);
          try {
            const html = await screen.getHtml();
            console.log(`    HTML URL: ${html}`);
          } catch (e) {
            console.log(`    HTML: Error (${e.message})`);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in Stitch Script:", err);
  }
}

run();
