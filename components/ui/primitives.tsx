import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconBack, IconChevron } from "./icons";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: "bg-brand text-brand-ink active:opacity-85 disabled:opacity-40",
    secondary: "bg-surface text-ink border border-line active:bg-surface-2 disabled:opacity-40",
    ghost: "text-brand active:bg-brand-soft disabled:opacity-40",
  };
  return (
    <button
      type="button"
      className={`min-h-[48px] rounded-2xl px-5 text-[16px] font-semibold transition-colors ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>{children}</div>;
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
      className={`flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 active:bg-surface-2 ${className}`}
    >
      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-snug">{title}</div>
        {subtitle && <div className="mt-0.5 text-sm text-ink-2">{subtitle}</div>}
      </div>
      {right}
      <IconChevron width={18} height={18} className="shrink-0 text-ink-2" />
    </Link>
  );
}

export function PageHeader({ title, subtitle, back }: { title: string; subtitle?: ReactNode; back?: string }) {
  return (
    <header className="mb-5">
      {back && (
        <Link href={back} className="-ml-2 mb-2 inline-flex min-h-[44px] items-center gap-1 px-2 text-brand">
          <IconBack width={18} height={18} /> Volver
        </Link>
      )}
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-ink-2">{subtitle}</p>}
    </header>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 mt-7 text-[13px] font-semibold uppercase tracking-wide text-ink-2">{children}</h2>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "ok" | "warn" | "bad" }) {
  const tones = {
    neutral: "bg-surface-2 text-ink-2",
    brand: "bg-brand-soft text-brand",
    ok: "bg-ok-soft text-ok",
    warn: "bg-warn-soft text-warn",
    bad: "bg-bad-soft text-bad",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
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
      className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
    >
      <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ReviewNote() {
  return (
    <p className="mt-6 text-xs text-ink-2">
      Contenido en portugués europeo (PT-PT) <span className="whitespace-nowrap">· pendiente de revisión por un hablante nativo</span>
    </p>
  );
}
