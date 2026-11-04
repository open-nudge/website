// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// /sitemap.xml: the site is one indexable page (404 is noindex).
import { site } from "../site.config.ts";

const pages = ["/"];

export function GET() {
  const urls = pages.map((path) => `<url><loc>${new URL(path, site.url)}</loc></url>`).join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
