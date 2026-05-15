import { useMemo, useState } from "react";
import {
  Plus, Trash2, FileText, Download, User, FileUp, Eye, Trophy, Search, Filter,
  LayoutGrid, Table as TableIcon, Printer, Calendar, X, BadgeCheck,
} from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import HzModal from "@/components/modals/HzModal";
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";
import TravellerProfileModal from "@/components/modals/TravellerProfileModal";
import WinnerMarkModal from "@/components/modals/WinnerMarkModal";
import HzInput from "@/components/shared/HzInput";
import { db, formatDate } from "@/lib/mockData";
import { toast } from "sonner";

const DOC_TYPES = ["passport", "visa", "id-card", "aadhaar", "pan", "insurance", "ticket", "other"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function fmtMonth(m) {
  if (!m) return "—";
  const [y, mo] = m.split("-");
  return `${MONTH_FULL[parseInt(mo, 10) - 1]} ${y}`;
}

export default function TravellersOld() {
  const [state, setState] = useState(() => db.load());
  const [docOpen, setDocOpen] = useState(null);
  const [docForm, setDocForm] = useState({ name: "", type: "passport", url: "" });
  const [viewDoc, setViewDoc] = useState(null);
  const [profileOpen, setProfileOpen] = useState(null);
  const [winnerOpen, setWinnerOpen] = useState(null);

  // Filters & view
  const [view, setView] = useState("cards"); // cards | table
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [packageId, setPackageId] = useState("all");
  const [winnersOnly, setWinnersOnly] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const allTravellers = useMemo(
    () =>
      state.bookings.flatMap((b) =>
        b.travellers.map((t) => ({
          ...t,
          bookingId: b.id,
          userId: b.userId,
          packageId: b.packageId,
          bookingDate: b.bookingDate,
          travelDate: b.travelDate,
          bookingStatus: b.status,
        }))
      ),
    [state.bookings]
  );

  const filtered = useMemo(() => {
    return allTravellers.filter((t) => {
      const fullName = (t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : t.name || "").toLowerCase();
      const text = `${fullName} ${t.emailId || ""} ${t.mobileNumber || ""} ${t.passportNumber || ""}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (gender !== "all" && (t.gender || "").toLowerCase() !== gender.toLowerCase()) return false;
      if (packageId !== "all" && t.packageId !== packageId) return false;
      if (winnersOnly && !t.winnerInfo) return false;
      if (from && new Date(t.bookingDate) < new Date(from)) return false;
      if (to && new Date(t.bookingDate) > new Date(to + "T23:59:59")) return false;
      return true;
    });
  }, [allTravellers, q, gender, packageId, winnersOnly, from, to]);

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setDocForm((f) => ({ ...f, url: r.result, name: f.name || file.name }));
    r.readAsDataURL(file);
  };

  const addDocument = () => {
    if (!docForm.name.trim()) { toast.error("Enter document name"); return; }
    const s = db.load();
    const booking = s.bookings.find((b) => b.id === docOpen.bookingId);
    const traveller = booking.travellers.find((t) => t.id === docOpen.id);
    traveller.documents = traveller.documents || [];
    traveller.documents.push({
      name: docForm.name,
      type: docForm.type,
      url: docForm.url || "",
      uploadedAt: new Date().toISOString(),
    });
    db.save(s);
    setState({ ...s });
    toast.success("Document added");
    setDocOpen(null);
    setDocForm({ name: "", type: "passport", url: "" });
  };

  const removeDoc = (bookingId, travellerId, docIdx) => {
    const s = db.load();
    const t = s.bookings.find((b) => b.id === bookingId).travellers.find((x) => x.id === travellerId);
    t.documents.splice(docIdx, 1);
    db.save(s);
    setState({ ...s });
    toast.success("Document removed");
  };

  const refresh = () => setState(db.load());

  const clearFilters = () => {
    setQ(""); setGender("all"); setPackageId("all"); setWinnersOnly(false); setFrom(""); setTo("");
  };

  const printTable = () => {
    setView("table");
    setTimeout(() => window.print(), 80);
  };

  const filtersActive = q || gender !== "all" || packageId !== "all" || winnersOnly || from || to;

  return (
    <div data-testid="travellers-page">
      <div className="hz-no-print">
        <HzPageHeader
          kicker="Roster"
          title="Traveller details"
          description="Every traveller across every booking — searchable, filterable, and printable as a table."
          actions={
            <>
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-[var(--hz-hover)]" data-testid="travellers-view-toggle">
                <button
                  onClick={() => setView("cards")}
                  className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition ${view === "cards" ? "bg-white text-[var(--hz-text)] shadow-sm" : "text-[var(--hz-text-2)]"}`}
                  data-testid="travellers-view-cards"
                >
                  <LayoutGrid className="size-3.5" /> Cards
                </button>
                <button
                  onClick={() => setView("table")}
                  className={`h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition ${view === "table" ? "bg-white text-[var(--hz-text)] shadow-sm" : "text-[var(--hz-text-2)]"}`}
                  data-testid="travellers-view-table"
                >
                  <TableIcon className="size-3.5" /> Table
                </button>
              </div>
              <button className="hz-btn-primary" onClick={printTable} data-testid="travellers-print">
                <Printer className="size-4" strokeWidth={1.75} /> Print
              </button>
            </>
          }
        />

        {/* Filter bar */}
        <div className="hz-card p-4 sm:p-5 mb-6" data-testid="travellers-filters">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <HzInput
                icon={Search}
                placeholder="Search by name, email, phone, passport"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                testid="travellers-search"
              />
            </div>
            <div className="md:col-span-2">
              <select className="hz-input !pl-4" value={gender} onChange={(e) => setGender(e.target.value)} data-testid="travellers-filter-gender">
                <option value="all">All genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <select className="hz-input !pl-4" value={packageId} onChange={(e) => setPackageId(e.target.value)} data-testid="travellers-filter-package">
                <option value="all">All packages</option>
                {state.packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <button
                onClick={() => setWinnersOnly((v) => !v)}
                className={`h-11 px-4 rounded-[10px] border w-full text-sm font-medium inline-flex items-center justify-center gap-2 transition ${winnersOnly ? "bg-[var(--hz-cta)] text-white border-[var(--hz-cta)]" : "bg-white border-[var(--hz-border)] text-[var(--hz-text-2)] hover:text-[var(--hz-text)]"}`}
                data-testid="travellers-filter-winners"
              >
                <Trophy className="size-4" strokeWidth={1.75} /> {winnersOnly ? "Showing winners only" : "Show winners only"}
              </button>
            </div>
            <div className="md:col-span-3">
              <HzInput icon={Calendar} type="date" value={from} onChange={(e) => setFrom(e.target.value)} testid="travellers-filter-from" />
            </div>
            <div className="md:col-span-3">
              <HzInput icon={Calendar} type="date" value={to} onChange={(e) => setTo(e.target.value)} testid="travellers-filter-to" />
            </div>
            <div className="md:col-span-6 flex items-center justify-between gap-3">
              <div className="text-xs text-[var(--hz-text-2)] inline-flex items-center gap-1.5">
                <Filter className="size-3.5" /> {filtered.length} of {allTravellers.length} traveller{allTravellers.length === 1 ? "" : "s"}
              </div>
              {filtersActive && (
                <button onClick={clearFilters} className="text-xs text-[var(--hz-cta)] inline-flex items-center gap-1 hover:underline" data-testid="travellers-filter-clear">
                  <X className="size-3.5" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print header — only on print */}
      <div className="hidden print:block mb-6">
        <div className="flex items-end justify-between border-b pb-4">
          <div>
            <div className="hz-heading text-2xl font-semibold">HZ Travel Zone</div>
            <div className="text-xs tracking-[0.18em] uppercase text-gray-500 mt-1">Traveller roster</div>
          </div>
          <div className="text-right text-xs text-gray-600">
            <div>Generated · {formatDate(new Date().toISOString())}</div>
            <div>{filtered.length} of {allTravellers.length} traveller{allTravellers.length === 1 ? "" : "s"}</div>
          </div>
        </div>
      </div>

      {/* CARDS VIEW */}
      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 hz-no-print">
          {filtered.map((t) => {
            const pkg = state.packages.find((p) => p.id === t.packageId);
            const fullName = t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : t.name;
            return (
              <div key={`${t.bookingId}-${t.id}`} className={`hz-card p-5 relative ${t.winnerInfo ? "ring-1 ring-[var(--hz-cta)]/30" : ""}`} data-testid={`traveller-card-${t.id}`}>
                {t.winnerInfo && (
                  <div className="absolute -top-2 -left-2 bg-[var(--hz-cta)] text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-md">
                    <Trophy className="size-3" strokeWidth={2} /> Winner
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="size-11 rounded-full bg-[var(--hz-hover)] flex items-center justify-center text-[var(--hz-text-2)]">
                    <User className="size-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="hz-heading text-base font-medium">{fullName}</div>
                    <div className="text-xs text-[var(--hz-text-2)]">
                      {t.relation || "Traveller"}{t.gender ? ` · ${t.gender}` : ""}{t.dateOfBirth ? ` · DOB ${t.dateOfBirth}` : t.age ? ` · Age ${t.age}` : ""}
                    </div>
                    {t.passportNumber && <div className="text-xs text-[var(--hz-text-2)] hz-mono mt-1">Passport · {t.passportNumber}</div>}
                  </div>
                  {t.isAddedByAdmin && <span className="hz-badge hz-badge--inactive">Admin</span>}
                  <button
                    onClick={() => setProfileOpen(t)}
                    className="size-9 rounded-lg flex items-center justify-center bg-[var(--hz-cta)]/10 text-[var(--hz-cta)] hover:bg-[var(--hz-cta)] hover:text-white transition shrink-0"
                    title="View full profile"
                    data-testid={`traveller-view-${t.id}`}
                  >
                    <Eye className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mt-3 text-xs text-[var(--hz-text-2)]">
                  Booking <span className="hz-mono text-[var(--hz-text)]">{t.bookingId}</span> · {pkg?.name}
                </div>

                {/* Mark as winner toggle */}
                <div className="mt-4 hz-card !shadow-none p-3 flex items-start gap-3 bg-[var(--hz-hover)]" data-testid={`traveller-winner-toggle-wrap-${t.id}`}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!t.winnerInfo}
                    onClick={() => setWinnerOpen(t)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${t.winnerInfo ? "bg-[var(--hz-cta)]" : "bg-[var(--hz-border)]"}`}
                    data-testid={`traveller-winner-toggle-${t.id}`}
                  >
                    <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${t.winnerInfo ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight inline-flex items-center gap-1.5">
                      <Trophy className="size-3.5 text-[var(--hz-cta)]" strokeWidth={1.75} />
                      {t.winnerInfo ? "Marked as winner" : "Mark as winner"}
                    </div>
                    {t.winnerInfo ? (
                      <div className="text-[11px] text-[var(--hz-text-2)] mt-0.5">
                        {fmtMonth(t.winnerInfo.month)} · {t.winnerInfo.remark}
                      </div>
                    ) : (
                      <div className="text-[11px] text-[var(--hz-text-2)] mt-0.5">Toggle to capture month and remark.</div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="hz-label">Documents</span>
                    <button onClick={() => setDocOpen(t)} className="text-[11px] text-[var(--hz-cta)] hover:underline inline-flex items-center gap-1" data-testid={`traveller-doc-add-${t.id}`}>
                      <Plus className="size-3" /> Upload
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {(t.documents || []).map((d, i) => (
                      <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--hz-hover)]" data-testid={`traveller-doc-${t.id}-${i}`}>
                        <FileText className="size-4 text-[var(--hz-text-2)]" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{d.name}</div>
                          <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--hz-text-2)]">{d.type}</div>
                        </div>
                        <button onClick={() => setViewDoc({ ...d, _traveller: fullName })} className="hz-btn-ghost !h-7 !w-7 !p-0 justify-center" title="View" data-testid={`traveller-doc-view-${t.id}-${i}`}><Eye className="size-3.5" /></button>
                        <button onClick={() => removeDoc(t.bookingId, t.id, i)} className="hz-btn-ghost !h-7 !w-7 !p-0 justify-center text-[var(--hz-error)]" title="Remove" data-testid={`traveller-doc-remove-${t.id}-${i}`}><Trash2 className="size-3.5" /></button>
                      </li>
                    ))}
                    {(!t.documents || t.documents.length === 0) && (
                      <li className="text-xs text-[var(--hz-text-2)] italic">No documents uploaded.</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="hz-card p-12 col-span-full text-center" data-testid="travellers-empty">
              <div className="hz-heading text-lg mb-1">No travellers match these filters</div>
              <div className="text-sm text-[var(--hz-text-2)]">Try clearing filters or expanding the date range.</div>
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {view === "table" && (
        <div className="hz-card overflow-hidden hz-print-area">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="travellers-table">
              <thead className="bg-[var(--hz-hover)] border-b border-[var(--hz-border)]">
                <tr className="text-left">
                  <th className="px-4 py-3 hz-label !text-[10px]">Traveller</th>
                  <th className="px-4 py-3 hz-label !text-[10px]">Gender · DOB</th>
                  <th className="px-4 py-3 hz-label !text-[10px]">Contact</th>
                  <th className="px-4 py-3 hz-label !text-[10px]">Passport</th>
                  <th className="px-4 py-3 hz-label !text-[10px]">Booking</th>
                  <th className="px-4 py-3 hz-label !text-[10px]">Package</th>
                  <th className="px-4 py-3 hz-label !text-[10px]">Booked on</th>
                  <th className="px-4 py-3 hz-label !text-[10px]">Winner</th>
                  <th className="px-4 py-3 hz-label !text-[10px] text-right hz-no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const pkg = state.packages.find((p) => p.id === t.packageId);
                  const fullName = t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : t.name;
                  return (
                    <tr key={`${t.bookingId}-${t.id}`} className="hz-stripes-row border-t border-[var(--hz-border-soft)] hover:bg-[var(--hz-hover)]/60" data-testid={`traveller-row-${t.id}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-[var(--hz-hover)] flex items-center justify-center text-[var(--hz-text-2)]">
                            <User className="size-3.5" strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="font-medium">{fullName}</div>
                            <div className="text-[11px] text-[var(--hz-text-2)] hz-mono">{t.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--hz-text-2)]">{t.gender || "—"}{t.dateOfBirth ? ` · ${t.dateOfBirth}` : ""}</td>
                      <td className="px-4 py-3">
                        <div className="text-[12px]">{t.mobileNumber || "—"}</div>
                        <div className="text-[11px] text-[var(--hz-text-2)] truncate max-w-[180px]">{t.emailId || ""}</div>
                      </td>
                      <td className="px-4 py-3 hz-mono text-[12px]">{t.passportNumber || "—"}</td>
                      <td className="px-4 py-3 hz-mono text-[12px]">{t.bookingId}</td>
                      <td className="px-4 py-3">{pkg?.name || "—"}</td>
                      <td className="px-4 py-3 text-[var(--hz-text-2)]">{formatDate(t.bookingDate)}</td>
                      <td className="px-4 py-3">
                        {t.winnerInfo ? (
                          <span className="hz-badge hz-badge--paid inline-flex items-center gap-1.5">
                            <Trophy className="size-3" strokeWidth={2} />
                            {fmtMonth(t.winnerInfo.month)}
                          </span>
                        ) : (
                          <span className="text-[var(--hz-text-2)] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hz-no-print">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setProfileOpen(t)} className="hz-btn-ghost !h-8 !w-8 !p-0 justify-center" title="View" data-testid={`traveller-row-view-${t.id}`}>
                            <Eye className="size-3.5" />
                          </button>
                          <button onClick={() => setWinnerOpen(t)} className="hz-btn-ghost !h-8 !w-8 !p-0 justify-center text-[var(--hz-cta)]" title="Mark winner" data-testid={`traveller-row-winner-${t.id}`}>
                            <Trophy className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-[var(--hz-text-2)]">No travellers match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <HzModal
        open={!!docOpen}
        onClose={() => { setDocOpen(null); setDocForm({ name: "", type: "passport", url: "" }); }}
        title="Upload travel document"
        description={`Add a document for ${docOpen?.firstName || docOpen?.name || ""}.`}
        testid="traveller-doc-modal"
        footer={
          <>
            <button className="hz-btn-ghost" onClick={() => { setDocOpen(null); setDocForm({ name: "", type: "passport", url: "" }); }} data-testid="traveller-doc-cancel">Cancel</button>
            <button className="hz-btn-primary" onClick={addDocument} data-testid="traveller-doc-save">Add document</button>
          </>
        }
      >
        <div className="space-y-4">
          <HzInput icon={FileUp} label="Document name" placeholder="e.g. Visa.pdf" value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} testid="traveller-doc-name" />
          <div>
            <label className="hz-label block mb-2">Document type</label>
            <select className="hz-input !pl-4" data-testid="traveller-doc-type" value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}>
              {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="hz-label block mb-2">Attach file (optional)</label>
            <label className="block w-full border-2 border-dashed border-[var(--hz-border)] rounded-xl p-5 text-center cursor-pointer hover:bg-[var(--hz-hover)] transition">
              <FileUp className="size-7 mx-auto text-[var(--hz-text-2)]" strokeWidth={1.25} />
              <div className="mt-2 text-sm font-medium">{docForm.url ? "File attached — replace?" : "Choose image or PDF"}</div>
              <div className="text-xs text-[var(--hz-text-2)] mt-0.5">Stored locally; viewable from the traveller card.</div>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onPickFile} data-testid="traveller-doc-file" />
            </label>
          </div>
        </div>
      </HzModal>

      <DocumentViewerModal
        doc={viewDoc}
        onClose={() => setViewDoc(null)}
        travellerName={viewDoc?._traveller}
      />

      <TravellerProfileModal
        open={!!profileOpen}
        onClose={() => setProfileOpen(null)}
        traveller={profileOpen}
        onSaved={refresh}
      />

      <WinnerMarkModal
        open={!!winnerOpen}
        onClose={() => setWinnerOpen(null)}
        traveller={winnerOpen}
        bookingId={winnerOpen?.bookingId}
        onSaved={refresh}
      />
    </div>
  );
}
