// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseYaml } from "../src/lib/content.ts";
import { plainText, renderMarkdown, validateMarkdown } from "../src/lib/markdown.ts";
import { projectSchema, validateReferences } from "../src/lib/project-schema.ts";
import { siteSchema, validateSiteProse } from "../src/lib/site-schema.ts";

const errorPatterns = [
  /site.yaml:.*Map keys/s,
  /site.yaml:/,
  /hero.lead/,
  /hero.title/,
  /unsupported link/,
  /hidden project/,
  /only one/,
];
const site = siteSchema.parse(parseYaml(readFileSync("src/content/site.yaml", "utf8"), "site.yaml"));

test("lead supports emphasis and a semantic list", () => {
  const html = renderMarkdown(
    "Switch on our tools (**one command!**) and:\n\n- ship faster with full confidence",
  );
  assert.ok(html.includes("<strong>one command!</strong>"));
  assert.ok(html.includes("<ul>\n<li>ship faster with full confidence</li>\n</ul>"));
  assert.ok(!html.includes("<p><ul>"));
});
test("standard Markdown breaks, inline code and links", () => {
  assert.equal(renderMarkdown("one\ntwo"), "<p>one\ntwo</p>\n");
  assert.equal(renderMarkdown("one\\\ntwo"), "<p>one<br>two</p>\n");
  assert.equal(
    // biome-ignore lint/security/noSecrets: Markdown fixture, not a credential
    renderMarkdown("a `command` and [link](#agents)", true),
    // biome-ignore lint/security/noSecrets: expected HTML fixture
    'a <code>command</code> and <a href="#agents">link</a>',
  );
});
test("plain text keeps punctuation, code and multiline list content", () => {
  assert.equal(
    // biome-ignore lint/security/noSecrets: Markdown fixture, not a credential
    plainText("A **bold** word, `code`, and [link](#agents).\n\n- First\n- Second"),
    "A bold word, code, and link. First Second",
  );
});
test("YAML preserves author order and rejects duplicate keys and indentation errors", () => {
  assert.deepEqual(Object.keys(parseYaml('zebra: "one"\nalpha: "two"', "projects.yaml") as object), [
    "zebra",
    "alpha",
  ]);
  assert.throws(() => parseYaml("name: one\nname: two", "site.yaml"), errorPatterns[0]);
  assert.throws(() => parseYaml("hero:\n\tlead: broken", "site.yaml"), errorPatterns[1]);
});
test("schemas reject typos, wrong types, unknown groups and invalid URLs", () => {
  assert.equal(siteSchema.safeParse({ ...site, typo: "x" }).success, false);
  assert.equal(siteSchema.safeParse({ ...site, url: "broken" }).success, false);
  assert.equal(siteSchema.safeParse({ ...site, hero: { ...site.hero, lead: 42 } }).success, false);
  assert.equal(projectSchema(site.groups).safeParse({ description: "x", group: "missing" }).success, false);
});
test("raw HTML and block headings report their field", () => {
  assert.throws(() => validateSiteProse({ hero: { lead: "<b>unsafe</b>" } }), errorPatterns[2]);
  assert.throws(() => validateMarkdown("one\n\n- two", "hero.title", true), errorPatterns[3]);
  // biome-ignore lint/security/noSecrets: deliberately invalid link fixture
  assert.throws(() => validateMarkdown("[x](javascript:alert)", "hero.lead"), errorPatterns[4]);
});
test("references reject hidden projects and multiple featured projects", () => {
  assert.throws(
    () => validateReferences([{ id: "one", hidden: true }], [{ projects: ["one"] }]),
    errorPatterns[5],
  );
  assert.throws(
    () =>
      validateReferences(
        [
          { id: "one", featured: true },
          { id: "two", featured: true },
        ],
        [],
      ),
    errorPatterns[6],
  );
  assert.doesNotThrow(() => validateReferences([], []));
});
