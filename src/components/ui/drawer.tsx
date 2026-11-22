"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn, cva, type VariantProps } from "@/lib/utils";

const drawerContentStyle = cva({
  base: "fixed z-50 flex flex-col border-border bg-background shadow-lg outline-none",
  variants: {
    side: {
      left: "inset-y-0 left-0 h-full w-full border-r",
      right: "inset-y-0 right-0 h-full w-full border-l",
    },
  },
  defaultVariants: {
    side: "left",
  },
});

function DrawerRoot(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DrawerContent({
  className,
  side = "left",
  children,
  ...props
}: React.ComponentPropsWithRef<typeof DialogPrimitive.Content> &
  VariantProps<typeof drawerContentStyle>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(drawerContentStyle({ side }), className)}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const Drawer = Object.assign(DrawerRoot, {
  Content: DrawerContent,
  Close: DialogPrimitive.Close,
  Trigger: DialogPrimitive.Trigger,
});
