import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Printer, Search, Calendar, IndianRupee, Filter, ChevronRight, Receipt, FileDown } from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import HzInput from "@/components/shared/HzInput";
import { db, formatCurrency, formatDate, formatDateTime } from "@/lib/mockData";
import TransactionDetailModal from "@/components/modals/TransactionDetailModal";

const STATUS_BADGE = { paid: "hz-badge--paid", pending: "hz-badge--pending", failed: "hz-badge--failed" };
const PACKAGE_STATUS = { active: "hz-badge--active", inactive: "hz-badge--inactive", closed: "hz-badge--closed" };

export default function UserTransactions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state] = useState(() => db.load());
  const user = state.users.find((u) => u.id === id);
  const [openBooking, setOpenBooking] = useState(null);

  if (!user) {
    return (
      <div className="hz-card p-12 text-center">
        <h2 className="hz-heading text-xl">Traveller not found</h2>
        <Link to="/users" className="hz-btn-primary mt-4 inline-flex">Back to users</Link>
      </div>
    );
  }

  const bookings = state.bookings.filter((b) => b.userId === user.id);
  const allTxns = state.transactions.filter((t) => t.userId === user.id);
  const totalLifetime = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const paid = allTxns.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const remaining = totalLifetime - paid;

  return (
    <div data-testid="user-transactions-page">
      <HzPageHeader
        kicker="Banking-grade ledger"
        title={`${user.firstName} ${user.lastName}`}
        description="Every booking, every transaction — preserved with banking-style strictness."
        actions={
          <>
            <button className="hz-btn-ghost" onClick={() => navigate(-1)} data-testid="user-txn-back">
              <ArrowLeft className="size-4" strokeWidth={1.5} /> Back
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="hz-card p-5 flex items-start gap-3">
            <img src={user.avatar} alt="" className="size-14 rounded-full object-cover" />
            <div className="min-w-0">
              <div className="hz-heading font-medium">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-[var(--hz-text-2)] truncate">{user.email}</div>
              <div className="text-xs text-[var(--hz-text-2)]">{user.phone}</div>
            </div>
          </div>
          <div className="hz-card p-5">
            <span className="hz-label">Lifetime summary</span>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[var(--hz-text-2)]">Total cost</span><span className="hz-mono">{formatCurrency(totalLifetime)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--hz-text-2)]">Paid</span><span className="hz-mono text-[var(--hz-success)]">{formatCurrency(paid)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--hz-text-2)]">Remaining</span><span className="hz-mono text-[var(--hz-cta)]">{formatCurrency(Math.max(0, remaining))}</span></div>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="hz-label">Purchased packages</div>
          {bookings.map((b) => {
            const pkg = state.packages.find((p) => p.id === b.packageId);
            const txns = allTxns.filter((t) => t.bookingId === b.id);
            const bPaid = txns.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);
            const bRemaining = Math.max(0, b.totalAmount - bPaid);
            return (
              <button
                key={b.id}
                onClick={() => setOpenBooking(b)}
                className="hz-card p-5 w-full text-left hover:translate-y-[-1px] transition"
                data-testid={`user-booking-${b.id}`}
              >
                <div className="flex items-start gap-4">
                  <img src={pkg?.images?.[0]} alt="" className="size-20 rounded-lg object-cover bg-[var(--hz-hover)]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="hz-heading text-lg font-medium">{pkg?.name}</div>
                        <div className="text-xs text-[var(--hz-text-2)] hz-mono mt-0.5">{b.id} · {b.durationDays} days · Travel {formatDate(b.travelDate)}</div>
                      </div>
                      <span className={`hz-badge ${PACKAGE_STATUS[b.status === "closed" ? "closed" : "active"]}`}>
                        {b.status === "closed" ? "Closed" : "Active"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                      <div>
                        <div className="hz-label">Total</div>
                        <div className="hz-mono mt-1">{formatCurrency(b.totalAmount)}</div>
                      </div>
                      <div>
                        <div className="hz-label">Paid</div>
                        <div className="hz-mono mt-1 text-[var(--hz-success)]">{formatCurrency(bPaid)}</div>
                      </div>
                      <div>
                        <div className="hz-label">Remaining</div>
                        <div className="hz-mono mt-1 text-[var(--hz-cta)]">{formatCurrency(bRemaining)}</div>
                      </div>
                    </div>
                    {b.status === "closed" && (
                      <div className="mt-3 p-2.5 rounded-lg bg-[#FCECEC] text-xs text-[var(--hz-error)]">
                        Closed on {formatDate(b.closedAt)} · {b.closeReason}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="size-5 text-[var(--hz-text-2)] mt-1" />
                </div>
              </button>
            );
          })}
          {bookings.length === 0 && (
            <div className="hz-card p-12 text-center text-sm text-[var(--hz-text-2)]">No bookings yet for this traveller.</div>
          )}
        </div>
      </div>

      <TransactionDetailModal
        booking={openBooking}
        onClose={() => setOpenBooking(null)}
        state={state}
        user={user}
      />
    </div>
  );
}
