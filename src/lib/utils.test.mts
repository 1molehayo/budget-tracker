import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cn, cva } from "./utils.ts";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    assert.equal(cn("px-2", "px-4", false && "hidden", "text-sm"), "px-4 text-sm");
  });
});

describe("cva", () => {
  it("builds variant class names", () => {
    const style = cva({
      base: "btn",
      variants: {
        tone: {
          primary: "bg-accent",
          ghost: "bg-transparent",
        },
      },
      defaultVariants: {
        tone: "primary",
      },
    });

    assert.equal(style(), "btn bg-accent");
    assert.equal(style({ tone: "ghost" }), "btn bg-transparent");
  });
});
