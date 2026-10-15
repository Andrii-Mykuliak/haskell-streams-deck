import { loadFont as loadExo } from "@remotion/google-fonts/Exo2";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const exo = loadExo("normal", { weights: ["300", "400", "600", "800"], subsets: ["latin", "cyrillic"] });
const inter = loadInter("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin", "cyrillic", "greek"] });
const mono = loadMono("normal", { weights: ["400", "600", "700"], subsets: ["latin", "cyrillic", "greek"] });

// Exo 2 has no Greek, so λ, α, β, η in headings fall back to Inter.
export const F = {
  head: `${exo.fontFamily}, ${inter.fontFamily}, sans-serif`,
  body: `${inter.fontFamily}, Arial, sans-serif`,
  mono: `${mono.fontFamily}, monospace`,
};

// JetBrains Mono advance width is exactly 0.6em, used to place annotations under code columns.
export const CH = 0.6;

export const C = {
  bg: "#181c28",
  panel: "#212738",
  panel2: "#2a3146",
  line: "#39415a",
  text: "#f2f3f8",
  dim: "#9aa3ba",
  faint: "#5d6680",
  accent: "#8d76dc",
  accentHi: "#a994ff",
  pink: "#b25fa8",
  mint: "#86e0a8",
  blue: "#2474e2",
  red: "#ef6b6b",
  amber: "#f2c17d",
  orange: "#f59e72",
  lav: "#c4b5fd",
  kw: "#f38bbf",
  op: "#8b9bbf",
  comment: "#6f7a94",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;
