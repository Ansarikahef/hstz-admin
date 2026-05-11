import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  icon,
  testid = "confirm",
  isBtnDisabled = false
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const accent = tone === "danger" ? "bg-[#FCECEC] text-[#C04235]" : "bg-[#F4F1EA] text-[#162D24]";
  const cta = tone === "danger" ? "bg-[#C04235] hover:bg-[#A03228]" : "bg-[#D9734E] hover:bg-[#BF613D]";
  const stripe = tone === "danger" ? "linear-gradient(90deg,#C04235 0%,#8A2C22 100%)" : "linear-gradient(90deg,#D9734E 0%,#BF613D 100%)";

  return createPortal(
    <div
      className="hz-modal-overlay fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={onClose}
      data-testid={`${testid}-modal-backdrop`}
    >
      <div
        className="hz-modal-content w-full max-w-md bg-white rounded-2xl border border-[var(--hz-border)] overflow-hidden"
        style={{ boxShadow: "0 30px 80px -20px rgba(22,45,36,0.45), 0 8px 16px -8px rgba(22,45,36,0.16)" }}
        onClick={(e) => e.stopPropagation()}
        data-testid={`${testid}-modal`}
      >
        <div className="h-1.5" style={{ background: stripe }} aria-hidden />
        <div className="p-7">
          <div className="flex items-start gap-4">
            <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
              {icon || <AlertTriangle className="size-5" strokeWidth={1.5} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="hz-heading text-xl font-medium text-[#1A1A1A]">{title}</h3>
              {description && (
                <p className="text-sm text-[#5C5C5C] mt-1.5 leading-relaxed">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="size-8 rounded-lg flex items-center justify-center text-[#5C5C5C] hover:bg-[#F4F1EA]"
              aria-label="Close"
              data-testid={`${testid}-modal-close`}
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex justify-end gap-2.5 mt-7">
            <button
              onClick={onClose}
              data-testid={`${testid}-modal-cancel`}
              className="hz-btn-ghost"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              data-testid={`${testid}-modal-confirm`}
              className={`text-white h-10 px-5 rounded-lg font-medium text-sm transition-colors ${cta}`}
              disabled={isBtnDisabled}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
