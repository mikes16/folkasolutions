import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "sale" | "sold-out" | "new";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-foreground text-primary-foreground",
  sale: "bg-red-500 text-white",
  "sold-out": "bg-muted text-white",
  new: "bg-[#803cee] text-white",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
