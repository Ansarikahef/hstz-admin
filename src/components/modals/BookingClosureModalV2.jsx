import { useState } from "react";
import HzModal from "./HzModal";
import HzInput from "@/components/shared/HzInput";
import { db, formatCurrency, formatDate } from "@/lib/mockData";
import {
  IndianRupee, FileText, Trophy, CheckCircle2, Sparkles, Printer,
  XCircle, ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Helper from "@/Utils/Helper";
import apiService from "@/Utils/ApiService";
import { toast } from "sonner";
export default function BookingClosureModalV2({
  open,
  onClose,
  booking,
  packageData,
  transactions = [],
  onClosed,
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [remark, setRemark] = useState("");
  const [discount, setDiscount] = useState("");
  const [winnerEnabled, setWinnerEnabled] = useState(false);
  const [winnerTravellerId, setWinnerTravellerId] = useState("");
  const [errors, setErrors] = useState({});
  const [closureNumber, setClosureNumber] = useState("");
  const [closureResponse, setClosureResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !booking) return null;
  console.log('transactions ::',transactions)
  console.log('packageData ::',packageData)
  console.log('booking ::',booking)
  const reset = () => {
    setStep(1); setRemark(""); setDiscount("");
    setWinnerEnabled(false); setWinnerTravellerId("");
    setErrors({}); setClosureNumber("");
  };
  const close = () => { onClose(); reset(); };
  const loggedInUser = Helper.getLoginUserDetails(); 
  const paid = transactions
    .filter((t) => t.bookingId === booking.id && t.status === "paid")
    .reduce((s, t) => s + t.amount, 0);
  const remaining = Math.max(0, booking.totalAmount - paid);

  const winnerTraveller = winnerEnabled
    ? (booking.travellers || []).find((t) => t.id === winnerTravellerId)
    : null;
  const winnerName = winnerTraveller
    ? (winnerTraveller.firstName && winnerTraveller.lastName
      ? `${winnerTraveller.firstName} ${winnerTraveller.lastName}`
      : winnerTraveller.name) || ""
    : "";

  const submit = async () => {
    const e = {};
    if (!remark.trim()) e.remark = "Remark is required to close this booking.";
    if (discount !== "" && (Number.isNaN(Number(discount)) || Number(discount) < 0)) {
      e.discount = "Discount must be a positive number.";
    } else if (Number(discount) > remaining) {
      e.discount = `Discount cannot exceed remaining ${formatCurrency(remaining)}.`;
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    setIsSubmitting(true);
    try{
      const payload = {
        bookingId: booking.id || 0,
        remark: remark.trim(),
        finalDiscount: discount ? Number(discount) : 0,
        isWinner: winnerEnabled,
        winnerTravellerId: booking.travellerId ?? 0,
        updatedBy: loggedInUser?.id || 0,
      };
      console.log('payload ::',payload)
      const {status,message,responseValue} = await apiService.post(`admin/CloseBooking`,payload);
      if(status === 1){
        console.log('responseValue ::',responseValue)
        const data = Array.isArray(responseValue) ? responseValue[0] : null;
        setClosureResponse(data);
        onClosed?.({ remark, discount: Number(discount) || 0, winner: winnerName, closureNumber: data?.closureNumber || "" });
        setStep(2);
      }
      else{
        toast.error("Failed to close booking", { description: message || "An error occurred while closing the booking. Please try again." });
      }
    }
    catch(err){
      console.error('Error closing booking:', err);
      toast.error("Failed to close booking", { description: "An error occurred while closing the booking. Please try again." });
    }
    finally{
      setIsSubmitting(false);
    }
    // const cn = `HZ-CLB-${Date.now().toString().slice(-8)}`;
    // setClosureNumber(cn);

    // const s = db.load();
    // const idx = s.bookings.findIndex((b) => b.id === booking.id);
    // if (idx >= 0) {
    //   s.bookings[idx] = {
    //     ...s.bookings[idx],
    //     status: "closed",
    //     closeReason: remark,
    //     discount: Number(discount) || 0,
    //     winnerName,
    //     winnerTravellerId: winnerTravellerId || "",
    //     closureNumber: cn,
    //     closedAt: new Date().toISOString(),
    //   };
    //   // Tag the chosen traveller with winnerInfo
    //   if (winnerEnabled && winnerTravellerId) {
    //     const tr = s.bookings[idx].travellers?.find((t) => t.id === winnerTravellerId);
    //     if (tr) {
    //       tr.winnerInfo = {
    //         month: new Date().toISOString().slice(0, 7),
    //         remark: `Winner of trip · ${remark}`,
    //         markedAt: new Date().toISOString(),
    //       };
    //     }
    //   }
    //   db.save(s);
    // }
    // onClosed?.({ remark, discount: Number(discount) || 0, winner: winnerName, closureNumber: cn });
    // setStep(2);
  };

  return (
    <HzModal
      open={open}
      onClose={close}
      title={step === 1 ? "Close booking" : "Booking closed"}
      description={
        step === 1
          ? "Record final remarks, optional discount, and (if any) the winner name. The transaction history is preserved."
          : "A closure record has been generated and added to the audit trail."
      }
      size={step === 1 ? "lg" : "md"}
      accent={step === 1 ? "danger" : "success"}
      icon={step === 1 ? <XCircle className="size-5" strokeWidth={1.5} /> : <CheckCircle2 className="size-5" strokeWidth={1.5} />}
      testid="booking-closure-modal"
      closeOnBackdrop={step === 2}
      footer={
        step === 1 ? (
          <>
            <button className="hz-btn-ghost" onClick={close} data-testid="booking-closure-cancel">Cancel</button>
            <button
              className="text-white h-10 px-5 rounded-lg font-medium text-sm transition-colors bg-[#C04235] hover:bg-[#A03228] disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
              onClick={submit}
              disabled={isSubmitting}
              data-testid="booking-closure-confirm"
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <XCircle className="size-4" strokeWidth={1.75} />
                  Close booking
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button className="hz-btn-ghost" onClick={close} data-testid="booking-closure-done">Done</button>
            <button
              className="hz-btn-primary"
              onClick={() => { close(); navigate(`/closure-slip/${booking.id}`); }}
              data-testid="booking-closure-print"
            >
              <Printer className="size-4" strokeWidth={1.75} /> Print slip
            </button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div className="space-y-6">
          {/* Package summary */}
          <div className="hz-card p-4 sm:p-5 flex items-start gap-4 bg-[var(--hz-hover)]">
            {packageData?.images?.[0] && (
              <img src={packageData.images[0]} alt="" className="size-16 sm:size-20 rounded-xl object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="hz-heading text-base sm:text-lg font-medium leading-tight">{packageData?.name}</div>
              <div className="text-xs text-[var(--hz-text-2)] mt-1 hz-mono">
                {packageData.bookingNo} · {packageData.durationName} days
              </div>
            </div>
          </div>

          {/* Money summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="hz-card p-4">
              <div className="hz-label">Total cost</div>
              <div className="hz-heading text-lg sm:text-xl font-medium mt-1 hz-mono">{formatCurrency(booking.netAmount ?? 0)}</div>
            </div>
            <div className="hz-card p-4">
              <div className="hz-label">Paid</div>
              <div className="hz-heading text-lg sm:text-xl font-medium mt-1 hz-mono text-[var(--hz-success)]">{formatCurrency(booking.paidAmount ?? 0)}</div>
            </div>
            <div className="hz-card p-4">
              <div className="hz-label">Remaining</div>
              <div className="hz-heading text-lg sm:text-xl font-medium mt-1 hz-mono text-[var(--hz-cta)]">{formatCurrency(booking.pendingAmount ?? 0)}</div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="hz-label block mb-2">Remark <span className="text-[var(--hz-error)]">*</span></label>
              <textarea
                className={`hz-input !h-24 !pl-4 !py-3 resize-none ${errors.remark ? "hz-input--error" : ""}`}
                data-testid="booking-closure-remark"
                placeholder="e.g. Trip completed; final settlement done."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
              {errors.remark && <div className="hz-input-error-msg">{errors.remark}</div>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <HzInput
                icon={IndianRupee}
                label="Final discount"
                type="number"
                min="0"
                placeholder="0"
                value={discount}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const pendingAmount = Number(booking.pendingAmount ?? 0);
                  setDiscount(
                    value > pendingAmount
                      ? pendingAmount
                      : e.target.value
                  );
                }}
                error={errors.discount}
                testid="booking-closure-discount"
              />
              <div>
                <label className="hz-label block mb-2">Winner</label>
                <div className={`hz-card p-3 flex items-start gap-3 ${winnerEnabled ? "border-[var(--hz-cta)] bg-[var(--hz-cta)]/5" : ""}`}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={winnerEnabled}
                    onClick={() => setWinnerEnabled((v) => !v)}
                    data-testid="booking-closure-winner-toggle"
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${winnerEnabled ? "bg-[var(--hz-cta)]" : "bg-[var(--hz-border)]"}`}
                  >
                    <span
                      className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${winnerEnabled ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-tight inline-flex items-center gap-1.5">
                      <Trophy className="size-3.5 text-[var(--hz-cta)]" strokeWidth={1.75} /> Mark traveller as winner
                    </div>
                    <div className="text-[11px] text-[var(--hz-text-2)] mt-0.5">Tag a traveller from this booking as the trip winner.</div>
                  </div>
                </div>
                {/* {winnerEnabled && (
                  <div className="mt-3 hz-fade-up">
                    <select
                      className={`hz-input !pl-4 ${errors.winner ? "hz-input--error" : ""}`}
                      value={winnerTravellerId}
                      onChange={(e) => setWinnerTravellerId(e.target.value)}
                      data-testid="booking-closure-winner-select"
                    >
                      <option value="">Pick a traveller…</option>
                      {(booking.travellers || []).map((t) => {
                        const n = t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : t.name;
                        return <option key={t.id} value={t.id}>{n}{t.relation ? ` · ${t.relation}` : ""}</option>;
                      })}
                    </select>
                    {errors.winner && <div className="hz-input-error-msg">{errors.winner}</div>}
                  </div>
                )} */}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--hz-warning-bg)] text-[#8A6024] text-xs flex items-start gap-2">
            <FileText className="size-4 shrink-0 mt-0.5" />
            <span>The booking will be marked as <b>Closed</b>. Existing transactions remain visible. The discount adjusts the remaining balance only.</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-2" data-testid="booking-closure-success">
          <div className="size-20 rounded-2xl bg-[#E9F2EB] text-[#4A7856] flex items-center justify-center mx-auto hz-success-pop">
            <CheckCircle2 className="size-10" strokeWidth={1.5} />
          </div>
          <h4 className="hz-heading text-2xl mt-5 font-medium tracking-tight">Closed successfully</h4>
          <p className="text-sm text-[var(--hz-text-2)] mt-1.5 max-w-sm mx-auto">
            The booking ledger is sealed. Print the slip below for your operations records.
          </p>

          <div className="hz-card p-5 text-left mt-6">
            <div className="hz-label">Closure number</div>
            <div className="hz-heading text-2xl hz-mono mt-1 text-[var(--hz-cta)]">{closureResponse?.closureNumber ?? ""}</div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 text-sm">
              <div>
                <div className="hz-label !text-[10px]">Booking</div>
                <div className="mt-0.5 hz-mono">{booking?.bookingNo ?? '-'}</div>
              </div>
              <div>
                <div className="hz-label !text-[10px]">Package</div>
                <div className="mt-0.5">{packageData?.name}</div>
              </div>
              <div>
                <div className="hz-label !text-[10px]">Closed on</div>
                <div className="mt-0.5">{closureResponse?.closureDate}</div>
              </div>
              <div>
                <div className="hz-label !text-[10px]">Discount applied</div>
                <div className="mt-0.5 hz-mono">{formatCurrency(Number(discount) || 0)}</div>
              </div>
              <div className="col-span-2">
                <div className="hz-label !text-[10px]">Remark</div>
                <div className="mt-0.5">{remark}</div>
              </div>
              {/* {winnerName && (
                <div className="col-span-2 p-3 rounded-lg bg-[#FDF1EB] inline-flex items-center gap-2">
                  <Trophy className="size-4 text-[var(--hz-cta)]" />
                  <span className="text-sm"><span className="hz-label !text-[10px]">Winner</span><br /><b>{winnerName}</b></span>
                </div>
              )} */}
            </div>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-xs text-[var(--hz-text-2)]">
            <Sparkles className="size-3.5 text-[var(--hz-cta)]" /> Audit trail entry recorded.
          </div>
        </div>
      )}
    </HzModal>
  );
}
