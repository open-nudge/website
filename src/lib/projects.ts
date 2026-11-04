// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Projects from src/content/projects.yaml, in the order of the file, with
// everything derived from the name filled in: links, install commands and
// the MCP server command.

import source from "../content/projects.yaml?raw";
import { site } from "../site.config.ts";
import { load } from "./content.ts";
import { projectsSchema, validateReferences } from "./project-schema.ts";

const entries = Object.entries(load(source, "src/content/projects.yaml", projectsSchema(site.groups)));
validateReferences(
  entries.map(([id, data]) => ({ id, ...data })),
  site.nudges,
);

const trailingSlash = /\/$/;
const docsBase = site.projectDefaults.docsBase.replace(trailingSlash, "");
const pypiBase = site.projectDefaults.pypiBase.replace(trailingSlash, "");

/** Requirement a shell leaves alone (no `[extras]`, which zsh globs). */
const plainRequirement = /^[\w.-]+$/;

/** Quote a requirement only when a shell would mangle it. */
const quote = (requirement: string) =>
  plainRequirement.test(requirement) ? requirement : `"${requirement}"`;

/** Visible projects, in the order of projects.yaml. */
export const projects = entries
  .filter(([, data]) => !data.hidden)
  .map(([name, data]) => ({
    ...data,
    name,
    repo: data.repo ?? `${site.links.github}/${name}`,
    docs: data.docs ?? `${docsBase}/${name}/`,
    pypi: data.pypi ?? (data.install ? `${pypiBase}/${name}/` : undefined),
    commands: data.install
      ? { uv: `uv add ${quote(data.install)}`, pip: `pip install ${quote(data.install)}` }
      : undefined,
    mcp: data.mcp ? `uvx --from ${quote(`${name}[mcp]`)} ${name} mcp` : undefined,
  }));

export type Project = (typeof projects)[number];

/** Groups from site.yaml that have at least one of the given projects. */
export function groupProjects(list: Project[]) {
  return Object.entries(site.groups)
    .map(([id, group]) => ({ id, ...group, projects: list.filter((project) => project.group === id) }))
    .filter((group) => group.projects.length > 0);
}
