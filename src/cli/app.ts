import { buildApplication } from "@stricli/core";
import { version } from "../../package.json";
import { main } from "./main";

export const app = buildApplication(main, {
  name: "cspell-init",
  versionInfo: { currentVersion: version },
});
