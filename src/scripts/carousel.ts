// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// The phone tab bar as an endless carousel, when the tabs don't fit it
// (tabs.ts): the tab set is repeated on both sides, so it scrolls round and
// round, wrapped back unseen once it rests, and a swipe on the sections
// (swipe.ts) moves it along with the finger.

import { arrows, list, panels, room, tabs } from "./tab-elements.ts";

/** Copies of the tab set in the carousel: the real one in the middle, two
 * on each side, room for a long fling before the loop wraps it back. */
const copies = 5;
/** The repeated tabs (aria-hidden), present only while it is a carousel. */
let clones: HTMLAnchorElement[] = [];
const isCarousel = () => clones.length > 0;
/** A swipe moves the bar: it neither loops nor snaps meanwhile. */
let following = false;

/** Width of one tab set, gaps included: the carousel's period. */
const period = () => {
  const [firstTab] = tabs;
  const next = clones[Math.floor(copies / 2) * tabs.length];
  return firstTab && next ? next.offsetLeft - firstTab.offsetLeft : 0;
};

/** Once the carousel rests, jump it back by whole tab sets so its middle is
 * over the real set again: the same tabs under the same spot, unseen, and
 * never the end of the copies. */
const loop = () => {
  const width = period();
  const start = tabs[0]?.offsetLeft;
  if (!(list && isCarousel() && !following && width > 0 && start !== undefined)) {
    return;
  }
  const middle = list.scrollLeft + list.clientWidth / 2;
  const sets = Math.floor((middle - start) / width);
  if (sets !== 0) {
    list.scrollTo({ left: list.scrollLeft - sets * width, behavior: "instant" });
  }
};

/** Scale past which the page counts as zoomed in (some browsers report a
 * hair over 1 at rest). */
const zoomedScale = 1.01;
/** The page is pinch-zoomed in: a sideways drag pans it, not the sections. */
const zoomed = () => (globalThis.visualViewport?.scale ?? 1) > zoomedScale;

/** In a carousel, center the copy of a section's tab nearest to the middle
 * of the bar (the one the eye is on), or the real tab itself. Only the bar
 * scrolls (sideways): scrollIntoView would move the page too. */
export const centerOn = (id: string, { smooth = true, real = false } = {}) => {
  if (!(list && isCarousel())) {
    return;
  }
  const middle = list.scrollLeft + list.clientWidth / 2;
  const distance = (tab: HTMLElement) => Math.abs(tab.offsetLeft + tab.offsetWidth / 2 - middle);
  const candidates = [...tabs, ...(real ? [] : clones)].filter((tab) => tab.dataset.tab === id);
  const [nearest] = candidates.sort((a, b) => distance(a) - distance(b));
  if (nearest) {
    list.scrollTo({
      left: nearest.offsetLeft - (list.clientWidth - nearest.offsetWidth) / 2,
      behavior: smooth ? "smooth" : "instant",
    });
  }
};

/**
 * Move the carousel with a swipe (swipe.ts), from the copy of the open tab
 * nearest the middle towards the tab next to it.
 *
 * @param current - Id of the open section.
 * @param direction - -1 towards the previous tab, 1 towards the next.
 * @returns Takes the progress (0 to 1); with `done`, glides there and lets
 *   the bar loop and snap again.
 */
export const follow = (current: string, direction: number) => {
  const middle = list ? list.scrollLeft + list.clientWidth / 2 : 0;
  const centerOf = (tab: Element | null | undefined) =>
    tab instanceof HTMLElement && tab.dataset.tab ? tab.offsetLeft + tab.offsetWidth / 2 : undefined;
  const away = (tab: HTMLElement) => Math.abs((centerOf(tab) ?? 0) - middle);
  const [from] = [...tabs, ...clones]
    .filter((tab) => tab.dataset.tab === current)
    .sort((a, b) => away(a) - away(b));
  const start = centerOf(from);
  const end = centerOf(direction > 0 ? from?.nextElementSibling : from?.previousElementSibling);
  if (!list || start === undefined || end === undefined) {
    return () => undefined;
  }
  // narrowed for the closure (an import is not)
  const bar = list;
  following = true;
  bar.style.scrollSnapType = "none";
  return (progress: number, done = false) => {
    const left = start + (end - start) * progress - bar.clientWidth / 2;
    bar.scrollTo({ left, behavior: done ? "smooth" : "instant" });
    if (done) {
      following = false;
      bar.style.scrollSnapType = "";
    }
  };
};

/** Sections are swiped (swipe.ts) while the tabs are a carousel (only ever
 * while tabbed) and the page is not zoomed in. */
export const swipes = () => isCarousel() && !zoomed();

/** [data-swipe] keeps the page's sideways drags for swipes while they are on. */
export const swipeable = () => {
  room?.toggleAttribute("data-swipe", swipes());
};

/**
 * Turn the carousel on (the tabs don't fit the bar) or off.
 *
 * @param current - Id of the open section: its tab is centered.
 * @param tap - Open a section, on a tap on a copy of its tab.
 */
export const carousel = (on: boolean, current: string, tap: (id: string) => void) => {
  if (!list || on === isCarousel()) {
    return;
  }
  if (on) {
    const copy = (tab: HTMLAnchorElement) => {
      const clone = tab.cloneNode(true) as HTMLAnchorElement;
      for (const name of ["id", "role", "aria-controls", "aria-selected"]) {
        clone.removeAttribute(name);
      }
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      clone.addEventListener("click", (event) => {
        event.preventDefault();
        tap(clone.dataset.tab ?? "");
      });
      return clone;
    };
    // the copies keep the open tab's data-current (show() keeps it on the tabs)
    const side = () => Array.from({ length: Math.floor(copies / 2) }, () => tabs.map(copy)).flat();
    const before = side();
    const after = side();
    tabs[0]?.before(...before);
    list.append(...after);
    clones = [...before, ...after];
    list.setAttribute("data-carousel", "");
    centerOn(current, { smooth: false, real: true });
  } else {
    for (const clone of clones) {
      clone.remove();
    }
    clones = [];
    list.removeAttribute("data-carousel");
  }
  for (const arrow of arrows) {
    arrow.hidden = !on;
  }
  swipeable();
};

/** The tab set, side by side, is wider than the room the bar has: the open
 * section's content box, between the gutters. Measured there, not on the bar
 * itself: a carousel spans the screen, and the room must not grow when it
 * turns on. `current`: id of the open section. */
export const overflows = (current: string) => {
  const [firstTab] = tabs;
  const lastTab = tabs.at(-1);
  const content = panels.get(current)?.querySelector<HTMLElement>(".wrap");
  if (!(list && firstTab && lastTab && content)) {
    return false;
  }
  const px = (value: string) => Number.parseFloat(value) || 0;
  const outer = getComputedStyle(content);
  const inner = getComputedStyle(list);
  const available = content.clientWidth - px(outer.paddingLeft) - px(outer.paddingRight);
  const inset = px(inner.paddingLeft) + px(inner.paddingRight);
  return lastTab.offsetLeft + lastTab.offsetWidth - firstTab.offsetLeft + inset > available + 1;
};

/** Mark the copies of a section's tab as the open one's (show() in tabs.ts
 * marks the tab itself). */
export const markCopies = (id: string) => {
  for (const copy of clones) {
    copy.toggleAttribute("data-current", copy.dataset.tab === id);
  }
};

/** The carousel wraps around once it rests (no scrollend: shortly after the
 * last scroll event). */
export const loopWhenRested = () => {
  if ("onscrollend" in globalThis) {
    list?.addEventListener("scrollend", loop);
    return;
  }
  const restMs = 150;
  let timer: ReturnType<typeof setTimeout> | undefined;
  list?.addEventListener(
    "scroll",
    () => {
      clearTimeout(timer);
      timer = setTimeout(loop, restMs);
    },
    { passive: true },
  );
};
