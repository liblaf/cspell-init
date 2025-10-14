import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/index.ts", "src/bin/cspell-init.ts"],
  format: ["esm"],
  minify: true,
  dts: true,
  target: "bun",
  sourcemap: "linked",
  exports: true,
  unused: true,
});
