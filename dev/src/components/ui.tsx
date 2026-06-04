"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Home, MessageCircle, UserRound, UsersRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppScreen } from "@/lib/routes";

const buttonVariants = cva(
  "inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-[var(--r-md)] border text-[15px] font-bold transition disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] text-[var(--cb-on-yellow)] shadow-[var(--sh-glow)] hover:bg-[var(--cb-yellow-2)]",
        outline: "border-[var(--cb-line-2)] bg-[var(--cb-surface-2)] text-[var(--cb-text)] hover:bg-[var(--cb-surface-3)]",
        kakao: "border-[#FEE500] bg-[#FEE500] text-[#191600]",
        danger: "border-[rgba(255,107,91,.35)] bg-[rgba(255,107,91,.14)] text-[var(--cb-danger)]"
      },
      size: {
        md: "h-[54px]",
        sm: "h-[42px] text-[13px]",
        icon: "h-[38px] w-[38px] rounded-full p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Chip({
  active,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-[34px] shrink-0 items-center gap-1 rounded-[var(--r-pill)] border px-3.5 text-[12.5px] font-medium transition",
        active
          ? "border-[var(--cb-yellow)] bg-[var(--cb-yellow)] font-bold text-[var(--cb-on-yellow)]"
          : "border-[var(--cb-line)] bg-[var(--cb-surface-2)] text-[var(--cb-text-2)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  multiline,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; multiline?: boolean }) {
  const field =
    multiline ? (
      <textarea
        className={cn(inputClassName, "min-h-[74px] resize-none items-start", className)}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    ) : (
      <input className={cn(inputClassName, className)} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
    );

  return (
    <label className="flex flex-col gap-2">
      {label ? <span className="text-[12.5px] font-semibold text-[var(--cb-text-2)]">{label}</span> : null}
      {field}
      {error ? <span className="text-[11px] font-semibold text-[var(--cb-danger)]">{error}</span> : null}
    </label>
  );
}

const inputClassName =
  "min-h-[48px] rounded-[var(--r-md)] border border-[var(--cb-line)] bg-[var(--cb-surface-2)] px-3.5 py-3 text-sm text-[var(--cb-text)] outline-none placeholder:text-[var(--cb-text-3)] focus:border-[var(--cb-yellow-line)]";

export function Modal({
  title,
  children,
  onClose,
  position = "bottom"
}: {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  position?: "bottom" | "center";
}) {
  return (
    <div className="absolute inset-0 z-40 bg-black/55">
      <section
        className={cn(
          "absolute border border-[var(--cb-line-2)] bg-[var(--cb-surface-1)] p-4 shadow-[var(--sh-pop)]",
          position === "bottom"
            ? "inset-x-3.5 bottom-3.5 rounded-[var(--r-xl)]"
            : "left-1/2 top-1/2 w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--r-xl)]"
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-[15px] font-bold">{title}</h2>
          <button
            aria-label="닫기"
            className="grid h-8 w-8 place-items-center rounded-full bg-[var(--cb-surface-2)] text-[var(--cb-text-2)]"
            onClick={onClose}
            type="button"
          >
            <X size={17} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("surface-card p-3.5", className)}>{children}</section>;
}

export function Avatar({ name, host }: { name: string; host?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-[var(--cb-surface-3)] text-[13px] font-bold uppercase text-[var(--cb-text-2)]",
        host ? "border-[var(--cb-yellow)] text-[var(--cb-yellow)] shadow-[0_0_0_1px_var(--cb-yellow-line)]" : "border-[var(--cb-line)]"
      )}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function AppBar({
  title,
  left,
  right
}: {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="relative flex h-[52px] shrink-0 items-center gap-2 px-3.5">
      {left}
      {title ? (
        <div className="absolute left-1/2 max-w-[210px] -translate-x-1/2 truncate text-center text-[16px] font-semibold">
          {title}
        </div>
      ) : null}
      <div className="ml-auto flex items-center gap-2">{right}</div>
    </header>
  );
}

export function BottomNav({ active }: { active?: AppScreen["nav"] }) {
  const tabs = [
    { key: "home", label: "홈", href: "/home", icon: Home },
    { key: "rooms", label: "동행", href: "/rooms", icon: UsersRound },
    { key: "my", label: "내 방", href: "/my-rooms", icon: MessageCircle },
    { key: "profile", label: "프로필", href: "/profile", icon: UserRound }
  ] as const;

  return (
    <nav className="flex h-16 shrink-0 border-t border-[var(--cb-line)] bg-[rgba(14,14,16,.92)] backdrop-blur">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold",
              active === tab.key ? "text-[var(--cb-yellow)]" : "text-[var(--cb-text-3)]"
            )}
          >
            <Icon size={23} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Stepper({
  value,
  onMinus,
  onPlus
}: {
  value: string;
  onMinus?: () => void;
  onPlus?: () => void;
}) {
  return (
    <div className="inline-flex h-[34px] items-center gap-1 rounded-[var(--r-pill)] border border-[var(--cb-line)] bg-[var(--cb-surface-3)] px-1">
      <button className="grid h-[26px] w-[26px] place-items-center rounded-full" onClick={onMinus} type="button">
        -
      </button>
      <span className="min-w-[54px] text-center text-xs font-bold">{value}</span>
      <button className="grid h-[26px] w-[26px] place-items-center rounded-full" onClick={onPlus} type="button">
        +
      </button>
    </div>
  );
}
