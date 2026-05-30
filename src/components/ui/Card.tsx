import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-[#111113] border border-white/[0.08] rounded-xl p-5 hover:border-white/[0.14] transition-colors ${className}`}
    >
      {children}
    </div>
  );
}
