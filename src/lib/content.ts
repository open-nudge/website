// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

import type { z } from "astro/zod";
import { parseDocument } from "yaml";

export function parseYaml(source: string, filename: string): unknown {
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length > 0) {
    throw new Error(`${filename}: ${document.errors.map((error) => error.message).join("\n")}`);
  }
  return document.toJS();
}

/** Parse and validate a YAML file; errors name the file and the field. */
export function load<T>(source: string, filename: string, schema: z.ZodType<T>): T {
  const result = schema.safeParse(parseYaml(source, filename));
  if (!result.success) {
    throw new Error(
      `${filename}:\n${result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")}`,
    );
  }
  return result.data;
}
