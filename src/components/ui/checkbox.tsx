"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn, cva } from "@/lib/utils";

const checkboxStyle = cva({
  base: [
    "relative flex size-5 shrink-0 items-center justify-center rounded-sm border border-border bg-background shadow-xs outline-none transition",
    "focus-visible:ring-(length:--ring-width) ring-ring",
    "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "enabled:cursor-pointer",
  ],
});

function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export type CheckboxProps = React.ComponentPropsWithRef<typeof CheckboxPrimitive.Root>;

export function Checkbox({ className, ref, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(checkboxStyle(), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-accent-foreground">
        <CheckMark className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
