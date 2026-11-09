// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Copy buttons (<Terminal>). They stay hidden without JavaScript or without
// clipboard access. After a click the icon turns into a check mark
// (data-state="copied") and a note says so (data-note, shown by global.css)
// for a moment. The note keeps its text afterwards, so it fades out still
// saying it.

/** How long the check mark and the note stay, in milliseconds. */
const noteDuration = 1500;

// without clipboard access (e.g. plain http) the buttons stay hidden
const buttons = navigator.clipboard ? document.querySelectorAll<HTMLButtonElement>("button[data-copy]") : [];
for (const button of buttons) {
  button.hidden = false;
  const label = button.getAttribute("aria-label") ?? button.title;
  let timer: ReturnType<typeof setTimeout> | undefined;
  button.addEventListener("click", async () => {
    const copied = await navigator.clipboard.writeText(button.dataset.copy ?? "").then(
      () => true,
      () => false,
    );
    button.dataset.state = copied ? "copied" : "failed";
    button.dataset.note = (copied ? button.dataset.copied : button.dataset.copyFailed) ?? label;
    button.setAttribute("aria-label", button.dataset.note);
    // a second click restarts the moment instead of being cut short
    clearTimeout(timer);
    timer = setTimeout(() => {
      delete button.dataset.state;
      button.setAttribute("aria-label", label);
    }, noteDuration);
  });
}
