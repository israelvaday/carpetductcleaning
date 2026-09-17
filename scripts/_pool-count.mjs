import { readFileSync } from "node:fs";
const TAGS = JSON.parse(readFileSync("content/photo-tags.json", "utf8").replace(/^﻿/, ""));
function srcToKey(src) {
  return src.replace(/\.(jpg|jpeg|png|gif)\.webp$/i, "").replace(/\.(webp|png|jpe?g|gif|avif)$/i, "").split("/").pop().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const seen = new Set();
let total = 0;
const perService = {};
for (const [src, t] of Object.entries(TAGS)) {
  if (!t || !t.ok || t.has_text || (t.quality !== "high" && t.quality !== "medium")) continue;
  const key = srcToKey(src);
  if (seen.has(key)) continue;
  seen.add(key);
  total++;
  for (const s of t.services?.length ? t.services : ["(generic)"]) perService[s] = (perService[s] || 0) + 1;
}
console.log("unique usable photos:", total);
console.log("per service:", Object.entries(perService).sort((a, b) => b[1] - a[1]));
