import fs from "node:fs/promises";
import path from "node:path";
import type { Command } from "@stricli/core";
import { buildCommand } from "@stricli/core";
import type { CSpellApplicationOptions, CSpellReporter, Issue } from "cspell";
import { getDefaultReporter, lint } from "cspell";
import { $ } from "execa";
import YAML from "yaml";
import { description } from "../../package.json";
import {
  CONFIG_HEADER,
  DEFAULT_IGNORE_EXTEND,
  DEFAULT_SETTINGS,
} from "../constants";
import type { Context } from "./context";

async function saveConfig(
  file: string,
  params: { [key: string]: any },
): Promise<void> {
  const data = CONFIG_HEADER + YAML.stringify(params);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data);
}

async function gitRoot(): Promise<string> {
  const { stdout } = await $({
    stderr: "inherit",
  })`git rev-parse --show-toplevel`;
  return stdout.trim();
}

type Flags = {
  readonly saveConfig?: string;
  readonly showPerfSummary?: boolean;
};

export const main: Command<Context> = buildCommand({
  docs: { brief: description },
  async func(this: Context, flags: Flags): Promise<void> {
    const root: string = await gitRoot();
    const options: CSpellApplicationOptions = {
      cache: true,
      cacheStrategy: "content",
      configSearch: false,
      continueOnError: true,
      defaultConfiguration: true,
      dot: true,
      exclude: DEFAULT_IGNORE_EXTEND,
      failFast: false,
      gitignore: true,
      ignoreRandomStrings: true,
      issues: true,
      issuesSummaryReport: true,
      progress: true,
      relative: true,
      root,
      showPerfSummary: flags.showPerfSummary,
      silent: false,
      summary: true,
      unique: true,
      config: {
        settings: DEFAULT_SETTINGS,
        url: new URL("https://github.com/liblaf/cspell-init"),
      },
    };
    const reporter: Required<CSpellReporter> = getDefaultReporter(
      { ...options, fileGlobs: ["."] },
      options,
    );
    const words = new Set();

    await lint(["."], options, {
      ...reporter,
      issue(issue: Issue): void {
        reporter.issue(issue);
        words.add(issue.text.toLowerCase());
      },
    });

    const file =
      flags.saveConfig ?? path.join(root, ".config", "cspell.config.yaml");
    await saveConfig(file, {
      ...DEFAULT_SETTINGS,
      words: Array.from(words).sort(),
    });
  },
  parameters: {
    flags: {
      saveConfig: {
        kind: "parsed",
        parse: String,
        brief: "",
        optional: true,
      },
      showPerfSummary: {
        kind: "boolean",
        brief: "",
        optional: true,
      },
    },
  },
});
