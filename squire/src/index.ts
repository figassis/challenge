import { autoMigrate, initialize } from "./config";

async function main() {
  try {
    const store = await initialize();
    autoMigrate(store, true);
  } catch (error) {
    console.log("Unable to configure application");
    console.log(error.message);
    process.exit(1);
  }
}

main();
