#!/usr/bin/env bun

import process from "node:process";

import { program } from "@/src/cli/program";

await program.parseAsync(process.argv);
