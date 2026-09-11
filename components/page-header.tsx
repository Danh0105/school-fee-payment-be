import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[26px] border border-[#078247]/12 bg-[linear-gradient(115deg,rgba(255,255,255,0.98),rgba(243,249,239,0.94))] px-5 py-5 shadow-[0_18px_48px_-38px_rgba(5,76,59,0.55)] sm:px-6">
      <div className="pointer-events-none absolute -right-10 -top-16 size-40 rounded-full border border-[#237fb5]/12" />
      <div className="pointer-events-none absolute -right-2 top-3 size-20 rounded-full border border-[#dfa72f]/20" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.19em] text-[#237fb5]">
              <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-[#078247] to-[#75b83c]" />
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-2xl font-black tracking-tight text-[#123f36] sm:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#58736d]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
