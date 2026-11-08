// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// DOM helpers of the swipe between sections (swipe.ts), none of them tied to
// a drag under way.

/** Longest wait for the slide to finish, in milliseconds. */
const settleMs = 600;

/** The element, or one of its ancestors inside `stop`, scrolls sideways
 * itself (code, tables): the drag is its own. */
export const scrollsSideways = (target: EventTarget | null, stop: HTMLElement) => {
  for (let el = target instanceof Element ? target : null; el && el !== stop; el = el.parentElement) {
    const overflow = getComputedStyle(el).overflowX;
    if ((overflow === "auto" || overflow === "scroll") && el.scrollWidth > el.clientWidth) {
      return true;
    }
  }
  return false;
};

/** Run `then` once the element's transform transition ends (or soon after,
 * if it never does). */
export const settle = (el: HTMLElement, then: () => void) => {
  let finished = false;
  const finish = () => {
    if (!finished) {
      finished = true;
      el.removeEventListener("transitionend", finish);
      then();
    }
  };
  el.addEventListener("transitionend", finish);
  setTimeout(finish, settleMs);
};

/** A drag is not a tap: the click after it (if any) opens nothing. */
export const swallowClick = (container: HTMLElement) => {
  const swallow = (click: Event) => {
    click.preventDefault();
    click.stopPropagation();
  };
  container.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(() => container.removeEventListener("click", swallow, { capture: true }), settleMs);
};
