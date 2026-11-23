#!/usr/bin/env node
/**
 * Checks that the Micro-Frontend Recipes embed the deployed React and Angular
 * guests in a real org: logs in headlessly, opens an Account, and asserts the
 * guest renders and the platform session banner is hidden inside it.
 *
 * Needs the app deployed and `npm run setup:mfe-csp` run. Playwright comes from
 * the React bundle's node_modules.
 *
 * Usage: npm run test:mfe-embedding [-- --target-org <alias>]
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requireFromReact = createRequire(
  join(root, "force-app/main/react-recipes/uiBundles/reactRecipes/package.json")
);
const { chromium } = requireFromReact("@playwright/test");

const argIndex = process.argv.findIndex(
  (a) => a === "--target-org" || a === "-o"
);
const org = argIndex >= 0 ? ["--target-org", process.argv[argIndex + 1]] : [];

function sf(args) {
  return JSON.parse(
    execFileSync("sf", [...args, "--json"], {
      encoding: "utf8",
      shell: process.platform === "win32"
    })
  ).result;
}

async function waitFor(description, check, timeout = 60000) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeout) {
    last = await check().catch(() => undefined);
    if (last) return last;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${description}`);
}

const guestFrame = (page, bundle) =>
  page
    .frames()
    .find((f) => f.url().includes(`/app/c__${bundle}/embedding/basic-render`));

// The guest card prints "Live from <url>" once it has rendered.
async function expectGuest(page, bundle) {
  const frame = await waitFor(`the ${bundle} guest frame`, async () => {
    const f = guestFrame(page, bundle);
    return f && (await f.locator("body").innerText()).includes("Live from")
      ? f
      : undefined;
  }).catch((e) => {
    const urls = page.frames().map((f) => f.url().split("?")[0]);
    throw new Error(
      `${e.message}. Page: ${page.url()}. Frames: ${urls.join(", ")}`
    );
  });
  const hasBanner = await frame.evaluate(() => {
    const find = (root) =>
      [...root.querySelectorAll("*")].some(
        (e) =>
          e.tagName === "SF-SESSION-BANNER" ||
          (e.shadowRoot && find(e.shadowRoot))
      );
    return find(document);
  });
  if (hasBanner) throw new Error(`${bundle} guest shows the session banner`);
  console.log(`ok - ${bundle} guest renders without the session banner`);
}

const { Id: accountId } = sf([
  "data",
  "query",
  "-q",
  "SELECT Id FROM Account ORDER BY Name ASC LIMIT 1",
  ...org
]).records[0];
const { url: frontdoor } = sf(["org", "open", "--url-only", ...org]);

const browser = await chromium.launch();
try {
  const page = await (await browser.newContext()).newPage();
  await page.goto(frontdoor, { waitUntil: "load" });
  // The frontdoor redirects to the org's Lightning domain.
  await page.waitForURL(/\.lightning\.force\.com/, { timeout: 60000 });
  const origin = new URL(page.url()).origin;
  await page.goto(`${origin}/lightning/app/c__microfrontendRecipes`, {
    waitUntil: "load"
  });
  await page.goto(`${origin}/lightning/r/Account/${accountId}/view`, {
    waitUntil: "load"
  });

  await expectGuest(page, "reactRecipes");
  await page.getByText("Angular", { exact: true }).first().click();
  await expectGuest(page, "angularRecipes");
} finally {
  await browser.close();
}
