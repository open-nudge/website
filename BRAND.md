<!--
SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
SPDX-License-Identifier: Apache-2.0
-->

# opennudge brand

How opennudge looks and sounds. The website in this repository is the reference
implementation of everything below.

## Idea

**Small changes, large effects.**

<!-- enq: "easy" describes the choice (what a nudge is), not the reader -->

<!-- vale alex.Condescending = NO -->

A nudge is a small, well-placed change that makes the better choice the easy
one. opennudge applies that idea to software: open source tools that nudge
_code_, and the agents writing it, toward quality.

<!-- enq: back on after the definition of a nudge -->

<!-- vale alex.Condescending = YES -->

Public copy never talks about economics or psychology; it talks about code,
tools and agents.

### Dev nudges

The backbone of the "how we nudge" section on the home page. New projects should
fit at least one.

<!-- enq: table rows cannot be wrapped to 80 columns -->

<!-- pyml disable-num-lines 7 md013-->

| Nudge                    | In practice                                                 | Projects                |
| ------------------------ | ----------------------------------------------------------- | ----------------------- |
| good defaults            | everything switched on from the first commit                | opentemplate            |
| feedback while you write | checks at commit time and over MCP, for humans _and_ agents | lintkit, pynudger       |
| explain, don't ban       | rules may be ignored, but the reason is written down        | noqaexplain             |
| less friction            | chores become one-liners that run themselves                | comver, cogeol, loadfig |

## Logo

The mark is an **o** and an **n** drawn as one stroke that forms a power symbol:
**on**. A nudge is often just the right default switched on.

- Files: `public/brand/opennudge-logo.svg` (mark + wordmark),
  `opennudge-mark.svg`, `opennudge-wordmark.svg`. These were vector-traced from
  the original 2292×448 PNG (pixel difference about 1%); if the original vector
  source turns up, replace them.
- On the website the logo is inlined and uses `currentColor`, so it is charcoal
  on light and light gray on dark. **Never recolor it** and never put it on a
  colored background.
- Minimum size: 16 px tall for the mark, 20 px tall for the full logo.
- Clear space: at least the height of the "o" on every side.

### Using the logo

The opennudge name, logo, mark, wordmark, icons and social image are **not**
covered by the Apache-2.0 license of this repository: they are © open-nudge, all
rights reserved
([LicenseRef-opennudge-brand](LICENSES/LicenseRef-opennudge-brand.txt), the
files are listed in `REUSE.toml`).

- You may use them unmodified, following the rules above, to refer to opennudge
  and its projects (articles, talks, READMEs, "built with" mentions).
- You may not use them for your own projects or products, or in a way that
  suggests opennudge endorses you.
- Forks of this website replace them with their own.
- For anything else, ask first in an
  [issue](https://github.com/open-nudge/website/issues).

## Color

The interface is grayscale (R = G = B), and **never pure black `#000` or pure
white `#fff`**.

| Token           | Light     | Dark      | Use                            |
| --------------- | --------- | --------- | ------------------------------ |
| `--bg`          | `#e4e4e4` | `#262626` | page background                |
| `--surface`     | `#f1f1f1` | `#303030` | cards, code blocks (raised)    |
| `--text`        | `#323232` | `#dcdcdc` | text, the logo charcoal        |
| `--muted`       | `#5e5e5e` | `#a3a3a3` | secondary text                 |
| `--line`        | `#c8c8c8` | `#3d3d3d` | hairlines, borders             |
| `--line-strong` | `#a6a6a6` | `#5a5a5a` | hover borders, dashed outlines |

Contrast: text about 10:1 (light) and 11:1 (dark); muted text about 5:1 and 6:1.
Emphasis comes from weight, underline, hairlines and **inversion** (the active
tab is a filled `--text` block with `--bg` text). Tags are filled gray pills (a
faint fill of the text color).

Boxes (cards, code, terminals) are **raised**: a surface a touch lighter than
the page, a faint 1px ring and a soft shadow (`--raised`), with a 10 px radius.
No hard gray borders on rounded boxes: a 1px stroke on a curve shows its pixels.
Lines inside a box use the opaque `--divider`; hairlines stay for square things
(section rules, the "how we nudge" grid, tables). Controls draw with **fills,
not outlines**: switches are a faint track with the filled block inside (radii
nested: track = block + padding), secondary buttons and icon buttons a faint
fill, primary buttons a solid `--text` block (6 px radius).

Links on project cards (github, pypi, docs) carry a small `--muted` icon of
where they go: the GitHub mark, the PyPI cube, an open book. They tell you the
destination before you click; there are no hover cards.

Color appears in exactly one place: **code**. Syntax highlighting uses Kanagawa
(lotus in light mode, dragon in dark mode) on the gray code surface. Tokens
below 4.5:1 on our gray are darkened or lifted, keeping their hue
(`src/lib/code.ts`).

Commands (`uv add`, `uvx`) sit in gray terminal rows with a `>_` tile and a `$`
prompt, both in `--muted`. The prompt is `$` (a normal user's POSIX shell),
never `>` (Windows / continuation prompt). Install commands default to uv, with
a pip tab on every card.

## Type

- **System fonts** only: `system-ui` for text (San Francisco, Segoe UI, Roboto,
  Noto Sans, …) and the system mono for code. Nothing to download, nothing to
  track; never a font CDN.
- One text font for everything you read: headings, project names, dates,
  counters, pills, labels and form fields. Mono is only for what you type or
  copy: code, commands and terminals. Numbers that line up (dates, counters,
  list markers) use tabular figures instead of mono.
- Display headings are **lowercase** ("developer-first tooling"); body text uses
  normal sentence case.

## Motion: "the nudge"

Interactive cards and the `→` arrows of text links move **2 px to the right** on
hover. That is the only movement. While a card is nudged, an invisible strip
fills the gap it leaves behind, so a pointer resting on its left edge does not
make it flicker. Clickable cards also lift: a soft gray shadow grows under them
(the only shadow on the site).

Buttons, arrows included, stay put (a box that moves under the cursor flickers
at its edge): on hover only their fill changes.

Everything else **fades, never snaps**: color, fill, border and underline
changes are quick on the way in and slower on the way back (`--fast` 160 ms,
`--slow` 360 ms, `--ease` a soft ease-out; tokens in `global.css`). Underlines
that appear on hover fade in their color instead of switching on. On top of
that:

- in-page links scroll smoothly, and the card you land on (`#lintkit`) lights up
  briefly;
- the light/dark switch cross-fades the whole page (View Transitions; an instant
  flip elsewhere);
- the uv / pip switch slides its filled block across, and the command
  cross-fades in place;
- a copy button shows a checkmark and a small inverted "copied" note that opens
  to its right (never over the command) for a moment.

All of it is switched off for people who prefer reduced motion: no movement, no
smooth scrolling, no fading.

## Voice

Plain, precise, technical, no hype. Show the command instead of describing it.

- Lead with the two pillars: **supply chain security** and **AI agents**. Every
  security claim (SLSA levels, Scorecard checks) must be backed by the project
  docs; never promise a total Scorecard score.

- Keep: "developer-first tooling", "quality meets convenience", "small changes,
  large effects.", "human-first tooling".

- Values: **convenience**, **quality**, **openness**.

- Mission: _opennudge gives programmers intuitive, open and free tools to build
  the software of their dreams._
