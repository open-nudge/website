// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// The elements of the phone tabs (Tabs.astro) and of the sections they switch
// (src/pages/index.astro), shared by tabs.ts and carousel.ts.

/** The tab bar's scrolling list of tabs. */
export const list = document.querySelector<HTMLElement>("[data-tablist]");
/** The real tabs, one per section (a carousel adds copies of them). */
export const tabs = [...document.querySelectorAll<HTMLAnchorElement>("[data-tab]")];
/** The sections' [data-panel] elements, by id. */
export const panels = new Map(
  [...document.querySelectorAll<HTMLElement>("[data-panel]")].map((panel) => [panel.id, panel]),
);
/** The filled block sliding under the chosen tab. */
export const block = list?.querySelector<HTMLElement>(".block");
/** The sticky bar around the list. */
export const bar = list?.closest<HTMLElement>(".tabs");
/** The carousel's previous / next arrows. */
export const arrows = [...(bar?.querySelectorAll<HTMLButtonElement>("[data-step]") ?? [])];
/** The sections' container. */
export const room = panels.values().next().value?.parentElement;
