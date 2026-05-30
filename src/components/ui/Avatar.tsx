import { avatarGradient } from "@/lib/utils";

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
} as const;

interface AvatarProps {
  handle: string;
  displayName: string;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({ handle, displayName, size = "md" }: AvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none`}
      style={{ background: avatarGradient(handle) }}
      aria-label={displayName}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}
