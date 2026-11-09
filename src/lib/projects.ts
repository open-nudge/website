// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Projects from src/content/projects.yaml, in the order of the file, with
// everything derived from the name filled in: links, install commands, the
// MCP server command and the commands adding it to each agent.

import source from "../content/projects.yaml?raw";
import { site } from "../site.config.ts";
import { load } from "./content.ts";
import { projectsSchema, validateReferences } from "./project-schema.ts";

const entries = Object.entries(load(source, "src/content/projects.yaml", projectsSchema(site.groups)));
validateReferences(entries.map(([, data]) => data));

/** A project's repository: its own `repo`, else open-nudge/<name>. */
const repoOf = (name: string, repo?: string) => repo ?? `${site.links.github}/${name}`;

const trailingSlash = /\/$/;
const docsBase = site.projectDefaults.docsBase.replace(trailingSlash, "");
const pypiBase = site.projectDefaults.pypiBase.replace(trailingSlash, "");

/** Requirement a shell leaves alone (no `[extras]`, which zsh globs). */
const plainRequirement = /^[\w.-]+$/;

/** Quote a requirement only when a shell would mangle it. */
const quote = (requirement: string) =>
  plainRequirement.test(requirement) ? requirement : `"${requirement}"`;

/** Agents whose CLI adds an MCP server with `<cli> mcp add <name> -- <command>`,
 * in the order of the switch: agent (switch option) to its CLI. */
const agentClis = {
  claude: "claude",
  codex: "codex",
  opencode: "opencode",
  pi: "pi",
  antigravity: "agy",
} as const;

/** The commands adding a project's MCP server to each agent: the server's own
 * command from the second line on (indented, as its continued lines are). */
const mcpAdd = (name: string, mcp: string) =>
  Object.fromEntries(
    Object.entries(agentClis).map(([agent, cli]) => [agent, `${cli} mcp add ${name} -- \\\n  ${mcp}`]),
  ) as Record<keyof typeof agentClis, string>;

/** Visible projects, in the order of projects.yaml. */
export const projects = entries
  .filter(([, data]) => !data.hidden)
  .map(([name, data]) => {
    const from = `uvx --from ${quote(`${name}[mcp]`)}`;
    const mcp = data.mcp ? `${from} ${name} mcp` : undefined;
    // phones: the server's name on a line of its own
    const phoneMcp = data.mcp ? `${from} \\\n  ${name} mcp` : undefined;
    return {
      ...data,
      name,
      repo: repoOf(name, data.repo),
      docs: data.docs ?? `${docsBase}/${name}/`,
      pypi: data.pypi ?? (data.install ? `${pypiBase}/${name}/` : undefined),
      commands: data.install
        ? { uv: `uv add ${quote(data.install)}`, pip: `pip install ${quote(data.install)}` }
        : undefined,
      mcp,
      mcpAdd: mcp ? mcpAdd(name, mcp) : undefined,
      phoneMcp,
      phoneMcpAdd: phoneMcp ? mcpAdd(name, phoneMcp) : undefined,
    };
  });

export type Project = (typeof projects)[number];

/** Where a nudge's project reference points: the project on the page, else
 * (hidden or not in projects.yaml) its GitHub repository. */
export function projectLink(name: string) {
  if (projects.some((project) => project.name === name)) {
    return `#${name}`;
  }
  return repoOf(name, entries.find(([id]) => id === name)?.[1].repo);
}

/** Projects with an MCP server, shown in the agents section. */
export const agentReady = projects.filter((project) => project.mcp);

/** Groups from site.yaml that have at least one of the given projects. */
export function groupProjects(list: Project[]) {
  return Object.entries(site.groups)
    .map(([id, group]) => ({ id, ...group, projects: list.filter((project) => project.group === id) }))
    .filter((group) => group.projects.length > 0);
}
