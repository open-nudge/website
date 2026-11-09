// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// The small icons shared by components.

/** Copy button icons (<CopyButton>): "idle" and "done" (after copying). */
export const copyIcons = [
  { class: "idle", paths: ["M5.75 5.75h7.5v7.5h-7.5z", "M10.25 5.75v-3h-7.5v7.5h3"] },
  { class: "done", paths: ["m3 8.5 3 3 7-7"] },
];

/** Right-pointing chevron (<Tabs>: the carousel's arrows; mirrored for "previous"). */
export const chevronPath = "m6 3.5 4.5 4.5L6 12.5";

/** opennudge.com's bouncing arrow: a filled chevron pointing down (24x24). */
export const arrowPath =
  "M12 17c-.3 0-.6-.1-.8-.3l-6-6a1 1 0 0 1 1.4-1.4L12 14.6l5.4-5.3a1 1 0 1 1 1.4 1.4l-6 6c-.2.2-.5.3-.8.3z";

/**
 * Attributes of our 16x16 stroke icons. A function, not a shared object: Astro
 * adds its scoped class to a spread object in place (`{...attributes}`), so
 * one object would collect the classes of every component that uses it.
 */
export const iconAttributes = () =>
  ({
    viewBox: "0 0 16 16",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
  }) as const;

/** GitHub's mark (filled, 16x16): the top bar and project cards. */
export const githubMark =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
