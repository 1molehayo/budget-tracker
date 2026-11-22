"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn, cva, type VariantProps } from "@/lib/utils";

const trackStyle = cva({
  base: "relative w-full overflow-hidden rounded-full bg-foreground/10 text-accent",
  variants: {
    size: {
      xs: "h-0.5",
      sm: "h-1",
      md: "h-1.5",
      lg: "h-2",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface ProgressProps
  extends React.ComponentPropsWithRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof trackStyle> {
  value: number;
  max?: number;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  className,
  ref,
  ...props
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = max === 0 ? 0 : (clamped / max) * 100;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={clamped}
      max={max}
      className={cn(trackStyle({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-current transition-[width] duration-150 ease-out"
        style={{ width: `${percent}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
