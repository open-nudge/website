// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

import { Marked, type Token, type Tokens } from "marked";

// Build-time only: content is compiled to ordinary HTML, never sent as a parser.
const unsafeUrl = /^(?:javascript|data|vbscript):/i;
const whitespace = /\s+/g;
const markdown = new Marked({ gfm: false, breaks: false });

function validateMarkdown(source: string, field: string, inline = false) {
  const tokens = markdown.lexer(source);
  markdown.walkTokens(tokens, (token) => {
    if (token.type === "html") {
      throw new Error(`${field}: use Markdown instead of raw HTML`);
    }
    if ((token.type === "link" || token.type === "image") && unsafeUrl.test(token.href)) {
      throw new Error(`${field}: unsupported link destination`);
    }
    if (inline && ["link", "image"].includes(token.type)) {
      throw new Error(`${field}: headings support emphasis and code, not links or images`);
    }
  });
  if (inline && (tokens.length > 1 || (tokens[0] && tokens[0].type !== "paragraph"))) {
    throw new Error(`${field}: expected inline text, not paragraphs or a list`);
  }
}

function renderMarkdown(source: string, inline = false): string {
  return inline ? markdown.parseInline(source, { async: false }) : markdown.parse(source, { async: false });
}

// Read tokens, not HTML/regex: keep code and link labels without markup.
function readToken(token: Token): string {
  if (token.type === "br" || token.type === "space") {
    return " ";
  }
  if (token.type === "list") {
    return (token as Tokens.List).items.map((item) => item.tokens.map(readToken).join("")).join(" ");
  }
  if ("tokens" in token && token.tokens) {
    const suffix = ["paragraph", "heading", "blockquote"].includes(token.type) ? " " : "";
    return token.tokens.map(readToken).join("") + suffix;
  }
  return "text" in token ? String(token.text) : "";
}
function plainText(source: string): string {
  return markdown.lexer(source).map(readToken).join("").replace(whitespace, " ").trim();
}

export { plainText, renderMarkdown, validateMarkdown };
