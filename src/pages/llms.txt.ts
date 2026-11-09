// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

import type { APIRoute } from "astro";
// /llms.txt: a plain-text map of the site for AI agents (https://llmstxt.org).
// Generated from projects.yaml and site.config.ts, so it never goes stale.
import { plainText } from "../lib/markdown.ts";
import { groupProjects, type Project, projects } from "../lib/projects.ts";
import { site } from "../site.config.ts";

/** How to start with a project: its install commands, else its first steps. */
const start = (project: Project) => {
  if (project.commands) {
    return ` ${site.llms.install}: \`${project.commands.uv}\` ${site.llms.or} \`${project.commands.pip}\`.`;
  }
  return project.steps ? ` ${site.llms.start}: ${project.steps.map(plainText).join("; ")}.` : "";
};

export const GET: APIRoute = () => {
  const lines: string[] = [`# ${site.name}`, "", `> ${site.description}`, "", site.llms.intro, ""];

  for (const group of groupProjects(projects)) {
    lines.push(`## ${plainText(group.title)}`, "");
    for (const project of group.projects) {
      const mcp = project.mcp ? ` ${site.llms.mcp}: \`${project.mcp}\`.` : "";
      lines.push(
        `- [${project.name}](${project.docs}): ${plainText(project.description)}${start(project)}${mcp}`,
      );
    }
    lines.push("");
  }

  lines.push(
    `## ${site.llms.optional}`,
    "",
    `- [${site.llms.github}](${site.links.github}): ${site.llms.githubText}`,
    `- [${site.llms.info}](${site.links.info}): ${site.llms.infoText}`,
    `- ${site.llms.contact}: ${site.email}`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
