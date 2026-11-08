// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Shell commands split into colored tokens at build time (<Terminal>), in the
// spirit of zsh-syntax-highlighting: the command and its flags stand out,
// strings and variables get their own color, operators a quiet accent, and
// everything else (subcommands, paths, values) stays plain. Not a parser:
// enough for the commands on this site. Colors: --code-* in global.css.

/** Token kinds; each maps to a `.sh-<kind>` class (plain text has none). */
type ShellKind = "cmd" | "flag" | "str" | "var" | "op";

interface ShellToken {
  kind?: ShellKind | undefined;
  text: string;
}

interface ShellLine {
  /** Starts a command (gets a `$` prompt); false for a line continued by `\`
   * and for a blank line. */
  command: boolean;
  tokens: ShellToken[];
}

/** Characters HTML needs escaped. */
const htmlSpecial = /[&<>"]/g;
/** Words that end one command and start the next. */
const separators = new Set(["|", "||", "&&", ";", "&"]);
/** A word and the whitespace after it; quotes keep their spaces. */
const wordPattern = /((?:"[^"]*"?|'[^']*'?|[^\s"'])+)|(\s+)/g;
/** Quoted parts of a word ("…", '…') and the plain text between them. */
const quotedPattern = /("[^"]*"?|'[^']*'?)/;
const variablePattern = /\$(?:\{[^}]*\}|[A-Za-z_]\w*|[0-9#?@*$!-])/g;
/** `NAME=value` in command position: a variable for the command. */
const assignmentPattern = /^([A-Za-z_]\w*)(=)(.*)$/s;
/** `--name=value`: only the flag part is colored. */
const flagValuePattern = /^(-[^=]*)(=)(.*)$/s;

/** Plain text or double quotes: the variables in it colored. */
function expand(part: string, kind: ShellKind | undefined): ShellToken[] {
  const tokens: ShellToken[] = [];
  let last = 0;
  for (const match of part.matchAll(variablePattern)) {
    if (match.index > last) {
      tokens.push({ kind, text: part.slice(last, match.index) });
    }
    tokens.push({ kind: "var", text: match[0] });
    last = match.index + match[0].length;
  }
  if (last < part.length) {
    tokens.push({ kind, text: part.slice(last) });
  }
  return tokens;
}

/** A word that is neither command nor flag: strings and variables in it
 * colored, the rest plain. Single quotes expand nothing. */
function argument(word: string): ShellToken[] {
  return word
    .split(quotedPattern)
    .filter(Boolean)
    .flatMap((part) => {
      if (part.startsWith("'")) {
        return [{ kind: "str" as const, text: part }];
      }
      return expand(part, part.startsWith('"') ? "str" : undefined);
    });
}

/** `name` `=` `value`: the name and value colored as given, `=` an operator. */
function pair(match: RegExpExecArray, kind: ShellKind): ShellToken[] {
  const [, name = "", equals = "", value = ""] = match;
  return [{ kind, text: name }, { kind: "op", text: equals }, ...argument(value)];
}

/**
 * Color one word.
 *
 * @param word - The word, not whitespace.
 * @param expectCommand - The word is in command position.
 * @returns Its tokens and whether the next word is in command position.
 */
function classify(word: string, expectCommand: boolean): [ShellToken[], boolean] {
  if (separators.has(word)) {
    return [[{ kind: "op", text: word }], true];
  }
  // end of options: what follows is usually a command to run
  // (`claude mcp add name -- uvx …`)
  if (word === "--") {
    return [[{ kind: "op", text: word }], true];
  }
  if (word === "\\") {
    return [[{ kind: "op", text: word }], expectCommand];
  }
  if (expectCommand) {
    const assignment = assignmentPattern.exec(word);
    return assignment ? [pair(assignment, "var"), true] : [[{ kind: "cmd", text: word }], false];
  }
  if (word.startsWith("-")) {
    const flag = flagValuePattern.exec(word);
    return [flag ? pair(flag, "flag") : [{ kind: "flag", text: word }], false];
  }
  return [argument(word), false];
}

/**
 * Split shell commands into colored tokens.
 *
 * @param source - One or more lines; a line ending in `\` continues on the next.
 * @returns The lines, each with its tokens (whitespace kept as plain tokens).
 */
function highlightShell(source: string): ShellLine[] {
  let continued = false;
  let expectCommand = true;
  return source.split("\n").map((line) => {
    const tokens: ShellToken[] = [];
    // a continued line goes on where the line above left off (after
    // `-- \`: a command), a new one starts a command
    expectCommand ||= !continued;
    for (const [, word, space] of line.matchAll(wordPattern)) {
      if (word) {
        const [colored, next] = classify(word, expectCommand);
        tokens.push(...colored);
        expectCommand = next;
      } else {
        tokens.push({ text: space ?? "" });
      }
    }
    const command = !continued && line.trim() !== "";
    continued = line.trimEnd().endsWith("\\");
    return { command, tokens };
  });
}

const escapes: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const escapeHtml = (text: string) => text.replace(htmlSpecial, (char) => escapes[char] ?? char);

/** Tokens as HTML: a `.sh-<kind>` span for each colored one. */
const tokensHtml = (tokens: ShellToken[]) =>
  tokens
    .map((token) =>
      token.kind ? `<span class="sh-${token.kind}">${escapeHtml(token.text)}</span>` : escapeHtml(token.text),
    )
    .join("");

/** The room in front of a line: a `$` prompt (never copied) for a command,
 * a continued line the room of one (as a shell's PS2), a blank line none. */
function prompt(line: ShellLine): string {
  if (line.command) {
    return '<span class="prompt" aria-hidden="true">$ </span>';
  }
  return line.tokens.length > 0 ? '<span class="prompt" aria-hidden="true">  </span>' : "";
}

/**
 * Shell commands as colored HTML, a prompt in front of each line (<Terminal>).
 *
 * @param source - One or more lines, as for {@link highlightShell}.
 * @param prompts - Put the prompt in front of each line (false: the caller
 *   draws one for a single line).
 * @returns The HTML, lines joined by newlines (for `white-space: pre`).
 */
function shellHtml(source: string, prompts = true): string {
  return highlightShell(source)
    .map((line) => (prompts ? prompt(line) : "") + tokensHtml(line.tokens))
    .join("\n");
}

export type { ShellKind, ShellLine, ShellToken };
export { highlightShell, shellHtml };
