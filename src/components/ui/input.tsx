import { cn, cva, type VariantProps } from "@/lib/utils";

const inputStyle = cva({
  base: [
    "w-full border outline-none transition",
    "font-medium placeholder:text-foreground-secondary",
    "focus-visible:ring-(length:--ring-width) ring-ring focus-visible:border-accent",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:border-error aria-invalid:ring-error/20",
    "data-[invalid]:border-error data-[invalid]:ring-error/20",
  ],
  variants: {
    variant: {
      default:
        "border-border bg-background shadow-xs hover:border-[color-mix(in_oklab,var(--color-border),var(--color-foreground)_8%)]",
      minimal: "border-transparent bg-transparent hover:bg-background-secondary focus-visible:bg-background",
    },
    size: {
      xs: "h-6 rounded-lg px-2 text-sm",
      sm: "h-8 rounded-lg px-3 text-sm",
      md: "h-10 rounded-xl px-4 text-base",
      lg: "h-12 rounded-2xl px-5 text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type InputSize = NonNullable<VariantProps<typeof inputStyle>["size"]>;
export type InputVariant = NonNullable<VariantProps<typeof inputStyle>["variant"]>;

export interface InputProps
  extends Omit<React.ComponentPropsWithRef<"input">, "size">,
    VariantProps<typeof inputStyle> {
  invalid?: boolean;
}

export function Input({
  className,
  invalid,
  size,
  variant,
  ref,
  ...props
}: InputProps) {
  return (
    <input
      ref={ref}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      className={cn(inputStyle({ variant, size }), className)}
      {...props}
    />
  );
}

export { inputStyle };
