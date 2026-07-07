"use client";

import { useRive, type UseRiveParameters } from "@rive-app/react-canvas";

import { cn } from "@/core/utils/cn";

export interface RiveAnimationProps {
  /** Path/URL to the `.riv` file (e.g. "/rive/gacha.riv" from /public). */
  src: string;
  /** Optional state machine to drive (recommended for interactive gacha art). */
  stateMachines?: string | string[];
  /** Optional artboard name inside the .riv file. */
  artboard?: string;
  autoplay?: boolean;
  className?: string;
  /** Extra useRive params (onStateChange, layout, etc.). */
  riveParams?: UseRiveParameters;
}

/**
 * Thin wrapper around Rive's `useRive` hook. Renders a `.riv` animation.
 * Client-only ("use client") — Rive needs the DOM/canvas.
 */
export function RiveAnimation({
  src,
  stateMachines,
  artboard,
  autoplay = true,
  className,
  riveParams,
}: RiveAnimationProps) {
  const { RiveComponent } = useRive({
    src,
    artboard,
    stateMachines,
    autoplay,
    ...riveParams,
  });

  return <RiveComponent className={cn("h-full w-full", className)} />;
}

export default RiveAnimation;
