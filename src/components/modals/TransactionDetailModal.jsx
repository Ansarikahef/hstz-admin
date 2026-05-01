import { useMemo, useState } from "react";
import HzModal from "./HzModal";
import HzInput from "@/components/shared/HzInput";
import TravellerDetailsCard from "@/components/shared/TravellerDetailsCard";
import TravellerEditorModal from "./TravellerEditorModal";
import BookingClosureModal from "./BookingClosureModal";
import ConfirmModal from "./ConfirmModal";
import { Search, Calendar, Filter, Printer, FileDown, IndianRupee, Receipt, ShieldCheck, UserCog, UserPlus, Edit2, Trash2, XCircle, Receipt as ReceiptIcon } from "lucide-react";
import { db, formatCurrency, formatDateTime } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const STATUS_BADGE = { paid: "hz-badge--paid", pending: "hz-badge--pending", failed: "hz-badge--failed" };

export default function TransactionDetailModal({ booking, onClose, state, user }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTraveller, setEditingTraveller] = useState(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const pkg = booking ? state.packages.find((p) => p.id === booking.packageId) : null;
  // Re-read fresh booking from db to reflect closure / traveller edits
  const liveBooking = useMemo(() => {
    if (!booking) return null;
    const s = db.load();
    return s.bookings.find((b) => b.id === booking.id) || booking;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking, refresh]);
  const txns = useMemo(
    () => (liveBooking ? state.transactions.filter((t) => t.bookingId === liveBooking.id) : []),
    [liveBooking, state.transactions]
  );

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      if (q && !t.transactionId.toLowerCase().includes(q.toLowerCase())) return false;
      if (method !== "all" && t.method !== method) return false;
      if (status !== "all" && t.status !== status) return false;
      if (from && new Date(t.date) < new Date(from)) return false;
      if (to && new Date(t.date) > new Date(to + "T23:59:59")) return false;
      if (minAmt && t.amount < Number(minAmt)) return false;
      if (maxAmt && t.amount > Number(maxAmt)) return false;
      return true;
    });
  }, [txns, q, method, status, from, to, minAmt, maxAmt]);

  if (!booking) return null;

  const paid = txns.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const pending = txns.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const remaining = Math.max(0, (liveBooking?.totalAmount || 0) - paid);
  const methods = Array.from(new Set(txns.map((t) => t.method)));

  const removeTraveller = () => {
    const s = db.load();
    const b = s.bookings.find((x) => x.id === liveBooking.id);
    if (!b) return;
    b.travellers = (b.travellers || []).filter((t) => t.id !== confirmRemove.id);
    db.save(s);
    setConfirmRemove(null);
    setRefresh((r) => r + 1);
    toast.success("Traveller removed from booking");
  };

  return (
    <HzModal
      open={!!booking}
      onClose={onClose}
      title={pkg?.name}
      description={`${liveBooking.id} · ${liveBooking.durationDays} days · Banking-grade ledger`}
      size="2xl"
      accent={liveBooking.status === "closed" ? "success" : "cta"}
      icon={<ReceiptIcon className="size-5" strokeWidth={1.5} />}
      testid="txn-detail-modal"
      footer={
        <>
          <button className="hz-btn-ghost" onClick={onClose} data-testid="txn-detail-close-btn">
            Close
          </button>
          {liveBooking.status !== "closed" && (
            <button
              className="text-white h-10 px-5 rounded-lg font-medium text-sm transition-colors bg-[#C04235] hover:bg-[#A03228] inline-flex items-center gap-2"
              onClick={() => setCloseOpen(true)}
              data-testid="txn-detail-close-booking"
            >
              <XCircle className="size-4" /> Close booking
            </button>
          )}
          <button className="hz-btn-primary" onClick={() => navigate(liveBooking.status === "closed" ? `/closure-slip/${liveBooking.id}` : `/invoice/${liveBooking.id}`)} data-testid="txn-detail-print">
            <Printer className="size-4" /> {liveBooking.status === "closed" ? "Print closure slip" : "Print transactions"}
          </button>
        </>
      }
    >
      {/* Booking meta */}
      <div className="flex flex-wrap items-center gap-2 mb-5" data-testid="txn-detail-meta">
        {liveBooking.bookedBy === "admin" ? (
          <span className="hz-badge hz-badge--inactive inline-flex items-center gap-1.5">
            <UserCog className="size-3" strokeWidth={1.75} /> Booked by Admin
          </span>
        ) : (
          <span className="hz-badge hz-badge--active inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3" strokeWidth={1.75} /> Booked by Self
          </span>
        )}
        <span className="hz-badge hz-badge--paid">{liveBooking.travellers?.length || 0} traveller{(liveBooking.travellers?.length || 0) === 1 ? "" : "s"}</span>
        {liveBooking.status === "closed" && <span className="hz-badge hz-badge--closed">Closed</span>}
        {liveBooking.bookedBy === "admin" && liveBooking.adminRemarks && (
          <div className="basis-full mt-2 p-3 rounded-lg bg-[var(--hz-warning-bg)] text-[#8A6024] text-xs" data-testid="txn-detail-admin-remarks">
            <span className="font-semibold tracking-wide uppercase mr-2 text-[10px]">Admin remarks</span>
            {liveBooking.adminRemarks}
          </div>
        )}
        {liveBooking.status === "closed" && liveBooking.closeReason && (
          <div className="basis-full mt-1 p-3 rounded-lg bg-[#FCECEC] text-[var(--hz-error)] text-xs">
            <span className="font-semibold tracking-wide uppercase mr-2 text-[10px]">Closure remark</span>
            {liveBooking.closeReason}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="hz-card p-4">
          <div className="hz-label">Total cost</div>
          <div className="hz-heading text-xl font-medium mt-1 hz-mono">{formatCurrency(liveBooking.totalAmount)}</div>
        </div>
        <div className="hz-card p-4">
          <div className="hz-label">Paid</div>
          <div className="hz-heading text-xl font-medium mt-1 hz-mono text-[var(--hz-success)]">{formatCurrency(paid)}</div>
        </div>
        <div className="hz-card p-4">
          <div className="hz-label">Pending</div>
          <div className="hz-heading text-xl font-medium mt-1 hz-mono text-[#8A6024]">{formatCurrency(pending)}</div>
        </div>
        <div className="hz-card p-4">
          <div className="hz-label">Remaining EMI</div>
          <div className="hz-heading text-xl font-medium mt-1 hz-mono text-[var(--hz-cta)]">{formatCurrency(remaining)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="hz-card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <HzInput icon={Search} placeholder="Search transaction ID" value={q} onChange={(e) => setQ(e.target.value)} testid="txn-filter-search" />
          </div>
          <div className="md:col-span-2">
            <select className="hz-input !pl-4" value={method} onChange={(e) => setMethod(e.target.value)} data-testid="txn-filter-method">
              <option value="all">All methods</option>
              {methods.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <select className="hz-input !pl-4" value={status} onChange={(e) => setStatus(e.target.value)} data-testid="txn-filter-status">
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <HzInput icon={Calendar} type="date" value={from} onChange={(e) => setFrom(e.target.value)} testid="txn-filter-from" />
          </div>
          <div className="md:col-span-2">
            <HzInput icon={Calendar} type="date" value={to} onChange={(e) => setTo(e.target.value)} testid="txn-filter-to" />
          </div>
          <div className="md:col-span-3">
            <HzInput icon={IndianRupee} type="number" placeholder="Min amount" value={minAmt} onChange={(e) => setMinAmt(e.target.value)} testid="txn-filter-min" />
          </div>
          <div className="md:col-span-3">
            <HzInput icon={IndianRupee} type="number" placeholder="Max amount" value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} testid="txn-filter-max" />
          </div>
        </div>
      </div>

      {/* Ledger */}
      <div className="hz-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--hz-hover)] sticky top-0">
              <tr className="text-left">
                <th className="px-4 py-3 hz-label !text-[10px]">Date</th>
                <th className="px-4 py-3 hz-label !text-[10px]">Method</th>
                <th className="px-4 py-3 hz-label !text-[10px]">Transaction ID</th>
                <th className="px-4 py-3 hz-label !text-[10px]">Installment</th>
                <th className="px-4 py-3 hz-label !text-[10px]">Status</th>
                <th className="px-4 py-3 hz-label !text-[10px] text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="hz-stripes-row border-t border-[var(--hz-border-soft)] hover:bg-[var(--hz-hover)]" data-testid={`txn-row-${t.id}`}>
                  <td className="px-4 py-3 text-[var(--hz-text-2)] hz-mono text-[12px]">{formatDateTime(t.date)}</td>
                  <td className="px-4 py-3 font-medium">{t.method}</td>
                  <td className="px-4 py-3 hz-mono text-[12px]">{t.transactionId}</td>
                  <td className="px-4 py-3 text-[var(--hz-text-2)]">{t.installment}</td>
                  <td className="px-4 py-3"><span className={`hz-badge ${STATUS_BADGE[t.status]}`}>{t.status}</span></td>
                  <td className="px-4 py-3 hz-mono text-right font-medium">{formatCurrency(t.amount)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--hz-text-2)]">No transactions match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Travellers section with manage controls */}
      <div className="mt-6" data-testid="txn-detail-travellers">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <span className="hz-label">Manage travellers on this booking</span>
            <p className="text-xs text-[var(--hz-text-2)] mt-1">Tap to expand · Edit or remove records · Add a new traveller below.</p>
          </div>
          {liveBooking.status !== "closed" && (
            <button
              className="hz-btn-primary !h-9 !px-4 text-xs"
              onClick={() => { setEditingTraveller(null); setEditorOpen(true); }}
              data-testid="txn-detail-add-traveller"
            >
              <UserPlus className="size-4" strokeWidth={1.75} /> Add traveller
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {(liveBooking.travellers || []).map((t) => (
            <div key={t.id} className="relative group">
              <TravellerDetailsCard traveller={t} />
              {liveBooking.status !== "closed" && (
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button
                    onClick={() => { setEditingTraveller(t); setEditorOpen(true); }}
                    className="size-8 rounded-lg flex items-center justify-center bg-white border border-[var(--hz-border)] text-[var(--hz-text-2)] hover:text-[var(--hz-text)] hover:bg-[var(--hz-hover)]"
                    title="Edit"
                    data-testid={`txn-detail-traveller-edit-${t.id}`}
                  >
                    <Edit2 className="size-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setConfirmRemove(t)}
                    className="size-8 rounded-lg flex items-center justify-center bg-white border border-[var(--hz-border)] text-[var(--hz-error)] hover:bg-[#FCECEC]"
                    title="Remove"
                    data-testid={`txn-detail-traveller-remove-${t.id}`}
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {(!liveBooking.travellers || liveBooking.travellers.length === 0) && (
            <div className="hz-card p-8 text-center text-sm text-[var(--hz-text-2)]">
              No traveller records linked to this booking yet.
              {liveBooking.status !== "closed" && (
                <button
                  className="block mx-auto mt-3 hz-btn-primary"
                  onClick={() => { setEditingTraveller(null); setEditorOpen(true); }}
                >
                  <UserPlus className="size-4" /> Add the first traveller
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <TravellerEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        bookingId={liveBooking.id}
        traveller={editingTraveller}
        onSaved={() => { setRefresh((r) => r + 1); toast.success(editingTraveller ? "Traveller updated" : "Traveller added"); }}
      />

      <BookingClosureModal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        booking={liveBooking}
        packageData={pkg}
        transactions={txns}
        onClosed={() => setRefresh((r) => r + 1)}
      />

      <ConfirmModal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={removeTraveller}
        title="Remove this traveller?"
        description={`${confirmRemove?.firstName || confirmRemove?.name || "Traveller"} will be removed from this booking. Documents on the record will also be deleted.`}
        confirmLabel="Remove"
        tone="danger"
        testid="txn-detail-remove-traveller"
      />
    </HzModal>
  );
}
