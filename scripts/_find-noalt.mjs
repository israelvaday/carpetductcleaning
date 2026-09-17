import { readFileSync } from "node:fs";
for (const page of ["out/blog/index.html", "out/contact/index.html"]) {
  const html = readFileSync(page, "utf8");
  const re = /<img[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const alt = tag.match(/alt="([^"]*)"/);
    if (!alt || !alt[1].trim()) {
      const src = tag.match(/src="([^"]*)"/)?.[1];
      console.log(`${page}: ${src}`);
    }
  }
}
