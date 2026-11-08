// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Swipe between sections (phones, while the tabs are a carousel: tabs.ts).
// Ported from maszke.co, which shares this design (helpers: swipe-dom.ts).
// The open section follows the finger sideways and the neighbouring one
// slides in next to it, its top where the eye is (just under the sticky
// bar); let go far or fast enough and the neighbour opens, else both spring
// back. The sections loop like the tabs do. Vertical drags stay the page's,
// and so does a pinch: a second finger lets the sections spring back.

import { scrollsSideways, settle, swallowClick } from "./swipe-dom.ts";

/** What the tabs (tabs.ts) lend the gesture. */
interface SwipeHost {
  /** The sections' [data-panel] elements, by id. */
  panels: Map<string, HTMLElement>;
  /** Id of the open section. */
  current: () => string;
  /** Id of the previous (-1) or next (1) section, round the ends. */
  neighbour: (direction: number) => string;
  /** Swiping is on (the tabs are a carousel, the page not zoomed in). */
  enabled: () => boolean;
  /** Open a section (as a tap on its tab does), its top scrolled under the
   * bar at once if the bar is stuck. */
  choose: (id: string) => void;
  /** The sticky bar is stuck: a switch scrolls to the top of the new section. */
  stuck: () => boolean;
  /** The bottom edge of the sticky bar, in viewport pixels. */
  barBottom: () => number;
  /** Start moving the tab bar with the finger towards the previous (-1) or
   * next (1) tab. The result takes the progress (0 to 1); with `done`, it
   * glides to that point and lets the bar go. */
  follow: (direction: number) => (progress: number, done?: boolean) => void;
}

/** Movement before the gesture picks an axis, in pixels. */
const lock = 10;
/** Share of the width past which letting go opens the neighbour. */
const distance = 0.25;
/** A flick at least this fast (pixels per millisecond) opens it too. */
const flick = 0.4;
/** No sliding: the sections switch at once. */
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

/** A drag under way. */
interface Drag {
  id: number;
  x0: number;
  y0: number;
  axis?: "x" | "y";
  dx: number;
  /** Last move, for the flick speed. */
  last: { x: number; t: number };
  speed: number;
  direction: number;
  panel: HTMLElement;
  neighbour?: HTMLElement;
  width: number;
  follow?: (progress: number, done?: boolean) => void;
}

/** One container's gesture: what it was lent, and how far it has got. */
interface Gesture {
  container: HTMLElement;
  host: SwipeHost;
  /** The drag under way, if any. */
  drag?: Drag;
  /** A slide is finishing: no new drag until it has. */
  busy: boolean;
}

/** Put the neighbour on the side it comes from, its top just under the bar
 * (where the switch will scroll its top to) or, near the page top, level
 * with the open section. */
const stage = ({ container, host }: Gesture, drag: Drag, direction: number) => {
  if (drag.neighbour) {
    drag.neighbour.hidden = true;
    drag.neighbour.removeAttribute("style");
  }
  const neighbour = host.panels.get(host.neighbour(direction));
  if (!neighbour || neighbour === drag.panel) {
    drag.neighbour = undefined;
    return;
  }
  // measure first, then place it out of the flow, then show it: shown in
  // the flow for a moment, a section above would push the page down
  const box = container.getBoundingClientRect();
  const top = host.stuck() ? host.barBottom() - box.top : drag.panel.offsetTop;
  const { offsetLeft: left, offsetWidth: width } = drag.panel;
  Object.assign(neighbour.style, {
    position: "absolute",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    // down to the bottom of the screen only: it must not spill over the
    // footer while it is a preview
    maxHeight: `${Math.max(0, innerHeight - (box.top + top))}px`,
    overflow: "clip",
    background: "var(--bg)",
  });
  neighbour.hidden = false;
  drag.neighbour = neighbour;
  drag.direction = direction;
  drag.follow?.(0, true);
  drag.follow = host.follow(direction);
};

/** Move both sections by `dx` (the neighbour a section width plus the gap
 * further). */
const position = (drag: Drag, dx: number) => {
  if (reducedMotion.matches) {
    return;
  }
  drag.panel.style.transform = `translateX(${dx}px)`;
  if (drag.neighbour) {
    drag.neighbour.style.transform = `translateX(${dx + drag.direction * drag.width}px)`;
  }
  drag.follow?.(Math.min(1, Math.abs(dx) / drag.width));
};

/** Let go of the drag: the neighbour slides in (`open`), or both spring
 * back. */
const release = (gesture: Gesture, open: boolean) => {
  const { drag } = gesture;
  if (!drag) {
    return;
  }
  gesture.drag = undefined;
  const { panel, neighbour, width, direction, follow, axis } = drag;
  if (axis !== "x" || !neighbour) {
    return;
  }
  swallowClick(gesture.container);
  const id = gesture.host.neighbour(direction);
  // the tab bar glides on to the new tab (or back) while the sections slide
  follow?.(open ? 1 : 0, true);
  const finish = () => {
    // The browser would keep the neighbour (the only section on screen) in
    // place as it drops into the page, scrolling the page by the distance;
    // the switch scrolls to it itself.
    const root = document.documentElement;
    root.style.overflowAnchor = "none";
    requestAnimationFrame(() => root.style.removeProperty("overflow-anchor"));
    panel.style.transform = "";
    panel.style.transition = "";
    if (!open) {
      neighbour.hidden = true;
    }
    neighbour.removeAttribute("style");
    if (open) {
      gesture.host.choose(id);
      // it is on screen already: no fade in
      neighbour.removeAttribute("data-enter");
    }
    gesture.busy = false;
  };
  if (reducedMotion.matches) {
    finish();
    return;
  }
  gesture.busy = true;
  const target = open ? -direction * width : 0;
  for (const el of [panel, neighbour]) {
    el.style.transition = "transform var(--slow) var(--ease)";
  }
  requestAnimationFrame(() => {
    panel.style.transform = `translateX(${target}px)`;
    neighbour.style.transform = `translateX(${target + direction * width}px)`;
    settle(panel, finish);
  });
};

/** A finger, on a section, while swiping is on and no slide is running. */
const starts = ({ container, host, busy }: Gesture, event: PointerEvent) =>
  event.pointerType === "touch" &&
  event.isPrimary &&
  !busy &&
  host.enabled() &&
  !scrollsSideways(event.target, container);

/** A finger touches down: a drag may start (a second one: a pinch, the drag
 * is not a swipe). */
const down = (gesture: Gesture, event: PointerEvent) => {
  if (gesture.drag && event.pointerId !== gesture.drag.id) {
    release(gesture, false);
    return;
  }
  if (!starts(gesture, event)) {
    return;
  }
  const { container, host } = gesture;
  const panel = host.panels.get(host.current());
  if (!panel) {
    return;
  }
  const gap = Number.parseFloat(getComputedStyle(container).paddingLeft) || 0;
  gesture.drag = {
    id: event.pointerId,
    x0: event.clientX,
    y0: event.clientY,
    dx: 0,
    last: { x: event.clientX, t: event.timeStamp },
    speed: 0,
    direction: 0,
    panel,
    width: panel.offsetWidth + gap,
  };
};

/** Pick the drag's axis once the finger has moved far enough: sideways it
 * is a swipe (the container takes the pointer), up or down it is the page's
 * (the drag is dropped). Whether it is a swipe so far. */
const sideways = (gesture: Gesture, drag: Drag, event: PointerEvent) => {
  if (drag.axis) {
    return drag.axis === "x";
  }
  const dx = event.clientX - drag.x0;
  const dy = event.clientY - drag.y0;
  if (Math.hypot(dx, dy) < lock) {
    return false;
  }
  drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  if (drag.axis === "y") {
    gesture.drag = undefined;
    return false;
  }
  gesture.container.setPointerCapture(event.pointerId);
  return true;
};

/** The finger moves: both sections follow it sideways. */
const move = (gesture: Gesture, event: PointerEvent) => {
  const { drag } = gesture;
  if (!drag || event.pointerId !== drag.id || !sideways(gesture, drag, event)) {
    return;
  }
  const elapsed = event.timeStamp - drag.last.t;
  if (elapsed > 0) {
    drag.speed = (event.clientX - drag.last.x) / elapsed;
  }
  drag.last = { x: event.clientX, t: event.timeStamp };
  drag.dx = event.clientX - drag.x0;
  // the finger moving right brings the previous section in from the left
  const direction = drag.dx > 0 ? -1 : 1;
  if (direction !== drag.direction) {
    stage(gesture, drag, direction);
  }
  position(drag, drag.dx);
};

/** The finger lifts (far or fast enough: the neighbour opens) or the
 * browser takes the gesture over (pointercancel: it springs back). */
const end = (gesture: Gesture, event: PointerEvent) => {
  const { drag } = gesture;
  if (!drag || event.pointerId !== drag.id) {
    return;
  }
  const { dx, speed, width, direction } = drag;
  release(
    gesture,
    event.type === "pointerup" &&
      (Math.abs(dx) > width * distance || (Math.abs(speed) > flick && Math.sign(speed) === -direction)),
  );
};

/**
 * Let a container of sections be swiped between them.
 *
 * @param container - The element holding the [data-panel] sections.
 * @param host - The tabs' side of it (see {@link SwipeHost}).
 */
export const swipe = (container: HTMLElement, host: SwipeHost) => {
  const gesture: Gesture = {
    container,
    host,
    busy: false,
  };
  container.addEventListener("pointerdown", (event) => down(gesture, event));
  container.addEventListener("pointermove", (event) => move(gesture, event));
  container.addEventListener("pointerup", (event) => end(gesture, event));
  container.addEventListener("pointercancel", (event) => end(gesture, event));
};
