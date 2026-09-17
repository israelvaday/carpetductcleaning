import { readFileSync } from "node:fs";
const tags = JSON.parse(readFileSync("content/photo-tags.json", "utf8").replace(/^﻿/, ""));
for (const [src, t] of Object.entries(tags)) {
  if (t.kind === "vehicle" || t.kind === "team" || /truck|van|vehicle/i.test(t.alt || "")) {
    console.log(`${t.kind} | ${src} | ${t.alt} | q=${t.quality} text=${t.has_text}`);
  }
}
