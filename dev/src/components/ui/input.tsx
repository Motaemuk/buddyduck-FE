import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function Input({ className, type, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "min-h-[48px] w-full rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 py-3 text-sm text-[var(--cb-text)] outline-none transition duration-150 placeholder:text-[var(--cb-text-3)] hover:border-[var(--cb-line-2)] focus:border-[var(--cb-yellow-line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--cb-line)] disabled:focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
});

export { Input };
