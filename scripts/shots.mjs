// Render a PNG of every step's final frame: node scripts/shots.mjs <outDir> [slideNumbers...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, getCompositions } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [outDir = "out/shots", ...only] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/remotion/index.ts") });
const comps = await getCompositions(serveUrl, { inputProps: {} });
for (const [i, c] of comps.entries()) {
  const n = i + 1;
  if (only.length && !only.includes(String(n))) continue;
  // FRAMES=10,20 overrides which frames are rendered
  const stops = process.env.FRAMES ? process.env.FRAMES.split(",").map(Number) : c.defaultProps.stops;
  for (const [k, f] of stops.entries()) {
    const comp = await selectComposition({ serveUrl, id: c.id, inputProps: c.defaultProps });
    const output = path.join(outDir, `${String(n).padStart(2, "0")}-${k + 1}.png`);
    await renderStill({ composition: comp, serveUrl, output, frame: f, inputProps: c.defaultProps, imageFormat: "png", scale: 0.5 });
    console.log(output);
  }
}
