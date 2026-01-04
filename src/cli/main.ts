import fs from "node:fs/promises";
import path from "node:path";
import type { Command } from "@stricli/core";
import { buildCommand } from "@stricli/core";
import { pathToFileURL } from "bun";
import type {
  CSpellApplicationOptions,
  CSpellReporter,
  CSpellSettings,
  Issue,
} from "cspell";
import { getDefaultReporter, lint } from "cspell";
import { GlobMatcher } from "cspell-glob";
import { type SimpleGit, simpleGit } from "simple-git";
import YAML from "yaml";
import { description } from "../../package.json";
import { CONFIG_HEADER, DEFAULT_SETTINGS } from "../constants";
import type { Context } from "./context";

type Flags = {
  exclude?: string[];
  saveConfig?: string;
  showPerfSummary?: boolean;
};

async function* filterIgnorePaths(
  git: SimpleGit,
  ignorePaths: string[],
): AsyncGenerator<string> {
  const files: string[] = (await git.raw(["ls-files", "-z"]))
    .split("\0")
    .filter(Boolean);
  for (const pattern of ignorePaths) {
    const matcher = new GlobMatcher([pattern], { mode: "exclude" });
    for (const file of files) {
      if (matcher.match(file)) {
        yield pattern;
        break;
      }
    }
  }
}

async function makeSettings(
  git: SimpleGit,
  flags: Flags,
): Promise<CSpellSettings> {
  const settings: CSpellSettings = { ...DEFAULT_SETTINGS };
  const ignorePaths: string[] = [".git/"];
  for await (const pattern of filterIgnorePaths(git, [
    ...(settings.ignorePaths as string[]),
    ...(flags.exclude || []),
  ]))
    ignorePaths.push(pattern);
  settings.ignorePaths = ignorePaths;
  return settings;
}

async function makeOptions(
  git: SimpleGit,
  settings: CSpellSettings,
  flags: Flags,
): Promise<CSpellApplicationOptions> {
  const root: string = await git.revparse(["--show-toplevel"]);
  return {
    cache: settings.cache?.useCache,
    cacheStrategy: settings.cache?.cacheStrategy,
    configSearch: false,
    continueOnError: true,
    defaultConfiguration: true,
    dot: settings.enableGlobDot,
    exclude: settings.ignorePaths as string[],
    failFast: false,
    gitignore: settings.useGitignore,
    ignoreRandomStrings: settings.ignoreRandomStrings,
    issues: true,
    issuesSummaryReport: true,
    maxFileSize: settings.maxFileSize as string,
    progress: true,
    relative: true,
    root,
    showPerfSummary: flags.showPerfSummary,
    silent: false,
    summary: true,
    unique: true,
    config: {
      settings,
      url: pathToFileURL(flags.saveConfig!),
    },
  };
}

async function saveConfig(
  file: string,
  params: { [key: string]: any },
): Promise<void> {
  const data: string = CONFIG_HEADER + YAML.stringify(params);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data);
}

export const main: Command<Context> = buildCommand({
  docs: { brief: description },
  async func(this: Context, flags: Flags): Promise<void> {
    const git: SimpleGit = simpleGit();
    const root: string = await git.revparse(["--show-toplevel"]);
    flags.saveConfig =
      flags.saveConfig ?? path.join(root, ".config", "cspell.config.yaml");
    await git.cwd(root);
    const settings: CSpellSettings = await makeSettings(git, flags);
    const options: CSpellApplicationOptions = await makeOptions(
      git,
      settings,
      flags,
    );
    const reporter: Required<CSpellReporter> = getDefaultReporter(
      { ...options, fileGlobs: ["."] },
      options,
    );
    const words: Set<string> = new Set();
    await lint(["."], options, {
      ...reporter,
      issue(issue: Issue): void {
        reporter.issue(issue);
        words.add(issue.text.toLowerCase());
      },
    });
    settings.words = Array.from(words).sort();
    await saveConfig(flags.saveConfig, settings);
  },
  parameters: {
    flags: {
      exclude: {
        kind: "parsed",
        parse: String,
        brief: "",
        optional: true,
        variadic: true,
      },
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
    aliases: {
      e: "exclude",
    },
  },
});
