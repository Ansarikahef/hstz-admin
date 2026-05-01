export default function HzPageHeader({ kicker, title, description, actions, testid = "page-header" }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8" data-testid={testid}>
      <div>
        {kicker && <div className="hz-label mb-2">{kicker}</div>}
        <h1 className="hz-heading text-3xl sm:text-4xl font-medium text-[var(--hz-text)] leading-[1.05]">
          {title}
        </h1>
        {description && (
          <p className="text-[var(--hz-text-2)] mt-2 max-w-2xl text-[15px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
