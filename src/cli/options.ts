import { pathToFileURL } from "bun";
import type { CSpellSettings, CSpellApplicationOptions } from "cspell";
import type { SimpleGit } from "simple-git";

import type { Opts } from "./types";

export async function makeOptions(
  git: SimpleGit,
  settings: CSpellSettings,
  options: Opts,
): Promise<CSpellApplicationOptions> {
  const root: string = await git.revparse(["--show-toplevel"]);
  return {
    // CSpell cache is not keyed on the config file, so disabling it prevents
    // stale results when the configuration changes.
    cache: false,
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
