import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}

/** Shared hero band for the inner public pages. */
export default function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden pb-16 pt-40 sm:pt-48">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_50%_0%,rgba(139,0,0,0.32),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-wine-700/60 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.4em] text-rose-muted">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-crimson-500" />
            {eyebrow}
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-crimson-500" />
          </span>
          <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-6 max-w-2xl text-[0.98rem] leading-relaxed text-white/55">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </header>
  );
}
