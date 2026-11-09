// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// /sitemap.xml: the site is one indexable page (404 is noindex).
import { site } from "../site.config.ts";

// the build date: the content only changes with a new build
const lastmod = new Date().toISOString().slice(0, 10);

export function GET() {
  const url = `<url><loc>${new URL(site.links.home, site.url)}</loc><lastmod>${lastmod}</lastmod></url>`;
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${url}</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
