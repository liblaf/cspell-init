#!/usr/bin/env bun

import process from "node:process";

import { command } from "@/src/cli/command";

await command.parseAsync(process.argv);
