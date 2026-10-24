import { cn } from "@/lib/utils/classnames";

export function Panel({ className, ...props }: React.ComponentPropsWithRef<"section">) {
  return (
    <section
      className={cn("rounded-xl border border-border bg-background shadow-xs", className)}
      {...props}
    />
  );
}

export function PanelHeader({ className, ...props }: React.ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3", className)}
      {...props}
    />
  );
}

export function PanelTitle({ className, ...props }: React.ComponentPropsWithRef<"h2">) {
  return <h2 className={cn("text-base font-semibold", className)} {...props} />;
}

export function PanelContent({ className, ...props }: React.ComponentPropsWithRef<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}
