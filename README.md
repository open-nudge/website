<!--
SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
SPDX-License-Identifier: Apache-2.0
-->

# opennudge.com

Source of [opennudge.com](https://opennudge.com), the home of
[opennudge](https://github.com/open-nudge): developer-first open source tooling
for supply chain security and AI agents.

The site is a small static website built with [Astro](https://astro.build) and
published to GitHub Pages on every push to `main`.

- **No JavaScript framework**: plain HTML and CSS, under 2 KB of JS per page
  (theme switch, uv/pip tabs, copy buttons).
- **No trackers, cookies, third-party requests or web fonts** (system fonts
  only). The home page is about 18 KB gzipped, everything included.
- **Grayscale, light and dark**: color appears only in highlighted code.
- **Content is data**: projects live in one YAML file, site text in one YAML
  file with Markdown prose.
- **Agent-friendly**: [`/llms.txt`](https://opennudge.com/llms.txt) is a plain
  text map of the site, generated from the same data.

## Quick start

Requires Node.js 22.12 or newer.

```sh
npm run setup   # install the exact dependency versions and the git hooks
npm run dev     # live preview at http://localhost:4321
```

[CONTRIBUTING.md](CONTRIBUTING.md) explains how the site is organized, how to
change it, and how it is checked and deployed. [BRAND.md](BRAND.md) describes
how it should look and sound.

## Found a problem?

Open an [issue](https://github.com/open-nudge/website/issues) or send a pull
request. For anything about the opennudge projects themselves, use their own
repositories.

## License

Code and content: [Apache-2.0](LICENSE). The opennudge name, logo, icons and
social image are not: they are © open-nudge, all rights reserved
([LicenseRef-opennudge-brand](LICENSES/LicenseRef-opennudge-brand.txt)); see
[BRAND.md](BRAND.md#using-the-logo) for how they may be used. Every file states
its license ([REUSE](https://reuse.software)).
