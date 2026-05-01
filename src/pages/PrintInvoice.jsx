import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Compass } from "lucide-react";
import { db, formatCurrency, formatDate, formatDateTime } from "@/lib/mockData";

const STATUS_BADGE = { paid: "hz-badge--paid", pending: "hz-badge--pending", failed: "hz-badge--failed" };

export default function PrintInvoice() {
  const { bookingId } = useParams();
  const state = db.load();
  const booking = state.bookings.find((b) => b.id === bookingId);
  const user = booking ? state.users.find((u) => u.id === booking.userId) : null;
  const pkg = booking ? state.packages.find((p) => p.id === booking.packageId) : null;
  const txns = booking ? state.transactions.filter((t) => t.bookingId === booking.id) : [];

  useEffect(() => {
    document.body.style.backgroundColor = "#fff";
    return () => { document.body.style.backgroundColor = ""; };
  }, []);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="hz-card p-8 text-center">
          <h2 className="hz-heading text-xl">Booking not found</h2>
          <Link to="/users" className="hz-btn-primary mt-4 inline-flex">Back</Link>
        </div>
      </div>
    );
  }

  const paid = txns.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const pending = txns.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const remaining = Math.max(0, booking.totalAmount - paid);

  return (
    <div className="min-h-screen bg-white">
      <div className="hz-no-print sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to={-1} className="hz-btn-ghost"><ArrowLeft className="size-4" /> Back</Link>
        <button className="hz-btn-primary" onClick={() => window.print()} data-testid="invoice-print"><Printer className="size-4" /> Print</button>
      </div>

      <div className="hz-print-area max-w-4xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#162D24" }}>
              <Compass className="size-6 text-white" />
            </div>
            <div>
              <div className="hz-heading text-2xl font-semibold">HZ Travel Zone</div>
              <div className="text-xs tracking-[0.18em] uppercase text-gray-500 mt-1">Transaction statement · Confidential</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Statement no.</div>
            <div className="hz-heading text-lg hz-mono">STMT-{booking.id.toUpperCase()}</div>
            <div className="text-xs text-gray-500 mt-1">Generated {formatDateTime(new Date().toISOString())}</div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Traveller</div>
            <div className="font-medium mt-1.5">{user?.firstName} {user?.lastName}</div>
            <div className="text-sm text-gray-600">{user?.email}</div>
            <div className="text-sm text-gray-600">{user?.phone}</div>
            <div className="text-sm text-gray-600">{user?.address}</div>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Package</div>
            <div className="font-medium mt-1.5">{pkg?.name}</div>
            <div className="text-sm text-gray-600">{booking.durationDays} days · Travel on {formatDate(booking.travelDate)}</div>
            <div className="text-sm text-gray-600 hz-mono">{booking.id}</div>
            <div className="text-sm text-gray-600">Booked on {formatDate(booking.bookingDate)}</div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="border rounded-xl p-4">
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Total cost</div>
            <div className="hz-heading text-xl font-medium mt-1 hz-mono">{formatCurrency(booking.totalAmount)}</div>
          </div>
          <div className="border rounded-xl p-4">
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Paid</div>
            <div className="hz-heading text-xl font-medium mt-1 hz-mono">{formatCurrency(paid)}</div>
          </div>
          <div className="border rounded-xl p-4">
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Remaining</div>
            <div className="hz-heading text-xl font-medium mt-1 hz-mono">{formatCurrency(remaining)}</div>
          </div>
        </div>

        {/* Ledger */}
        <div className="mt-8">
          <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500 mb-2">Transaction history</div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-y">
                <th className="text-left py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Date</th>
                <th className="text-left py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Method</th>
                <th className="text-left py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Transaction ID</th>
                <th className="text-left py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Installment</th>
                <th className="text-left py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Status</th>
                <th className="text-right py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-2 px-2 hz-mono text-[12px] text-gray-700">{formatDateTime(t.date)}</td>
                  <td className="py-2 px-2">{t.method}</td>
                  <td className="py-2 px-2 hz-mono text-[12px]">{t.transactionId}</td>
                  <td className="py-2 px-2 text-gray-600">{t.installment}</td>
                  <td className="py-2 px-2"><span className={`hz-badge ${STATUS_BADGE[t.status]}`}>{t.status}</span></td>
                  <td className="py-2 px-2 hz-mono text-right">{formatCurrency(t.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-y">
                <td colSpan={5} className="py-3 px-2 text-right text-[11px] tracking-[0.18em] uppercase text-gray-500">Total paid</td>
                <td className="py-3 px-2 text-right hz-mono font-semibold">{formatCurrency(paid)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="py-2 px-2 text-right text-[11px] tracking-[0.18em] uppercase text-gray-500">Remaining</td>
                <td className="py-2 px-2 text-right hz-mono font-semibold">{formatCurrency(remaining)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {booking.status === "closed" && (
          <div className="mt-6 p-4 border rounded-xl bg-gray-50">
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Closure</div>
            <div className="text-sm mt-1">Closed on {formatDate(booking.closedAt)} · {booking.closeReason}</div>
          </div>
        )}

        <div className="mt-10 text-xs text-gray-500 leading-relaxed border-t pt-5">
          This statement is generated by the HZ Travel Zone admin console for internal record-keeping.
          For any clarifications about transactions, please reach the operations desk at ops@hztravelzone.com.
        </div>
      </div>
    </div>
  );
}
