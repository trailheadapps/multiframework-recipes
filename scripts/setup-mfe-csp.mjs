#!/usr/bin/env node
/**
 * Deploys a frame-src CSP Trusted Site for this org's UI bundle origin so the
 * Micro-Frontend Recipes can embed the deployed guests. Exact origin on purpose:
 * a *.my.salesforce.app wildcard would trust every org's bundles.
 *
 * Usage: npm run setup:mfe-csp [-- --target-org <alias>]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Same transform as toGuestOrigin() in lwc/guestHost.
function toGuestOrigin(hostname) {
  const [name, ...rest] = hostname.trim().split(".");
  return `https://${name}--c.${rest.join(".").replace(/\.com$/, ".app")}`;
}

function sf(args) {
  return execFileSync("sf", args, {
    encoding: "utf8",
    shell: process.platform === "win32"
  });
}

function main() {
  const args = process.argv.slice(2);
  const flag = args.findIndex((a) => /^(--target-org|-o)(=|$)/.test(a));
  const value =
    flag < 0
      ? undefined
      : args[flag].includes("=")
        ? args[flag].split("=")[1]
        : args[flag + 1];
  if (flag >= 0 && !value) {
    console.error("Usage: npm run setup:mfe-csp [-- --target-org <alias>]");
    process.exit(1);
  }
  const org = value ? ["--target-org", value] : [];

  const display = JSON.parse(sf(["org", "display", "--json", ...org]));
  const { instanceUrl, username } = display.result;
  const origin = toGuestOrigin(new URL(instanceUrl).hostname);
  console.log(`Trusting ${origin} (frame-src) in ${username}`);

  const dir = mkdtempSync(join(tmpdir(), "mfe-csp-"));
  try {
    mkdirSync(join(dir, "cspTrustedSites"));
    writeFileSync(
      join(dir, "package.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <types><members>MicrofrontendRecipesGuests</members><name>CspTrustedSite</name></types>
  <version>67.0</version>
</Package>
`
    );
    writeFileSync(
      join(dir, "cspTrustedSites", "MicrofrontendRecipesGuests.cspTrustedSite"),
      `<?xml version="1.0" encoding="UTF-8"?>
<CspTrustedSite xmlns="http://soap.sforce.com/2006/04/metadata">
  <canAccessCamera>false</canAccessCamera>
  <canAccessMicrophone>false</canAccessMicrophone>
  <context>All</context>
  <description>Lets lightning-ui-embedding load the Microfrontend Recipes guests from this org's deployed UI bundles. Created by scripts/setup-mfe-csp.mjs.</description>
  <endpointUrl>${origin}</endpointUrl>
  <isActive>true</isActive>
  <isApplicableToConnectSrc>false</isApplicableToConnectSrc>
  <isApplicableToFontSrc>false</isApplicableToFontSrc>
  <isApplicableToFrameSrc>true</isApplicableToFrameSrc>
  <isApplicableToImgSrc>false</isApplicableToImgSrc>
  <isApplicableToMediaSrc>false</isApplicableToMediaSrc>
  <isApplicableToStyleSrc>false</isApplicableToStyleSrc>
</CspTrustedSite>
`
    );
    console.log(
      sf([
        "project",
        "deploy",
        "start",
        "--metadata-dir",
        dir,
        "--wait",
        "10",
        ...org
      ])
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main();
