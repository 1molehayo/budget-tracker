import { cn, cva } from "@/lib/utils";

const tableStyle = cva({
  base: [
    "w-full caption-bottom border-collapse text-sm",
    "[--table-cell-px:--spacing(4)] [--table-cell-py:--spacing(3)]",
  ],
  variants: {
    density: {
      sm: "[--table-cell-py:--spacing(2)]",
      md: "[--table-cell-py:--spacing(3)]",
    },
  },
  defaultVariants: {
    density: "md",
  },
});

const cellAlignStyle = cva({
  variants: {
    align: {
      start: "text-start",
      center: "text-center",
      end: "text-end",
    },
  },
  defaultVariants: {
    align: "start",
  },
});

function TableContainer({
  ref,
  className,
  bordered = true,
  ...props
}: React.ComponentPropsWithRef<"div"> & { bordered?: boolean }) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-x-auto",
        bordered && "rounded-lg border border-border shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function TableRoot({
  ref,
  className,
  density,
  ...props
}: React.ComponentPropsWithRef<"table"> & { density?: "sm" | "md" }) {
  return <table ref={ref} className={cn(tableStyle({ density }), className)} {...props} />;
}

function TableHeader({
  ref,
  className,
  sticky,
  ...props
}: React.ComponentPropsWithRef<"thead"> & { sticky?: boolean }) {
  return (
    <thead
      ref={ref}
      className={cn(
        "[&_tr]:border-b [&_tr]:border-border",
        sticky && "sticky top-0 z-10 bg-background",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ ref, className, ...props }: React.ComponentPropsWithRef<"tbody">) {
  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0 [&_tr]:border-b [&_tr]:border-border", className)}
      {...props}
    />
  );
}

function TableFooter({ ref, className, ...props }: React.ComponentPropsWithRef<"tfoot">) {
  return (
    <tfoot
      ref={ref}
      className={cn("border-t border-border bg-foreground/2 font-medium", className)}
      {...props}
    />
  );
}

function TableRow({ ref, className, ...props }: React.ComponentPropsWithRef<"tr">) {
  return <tr ref={ref} className={cn("transition-colors", className)} {...props} />;
}

function TableHead({
  ref,
  className,
  align,
  ...props
}: Omit<React.ComponentPropsWithRef<"th">, "align"> & {
  align?: "start" | "center" | "end";
}) {
  return (
    <th
      ref={ref}
      className={cn(
        "h-10 px-(--table-cell-px) align-middle font-medium whitespace-nowrap text-foreground-secondary",
        cellAlignStyle({ align }),
        className,
      )}
      {...props}
    />
  );
}

function TableCell({
  ref,
  className,
  align,
  ...props
}: Omit<React.ComponentPropsWithRef<"td">, "align"> & {
  align?: "start" | "center" | "end";
}) {
  return (
    <td
      ref={ref}
      className={cn(
        "px-(--table-cell-px) py-(--table-cell-py) align-middle",
        cellAlignStyle({ align }),
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ ref, className, ...props }: React.ComponentPropsWithRef<"caption">) {
  return (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-foreground-secondary", className)}
      {...props}
    />
  );
}

export const Table = Object.assign(TableRoot, {
  Container: TableContainer,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
});
