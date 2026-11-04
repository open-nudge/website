// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

import { z } from "astro/zod";
import { validateMarkdown } from "./markdown.ts";

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
    copied: z.string(),
    copyFailed: z.string(),
    uv: z.string(),
    pip: z.string(),
  }),
  hero: z.strictObject({
    title: z.string(),
    action: z.string(),
    motto: z.string(),
    lead: z.string(),
    points: z.array(z.string()),
    spec: z.array(
      z.strictObject({
        key: z.string(),
        value: z.string(),
        note: z.string(),
      }),
    ),
  }),
  template: z.strictObject({
    eyebrow: z.string(),
    action: z.string(),
    url: z.url(),
    text: z.string(),
    features: z.array(
      z.strictObject({
        title: z.string(),
        text: z.string(),
      }),
    ),
    verify: z.strictObject({
      title: z.string(),
      text: z.string(),
      command: z.string(),
    }),
  }),
  agents: z.strictObject({
    eyebrow: z.string(),
    title: z.string(),
    text: z.string(),
    note: z.string(),
    commandLabel: z.string(),
    configLabel: z.string(),
  }),
  projects: z.strictObject({
    label: z.string(),
    ships: z.string(),
    benefits: z.array(z.string()),
  }),
  nudgeSection: z.strictObject({
    title: z.string(),
    text: z.string(),
  }),
  groups: z.record(
    z.string().regex(/^[a-z][a-z0-9-]*$/),
    z.strictObject({ title: z.string(), text: z.string() }),
  ),
  links: z.strictObject({
    github: destination,
    source: destination,
    info: destination,
    home: destination,
    llms: destination,
    agents: destination,
  }),
  nudges: z.array(
    z.strictObject({
      title: z.string(),
      text: z.string(),
      projects: z.array(z.string()),
      link: z.strictObject({ href: destination, label: z.string() }).optional(),
    }),
  ),
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
  identity: z.strictObject({
    eyebrow: z.string(),
    title: z.string(),
    values: z.array(
      z.strictObject({
        name: z.string(),
        text: z.string(),
      }),
    ),
    mission: z.string(),
    vision: z.string(),
  }),
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
