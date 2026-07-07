import * as React from "react";

import { cn } from "@/core/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/** Loading placeholder — animated shimmer block. Size it via className. */
const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div className={cn("animate-pulse rounded-md bg-red-100/70", className)} {...props} />
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
