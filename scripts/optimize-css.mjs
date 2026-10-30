// Shrinks the built stylesheet after `next build`: rules whose classes appear nowhere in the
// exported pages or scripts are dropped (PurgeCSS), and overridden or repeated declarations are
// merged (csso). globals.css grew by appending override blocks, so much of it is dead weight.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PurgeCSS } from "purgecss";
import { minify } from "csso";

const out = resolve(dirname(fileURLToPath(import.meta.url)), "..", "out");
const cssDir = join(out, "_next", "static", "css");

async function files(dir, test) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await files(path, test)));
    else if (test(entry.name)) found.push(path);
  }
  return found;
}

const content = [
  ...(await files(out, (name) => name.endsWith(".html"))),
  ...(await files(join(out, "_next", "static", "chunks"), (name) => name.endsWith(".js"))),
];

for (const css of await files(cssDir, (name) => name.endsWith(".css"))) {
  const before = (await readFile(css, "utf8")).length;
  const [purged] = await new PurgeCSS().purge({
    content,
    css: [css],
    // Classes built at run time from pieces ("wz-tile-" + name, "av-emo-" + mood…) and state classes.
    safelist: {
      standard: [/^(html|body|:root)$/],
      greedy: [/^av-/, /^wz-tile/, /^profile-icon/, /^lesson-icon/, /^scene-art/, /^theme-/, /^level-/, /^status-/, /^is-/, /^has-/, /data-theme/, /^sg-/, /^cr-/, /^dict-/, /^gauge/, /^usage-/, /^voice-/, /^vipack/],
    },
    keyframes: false,
    fontFace: false,
    variables: false,
  });
  const optimized = minify(purged.css, { restructure: true }).css;
  await writeFile(css, optimized);
  console.log(`${css.split(/[\\/]/).pop()}: ${Math.round(before / 1024)} KB → ${Math.round(optimized.length / 1024)} KB`);
}
