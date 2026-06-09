import { UpdatedBadge } from "./badges";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1440px] px-3 pb-24 pt-6 sm:px-5 md:pb-6 lg:px-6">{children}</div>;
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
    <div className="mb-8 border-b border-[#27272a] pb-6">
      {kicker ? (
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#6c6c6c]">{kicker}</p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold leading-tight text-[#ffffff] sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#9d9d9d]">{description}</p>
        </div>
        <UpdatedBadge />
      </div>
    </div>
  );
}

export function DataNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#27272a] bg-[#18181b]/50 px-4 py-3 text-[13px] leading-6 text-[#9d9d9d]">
      {children}
    </div>
  );
}
