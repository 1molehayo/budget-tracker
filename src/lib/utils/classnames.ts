/**
 * Adapted from Significa Foundations.
 * License: GPL-3.0-only
 * https://github.com/significa/foundations
 */

import { defineConfig } from "cva";
import { twMerge } from "tailwind-merge";

export const {
  cva,
  cx: cn,
  compose,
} = defineConfig({
  hooks: {
    onComplete: (className) => twMerge(className),
  },
});
