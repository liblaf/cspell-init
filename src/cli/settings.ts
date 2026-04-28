import type { CSpellSettings } from "cspell";
import { GlobMatcher } from "cspell-glob";
import type { SimpleGit } from "simple-git";

import type { Opts } from "./types";

const DEFAULT_IGNORE_PATHS: string[] = [
  // CSpell
  ".cspell.*",
  "cspell.*",
  // generated files
  "CHANGELOG.md",
  // lock files
  "*-lock.*",
  "*.lock",
  "go.sum",
  // 3D models
  "*.msh",
  "*.obj",
  "*.ply",
  "*.series",
  "*.stl",
  "*.vti",
  "*.vtm",
  "*.vtp",
  "*.vtr",
  "*.vts",
  "*.vtu",
];

const DEFAULT_SETTINGS: CSpellSettings = {
  $schema:
    "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-types/cspell.schema.json",
  allowCompoundWords: true,
  cache: {
    useCache: true,
  },
  enableGlobDot: true,
  ignorePaths: [".git/"],
  ignoreRandomStrings: true,
  maxFileSize: "32KB",
  useGitignore: true,
};

export async function* filterIgnorePaths(
  git: SimpleGit,
  ignorePaths: string[],
): AsyncGenerator<string> {
  const files: string[] = (await git.raw(["ls-files", "-z"])).split("\0").filter(Boolean);
  for (const pattern of ignorePaths) {
    const matcher = new GlobMatcher(pattern);
    for (const file of files) {
      if (matcher.match(file)) {
        yield pattern;
        break;
      }
    }
  }
}

export async function makeSettings(git: SimpleGit, options: Opts): Promise<CSpellSettings> {
  const settings: CSpellSettings = { ...DEFAULT_SETTINGS };
  for await (const pattern of filterIgnorePaths(git, [
    ...DEFAULT_IGNORE_PATHS,
    ...(options.exclude ?? []),
  ]))
    settings.ignorePaths!.push(pattern);
  return settings;
}
