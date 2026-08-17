import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <Reveal className={`flex flex-col ${alignment} ${className}`}>
      {eyebrow && (
        <span className="mb-4 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-rose-muted">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-wine-700" />
          {eyebrow}
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-wine-700" />
        </span>
      )}
      <h2 className="font-display text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-white/55 ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
