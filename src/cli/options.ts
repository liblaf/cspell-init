import { pathToFileURL } from "bun";
import type { CSpellSettings, CSpellApplicationOptions } from "cspell";
import type { SimpleGit } from "simple-git";

import type { Options } from "./types";

export async function makeOptions(
  git: SimpleGit,
  settings: CSpellSettings,
  options: Options,
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
    showPerfSummary: options.showPerfSummary,
    silent: false,
    summary: true,
    unique: true,
    config: {
      settings,
      url: pathToFileURL(options.saveConfig!),
    },
  };
}
