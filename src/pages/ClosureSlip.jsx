import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Compass, Trophy, CheckCircle2 } from "lucide-react";
import { db, formatCurrency, formatDate, formatDateTime } from "@/lib/mockData";

export default function ClosureSlip() {
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
  const discount = booking.discount || 0;
  const finalRemaining = Math.max(0, booking.totalAmount - paid - discount);
  const traveller = booking.travellers?.[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="hz-no-print sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
        <Link to={-1} className="hz-btn-ghost"><ArrowLeft className="size-4" /> Back</Link>
        <button className="hz-btn-primary" onClick={() => window.print()} data-testid="closure-slip-print">
          <Printer className="size-4" /> Print slip
        </button>
      </div>

      <div className="hz-print-area max-w-3xl mx-auto py-10 px-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#162D24" }}>
              <Compass className="size-6 text-white" />
            </div>
            <div>
              <div className="hz-heading text-2xl font-semibold">HZ Travel Zone</div>
              <div className="text-xs tracking-[0.18em] uppercase text-gray-500 mt-1">Booking closure slip</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Closure no.</div>
            <div className="hz-heading text-lg hz-mono">{booking.closureNumber || `HZ-CLB-${booking.id.toUpperCase()}`}</div>
            <div className="text-xs text-gray-500 mt-1">Generated {formatDateTime(booking.closedAt || new Date().toISOString())}</div>
          </div>
        </div>

        {/* Closure banner */}
        <div className="mt-6 p-5 rounded-2xl border-2 border-[#E9F2EB] bg-[#F4FAF5] flex items-center gap-4">
          <div className="size-12 rounded-full bg-[#E9F2EB] text-[#4A7856] flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-6" strokeWidth={1.5} />
          </div>
          <div>
            <div className="hz-heading text-lg font-medium">Booking closed</div>
            <div className="text-sm text-gray-600 mt-0.5">{booking.closeReason || "Booking has been closed."}</div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Traveller</div>
            <div className="font-medium mt-1.5">
              {traveller ? `${traveller.firstName || traveller.name} ${traveller.lastName || ""}` : `${user?.firstName} ${user?.lastName}`}
            </div>
            <div className="text-sm text-gray-600">{user?.emailId || user?.email}</div>
            <div className="text-sm text-gray-600">{user?.mobileNumber || user?.phone}</div>
            {user?.address && <div className="text-sm text-gray-600">{user.address}</div>}
          </div>
          <div>
            <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Package</div>
            <div className="font-medium mt-1.5">{pkg?.name}</div>
            <div className="text-sm text-gray-600">{booking.durationDays} days</div>
            <div className="text-sm text-gray-600 hz-mono">{booking.id}</div>
            <div className="text-sm text-gray-600">Booked on {formatDate(booking.bookingDate)}</div>
            <div className="text-sm text-gray-600">Travel on {formatDate(booking.travelDate)}</div>
          </div>
        </div>

        {/* Money summary */}
        <div className="mt-8">
          <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500 mb-2">Settlement</div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-y">
                <td className="py-2.5 px-2 text-gray-600">Total package amount</td>
                <td className="py-2.5 px-2 text-right hz-mono">{formatCurrency(booking.totalAmount)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2.5 px-2 text-gray-600">Total paid</td>
                <td className="py-2.5 px-2 text-right hz-mono">{formatCurrency(paid)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2.5 px-2 text-gray-600">Discount applied</td>
                <td className="py-2.5 px-2 text-right hz-mono text-[#C04235]">− {formatCurrency(discount)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Final remaining (waived on closure)</td>
                <td className="py-3 px-2 text-right hz-mono font-semibold">{formatCurrency(finalRemaining)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Winner */}
        {booking.winnerName && (
          <div className="mt-6 p-5 rounded-2xl bg-[#FDF1EB] flex items-center gap-4">
            <div className="size-12 rounded-full bg-white flex items-center justify-center text-[var(--hz-cta)]">
              <Trophy className="size-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500">Winner</div>
              <div className="hz-heading text-lg font-medium mt-0.5">{booking.winnerName}</div>
            </div>
          </div>
        )}

        {/* Transaction history */}
        <div className="mt-8">
          <div className="text-[11px] tracking-[0.18em] uppercase text-gray-500 mb-2">Transaction history</div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-y">
                <th className="text-left py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Date</th>
                <th className="text-left py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Method</th>
                <th className="text-left py-2 px-2 font-medium text-[11px] tracking-[0.18em] uppercase text-gray-500">Txn ID</th>
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
                  <td className="py-2 px-2 capitalize">{t.status}</td>
                  <td className="py-2 px-2 hz-mono text-right">{formatCurrency(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sign */}
        <div className="grid grid-cols-2 gap-10 mt-12">
          <div>
            <div className="border-t border-gray-400 pt-2">
              <div className="text-xs text-gray-500">Authorised signatory</div>
              <div className="text-sm font-medium">HZ Travel Zone Operations</div>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2">
              <div className="text-xs text-gray-500">Traveller signature</div>
              <div className="text-sm font-medium">
                {traveller ? `${traveller.firstName || traveller.name || ""} ${traveller.lastName || ""}` : `${user?.firstName} ${user?.lastName}`}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-gray-500 leading-relaxed border-t pt-5">
          This closure slip is generated by HZ Travel Zone admin console for internal record-keeping.
          For any clarifications, please reach the operations desk at ops@hztravelzone.com.
        </div>
      </div>
    </div>
  );
}
