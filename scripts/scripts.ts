import generateTestData from "./generate_test_data";
import depopulate from "./depopulate_database";

const [, , command, ...args] = process.argv;

switch (command) {
  case "generate":
    const count = parseInt(args[0], 10);
    if (!isNaN(count)) {
      generateTestData(count).catch(console.error);
    } else {
      console.error("Invalid count. Please provide a valid number.");
    }
    break;
  case "depopulate":
    depopulate().catch(console.error);
    break;
  default:
    console.error("Invalid command. Usage: npm run <command> <args>");
    break;
}
