// SPDX-FileCopyrightText: © 2026 open-nudge <https://github.com/open-nudge>
// SPDX-License-Identifier: Apache-2.0

// Code highlighting (<CodeBlock>) and the small icons shared by components.
//
// Theme: Kanagawa, lotus (light) and dragon (dark). Both were tuned for their
// own backgrounds; on our gray code surface some tokens fall below 4.5:1, so
// those are darkened / lifted (same hue) to at least 4.6:1. Recompute them
// when changing --surface in src/styles/global.css.
import kanagawaDragon from "@shikijs/themes/kanagawa-dragon";
import kanagawaLotus from "@shikijs/themes/kanagawa-lotus";

export const codeThemes = {
  light: {
    ...kanagawaLotus,
    name: "opennudge-lotus",
    colorReplacements: {
      "#716e61": "#676559",
      "#cc6d00": "#995200",
      "#e82424": "#c91515",
      "#d9a594": "#9b4f37",
      "#77713f": "#6b6639",
      "#4e8ca2": "#3c6b7c",
      "#4d699b": "#4a6494",
      "#6693bf": "#3d6891",
      "#c84053": "#b73547",
      "#b35b79": "#9e4966",
      "#6f894e": "#566a3c",
      "#597b75": "#4d6b66",
      "#6e915f": "#526c47",
      "#d7474b": "#bf2a2e",
      "#de9800": "#875d00",
      "#836f4a": "#746342",
    },
  },
  dark: {
    ...kanagawaDragon,
    name: "opennudge-dragon",
    colorReplacements: {
      "#737c73": "#939b93",
      "#e82424": "#f07272",
      "#8992a7": "#9099ac",
      "#c4746e": "#cc8782",
      "#8a9a7b": "#8f9e80",
      "#76946a": "#86a07b",
      "#c34043": "#d78183",
      "#a292a3": "#a394a4",
      "#b98d7b": "#bb907e",
    },
  },
};

/** Copy button icons (<Terminal>): "idle" and "done" (after copying). */
export const copyIcons = [
  { class: "idle", paths: ["M5.75 5.75h7.5v7.5h-7.5z", "M10.25 5.75v-3h-7.5v7.5h3"] },
  { class: "done", paths: ["m3 8.5 3 3 7-7"] },
];

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
