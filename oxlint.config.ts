import base from "@liblaf/config/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  options: {
    reportUnusedDisableDirectives: "warn",
    typeAware: true,
    typeCheck: true,
  },
});
