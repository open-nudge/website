// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Switches (<Switch>): uv / pip on the project cards, the agent in "for
// agents". A click sets <html data-{name}> (global.css shows the matching
// options), stores the choice for the next visit (restored by Base.astro
// before first paint) and updates every switch of that name. The block under
// the chosen option is measured, as the options have their labels' widths.

const root = document.documentElement;
const groups = [...document.querySelectorAll<HTMLElement>("[data-switch]")];

/** The chosen value of a switch: <html data-{name}>, else its first option. */
const chosen = (group: HTMLElement) => root.dataset[group.dataset.switch ?? ""] ?? group.dataset.default;

/** Press the chosen option and slide the block under it. */
const sync = (group: HTMLElement) => {
  const value = chosen(group);
  const block = group.querySelector<HTMLElement>(".block");
  for (const button of group.querySelectorAll<HTMLButtonElement>("button[data-value]")) {
    const pressed = button.dataset.value === value;
    button.setAttribute("aria-pressed", String(pressed));
    // a hidden switch (a section closed on phones) has nothing to measure:
    // the ResizeObserver below places the block once it is shown
    if (pressed && button.offsetWidth > 0) {
      block?.style.setProperty("--x", `${button.offsetLeft}px`);
      block?.style.setProperty("--w", `${button.offsetWidth}px`);
      if (!group.hasAttribute("data-ready")) {
        group.toggleAttribute("data-ready", true);
        // the block slides only between options, not into its first place
        requestAnimationFrame(() => group.toggleAttribute("data-animate", true));
      }
    }
  }
};

const resize = new ResizeObserver((entries) => {
  for (const entry of entries) {
    sync(entry.target as HTMLElement);
  }
});

for (const group of groups) {
  const name = group.dataset.switch ?? "";
  group.hidden = false;
  for (const button of group.querySelectorAll<HTMLButtonElement>("button[data-value]")) {
    button.addEventListener("click", () => {
      const value = button.dataset.value ?? "";
      root.dataset[name] = value;
      try {
        localStorage.setItem(name, value);
      } catch {
        // storage unavailable (private mode): the choice lasts for this page only
      }
      for (const other of groups) {
        if (other.dataset.switch === name) {
          sync(other);
        }
      }
    });
  }
  sync(group);
  resize.observe(group);
}
