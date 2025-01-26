import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex h-full items-center justify-center py-8", className)}>
      <div className={cn("animate-spin rounded-full border-b-2 border-lodge-brown", sizeMap[size])} />
    </div>
  );
} 