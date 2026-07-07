import * as React from "react";

import { Input, type InputProps } from "@/components/atoms/input";
import { cn } from "@/core/utils";

type AuthFieldProps = InputProps & {
  label: string;
  error?: string;
};

export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, className, ...props }, ref) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#cfc5a8]">{label}</span>
      <Input
        ref={ref}
        className={cn(
          "border-[#c8a961]/40 bg-white/5 text-[#f3ead2] placeholder:text-[#5d6470] focus-visible:ring-[#c8a961]",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-[#ff9d9d]">{error}</span>}
    </label>
  ),
);
AuthField.displayName = "AuthField";
