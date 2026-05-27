import { stitch } from "@google/stitch-sdk";

async function run() {
  try {
    const projects = await stitch.projects();
    console.log("=== ALL STITCH PROJECTS WITH SCREENS ===");
    for (const project of projects) {
      const screens = await project.screens();
      if (screens.length > 0) {
        console.log(`\n=========================================`);
        console.log(`Project ID: ${project.projectId}`);
        console.log(`Title: ${project.data ? project.data.title : 'No Title'}`);
        console.log(`Screens Count: ${screens.length}`);
        
        for (const screen of screens) {
          console.log(`  ---------------------------------------`);
          console.log(`  Screen ID: ${screen.id}`);
          console.log(`  Screen Title: ${screen.data ? screen.data.title : 'No Screen Title'}`);
          try {
            const html = await screen.getHtml();
            console.log(`  HTML URL: ${html}`);
          } catch (e) {
            console.log(`  HTML URL: Error getting HTML (${e.message})`);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in Stitch Script:", err);
  }
}

run();
