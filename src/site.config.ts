// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Import raw content through Vite so saving YAML refreshes the local preview.
import source from "./content/site.yaml?raw";
import { load } from "./lib/content.ts";
import { siteSchema, validateSiteProse } from "./lib/site-schema.ts";

const content = load(source, "src/content/site.yaml", siteSchema);
validateSiteProse(content);
export const site = content;
