import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconBack, IconChevron } from "./icons";

type Variant = "primary" | "secondary" | "ghost";

/** Botón en píldora. Un solo color de acción; el resto, discreto. */
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: "bg-brand text-brand-ink active:brightness-90 disabled:opacity-35",
    secondary: "bg-surface-2 text-ink active:brightness-95 disabled:opacity-35",
    ghost: "text-brand active:opacity-60 disabled:opacity-35",
  };
  return (
    <button
      type="button"
      className={`min-h-[50px] rounded-full px-6 text-[17px] font-medium tracking-[-0.016em] transition ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-surface p-5 shadow-card ${className}`}>{children}</div>;
}

export function LinkCard({
  href,
  title,
  subtitle,
  right,
  className = "",
}: {
  href: string;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl bg-surface px-4 py-4 shadow-card transition active:scale-[0.99] active:opacity-80 ${className}`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[17px] font-semibold leading-snug tracking-[-0.02em]">{title}</div>
        {subtitle && <div className="mt-0.5 text-[15px] leading-snug text-ink-2">{subtitle}</div>}
      </div>
      {right}
      <IconChevron width={16} height={16} strokeWidth={2.2} className="shrink-0 text-ink-2/50" />
    </Link>
  );
}

/** Título grande al estilo de las apps del sistema. */
export function PageHeader({ title, subtitle, back }: { title: string; subtitle?: ReactNode; back?: string }) {
  return (
    <header className="mb-7 pt-2">
      {back && (
        <Link href={back} className="-ml-1.5 mb-1 inline-flex min-h-[44px] items-center gap-0.5 pr-2 text-[17px] text-brand">
          <IconBack width={20} height={20} strokeWidth={2.2} /> Volver
        </Link>
      )}
      <h1 className="text-[34px] font-bold leading-[1.08] tracking-[-0.03em]">{title}</h1>
      {subtitle && <p className="mt-2 text-[17px] leading-relaxed text-ink-2">{subtitle}</p>}
    </header>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 mt-10 text-[22px] font-bold tracking-[-0.025em]">{children}</h2>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "ok" | "warn" | "bad" }) {
  const tones = {
    neutral: "bg-surface-2 text-ink-2",
    brand: "bg-brand-soft text-brand",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    bad: "bg-bad-soft text-bad",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
    >
      <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ReviewNote() {
  return (
    <p className="mt-10 text-center text-[12px] leading-relaxed text-ink-2">
      Portugués europeo (PT-PT) · pendiente de revisión por un hablante nativo
    </p>
  );
}
