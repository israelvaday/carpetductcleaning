import { execSync } from "node:child_process";
const old = JSON.parse(execSync("git show HEAD:content/image-map.json").toString().replace(/^﻿/, ""));
for (const a of old.assets) console.log(`${a.key} | ${a.src} | ${a.alt}`);
