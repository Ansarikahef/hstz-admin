import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function HzModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  testid = "modal",
  icon,
  accent = "cta",
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-[96vw]",
  };
  const accents = {
    cta: "linear-gradient(90deg, #D9734E 0%, #BF613D 100%)",
    success: "linear-gradient(90deg, #4A7856 0%, #2F5A3F 100%)",
    danger: "linear-gradient(90deg, #C04235 0%, #8A2C22 100%)",
    info: "linear-gradient(90deg, #4A6E8C 0%, #2E4F69 100%)",
    none: null,
  };
  const accentBg = accents[accent] !== undefined ? accents[accent] : accents.cta;
  const iconBg =
    accent === "danger"
      ? "bg-[#FCECEC] text-[#C04235]"
      : accent === "success"
        ? "bg-[#E9F2EB] text-[#4A7856]"
        : accent === "info"
          ? "bg-[#EAF1F7] text-[#4A6E8C]"
          : "bg-[#FDF1EB] text-[#D9734E]";

  return createPortal(
    <div
      className="hz-modal-overlay fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
      onClick={closeOnBackdrop ? onClose : undefined}
      data-testid={`${testid}-backdrop`}
    >
      <div
        className={`hz-modal-content relative w-full ${widths[size] || widths.md} bg-white rounded-2xl sm:rounded-[20px] border border-[var(--hz-border)] flex flex-col max-h-[92vh] overflow-hidden`}
        style={{ boxShadow: "0 30px 80px -20px rgba(22,45,36,0.45), 0 8px 16px -8px rgba(22,45,36,0.16)" }}
        onClick={(e) => e.stopPropagation()}
        data-testid={testid}
      >
        {accentBg && (
          <div className="h-1.5 shrink-0" style={{ background: accentBg }} aria-hidden />
        )}
        <div className="flex items-start gap-4 px-5 sm:px-7 py-5 border-b border-[var(--hz-border)] shrink-0">
          {icon && (
            <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="hz-heading text-lg sm:text-xl font-medium text-[#1A1A1A] leading-tight tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-[#5C5C5C] mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-lg flex items-center justify-center text-[#5C5C5C] hover:bg-[#F4F1EA] hover:text-[#1A1A1A] transition shrink-0"
            aria-label="Close"
            data-testid={`${testid}-close`}
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-5 sm:px-7 py-5 sm:py-6 hz-scroll"
          style={{ scrollBehavior: "smooth" }}
        >
          {children}
        </div>
        {footer && (
          <div className="px-5 sm:px-7 py-4 border-t border-[var(--hz-border)] bg-gradient-to-b from-[var(--hz-bg)]/40 to-[var(--hz-hover)]/30 flex flex-wrap justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
