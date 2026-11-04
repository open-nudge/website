// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// `npm run check`: the content checks of the build, without building.
import { readFileSync } from "node:fs";
import { load } from "../src/lib/content.ts";
import { projectsSchema, validateReferences } from "../src/lib/project-schema.ts";
import { siteSchema, validateSiteProse } from "../src/lib/site-schema.ts";

const read = (filename: string) => readFileSync(filename, "utf8");

const site = load(read("src/content/site.yaml"), "src/content/site.yaml", siteSchema);
validateSiteProse(site);
const projects = load(
  read("src/content/projects.yaml"),
  "src/content/projects.yaml",
  projectsSchema(site.groups),
);
validateReferences(
  Object.entries(projects).map(([id, data]) => ({ id, ...data })),
  site.nudges,
);
