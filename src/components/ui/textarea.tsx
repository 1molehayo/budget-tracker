import { cn, cva, type VariantProps } from "@/lib/utils";
import { inputStyle } from "@/components/ui/input";

const textareaStyle = cva({
  base: "min-h-24 py-3",
  variants: {
    variant: {
      default: "",
      minimal: "",
    },
    size: {
      xs: "",
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface TextareaProps
  extends Omit<React.ComponentPropsWithRef<"textarea">, "size">,
    VariantProps<typeof inputStyle> {
  invalid?: boolean;
}

export function Textarea({
  className,
  invalid,
  size,
  variant,
  ref,
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      className={cn(inputStyle({ variant, size }), textareaStyle({ variant, size }), className)}
      {...props}
    />
  );
}
