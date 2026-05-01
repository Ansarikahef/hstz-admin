import { useState } from "react";
import HzModal from "./HzModal";
import HzInput from "@/components/shared/HzInput";
import { CheckCircle2, IndianRupee, FileText, Sparkles } from "lucide-react";
import { db, formatCurrency, formatDate } from "@/lib/mockData";

export default function ClosePackageModal({ open, onClose, pkg, onClosed }) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [discount, setDiscount] = useState("");
  const [errors, setErrors] = useState({});
  const [bookingNumber, setBookingNumber] = useState("");

  const reset = () => { setStep(1); setReason(""); setDiscount(""); setErrors({}); setBookingNumber(""); };

  const submit = () => {
    const e = {};
    if (!reason.trim()) e.reason = "Reason is required.";
    if (discount && Number(discount) < 0) e.discount = "Discount cannot be negative.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const bn = `HZ-CLS-${Date.now().toString().slice(-8)}`;
    setBookingNumber(bn);
    onClosed?.({ reason, discount: Number(discount) || 0, bookingNumber: bn });
    setStep(2);
  };

  const close = () => { onClose(); reset(); };

  if (!open || !pkg) return null;

  return (
    <HzModal
      open={open}
      onClose={close}
      title={step === 1 ? "Close package" : "Closure recorded"}
      description={step === 1 ? "Record the reason and any final adjustments. The transaction history is preserved." : "A booking number has been generated for this closure."}
      size="md"
      testid="close-package-modal"
      footer={
        step === 1 ? (
          <>
            <button className="hz-btn-ghost" onClick={close} data-testid="close-package-cancel">Cancel</button>
            <button className="hz-btn-primary !bg-[#C04235] hover:!bg-[#A03228]" onClick={submit} data-testid="close-package-confirm">Close package</button>
          </>
        ) : (
          <button className="hz-btn-primary" onClick={close} data-testid="close-package-done">Done</button>
        )
      }
    >
      {step === 1 ? (
        <div className="space-y-5">
          <div className="hz-card p-4 bg-[var(--hz-hover)]">
            <div className="flex items-start gap-3">
              <FileText className="size-4 text-[var(--hz-text-2)] mt-0.5" />
              <div>
                <div className="hz-heading font-medium">{pkg.name}</div>
                <div className="text-xs text-[var(--hz-text-2)] mt-0.5">{pkg.durations.length} durations · From {formatCurrency(Math.min(...pkg.durations.map((d) => d.price)))}</div>
              </div>
            </div>
          </div>
          <div>
            <label className="hz-label block mb-2">Reason for closing</label>
            <textarea
              className={`hz-input !h-24 !pl-4 !py-3 resize-none ${errors.reason ? "hz-input--error" : ""}`}
              data-testid="close-package-reason"
              placeholder="e.g. Operator pause for off-season maintenance."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {errors.reason && <div className="hz-input-error-msg">{errors.reason}</div>}
          </div>
          <HzInput
            icon={IndianRupee}
            label="Final discount (optional)"
            type="number"
            min="0"
            placeholder="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            error={errors.discount}
            testid="close-package-discount"
          />
        </div>
      ) : (
        <div className="text-center py-4" data-testid="close-package-success">
          <div className="size-16 rounded-2xl bg-[#E9F2EB] text-[#4A7856] flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-8" strokeWidth={1.5} />
          </div>
          <h4 className="hz-heading text-2xl mt-4 font-medium">Closed successfully</h4>
          <p className="text-sm text-[var(--hz-text-2)] mt-1.5">The package is now marked as closed. The ledger remains intact.</p>
          <div className="hz-card p-5 text-left mt-5">
            <div className="text-xs tracking-[0.2em] uppercase text-[var(--hz-text-2)]">Booking number</div>
            <div className="hz-heading text-2xl hz-mono mt-1">{bookingNumber}</div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <div className="hz-label">Closed on</div>
                <div className="mt-1">{formatDate(new Date().toISOString())}</div>
              </div>
              <div>
                <div className="hz-label">Discount</div>
                <div className="mt-1 hz-mono">{formatCurrency(Number(discount) || 0)}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="hz-label">Reason</div>
              <div className="text-sm mt-1">{reason}</div>
            </div>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-xs text-[var(--hz-text-2)]">
            <Sparkles className="size-3.5 text-[var(--hz-cta)]" /> A confirmation has been logged in the audit trail.
          </div>
        </div>
      )}
    </HzModal>
  );
}
