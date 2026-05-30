"use client";

import { type ButtonHTMLAttributes } from "react";

const variantClasses = {
  primary:
    "bg-[#1d9bf0] text-white font-medium hover:bg-[#1a8cd8] active:bg-[#1d9bf0]",
  secondary:
    "bg-transparent text-[#e7e9ea] border border-white/10 hover:bg-white/[0.04] hover:border-white/[0.12] active:bg-white/[0.06]",
  ghost:
    "bg-transparent text-[#e7e9ea] hover:bg-white/[0.04] active:bg-white/[0.06]",
  danger:
    "bg-[rgba(239,68,68,0.12)] text-[#EF4444] border border-[rgba(239,68,68,0.20)] hover:bg-[rgba(239,68,68,0.18)]",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000] disabled:pointer-events-none disabled:opacity-40 cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
