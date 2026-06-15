import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r-md)] border text-[15px] font-bold transition duration-150 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cb-yellow)] disabled:pointer-events-none disabled:opacity-60 disabled:active:scale-100 disabled:focus-visible:outline-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] shadow-[var(--sh-glow)] hover:bg-[var(--cb-yellow-2)]",
        outline:
          "border-[var(--cb-line-2)] bg-[var(--cb-surface-2)] text-[var(--cb-text)] hover:bg-[var(--cb-surface-3)]",
        secondary: "border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[var(--cb-text-2)]",
        ghost: "border-transparent bg-transparent text-[var(--cb-text-2)] hover:bg-[var(--cb-surface-2)]",
        destructive:
          "border-[rgba(255,107,91,.35)] bg-[rgba(255,107,91,.14)] text-[var(--cb-danger)] hover:border-[rgba(255,107,91,.55)] hover:bg-[rgba(255,107,91,.20)]",
        kakao: "border-[#FEE500] bg-[#FEE500] text-[#191600] hover:bg-[#ffef4a]"
      },
      size: {
        default: "h-[54px] px-4 py-2",
        sm: "h-[42px] px-3 text-[13px]",
        icon: "h-[38px] w-[38px] rounded-full p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
