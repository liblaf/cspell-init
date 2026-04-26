import base from "@liblaf/config/bunup";
import { defineConfig } from "bunup";
import type { DefineConfigItem } from "bunup";

export default defineConfig({
  ...base,
  entry: ["src/bin/cspell-init.ts"],
  target: "bun",
  sourceBase: "./src/",
  unused: {
    ignore: ["commander"],
  },
}) as DefineConfigItem;
