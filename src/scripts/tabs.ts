// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Phones only: turns the section menu (Tabs.astro) into tabs, following the
// WAI-ARIA tabs pattern: one [data-panel] shown at a time, arrow keys / Home
// / End move between tabs, the URL hash names the open one (/#agents), so
// links and the back button work. A link into a section (#lintkit, a card
// in "linters") opens that section and scrolls to it. Wider screens (and no
// JavaScript) keep the long page, every section shown; turning the phone
// sideways past the breakpoint switches between the two.
//
// When the tabs don't fit, the bar becomes an endless carousel: the tab set
// is repeated on both sides, so it scrolls round and round, and the tabs cut
// off at both edges show there is more. Swiping only scrolls; a tap opens the
// section, centers its tab and scrolls the page to the top of the section;
// the arrows at its ends and a swipe on the content (src/scripts/swipe.ts)
// open the next or previous one.
//
// Ported from maszke.co (the same design); new here: the phone-only switch
// and links into a section. The carousel itself: carousel.ts.

import {
  carousel,
  centerOn,
  follow,
  loopWhenRested,
  markCopies,
  overflows,
  swipeable,
  swipes,
} from "./carousel.ts";
import { swipe } from "./swipe.ts";
import { arrows, bar, block, list, panels, room, tabs } from "./tab-elements.ts";

/** Screens that get tabs: the same breakpoint as Tabs.astro and global.css. */
const phone = matchMedia("(max-width: 40rem)");

const first = tabs[0]?.dataset.tab ?? "";

/** The element the URL hash names, if any. */
const target = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  return id ? document.getElementById(id) : null;
};

/**
 * The section the URL hash names, or holds (#lintkit: its group).
 *
 * @param otherwise - The section for a hash that names something outside
 *   them (#main, the skip link); no hash at all opens the first one.
 */
const fromHash = (otherwise: string) => {
  if (!location.hash) {
    return first;
  }
  return target()?.closest<HTMLElement>("[data-panel]")?.id ?? otherwise;
};

/** Slide the filled block under the chosen tab. */
const place = (tab: HTMLElement) => {
  block?.style.setProperty("--x", `${tab.offsetLeft}px`);
  block?.style.setProperty("--w", `${tab.offsetWidth}px`);
};

/** Tabs are on (a phone); off, every section is shown. */
let tabbed = false;

/** Where the sticky bar sticks: its `top`, under the header. */
const stickyTop = (sticky: HTMLElement) => Number.parseFloat(getComputedStyle(sticky).top) || 0;

/** The sticky bar is stuck under the header (the page is scrolled past it). */
const stuck = () => (bar ? bar.getBoundingClientRect().top <= stickyTop(bar) + 1 : false);

/** Scroll the page to the top of a section, just under the sticky bar: down
 * to it from above, up to it from deep in another one. `jump`: see
 * {@link show}. */
const toTop = (panel: HTMLElement, { jump = false } = {}) => {
  if (!bar) {
    return;
  }
  const top = stickyTop(bar);
  scrollTo({
    top: panel.getBoundingClientRect().top + scrollY - top - bar.offsetHeight,
    behavior: jump ? "instant" : "auto",
  });
};

/** Id of the open section ("" before the first {@link show}). */
let current = "";

/**
 * Open one section: select its tab, hide the other panels and scroll to the
 * top of the new section: always for a tap on the bar (`reveal`), otherwise
 * if the bar is stuck.
 *
 * @param id - The section's id (its [data-panel] element and tab).
 * @param options.focus - Move keyboard focus to the tab (arrow keys).
 * @param options.jump - Scroll to the new section at once, not smoothly (a
 *   swipe has drawn it there already).
 * @param options.reveal - Chosen on the bar (a tab, an arrow, a key): bring
 *   the section's top under the bar wherever the page is.
 */
const show = (id: string, { focus = false, jump = false, reveal = false } = {}) => {
  if (id === current) {
    return;
  }
  const previous = current;
  current = id;
  markCopies(id);
  for (const tab of tabs) {
    const selected = tab.dataset.tab === id;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.toggleAttribute("data-current", selected);
    if (selected) {
      place(tab);
      // scrolled there on a switch, at once on load; the real tab for the
      // keyboard (it has the focus ring), else the copy nearest the eye (a
      // tap: the one tapped)
      centerOn(id, { smooth: previous !== "", real: focus });
      if (focus) {
        tab.focus({ preventScroll: true });
      }
    }
  }
  for (const [panelId, panel] of panels) {
    panel.hidden = panelId !== id;
    panel.toggleAttribute("data-enter", previous !== "" && panelId === id);
  }
  // A switch made on the bar goes to the top of the new section, just under
  // the bar: down from the page top, up from deep in another section, never
  // into the middle of it. Any other switch (a swipe, back / forward) only
  // when far down the page (the bar stuck).
  const panel = panels.get(id);
  if (previous && panel && (reveal || stuck())) {
    toTop(panel, { jump });
  }
};

/** Open the section the URL hash names. If the named element (a section, or
 * a card in one: #lintkit) was hidden, the browser could not scroll to it:
 * scroll there now that it is shown. */
const showHash = () => {
  const element = target();
  const hidden = Boolean(element?.closest<HTMLElement>("[data-panel]")?.hidden);
  show(fromHash(current || first));
  if (element && hidden) {
    element.scrollIntoView();
  }
};

/** A tap on a tab (or a copy of it): open its section, or, if it is open
 * already, bring its tab to the middle of a carousel (and, with `reveal`,
 * the page to its top). `jump`, `reveal`: see {@link show}. */
const choose = (id: string, { jump = false, reveal = false } = {}) => {
  if (id === current) {
    centerOn(id);
    const panel = panels.get(id);
    if (reveal && panel) {
      toTop(panel, { jump });
    }
  } else {
    history.pushState(null, "", `#${id}`);
    show(id, { jump, reveal });
  }
};

/** A tap on a copy of a tab in the carousel: as on the tab itself. */
const tapCopy = (id: string) => choose(id, { reveal: true });

/** Id of the section `by` tabs away from the open one (-1 or 1), round the
 * ends. */
const neighbour = (by: number) => {
  const index = tabs.findIndex((tab) => tab.dataset.tab === current);
  return tabs[(index + by + tabs.length) % tabs.length]?.dataset.tab ?? "";
};

/** Measure again (layout, resize): carousel or not, the block's place. */
const replace = () => {
  if (!tabbed) {
    return;
  }
  carousel(overflows(current), current, tapCopy);
  const tab = tabs.find((item) => item.dataset.tab === current);
  if (tab) {
    place(tab);
  }
};

/** Panel attributes set while tabbed, removed again for the long page. */
const panelAttributes = ["role", "aria-labelledby", "tabindex", "data-enter"];
const tabAttributes = ["role", "aria-controls", "aria-selected", "tabindex", "data-current"];

/** Phones: tabs, one section at a time (the one the URL names). */
const enable = () => {
  if (!list || tabbed) {
    return;
  }
  tabbed = true;
  list.setAttribute("role", "tablist");
  for (const tab of tabs) {
    const id = tab.dataset.tab ?? "";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", id);
    const panel = panels.get(id);
    panel?.setAttribute("role", "tabpanel");
    panel?.setAttribute("aria-labelledby", tab.id);
    panel?.setAttribute("tabindex", "-1");
  }
  room?.setAttribute("data-tabbed", "");
  // current is "" here (disable() resets it): showHash() opens a section
  showHash();
  replace();
};

/** Wider screens: the long page, every section shown, the bar hidden. */
const disable = () => {
  if (!list) {
    return;
  }
  tabbed = false;
  carousel(false, current, tapCopy);
  list.removeAttribute("role");
  for (const tab of tabs) {
    for (const name of tabAttributes) {
      tab.removeAttribute(name);
    }
  }
  for (const panel of panels.values()) {
    for (const name of panelAttributes) {
      panel.removeAttribute(name);
    }
    panel.hidden = false;
  }
  room?.removeAttribute("data-tabbed");
  current = "";
};

if (list && tabs.length > 0) {
  for (const tab of tabs) {
    tab.addEventListener("click", (event) => {
      if (tabbed) {
        event.preventDefault();
        choose(tab.dataset.tab ?? "", { reveal: true });
      }
    });
  }

  /** The keys moving between tabs, each to the id of the tab it opens. */
  const moves = new Map<string, () => string | undefined>([
    ["ArrowRight", () => neighbour(1)],
    ["ArrowLeft", () => neighbour(-1)],
    ["Home", () => tabs[0]?.dataset.tab],
    ["End", () => tabs.at(-1)?.dataset.tab],
  ]);
  list.addEventListener("keydown", (event) => {
    const move = moves.get(event.key);
    if (!(tabbed && move)) {
      return;
    }
    event.preventDefault();
    const id = move();
    if (id) {
      history.replaceState(null, "", `#${id}`);
      show(id, { focus: true, reveal: true });
    }
  });

  for (const arrow of arrows) {
    arrow.addEventListener("click", () => choose(neighbour(Number(arrow.dataset.step)), { reveal: true }));
  }

  if (room) {
    swipe(room, {
      panels,
      current: () => current,
      neighbour,
      enabled: swipes,
      choose: (id) => choose(id, { jump: true }),
      stuck,
      barBottom: () => bar?.getBoundingClientRect().bottom ?? 0,
      follow: (direction) => follow(current, direction),
    });
  }

  // back / forward, and in-page links to a section or into one (#lintkit)
  const onHash = () => {
    if (tabbed) {
      showHash();
    }
  };
  addEventListener("popstate", onHash);
  addEventListener("hashchange", onHash);

  const toggle = () => (phone.matches ? enable() : disable());
  phone.addEventListener("change", toggle);
  toggle();

  // zooming in hands sideways drags back to the page; zooming out, to swipes
  globalThis.visualViewport?.addEventListener("resize", swipeable);
  loopWhenRested();
  const resize = new ResizeObserver(replace);
  resize.observe(list);
  if (room) {
    resize.observe(room);
  }
  // narrowed for the callbacks (an import is not)
  const tablist = list;
  requestAnimationFrame(() => {
    replace();
    tablist.setAttribute("data-ready", "");
    // the block slides only between tabs, not into place on load
    requestAnimationFrame(() => tablist.setAttribute("data-animate", ""));
  });
}
