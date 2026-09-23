/**
 * One-time Google Business Profile OAuth setup.
 *
 * Prereqs in Google Cloud Console (same project as the Places key is fine):
 *   1. Enable "Google My Business API" and "My Business Account Management API"
 *   2. OAuth consent screen -> External -> publish to Production (avoids the
 *      7-day refresh-token expiry of Testing mode)
 *   3. Credentials -> Create OAuth client ID -> Web application
 *      Authorized redirect URI: http://localhost:8787/callback
 *   4. Add to .env.local:
 *        GBP_CLIENT_ID=....apps.googleusercontent.com
 *        GBP_CLIENT_SECRET=....
 *
 * Then run:  node scripts/gbp-auth.mjs
 * Open the printed URL, sign in as the Business Profile owner, approve
 * (click Advanced -> Go to app if Google shows the unverified-app warning).
 * The refresh token is written to .env.local as GBP_REFRESH_TOKEN.
 */
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV = join(ROOT, ".env.local");
const PORT = 8787;
const SCOPE = "https://www.googleapis.com/auth/business.manage";

for (const line of readFileSync(ENV, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { GBP_CLIENT_ID, GBP_CLIENT_SECRET } = process.env;
if (!GBP_CLIENT_ID || !GBP_CLIENT_SECRET) {
  console.error("GBP_CLIENT_ID / GBP_CLIENT_SECRET missing from .env.local — see header comment.");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: GBP_CLIENT_ID,
    redirect_uri: `http://localhost:${PORT}/callback`,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

console.log("\nOpen this URL in your browser and approve as the Business Profile owner:\n");
console.log(authUrl + "\n");
console.log("Waiting for the callback on http://localhost:8787/callback ...");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/callback") return;
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error");
  if (err || !code) {
    res.end("Authorization failed: " + (err || "no code"));
    server.close();
    process.exit(1);
  }
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GBP_CLIENT_ID,
        client_secret: GBP_CLIENT_SECRET,
        redirect_uri: `http://localhost:${PORT}/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.refresh_token) throw new Error(JSON.stringify(tokens).slice(0, 300));

    const env = readFileSync(ENV, "utf8").replace(/^GBP_REFRESH_TOKEN=.*$/m, "").trimEnd();
    writeFileSync(ENV, env + `\nGBP_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    res.end("Done! Refresh token saved to .env.local — you can close this tab.");
    console.log("\nRefresh token saved to .env.local as GBP_REFRESH_TOKEN");
    console.log("Now run: node scripts/fetch-reviews-gbp.mjs");
  } catch (e) {
    res.end("Token exchange failed: " + e.message);
    console.error("Token exchange failed:", e.message);
  } finally {
    server.close();
  }
});
server.listen(PORT);
