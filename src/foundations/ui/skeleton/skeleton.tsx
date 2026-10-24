"use client";

/**
 * Adapted from Significa Foundations.
 * License: GPL-3.0-only
 * https://github.com/significa/foundations
 */

import { cn } from "@/lib/utils/classnames";

const Skeleton = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => {
  return <div className={cn("animate-pulse rounded-md bg-foreground/10", className)} {...props} />;
};

export { Skeleton };
