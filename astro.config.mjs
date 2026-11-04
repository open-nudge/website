// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import { parse } from "yaml";

export default defineConfig({
  site: parse(readFileSync(new URL("./src/content/site.yaml", import.meta.url), "utf8")).url,
  trailingSlash: "ignore",
  build: {
    // All CSS is inlined into the HTML (it is small): one request per page.
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
});
