"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, cva, type VariantProps } from "@/lib/utils";

const avatarStyle = cva({
  base: "relative flex items-center justify-center overflow-hidden bg-foreground-secondary/10 font-semibold text-foreground/80",
  variants: {
    size: {
      sm: "size-8 text-xs",
      md: "size-10 text-sm",
      lg: "size-12 text-base",
    },
    variant: {
      circle: "rounded-full",
      square: "rounded-md",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "circle",
  },
});

function AvatarRoot({
  className,
  size,
  variant,
  ...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarStyle>) {
  return (
    <AvatarPrimitive.Root
      className={cn(avatarStyle({ size, variant }), className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image className={cn("aspect-square size-full object-cover", className)} {...props} />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn("flex size-full items-center justify-center opacity-80", className)}
      {...props}
    />
  );
}

export const Avatar = Object.assign(AvatarRoot, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
