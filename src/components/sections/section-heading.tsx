import { Link } from "@/i18n/navigation";

interface SectionHeadingProps {
  title: string;
  href?: string;
  linkText?: string;
  accent?: boolean;
}

export function SectionHeading({ title, href, linkText, accent }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between mb-10">
      <div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)]">
          {title}
        </h2>
        {accent && <div className="w-10 h-0.5 bg-secondary mt-3" />}
      </div>
      {href && linkText && (
        <Link
          href={href}
          className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted hover:text-foreground border-b border-transparent hover:border-foreground pb-1 transition-all duration-300"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
