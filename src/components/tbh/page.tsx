import { UpdatedBadge } from "./badges";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1440px] px-3 pb-24 pt-6 sm:px-5 md:pb-8 lg:px-6">{children}</div>;
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
    <div className="mb-8 border-b-2 border-border-default pb-6">
      {kicker ? (
        <p className="section-eyebrow mb-2">{kicker}</p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-pixel text-heading-lg font-semibold leading-tight text-text-primary sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-body leading-relaxed text-text-secondary">{description}</p>
        </div>
        <UpdatedBadge />
      </div>
    </div>
  );
}

export function DataNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel rounded-md px-4 py-3 text-body-sm leading-6 text-text-secondary">
      {children}
    </div>
  );
}
