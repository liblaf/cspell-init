import type { Application } from "@stricli/core";
import { buildApplication } from "@stricli/core";
import { version } from "../../package.json";
import type { Context } from "./context";
import { main } from "./main";

export const app: Application<Context> = buildApplication(main, {
  name: "cspell-init",
  scanner: { caseStyle: "allow-kebab-for-camel" },
  versionInfo: { currentVersion: version },
});
