import { useMemo, useState } from "react";
import {
  Trophy, Search, Filter, Download, Printer, Calendar, X, Eye, User,
  Sparkles, Plane, ArrowUpRight, Layers,
} from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import HzStatCard from "@/components/shared/HzStatCard";
import HzInput from "@/components/shared/HzInput";
import TravellerProfileModal from "@/components/modals/TravellerProfileModal";
import { db, formatDate, formatDateTime } from "@/lib/mockData";
import { toast } from "sonner";

const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function fmtMonth(m) {
  if (!m) return "—";
  const [y, mo] = m.split("-");
  return `${MONTH_FULL[parseInt(mo, 10) - 1]} ${y}`;
}

export default function Winners() {
  const [state] = useState(() => db.load());
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("all");
  const [packageId, setPackageId] = useState("all");
  const [profileOpen, setProfileOpen] = useState(null);

  // Aggregate winners across bookings
  const winners = useMemo(() => {
    const list = [];
    state.bookings.forEach((b) => {
      (b.travellers || []).forEach((t) => {
        if (t.winnerInfo) {
          list.push({
            ...t,
            bookingId: b.id,
            userId: b.userId,
            packageId: b.packageId,
            bookingStatus: b.status,
            travelDate: b.travelDate,
            bookingDate: b.bookingDate,
          });
        }
      });
    });
    // Latest winners first
    list.sort((a, b) => new Date(b.winnerInfo.markedAt) - new Date(a.winnerInfo.markedAt));
    return list;
  }, [state.bookings]);

  const monthOptions = useMemo(() => {
    const set = new Set(winners.map((w) => w.winnerInfo.month).filter(Boolean));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [winners]);

  const filtered = useMemo(() => {
    return winners.filter((w) => {
      const fullName = (w.firstName && w.lastName ? `${w.firstName} ${w.lastName}` : w.name || "").toLowerCase();
      const text = `${fullName} ${w.winnerInfo.remark || ""}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (month !== "all" && w.winnerInfo.month !== month) return false;
      if (packageId !== "all" && w.packageId !== packageId) return false;
      return true;
    });
  }, [winners, q, month, packageId]);

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((w) => {
      const key = w.winnerInfo.month || "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(w);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  // Stats
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonthCount = winners.filter((w) => w.winnerInfo.month === currentMonthKey).length;
  const uniquePackages = new Set(winners.map((w) => w.packageId)).size;
  const latest = winners[0];
  const latestName = latest ? (latest.firstName && latest.lastName ? `${latest.firstName} ${latest.lastName}` : latest.name) : null;

  const exportCsv = () => {
    if (!filtered.length) {
      toast.error("Nothing to export with the current filters.");
      return;
    }
    const rows = [["Month", "Name", "Relation", "Gender", "Package", "Booking", "Travel date", "Remark", "Marked at"]];
    filtered.forEach((w) => {
      const pkg = state.packages.find((p) => p.id === w.packageId);
      rows.push([
        fmtMonth(w.winnerInfo.month),
        w.firstName && w.lastName ? `${w.firstName} ${w.lastName}` : w.name || "",
        w.relation || "",
        w.gender || "",
        pkg?.name || "",
        w.bookingId || "",
        w.travelDate || "",
        (w.winnerInfo.remark || "").replace(/\n/g, " "),
        w.winnerInfo.markedAt || "",
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hz-winners-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Winners CSV exported");
  };

  const clearFilters = () => { setQ(""); setMonth("all"); setPackageId("all"); };
  const filtersActive = q || month !== "all" || packageId !== "all";

  return (
    <div data-testid="winners-page">
      <div className="hz-no-print">
        <HzPageHeader
          kicker="Spotlight"
          title="Winners roster"
          description="Every traveller marked as a winner — aggregated by month for HR, marketing, and post-trip storytelling."
          actions={
            <>
              <button className="hz-btn-ghost" onClick={exportCsv} data-testid="winners-export">
                <Download className="size-4" strokeWidth={1.5} /> Export CSV
              </button>
              <button className="hz-btn-primary" onClick={() => window.print()} data-testid="winners-print">
                <Printer className="size-4" strokeWidth={1.75} /> Print spotlight
              </button>
            </>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <HzStatCard
            label="Total winners"
            value={winners.length}
            icon={Trophy}
            accent="cta"
            testid="winners-stat-total"
          />
          <HzStatCard
            label="This month"
            value={thisMonthCount}
            icon={Sparkles}
            accent="success"
            testid="winners-stat-month"
          />
          <HzStatCard
            label="Across packages"
            value={uniquePackages}
            icon={Layers}
            accent="info"
            testid="winners-stat-packages"
          />
          <div className="hz-card p-6" data-testid="winners-stat-latest">
            <div className="flex items-center justify-between">
              <span className="hz-label">Latest winner</span>
              <div className="size-10 rounded-xl flex items-center justify-center bg-[#FDF1EB] text-[var(--hz-cta)]">
                <ArrowUpRight className="size-5" strokeWidth={1.5} />
              </div>
            </div>
            <div className="mt-3 hz-heading text-lg font-medium leading-tight truncate">
              {latestName || "No winners yet"}
            </div>
            <div className="text-xs text-[var(--hz-text-2)] mt-1">
              {latest ? `${fmtMonth(latest.winnerInfo.month)} · marked ${formatDate(latest.winnerInfo.markedAt)}` : "Mark a traveller from the Travellers page."}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="hz-card p-4 sm:p-5 mb-6" data-testid="winners-filters">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <HzInput
                icon={Search}
                placeholder="Search by name or remark"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                testid="winners-search"
              />
            </div>
            <div className="md:col-span-3">
              <select
                className="hz-input !pl-4"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                data-testid="winners-filter-month"
              >
                <option value="all">All months</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>{fmtMonth(m)}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4">
              <select
                className="hz-input !pl-4"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                data-testid="winners-filter-package"
              >
                <option value="all">All packages</option>
                {state.packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-12 flex items-center justify-between">
              <div className="text-xs text-[var(--hz-text-2)] inline-flex items-center gap-1.5">
                <Filter className="size-3.5" /> {filtered.length} of {winners.length} winner{winners.length === 1 ? "" : "s"}
              </div>
              {filtersActive && (
                <button onClick={clearFilters} className="text-xs text-[var(--hz-cta)] inline-flex items-center gap-1 hover:underline" data-testid="winners-filter-clear">
                  <X className="size-3.5" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <div className="flex items-end justify-between border-b pb-4">
          <div>
            <div className="hz-heading text-2xl font-semibold">HZ Travel Zone</div>
            <div className="text-xs tracking-[0.18em] uppercase text-gray-500 mt-1">Winners spotlight · {filtered.length} record{filtered.length === 1 ? "" : "s"}</div>
          </div>
          <div className="text-right text-xs text-gray-600">
            Generated · {formatDate(new Date().toISOString())}
          </div>
        </div>
      </div>

      {/* Grouped winners */}
      {grouped.length === 0 ? (
        <div className="hz-card p-12 text-center" data-testid="winners-empty">
          <div className="size-16 rounded-2xl bg-[#FDF1EB] text-[var(--hz-cta)] flex items-center justify-center mx-auto">
            <Trophy className="size-8" strokeWidth={1.25} />
          </div>
          <div className="hz-heading text-lg mt-4">No winners {filtersActive ? "match these filters" : "yet"}</div>
          <div className="text-sm text-[var(--hz-text-2)] mt-1.5 max-w-md mx-auto">
            {filtersActive
              ? "Try clearing the filters or pick a different month."
              : "Open the Travellers page and use the “Mark as winner” toggle on any card to celebrate a guest."}
          </div>
        </div>
      ) : (
        <div className="space-y-8" data-testid="winners-list">
          {grouped.map(([m, items]) => (
            <section key={m} data-testid={`winners-group-${m}`}>
              <div className="flex items-end justify-between border-b border-[var(--hz-border)] pb-3 mb-4">
                <div>
                  <div className="hz-label">Month</div>
                  <h2 className="hz-heading text-2xl font-medium tracking-tight">{fmtMonth(m)}</h2>
                </div>
                <div className="text-xs text-[var(--hz-text-2)] hz-mono">
                  {items.length} winner{items.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {items.map((w) => {
                  const pkg = state.packages.find((p) => p.id === w.packageId);
                  const fullName = w.firstName && w.lastName ? `${w.firstName} ${w.lastName}` : w.name;
                  return (
                    <div key={`${w.bookingId}-${w.id}`} className="hz-card p-5 ring-1 ring-[var(--hz-cta)]/30 relative" data-testid={`winner-card-${w.id}`}>
                      <div className="absolute -top-2 -left-2 bg-[var(--hz-cta)] text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-md">
                        <Trophy className="size-3" strokeWidth={2} /> Winner
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-[var(--hz-cta)]/10 text-[var(--hz-cta)] flex items-center justify-center shrink-0">
                          <Trophy className="size-6" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="hz-heading text-lg font-medium leading-tight">{fullName}</div>
                          <div className="text-xs text-[var(--hz-text-2)] mt-0.5">
                            {w.relation || "Traveller"}{w.gender ? ` · ${w.gender}` : ""}{w.dateOfBirth ? ` · DOB ${w.dateOfBirth}` : ""}
                          </div>
                          {pkg && (
                            <div className="text-xs text-[var(--hz-text-2)] mt-2 inline-flex items-center gap-1.5">
                              <Plane className="size-3.5" strokeWidth={1.5} />
                              <span className="text-[var(--hz-text)]">{pkg.name}</span>
                              <span className="hz-mono">· {w.bookingId}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setProfileOpen(w)}
                          className="size-9 rounded-lg flex items-center justify-center bg-[var(--hz-cta)]/10 text-[var(--hz-cta)] hover:bg-[var(--hz-cta)] hover:text-white transition shrink-0 hz-no-print"
                          title="View full profile"
                          data-testid={`winner-view-${w.id}`}
                        >
                          <Eye className="size-4" strokeWidth={1.5} />
                        </button>
                      </div>

                      {w.winnerInfo.remark && (
                        <p className="mt-4 text-sm text-[var(--hz-text)] italic leading-relaxed border-l-2 border-[var(--hz-cta)] pl-3">
                          “{w.winnerInfo.remark}”
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-[var(--hz-border-soft)] flex items-center justify-between text-[11px] text-[var(--hz-text-2)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3" strokeWidth={1.5} />
                          {fmtMonth(w.winnerInfo.month)}
                        </span>
                        <span className="hz-mono">marked {formatDateTime(w.winnerInfo.markedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <TravellerProfileModal
        open={!!profileOpen}
        onClose={() => setProfileOpen(null)}
        traveller={profileOpen}
      />
    </div>
  );
}
