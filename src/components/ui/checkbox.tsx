"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@phosphor-icons/react";
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

export type CheckboxProps = React.ComponentPropsWithRef<typeof CheckboxPrimitive.Root>;

export function Checkbox({ className, ref, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(checkboxStyle(), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-accent-foreground">
        <CheckIcon className="size-3.5" weight="bold" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
