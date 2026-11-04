// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0
import { z } from "astro/zod";
import { validateMarkdown } from "./markdown.ts";

const projectName = /^[a-z][a-z0-9.-]*$/;
const prose = z.string().superRefine((value, context) => {
  try {
    validateMarkdown(value, "projects.yaml");
  } catch (error) {
    context.addIssue({ code: "custom", message: String(error) });
  }
});

export const projectSchema = (groups: Record<string, unknown>) =>
  z.strictObject({
    description: prose,
    group: z.string().refine((group) => group in groups, "Unknown project group (see site.yaml groups)"),
    tags: z.array(z.string()).default([]),
    /** PyPI requirement, e.g. `lintkit[all]`. */
    install: z.string().optional(),
    /** Alternative to `install`: short numbered steps. */
    steps: z.array(prose).optional(),
    /** `<name> mcp` starts an MCP server (from the `[mcp]` extra). */
    mcp: z.boolean().default(false),
    featured: z.boolean().default(false),
    hidden: z.boolean().default(false),
    repo: z.url().optional(),
    docs: z.url().optional(),
    pypi: z.url().optional(),
  });

/** The whole of projects.yaml: project name -> project, in file order. */
export const projectsSchema = (groups: Record<string, unknown>) =>
  z.record(z.string().regex(projectName), projectSchema(groups));

export function validateReferences(
  projects: { id: string; hidden?: boolean; featured?: boolean }[],
  nudges: { projects: string[] }[],
) {
  const visible = projects.filter((project) => !project.hidden);
  if (visible.filter((project) => project.featured).length > 1) {
    throw new Error("projects.yaml: only one visible featured project is allowed");
  }
  for (const [index, nudge] of nudges.entries()) {
    for (const name of nudge.projects) {
      if (!visible.some((project) => project.id === name)) {
        throw new Error(`site.yaml:nudges.${index}.projects: unknown or hidden project "${name}"`);
      }
    }
  }
}
