import base from "@liblaf/config/bunup";
import { defineConfig } from "bunup";

export default defineConfig({
  ...base,
  entry: ["src/bin/cspell-init.ts"],
  target: "bun",
  sourceBase: "./src/",
});
