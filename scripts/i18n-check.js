#!/usr/bin/env node
/**
 * i18n Translation Checker
 *
 * Scans all .tsx / .ts source files for t("key") calls and
 * compares them against every locale JSON file to find:
 *   1. Keys used in code but MISSING from a locale.
 *   2. Keys present in a locale but UNUSED in code (dead keys).
 *
 * Usage:
 *   node scripts/check-i18n.js [--unused] [--locale en]
 *
 * Flags:
 *   --unused              Also report unused keys in locale files.
 *   --locale <name>       Only check this locale (e.g. --locale en).
 *   --dir <path>          Source directory to scan (default: app + components).
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ── Configuration ─────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "lib/i18n", "locales");
const SOURCE_DIRS = [
  path.join(ROOT, "app"),
  path.join(ROOT, "components"),
  path.join(ROOT, "store"),
  path.join(ROOT, "utils"),
  path.join(ROOT, "constants"),
];

const args = process.argv.slice(2);
const showUnused = args.includes("--unused");
const localeFilter = args.includes("--locale")
  ? args[args.indexOf("--locale") + 1]
  : null;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Recursively flatten a JSON object to dot-notation keys */
function flattenKeys(obj, prefix = "") {
  const result = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      result.push(...flattenKeys(v, key));
    } else {
      result.push(key);
    }
  }
  return result;
}

/** Find all .tsx / .ts source files (exclude node_modules, tests, scripts) */
function findSourceFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const out = execSync(
      `find "${dir}" -type f \\( -name "*.tsx" -o -name "*.ts" \\) ! -path "*/node_modules/*" ! -path "*/__tests__/*" ! -path "*/scripts/*"`,
      { encoding: "utf8" }
    );
    files.push(...out.trim().split("\n").filter(Boolean));
  }
  return files;
}

/**
 * Extract translation keys from source code.
 * Matches:
 *   t("key")  t('key')  t(`key`)
 *   i18n.t("key")
 *   Trans i18nKey="key"
 */
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const keys = new Set();

  // t("key") / t('key')
  const tRegex = /\bt\(\s*["'`]([^"'`]+)["'`]/g;
  let m;
  while ((m = tRegex.exec(content)) !== null) {
    keys.add(m[1]);
  }

  // i18nKey="key" or i18nKey={'key'}
  const transRegex = /i18nKey=["'{]([^"'}`]+)["']}/g;
  while ((m = transRegex.exec(content)) !== null) {
    keys.add(m[1]);
  }

  return keys;
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log("\n🔍  Scanning source files…");
const sourceFiles = findSourceFiles(SOURCE_DIRS);
console.log(`   Found ${sourceFiles.length} source files.`);

const allUsedKeys = new Set();
for (const file of sourceFiles) {
  for (const key of extractKeysFromFile(file)) {
    allUsedKeys.add(key);
  }
}
console.log(`   Found ${allUsedKeys.size} unique translation keys in code.\n`);

// ── Load locales ──────────────────────────────────────────────────────────────
const localeFiles = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => !localeFilter || f === `${localeFilter}.json`);

if (localeFiles.length === 0) {
  console.error(`❌  No locale files found in ${LOCALES_DIR}`);
  process.exit(1);
}

let hasIssues = false;

for (const localeFile of localeFiles) {
  const localeName = path.basename(localeFile, ".json");
  const localePath = path.join(LOCALES_DIR, localeFile);
  const localeData = JSON.parse(fs.readFileSync(localePath, "utf8"));
  const localeKeys = new Set(flattenKeys(localeData));

  // ── Missing keys (in code but not in locale) ─────────────────────────────
  // Filter out dynamic template-literal keys (e.g. activities.status.${status})
  // which are built at runtime and can't be statically validated.
  const missing = [...allUsedKeys].filter(
    (k) => !localeKeys.has(k) && !k.includes("${")
  );

  if (missing.length > 0) {
    hasIssues = true;
    console.log(`❌  [${localeName}] Missing ${missing.length} key(s):`);
    for (const k of missing.sort()) {
      console.log(`      - ${k}`);
    }
    console.log();
  } else {
    console.log(`✅  [${localeName}] All ${localeKeys.size} keys present.\n`);
  }

  // ── Unused keys (in locale but not in code) ───────────────────────────────
  if (showUnused) {
    const unused = [...localeKeys].filter((k) => !allUsedKeys.has(k));
    if (unused.length > 0) {
      console.log(`⚠️   [${localeName}] ${unused.length} UNUSED key(s) in locale:`);
      for (const k of unused.sort()) {
        console.log(`      ~ ${k}`);
      }
      console.log();
    }
  }
}

if (!hasIssues) {
  console.log("🎉  All translation keys are present in every locale!\n");
} else {
  console.log(
    "💡  Tip: run with --unused to also see keys in locale files that are never used.\n"
  );
  process.exit(1);
}
