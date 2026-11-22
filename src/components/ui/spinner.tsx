import { cn, cva, type VariantProps } from "@/lib/utils";

const spinnerStyle = cva({
  base: "inline-flex items-center justify-center gap-0.5 text-current",
  variants: {
    size: {
      xs: "h-3",
      sm: "h-3.5",
      md: "h-4",
      lg: "h-5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const dotStyle = cva({
  base: "inline-block animate-[spinner-dot_1.4s_ease-in-out_infinite_both] rounded-full bg-current",
  variants: {
    size: {
      xs: "size-1",
      sm: "size-1",
      md: "size-1.5",
      lg: "size-1.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps
  extends React.ComponentPropsWithRef<"span">,
    VariantProps<typeof spinnerStyle> {}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(spinnerStyle({ size }), className)}
      {...props}
    >
      <span className={dotStyle({ size })} style={{ animationDelay: "-0.32s" }} />
      <span className={dotStyle({ size })} style={{ animationDelay: "-0.16s" }} />
      <span className={dotStyle({ size })} />
    </span>
  );
}
