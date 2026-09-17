import { readFileSync } from "node:fs";
const tags = JSON.parse(readFileSync("content/photo-tags.json", "utf8").replace(/^﻿/, ""));
const entries = Object.entries(tags);

const by = (fn) => {
  const c = {};
  for (const [src, t] of entries) {
    const k = fn(t, src);
    if (Array.isArray(k)) for (const x of k) c[x] = (c[x] || 0) + 1;
    else c[k] = (c[k] || 0) + 1;
  }
  return Object.entries(c).sort((a, b) => b[1] - a[1]);
};

console.log("ok:", by((t) => String(t.ok)));
console.log("\nkind:", by((t) => t.kind));
console.log("\nquality:", by((t) => t.quality));
console.log("\nservices:", by((t) => (t.services?.length ? t.services : ["(none)"])));
console.log("\nsetting:", by((t) => t.setting));
console.log("\nok + photo + no text + quality!=low:");
const good = entries.filter(([, t]) => t.ok && t.kind === "photo" && !t.has_text && t.quality !== "low");
console.log("  count:", good.length);
console.log("  by service:", (() => { const c = {}; for (const [, t] of good) for (const s of t.services?.length ? t.services : ["(generic)"]) c[s] = (c[s] || 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1]); })());
