"use client";

import { type ButtonHTMLAttributes } from "react";

const variantClasses = {
  primary:
    "bg-[#6366F1] text-white hover:bg-[#818CF8] active:bg-[#6366F1]",
  secondary:
    "bg-transparent text-[#F4F4F5] border border-white/10 hover:bg-white/[0.04] active:bg-white/[0.06]",
  ghost:
    "bg-transparent text-[#F4F4F5] hover:bg-white/[0.04] active:bg-white/[0.06]",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
