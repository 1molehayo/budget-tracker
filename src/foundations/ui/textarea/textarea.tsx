"use client";

/**
 * Adapted from Significa Foundations.
 * License: GPL-3.0-only
 * https://github.com/significa/foundations
 */

import type { VariantProps } from "cva";

import { inputStyle } from "@/foundations/ui/input/input";
import { cn } from "@/lib/utils/classnames";

interface TextareaProps extends React.ComponentPropsWithRef<"textarea"> {
  invalid?: boolean;
  variant?: VariantProps<typeof inputStyle>["variant"];
}

const Textarea = ({ className, invalid, variant, ...props }: TextareaProps) => {
  return (
    <textarea
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      className={cn(inputStyle({ variant }), "h-auto resize-none py-2 leading-snug", className)}
      {...props}
    />
  );
};

export { Textarea };
