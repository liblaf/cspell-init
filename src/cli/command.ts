import path from "node:path";

import { Command } from "@commander-js/extra-typings";
import type { CSpellApplicationOptions, CSpellReporter, CSpellSettings, Issue } from "cspell";
import { getDefaultReporter, lint } from "cspell";
import { simpleGit } from "simple-git";
import type { SimpleGit } from "simple-git";

import { description, version } from "@/package.json";

import { saveConfig } from "./config-file";
import { makeOptions } from "./options";
import { makeSettings } from "./settings";
import type { Options } from "./types";

export const command: Command<[], Options> = new Command()
  .name("cspell-init")
  .description(description)
  .version(version)
  .option("-e, --exclude <pattern...>")
  .option("-s, --save-config <file>")
  .option("--show-perf-summary")
  .option("--no-show-perf-summary")
  .action(async (options: Options): Promise<void> => {
    const git: SimpleGit = simpleGit();
    const root: string = await git.revparse(["--show-toplevel"]);
    process.chdir(root);
    await git.cwd(root);
    const settings: CSpellSettings = await makeSettings(git, options);
    const cSpellOptions: CSpellApplicationOptions = await makeOptions(git, settings, options);
    // cspell does not respect global gitignore, so we need to get the list of files ourselves.
    const files: string[] = (
      await git.raw(["ls-files", "--cached", "--others", "-z", "--exclude-standard"])
    )
      .split("\0")
      .filter(Boolean);
    const reporter: Required<CSpellReporter> = getDefaultReporter(
      { ...cSpellOptions, fileGlobs: files },
      cSpellOptions,
    );
    const words: Set<string> = new Set();
    await lint(files, cSpellOptions, {
      ...reporter,
      issue(issue: Issue): void {
        reporter.issue(issue);
        words.add(issue.text.toLowerCase());
      },
    });
    settings.words = Array.from(words).sort();
    await saveConfig(
      options.saveConfig ?? path.join(root, ".config", "cspell.config.yaml"),
      settings,
    );
  });
