import { testBootstrap } from "./bootstrap.test";
import { testSocketMessages } from "./socket-messages.test";
import { testAdapterSigning } from "./adapter-signing.test";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}`);
    failed++;
  }
}

async function main() {
  console.log("\n=== uTrace Compatibility Tests ===\n");

  console.log("Bootstrap Parser:");
  testBootstrap(assert);

  console.log("\nSocket Messages:");
  testSocketMessages(assert);

  console.log("\nAdapter Signing:");
  await testAdapterSigning(assert);

  console.log(`\n${passed} passed, ${failed} failed\n`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
