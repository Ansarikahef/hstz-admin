import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function HzStatCard({ label, value, delta, deltaLabel, icon: Icon, accent = "default", testid }) {
  const accents = {
    default: "bg-[#F4F1EA] text-[#162D24]",
    cta: "bg-[#D9734E]/10 text-[#D9734E]",
    success: "bg-[#E9F2EB] text-[#4A7856]",
    info: "bg-[#EAF1F7] text-[#4A6E8C]",
    warning: "bg-[#FDF6ED] text-[#8A6024]",
  };
  const positive = delta != null && delta >= 0;
  return (
    <div
      data-testid={testid || "stat-card"}
      className="hz-card p-6 flex flex-col gap-4 group"
    >
      <div className="flex items-center justify-between">
        <span className="hz-label">{label}</span>
        {Icon && (
          <div className={`size-10 rounded-xl flex items-center justify-center ${accents[accent]}`}>
            <Icon className="size-5" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <div className="hz-heading text-3xl sm:text-4xl font-medium tracking-tight text-[var(--hz-text)]">
          {value}
        </div>
      </div>
      {delta != null && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              positive ? "text-[#4A7856]" : "text-[#C04235]"
            }`}
          >
            {positive ? <ArrowUpRight className="size-3.5" strokeWidth={2} /> : <ArrowDownRight className="size-3.5" strokeWidth={2} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-[var(--hz-text-2)]">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
