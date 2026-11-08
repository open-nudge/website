<!--
SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
SPDX-License-Identifier: Apache-2.0
-->

# Contributing

How to run, change, check and deploy opennudge.com. Most changes touch a single
file: projects live in `src/content/projects.yaml` and site text in
`src/content/site.yaml`.

## Run it locally

Requires Node.js 22.12+ (CI uses the version in `.nvmrc`).

```sh
npm run setup     # npm ci (exact versions from package-lock.json) + git hooks
npm run dev       # live preview at http://localhost:4321 (reloads on save)
npm run check     # type + content check (CI runs this too)
npm run build     # production build into dist/
npm run preview   # serve dist/ locally, exactly as it will be deployed
npm run fix       # every check below, on every file
```

Nothing is sent anywhere while you work: the npm scripts turn off Astro's
telemetry and update check (`astro.env`), and `.npmrc` turns off npm's update
check. Run other Astro commands as `npm run astro -- <command>`; a bare
`npx astro` skips `astro.env`.

## Everyday edits

| I want to…                      | Edit                                 |
| ------------------------------- | ------------------------------------ |
| change hero text, links, email  | `src/content/site.yaml`              |
| edit the "how we nudge" section | `src/content/site.yaml` (`nudges`)   |
| add, hide or reorder a project  | `src/content/projects.yaml`          |
| add or rename a project group   | `src/content/site.yaml` (`groups`)   |
| change colors / spacing         | `src/styles/global.css` (tokens)     |
| change code highlighting        | `src/lib/code.ts`                    |
| replace the logo                | `src/assets/brand/`, `public/brand/` |

A mistake in `projects.yaml` fails `npm run check` / `npm run build` with a
message that names the file and field, so mistakes never reach the live site. A
nudge's project jumps to its card on the page; a project that isn't shown
(hidden, or not in `projects.yaml`) links to `github.com/open-nudge/<name>`.

### Edit website text

All shared copy lives in `src/content/site.yaml`, organized in page order.
Project descriptions, tags and setup steps live in `src/content/projects.yaml`.
Edit these two files, save, and check the result with `npm run dev`.

Prose fields support Markdown: `lead`, `text`, `note` (except hero spec notes),
`mission`, `vision`, project `description`, and each setup step. Visible section
and feature titles support inline emphasis and code. The 404 heading supports
these too; its browser title stays plain text.

```yaml
hero:
  lead: |-
    Switch on our tools (**one command!**) and:

    - ship faster with full confidence
    - keep your agents productive
```

Use `|-` for multiline Markdown. A blank line starts a paragraph. A single
newline wraps the source without adding a visible break; put a backslash at its
end when you need a visible line break. Use `>-` for long prose that should fold
into one paragraph. Indent content with spaces, never tabs.

```yaml
text: >-
  Use **bold**, *emphasis*, `inline code`, and
  [a link to lintkit](#lintkit).
steps:
  - |-
    Run `uv run poe setup`.

    Then review the generated files.
```

For a numbered list inside prose, use `1.`, `2.`, and so on. For literal
multiline commands use `|-` without Markdown fences; `template.verify.command`
is already displayed as a code block. Raw HTML in prose is rejected: use
Markdown links and formatting instead.

Labels, tags, button text, hero spec cells, value names, URLs, browser metadata,
commands, and accessibility text are plain strings. `llms.intro` is literal
Markdown for the generated text file. Headings cannot contain links or images.
Section order and layout remain in the components; list items and project
ordering are controlled by YAML. Preserve the existing IDs when other content
links to them.

Phones (up to 40rem wide) show a shorter page: `hero.phone` replaces the hero's
`lead` and `points`, `template.phone.text` and `agents.phone.text` replace
`template.text` and `agents.text`, `template.verify.phoneCommand` replaces the
verify command (keep its lines within 39 characters), the featured project's
`phone.steps` and `phone.tags` (projects.yaml) replace its `steps` and `tags`,
and the sections become tabs labeled by each section's `tab` (groups included).
Without these keys, phones show the desktop text. `agents.note` and the
`projects` line are not shown on phones, and the MCP commands are split over
more lines there.

Page sections are optional: delete `template`, `agents`, `projects` (the line
under the project groups), `nudgeSection` or `identity` to drop that section,
its tab on phones and the links to it. Eyebrows, `template.text`,
`template.verify`, `agents.note`, `identity.mission` and `identity.vision` can
be left out too.

`links` controls shared destinations. `projectDefaults` controls derived project
URLs and structured-data defaults; individual projects can override their URLs.
Change `url` to update canonical URLs, the sitemap and robots sitemap link.
Restart the preview server after changing this site-wide URL.

Run `npm run check` before publishing. It reports YAML syntax, field names,
types, missing values, unsupported HTML, unknown groups, hidden project
references, and multiple visible featured projects. `npm run build` repeats
content validation. `npm test` checks the Markdown and validation behavior.
Neither YAML nor the Markdown parser is downloaded by visitors.

### Add a project

Add an entry to `src/content/projects.yaml`; the key is the project name and the
order of the file is the order on the page:

```yaml
newtool:
  description: "One sentence from the README."
  group: "linters"  # linters | automation | pytorch (groups: src/content/site.yaml)
  tags:
    - "CLI"
    - "pre-commit hook"
  install: "newtool[all]"  # shown as `uv add` / `pip install`
  mcp: true  # optional: `newtool mcp` starts an MCP server ("agent-ready")
```

GitHub, docs and PyPI links follow from the name
(`github.com/open-nudge/newtool`, `open-nudge.github.io/newtool/`,
`pypi.org/project/newtool/`); set `repo`, `docs` or `pypi` only when they
differ. `hidden: true` keeps a project in the file but off the website. The
header of `projects.yaml` lists every field; a misspelled field fails the build.

The home page, `llms.txt`, the "agent-ready" section and the structured data for
search engines update automatically. Visitors pick uv (default) or pip on any
card; the choice applies to every card and is remembered.

## Checks

`npm run setup` installs the git hooks ([prek](https://prek.j178.dev),
configured in `prek.toml`): the same checks as every opennudge repository. Each
commit checks the files it changes, `npm run fix` checks every file. Fixers
(formatting, license headers, spelling) change files in place: review their
changes, stage them and commit again.

- **JS, TS, Astro, CSS, JSON**: Biome (`biome.jsonc`) formats, sorts imports and
  lints with every rule on (`npm run fix:js` runs it alone). Exceptions are
  explained in the config or next to the code (`biome-ignore <rule>: <why>`).
- **Types and content**: `astro check` and the build.
- **YAML**: yamllint (`.yamllint.yml`): `---` and `...`, double-quoted strings,
  block lists.
- **Markdown**: mdformat (wraps at 80 columns), pymarkdown, lychee (dead links),
  Vale (prose, `.vale.ini`) and codespell (spelling, every file).
- **Licensing**: an SPDX header on every file (REUSE, added by a hook; files
  without comments, like JSON, get a `.license` file next to them) and allowed
  licenses of npm dependencies (`npm run check:licenses`).
- **Security**: trufflehog (secrets), semgrep (code), zizmor and actionlint
  (workflows), `npm audit` (advisories and registry signatures).
- **Commits**: messages start with `feat:` or `fix:`; every commit is signed off
  and GPG signed (`git commit -s -S`, see [DCO.md](DCO.md)), checked before
  push. Commits to `main` go through pull requests.

No rule is turned off silently: an `enq:` comment above `yamllint disable` or
`<!-- vale ... -->` says why (checked by noqaexplain).

The first run downloads and builds every tool, which takes a few minutes. Their
versions are pinned in `prek.toml`; a hook updates them (`npm run update:hooks`)
once a release is 7 days old.

## Project layout

```text
src/
  site.config.ts         validated loader for site.yaml
  content/site.yaml     site text, Markdown and links
  content/projects.yaml  open source projects
  pages/                 one file per route: index, 404, llms.txt, robots.txt,
                         sitemap.xml
  components/            header, footer, project cards, terminal, code block,
                         logo, theme switch
  layouts/Base.astro     <head>, header and footer shared by every page
  lib/code.ts            code highlighting (Kanagawa) and shared icons
  lib/projects.ts        validated loader for projects.yaml + derived links
  scripts/copy.ts        copy buttons
  styles/global.css      design tokens (grays, light-dark()) and base styles
  assets/brand/          logo SVGs (inlined, follow the theme)
public/                  copied as-is: favicons, og.png, brand files
.github/                 workflows (deploy, pull request checks, Harden),
                         rulesets, Dependabot, labeler, tools/licenses.ts,
                         tools/harden/ (repository settings scripts)
LICENSES/, REUSE.toml    licenses of every file (brand assets: not Apache-2.0)
prek.toml, biome.jsonc   checks (and the configuration files they point to)
```

## Conventions

- **Follow the design**: Chrome iOS greys, no accent color, system fonts,
  lowercase display headings, the 2 px "nudge" as the only movement, everything
  off for reduced motion.
- **Keep it light**: no JavaScript frameworks, no client-side router, no
  third-party requests (fonts, analytics, CDNs). Scripts are small and the site
  still works without them.
- **Accessible**: real links and buttons, `aria-*` where state changes, and
  contrast of at least 4.5:1 for text.
- **New files** start with the SPDX header used everywhere else (a hook adds
  it); `.editorconfig` and Biome set the formatting. Docs and comments are in US
  English.
- **Dependencies** are pinned to exact versions
  (`npm install --save-exact <package>`) and committed with `package-lock.json`.
  Add one only when the site cannot reasonably do without it.

## Pull requests

1. Fork the repository, create a branch and run `npm run setup`.
1. Make your change; preview it with `npm run dev`, in light and dark mode and
   at mobile width.
1. Commit with `git commit -s -S -m "fix: <what changed>"`; the checks run on
   the commit.
1. Open a pull request titled like a commit (`fix: <what changed>`) that says
   what changed and why (a screenshot helps for visual changes). Pull requests
   are squash merged: the title becomes the commit on `main`.

CI runs on every pull request:

- **Build**: type check and build (`deploy.yml`).
- **Pull Request**: the title starts with `feat:` or `fix:` (no scope, lowercase
  subject).
- **Policy**: every commit is signed off, GPG signed and spelled correctly
  (conform, `.conform.yaml`).
- **Security Secrets**: trufflehog (verified secrets in the history).
- **Security zizmor**: workflow audit, when workflows change.
- **CodeQL**: code scanning (GitHub default setup, once the repository is
  public).

Pull requests are labeled by changed paths and title (`.github/label-*.yml`);
ones without new commits are marked stale after 14 days and closed after 28.

## Deployment

`.github/workflows/deploy.yml` checks and builds every push and pull request.
Pushes to `main` are then deployed to GitHub Pages, which serves the site at
https://opennudge.com.

To run your own copy:

1. Fork the repository and set _Settings → Pages → Source_ to _GitHub Actions_.
1. Set `url` in `src/content/site.yaml` to your site address.
1. Replace the opennudge logo, icons and social image (`src/assets/brand/`,
   `public/brand/`, `public/favicon.*`, `public/apple-touch-icon.png`,
   `public/og.png`): they are not licensed under Apache-2.0 (see
   [LicenseRef-opennudge-brand](LICENSES/LicenseRef-opennudge-brand.txt)).
1. Optionally add a custom domain under _Settings → Pages → Custom domain_ (see
   [GitHub's guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).

## Repository settings

The scripts in `.github/tools/harden/` apply the repository settings once the
repository is public, either locally or through `.github/workflows/harden.yml`:
squash merges only (pull request title as the commit), the rulesets in
`.github/rulesets/` (signed commits, no force pushes, pull requests and the
checks above required on `main`, no tags), GitHub Pages with the custom domain,
deployments from `main` only, secret scanning with push protection, Dependabot
alerts and security updates, private vulnerability reporting and CodeQL. Every
script can be run again (for example when someone joins as a maintainer).

Merge the initial work into `main` first: the pull request checks run from
`main` (`pull_request_target`), so once the rulesets require them, a pull
request introducing them can't pass.

### Locally

Install Bash, the [GitHub CLI](https://cli.github.com) (`gh`) and `jq`, log in
as an administrator of the repository (`gh auth login`) and run the scripts from
the repository root. `gh` resolves the repository from the checkout, set
`GH_REPO=owner/repo` to target another one.

| Script                               | Purpose                               |
| ------------------------------------ | ------------------------------------- |
| `settings.sh`                        | Squash merges, sign-off, homepage     |
| `pages.sh`                           | Pages via Actions, custom domain      |
| `pages-https.sh`                     | Enforce HTTPS (needs the certificate) |
| `pages-main.sh`                      | Pages deployments from `main` only    |
| `vulnerability-alerts.sh`            | Dependabot alerts and updates         |
| `private-vulnerability-reporting.sh` | Private vulnerability reporting       |
| `security.sh`                        | Secret scanning and push protection   |
| `codeql.sh`                          | CodeQL default setup                  |
| `rulesets.sh`                        | Rulesets, updated in place by name    |

```sh
./.github/tools/harden.sh 0
```

`harden.sh` runs every script (rulesets last, afterwards `main` accepts changes
through pull requests only), then the Security Scorecard. Pass `0` required
approvals when working solo, `1` for two contributors and `2` for more; single
scripts can be run on their own, e.g. `pages-https.sh` once the certificate is
issued.

### Workflow

1. Create a
   [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new):
   resource owner `open-nudge`, only the `open-nudge/website` repository,
   expiring the next day, repository permissions _Administration_ and _Pages_:
   read and write.
1. Add it as the `HARDEN_GITHUB_TOKEN` repository secret (_Settings → Secrets
   and variables → Actions_).
1. Run the _Harden_ workflow from `main` (_Actions → Harden → Run workflow_) and
   choose the number of contributors: 1 (no approvals), 2 (one approval) or 3+
   (two approvals).
1. Delete the `HARDEN_GITHUB_TOKEN` secret.

### By hand

Point the DNS of `opennudge.com` to GitHub Pages,
[verify the domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
for the organization (prevents domain takeovers) and, optionally, install the
[StepSecurity app](https://github.com/apps/stepsecurity-actions-security)
(harden-runner insights). If enforcing HTTPS failed (no certificate yet), tick
_Enforce HTTPS_ in _Settings → Pages_ later.

## Security

- Exact dependency versions + `package-lock.json`; `npm ci` in CI.
- `.npmrc` blocks dependency install scripts.
- GitHub Actions pinned to commit SHAs, least-privilege permissions; Dependabot
  updates npm and Actions weekly with a 7-day cooldown. harden-runner limits
  runner egress (blocked outside of `deploy.yml`, which audits it).
- Rulesets protect `main` and require the pull request checks and CodeQL (see
  [Repository settings](#repository-settings)); OpenSSF Scorecard rates the
  repository weekly (`security-scorecard.yml`).
- Git hooks check secrets, code, workflows, npm advisories and registry
  signatures (see [Checks](#checks)).
- No cookies, analytics, or third-party scripts.
