// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

import { z } from "astro/zod";
import { validateMarkdown } from "./markdown.ts";
import { projectName } from "./project-schema.ts";

const destinationPattern = /^(https?:\/\/|mailto:|\/(?!\/)|#)/;
const destination = z
  .string()
  .refine(
    (value) => destinationPattern.test(value),
    "Expected an https URL, mailto link, site path or anchor",
  );
const siteSchema = z.strictObject({
  name: z.string(),
  url: z.url(),
  title: z.string(),
  description: z.string(),
  email: z.email(),
  ui: z.strictObject({
    github: z.string(),
    docs: z.string(),
    pypi: z.string(),
    tags: z.string(),
    installWith: z.string(),
    homeLabel: z.string(),
    githubLabel: z.string(),
    darkMode: z.string(),
    skip: z.string(),
    copy: z.string(),
    copyCommand: z.string(),
    shell: z.string(),
    copied: z.string(),
    copyFailed: z.string(),
    uv: z.string(),
    pip: z.string(),
    sections: z.string(),
    previous: z.string(),
    next: z.string(),
  }),
  hero: z.strictObject({
    title: z.string(),
    action: z.string(),
    motto: z.string(),
    lead: z.string(),
    points: z.array(z.string()),
    // phones fall back to `lead` and `points`
    phone: z
      .strictObject({
        lead: z.string().optional(),
        points: z.array(z.string()).optional(),
      })
      .optional(),
    spec: z
      .array(
        z.strictObject({
          key: z.string(),
          value: z.string(),
          note: z.string(),
        }),
      )
      .default([]),
  }),
  // Page sections: each is optional, and leaving one out drops the section,
  // its phone tab and the links to it.

  template: z
    .strictObject({
      tab: z.string(),
      eyebrow: z.string().optional(),
      action: z.string(),
      url: z.url(),
      text: z.string().optional(),
      // phones fall back to `text`
      phone: z.strictObject({ text: z.string().optional() }).optional(),
      verify: z
        .strictObject({
          title: z.string(),
          text: z.string(),
          command: z.string(),
          // phones fall back to `command`
          phoneCommand: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  agents: z
    .strictObject({
      tab: z.string(),
      title: z.string(),
      text: z.string(),
      // phones fall back to `text`
      phone: z.strictObject({ text: z.string().optional() }).optional(),
      note: z.string().optional(),
      commandLabel: z.string(),
      addLabel: z.string(),
      switchLabel: z.string(),
      clients: z.strictObject({
        claude: z.string(),
        codex: z.string(),
        opencode: z.string(),
        pi: z.string(),
        antigravity: z.string(),
      }),
    })
    .optional(),
  projects: z
    .strictObject({
      ships: z.string(),
      benefits: z.array(z.string()),
    })
    .optional(),
  nudgeSection: z
    .strictObject({
      tab: z.string(),
      title: z.string(),
      text: z.string(),
    })
    .optional(),
  groups: z.record(
    z.string().regex(/^[a-z][a-z0-9-]*$/),
    z.strictObject({ title: z.string(), tab: z.string(), text: z.string() }),
  ),
  links: z.strictObject({
    github: destination,
    source: destination,
    info: destination,
    home: destination,
    llms: destination,
    agents: destination,
  }),
  nudges: z
    .array(
      z.strictObject({
        title: z.string(),
        text: z.string(),
        // shown projects link to their card, others to their GitHub repository
        projects: z.array(z.string().regex(projectName)),
        link: z.strictObject({ href: destination, label: z.string() }).optional(),
      }),
    )
    .default([]),
  footer: z.strictObject({
    contact: z.string(),
    github: z.string(),
    agents: z.string(),
    llms: z.string(),
    mcp: z.string(),
    organization: z.string(),
    info: z.string(),
    source: z.string(),
    license: z.string(),
  }),
  notFound: z.strictObject({
    title: z.string(),
    code: z.string(),
    heading: z.string(),
    text: z.string(),
    action: z.string(),
  }),
  llms: z.strictObject({
    intro: z.string(),
    install: z.string(),
    or: z.string(),
    start: z.string(),
    mcp: z.string(),
    optional: z.string(),
    github: z.string(),
    githubText: z.string(),
    info: z.string(),
    infoText: z.string(),
    contact: z.string(),
  }),
  identity: z
    .strictObject({
      tab: z.string(),
      eyebrow: z.string().optional(),
      title: z.string(),
      values: z
        .array(
          z.strictObject({
            name: z.string(),
            text: z.string(),
          }),
        )
        .default([]),
      mission: z.string().optional(),
      vision: z.string().optional(),
    })
    .optional(),
  language: z.string(),
  projectDefaults: z.strictObject({
    docsBase: z.url(),
    pypiBase: z.url(),
    language: z.string(),
    license: z.url(),
    listTitle: z.string(),
  }),
});

// Only editorial prose is Markdown; controls, metadata and code stay literal.
const plainSections = new Set(["ui", "footer", "llms", "projectDefaults"]);
const inlineKeys = new Set(["title", "heading"]);
const blockKeys = new Set(["lead", "text", "note", "mission", "vision"]);

function validateField(value: string, path: string[]) {
  const field = path.join(".");
  // top-level metadata, labels, the 404 browser title and the hero spec sheet
  if (
    path.length < 2 ||
    plainSections.has(path[0] ?? "") ||
    field === "notFound.title" ||
    path[1] === "spec"
  ) {
    return;
  }
  const key = path.at(-1) ?? "";
  if (inlineKeys.has(key) || blockKeys.has(key)) {
    validateMarkdown(value, `src/content/site.yaml:${field}`, inlineKeys.has(key));
  }
}
function validateSiteProse(value: unknown, path: string[] = []): void {
  if (typeof value === "string") {
    validateField(value, path);
    return;
  }
  if (!value || typeof value !== "object") {
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    validateSiteProse(item, [...path, key]);
  }
}

export { siteSchema, validateSiteProse };
