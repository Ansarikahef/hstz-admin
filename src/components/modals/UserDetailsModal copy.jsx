import HzModal from "./HzModal";
import { Mail, Phone, MapPin, Calendar, Receipt, Printer } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/mockData";

export default function UserDetailsModal({ user, onClose, state, onOpenTransactions }) {
  if (!user) return null;
  const userBookings = state.bookings.filter((b) => b.userId === user.id);
  const ltv = userBookings.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <HzModal
      open={!!user}
      onClose={onClose}
      title={`${user.firstName} ${user.lastName}`}
      description="Full profile and purchased packages."
      size="lg"
      testid="user-details-modal"
      footer={
        <>
          <button className="hz-btn-ghost" onClick={() => window.print()} data-testid="user-details-print">
            <Printer className="size-4" /> Print
          </button>
          <button className="hz-btn-primary" onClick={() => onOpenTransactions(user.id)} data-testid="user-details-view-transactions">
            <Receipt className="size-4" /> View transactions
          </button>
        </>
      }
    >
      <div className="grid sm:grid-cols-[120px_1fr] gap-5">
        <img src={user.avatar} alt="" className="size-24 rounded-2xl object-cover" />
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[var(--hz-text-2)]"><Mail className="size-4" />{user.email}</div>
          <div className="flex items-center gap-2 text-[var(--hz-text-2)]"><Phone className="size-4" />{user.phone}</div>
          <div className="flex items-center gap-2 text-[var(--hz-text-2)]"><MapPin className="size-4" />{user.address}</div>
          <div className="flex items-center gap-2 text-[var(--hz-text-2)]"><Calendar className="size-4" />Joined {formatDate(user.registeredAt)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="hz-card p-4">
          <div className="hz-label">Bookings</div>
          <div className="hz-heading text-2xl font-medium mt-1">{userBookings.length}</div>
        </div>
        <div className="hz-card p-4">
          <div className="hz-label">Lifetime</div>
          <div className="hz-heading text-2xl font-medium mt-1 hz-mono">{formatCurrency(ltv)}</div>
        </div>
        <div className="hz-card p-4">
          <div className="hz-label">Status</div>
          <div className="mt-2"><span className="hz-badge hz-badge--active">{user.status}</span></div>
        </div>
      </div>

      <div className="mt-6">
        <div className="hz-label mb-3">Purchased packages</div>
        <ul className="space-y-2">
          {userBookings.map((b) => {
            const p = state.packages.find((x) => x.id === b.packageId);
            return (
              <li key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--hz-hover)]" data-testid={`user-details-booking-${b.id}`}>
                <img src={p?.images?.[0]} alt="" className="size-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{p?.name}</div>
                  <div className="text-xs text-[var(--hz-text-2)] hz-mono">{b.id} · {b.durationDays} days · {formatDate(b.bookingDate)}</div>
                </div>
                <div className="hz-mono font-medium">{formatCurrency(b.totalAmount)}</div>
              </li>
            );
          })}
          {userBookings.length === 0 && <li className="text-sm text-[var(--hz-text-2)] italic">No purchases yet.</li>}
        </ul>
      </div>
    </HzModal>
  );
}
