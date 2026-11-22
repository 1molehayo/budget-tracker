import { cn, type VariantProps } from "@/lib/utils";
import { inputStyle } from "@/components/ui/input";

const chevron =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="#111827" d="M3.7 5.3 8 9.6l4.3-4.3.7.7-5 5-5-5z"/></svg>',
  );

export interface SelectProps
  extends Omit<React.ComponentPropsWithRef<"select">, "size">,
    VariantProps<typeof inputStyle> {
  invalid?: boolean;
}

export function Select({
  className,
  invalid,
  size,
  variant,
  ref,
  style,
  ...props
}: SelectProps) {
  return (
    <select
      ref={ref}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      className={cn(
        inputStyle({ variant, size }),
        "appearance-none bg-size-[1em] bg-no-repeat pr-10",
        className,
      )}
      style={{
        backgroundImage: `url("${chevron}")`,
        backgroundPosition: "right 0.5rem center",
        ...style,
      }}
      {...props}
    />
  );
}
