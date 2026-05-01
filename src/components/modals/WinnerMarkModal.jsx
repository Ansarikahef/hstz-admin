import { useEffect, useState } from "react";
import HzModal from "./HzModal";
import { db } from "@/lib/mockData";
import { ChevronLeft, ChevronRight, Trophy, Save, Calendar } from "lucide-react";
import { toast } from "sonner";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function MonthPicker({ value, onChange, error }) {
  // value is "YYYY-MM"
  const today = new Date();
  const initialYear = value ? parseInt(value.slice(0, 4), 10) : today.getFullYear();
  const [year, setYear] = useState(initialYear);
  const selected = value || null;
  const currentKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div>
      <label className="hz-label block mb-2">Winner of the month</label>
      <div
        className={`hz-card p-4 sm:p-5 ${error ? "ring-2 ring-[var(--hz-error)]/40 border-[var(--hz-error)]" : ""}`}
        data-testid="winner-month-picker"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            className="size-9 rounded-lg flex items-center justify-center border border-[var(--hz-border)] hover:bg-[var(--hz-hover)]"
            aria-label="Previous year"
            data-testid="winner-month-prev-year"
          >
            <ChevronLeft className="size-4" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[var(--hz-cta)]" strokeWidth={1.5} />
            <span className="hz-heading text-2xl font-medium tracking-tight hz-mono">{year}</span>
          </div>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            className="size-9 rounded-lg flex items-center justify-center border border-[var(--hz-border)] hover:bg-[var(--hz-hover)]"
            aria-label="Next year"
            data-testid="winner-month-next-year"
          >
            <ChevronRight className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {MONTH_LABELS.map((m, i) => {
            const key = `${year}-${String(i + 1).padStart(2, "0")}`;
            const active = selected === key;
            const isCurrent = key === currentKey;
            return (
              <button
                type="button"
                key={key}
                onClick={() => onChange(key)}
                data-testid={`winner-month-${key}`}
                className={`
                  group relative h-16 rounded-xl border transition-all duration-200
                  flex flex-col items-center justify-center gap-0.5
                  ${
                    active
                      ? "bg-[var(--hz-cta)] border-[var(--hz-cta)] text-white shadow-[0_8px_24px_-8px_rgba(217,115,78,0.6)] scale-[1.02]"
                      : "bg-white border-[var(--hz-border)] text-[var(--hz-text)] hover:border-[var(--hz-cta)] hover:bg-[var(--hz-cta)]/5"
                  }
                `}
              >
                {isCurrent && !active && (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--hz-cta)]" />
                )}
                <span className={`text-xs tracking-[0.18em] uppercase font-medium ${active ? "text-white/90" : "text-[var(--hz-text-2)] group-hover:text-[var(--hz-cta)]"}`}>
                  {m}
                </span>
                <span className={`text-[10px] hz-mono ${active ? "text-white/70" : "text-[var(--hz-text-2)]/60"}`}>
                  {String(year).slice(2)}
                </span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-4 p-2.5 rounded-lg bg-[var(--hz-cta)]/10 text-[var(--hz-cta)] text-xs flex items-center gap-2 hz-fade-up">
            <Trophy className="size-3.5" strokeWidth={1.75} />
            Selected · <b>{MONTH_FULL[parseInt(selected.slice(5, 7), 10) - 1]} {selected.slice(0, 4)}</b>
          </div>
        )}
      </div>
      {error && <div className="hz-input-error-msg" data-testid="winner-month-error">{error}</div>}
    </div>
  );
}

export default function WinnerMarkModal({ open, onClose, traveller, bookingId, onSaved }) {
  const [month, setMonth] = useState("");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setMonth(traveller?.winnerInfo?.month || "");
      setRemark(traveller?.winnerInfo?.remark || "");
      setErrors({});
    }
  }, [open, traveller]);

  if (!open || !traveller) return null;
  const fullName = traveller.firstName && traveller.lastName ? `${traveller.firstName} ${traveller.lastName}` : traveller.name;

  const save = () => {
    const e = {};
    if (!month) e.month = "Pick the month this traveller won.";
    if (!remark.trim()) e.remark = "Add a short remark.";
    setErrors(e);
    if (Object.keys(e).length) return;

    const s = db.load();
    const targetBookingId = bookingId || traveller.bookingId;
    const booking = s.bookings.find((b) => b.id === targetBookingId);
    if (booking) {
      const t = booking.travellers.find((x) => x.id === traveller.id);
      if (t) {
        t.winnerInfo = {
          month,
          remark,
          markedAt: new Date().toISOString(),
        };
      }
    }
    db.save(s);
    onSaved?.();
    toast.success("Winner marked", {
      description: `${fullName} · ${MONTH_FULL[parseInt(month.slice(5, 7), 10) - 1]} ${month.slice(0, 4)}`,
    });
    onClose();
  };

  const removeWinner = () => {
    const s = db.load();
    const targetBookingId = bookingId || traveller.bookingId;
    const booking = s.bookings.find((b) => b.id === targetBookingId);
    if (booking) {
      const t = booking.travellers.find((x) => x.id === traveller.id);
      if (t) delete t.winnerInfo;
    }
    db.save(s);
    onSaved?.();
    toast.success("Winner mark cleared");
    onClose();
  };

  return (
    <HzModal
      open={open}
      onClose={onClose}
      title="Mark traveller as winner"
      description={`Capture the month and a short remark for ${fullName}.`}
      size="md"
      accent="cta"
      icon={<Trophy className="size-5" strokeWidth={1.5} />}
      testid="winner-mark-modal"
      footer={
        <>
          {traveller.winnerInfo && (
            <button
              className="hz-btn-ghost text-[var(--hz-error)]"
              onClick={removeWinner}
              data-testid="winner-mark-remove"
            >
              Remove winner mark
            </button>
          )}
          <button className="hz-btn-ghost" onClick={onClose} data-testid="winner-mark-cancel">
            Cancel
          </button>
          <button className="hz-btn-primary" onClick={save} data-testid="winner-mark-save">
            <Save className="size-4" strokeWidth={1.75} /> Save winner
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="hz-card p-4 flex items-center gap-3 bg-[var(--hz-hover)]">
          <div className="size-11 rounded-full bg-[var(--hz-cta)]/10 text-[var(--hz-cta)] flex items-center justify-center shrink-0">
            <Trophy className="size-5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="hz-heading text-base font-medium leading-tight">{fullName}</div>
            <div className="text-xs text-[var(--hz-text-2)] mt-0.5">{traveller.relation || "Traveller"} · Booking <span className="hz-mono">{traveller.bookingId || bookingId || "—"}</span></div>
          </div>
        </div>

        <MonthPicker value={month} onChange={setMonth} error={errors.month} />

        <div>
          <label className="hz-label block mb-2">Remark</label>
          <textarea
            className={`hz-input !h-24 !pl-4 !py-3 resize-none ${errors.remark ? "hz-input--error" : ""}`}
            data-testid="winner-mark-remark"
            placeholder="e.g. Drew the lucky-dip prize at our anniversary event."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          {errors.remark && <div className="hz-input-error-msg">{errors.remark}</div>}
        </div>
      </div>
    </HzModal>
  );
}
