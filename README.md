<!--
SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
SPDX-License-Identifier: Apache-2.0
-->

# opennudge.com

<!-- enq: badge alt texts are labels, not prose -->

<!-- vale off -->

<!-- enq: badge markup contains generated URLs that cannot fit the line limit -->

<!-- pyml disable-num-lines 15 line-length-->

<div align="center">

<a href="https://github.com/open-nudge/website/releases">![Release](https://img.shields.io/github/v/release/open-nudge/website?style=for-the-badge&label=release&labelColor=grey&color=blue)
</a>
<a href="https://www.typescriptlang.org">![TypeScript Version](https://img.shields.io/github/package-json/dependency-version/open-nudge/website/dev/typescript?style=for-the-badge&label=typescript&labelColor=grey&color=blue)
</a>
<a href="https://astro.build">![Astro Version](https://img.shields.io/github/package-json/dependency-version/open-nudge/website/astro?style=for-the-badge&label=astro&labelColor=grey&color=blue)
</a>
<a href="https://scorecard.dev/viewer/?uri=github.com/open-nudge/website">![OSSF-Scorecard Score](https://img.shields.io/ossf-scorecard/github.com/open-nudge/website?style=for-the-badge&label=OSSF)
</a>

</div>

<!-- enq: prose checks resume after the badges -->

<!-- vale on -->

Source of [opennudge.com](https://opennudge.com), the home of
[opennudge](https://github.com/open-nudge): developer-first open source tooling
for supply chain security and AI agents.

The site is a small static website built with [Astro](https://astro.build) and
published to GitHub Pages on every push to `main`. Each deployment is released
as the next version (`vX.Y.Z`, from the conventional commits since the last
one).

- **No JavaScript framework**: plain HTML and CSS, under 2 KB of JS per page
  (theme switch, uv/pip tabs, copy buttons).
- **No trackers, cookies, third-party requests or web fonts** (system fonts
  only). The home page is about 18 KB gzipped, everything included.
- **Chrome iOS greys, light and dark**: the page matches the browser bars on an
  iPhone; color appears only in highlighted code.
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
change it, and how it is checked and deployed.

## Found a problem?

Open an [issue](https://github.com/open-nudge/website/issues) or send a pull
request. For anything about the opennudge projects themselves, use their own
repositories.

## License

Code and content: [Apache-2.0](LICENSE). The opennudge name, logo, icons and
social image are not: they are © open-nudge, all rights reserved
([LicenseRef-opennudge-brand](LICENSES/LicenseRef-opennudge-brand.txt)). Every
file states its license ([REUSE](https://reuse.software)).
