#!/usr/bin/env node
import { execSync } from "node:child_process";

const reset = process.argv.includes("--reset");
const args = JSON.stringify(reset ? { reset: true } : {});

const command = `npx convex run catalog:seedScotchCatalog '${args}'`;
console.log(`Running: ${command}`);
execSync(command, { stdio: "inherit" });

console.log("\nTip: verify counts with `npx convex run catalog:catalogStats '{}'`.");
