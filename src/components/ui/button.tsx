"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn, cva, type VariantProps } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const buttonStyle = cva({
  base: [
    "relative inline-flex h-(--button-height) shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-medium text-(--button-text-color) shadow-xs [--button-text-color:var(--color-foreground)]",
    "transition enabled:cursor-pointer disabled:opacity-40",
    "focus-visible:ring-(length:--ring-width) ring-ring focus-visible:outline-none",
  ],
  variants: {
    variant: {
      primary:
        "bg-accent [--button-text-color:var(--color-accent-foreground)] hover:bg-accent/90",
      outline:
        "border border-border bg-background hover:bg-foreground/2 focus-visible:border-accent",
      ghost: "border-none bg-transparent shadow-none ring-0 hover:bg-foreground/5",
      destructive:
        "bg-error ring-error/50 [--button-text-color:var(--color-white)] hover:bg-error/90",
    },
    size: {
      xs: "rounded-lg px-2 text-sm [--button-height:--spacing(6)]",
      sm: "rounded-lg px-3 text-sm [--button-height:--spacing(8)]",
      md: "rounded-xl px-4 text-base [--button-height:--spacing(10)]",
      lg: "rounded-2xl px-5 text-base [--button-height:--spacing(12)]",
    },
    square: {
      true: "w-(--button-height) px-0",
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    square: false,
  },
});

export interface ButtonProps
  extends React.ComponentPropsWithRef<"button">,
    VariantProps<typeof buttonStyle> {
  asChild?: boolean;
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant,
  asChild = false,
  isLoading,
  size = "md",
  square,
  type = "button",
  disabled,
  ref,
  ...props
}: ButtonProps) {
  const classes = cn(
    buttonStyle({ variant, size, square, className }),
    isLoading && !asChild && "text-transparent",
  );

  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={classes}
      {...props}
    >
      {children}
      {isLoading ? (
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-(--button-text-color)">
          <Spinner size={size === "lg" ? "md" : size === "xs" ? "xs" : "sm"} />
        </span>
      ) : null}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "square"> {
  "aria-label": string;
}

export function IconButton({ ref, ...props }: IconButtonProps) {
  return <Button square ref={ref} {...props} />;
}
