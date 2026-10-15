import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from /<repo>/
  base: process.env.GITHUB_ACTIONS ? "/haskell-streams-deck/" : "/",
});
