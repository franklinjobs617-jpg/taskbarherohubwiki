import { UpdatedBadge } from "./badges";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1440px] px-3 py-5 sm:px-4 lg:px-6">{children}</div>;
}

export function PageHeader({
  title,
  description,
  kicker,
}: {
  title: string;
  description: string;
  kicker?: string;
}) {
  return (
    <div className="mb-6 border-b border-[#242424] pb-5">
      {kicker ? <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-[#777]">{kicker}</p> : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f1e8d5] md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8f8778]">{description}</p>
        </div>
        <UpdatedBadge />
      </div>
    </div>
  );
}

export function DataNotice({ children }: { children: React.ReactNode }) {
  return <div className="border border-amber-800/70 bg-amber-950/20 p-3 text-sm text-amber-200/80">{children}</div>;
}
