import { useState } from "react";
import HzModal from "./HzModal";
import BookingClosureModal from "./BookingClosureModal";
import DocumentViewerModal from "./DocumentViewerModal";
import {
  User, Mail, Phone, MapPin, Calendar, FileText, Eye,
  Plane, Heart, ShieldAlert, BadgeCheck, Receipt, Printer, XCircle, Trophy,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { db, formatCurrency, formatDate, formatDateTime } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import Helper from "@/Utils/Helper";
import apiService from "@/Utils/ApiService";
import { useQueryClient } from "@tanstack/react-query";



const STATUS_BADGE = { paid: "hz-badge--paid", pending: "hz-badge--pending", failed: "hz-badge--failed" };

function Field({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <div className="hz-label !text-[10px]">{label}</div>
      <div className="text-sm text-[var(--hz-text)] mt-0.5 break-words">{value}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children, accent = "cta" }) {
  const tints = {
    cta: "text-[var(--hz-cta)]",
    info: "text-[#4A6E8C]",
    success: "text-[var(--hz-success)]",
    warning: "text-[#8A6024]",
  };
  return (
    <section className="hz-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className={`size-4 ${tints[accent]}`} strokeWidth={1.5} />}
        <h4 className="hz-label">{title}</h4>
      </div>
      {children}
    </section>
  );
}

export default function BookingDetailsModal({ open, onClose, details, onSaved }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [closeOpen, setCloseOpen] = useState(false);
  const [isShowBtnLoader, setIsShowBtnLoader] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // eslint-disable-line no-unused-vars
  const loggedInUser = Helper.getLoginUserDetails();
  if (!open || !details) return null;
  const t = details;
  console.log("BookingDetailsModal render", t );
  const fullName = t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : t.name;

  const state = db.load();
  const booking = state.bookings.find((b) => b.id === t.bookingId);
  const pkg = booking ? state.packages.find((p) => p.id === booking.packageId) : null;
  const user = booking ? state.users.find((u) => u.id === booking.userId) : null;
  const transactions = state.transactions.filter((tx) => tx.bookingId === t.bookingId);
  const paid = transactions.filter((x) => x.status === "paid").reduce((s, x) => s + x.amount, 0);
  const pending = transactions.filter((x) => x.status === "pending").reduce((s, x) => s + x.amount, 0);
  const remaining = booking ? Math.max(0, booking.totalAmount - paid) : 0;

  const isClosed = booking?.status === "closed";
  const isConfirmedBooking = t?.bookingStatus === "Confirmed" ? true : false;

  const handleBookingStatusUpdate =async (newStatus) => {
    if (!t) return;
    try {
      setIsShowBtnLoader(true);
      const payload = {
        key: t.bookingId,
        bookingStatus: newStatus,
        userId: loggedInUser?.id ?? 0,
      }
      const {status,message} = await apiService.post("admin/updateBookingStatus", payload);
      if(status === 1){
        toast.success(message || "Booking status updated successfully");
         // Refetch booking list
         onClose();
        queryClient.invalidateQueries({
          queryKey: ["bookingList"],
        });
      } else {
        toast.error("Sign-in failed", { description: message || "Failed to update booking status" });
      }
    } catch (error) {
      console.error("Failed to update booking status:", error);
      toast.error("Sign-in failed", { description: message || "Failed to update booking status. Please try again." });
    }
    finally {
      setIsShowBtnLoader(false);
    }
  }

  return (
    <HzModal
      open={open}
      onClose={onClose}
      title={fullName}
      description={`${t.bookingNo}${" · " + t.packageName}`}
      size="2xl"
      accent="cta"
      icon={<User className="size-5" strokeWidth={1.5} />}
      testid="details-profile-modal"
      footer={
      <>
        <button
          className="hz-btn-ghost"
          onClick={onClose}
          data-testid="details-profile-close-btn"
        >
          Close
        </button>

        {/* <button
          className="hz-btn-ghost"
          onClick={() => navigate(`/invoice/${t.bookingId}`)}
          data-testid="details-profile-print"
        >
          <Printer className="size-4" />
          Print statement
        </button> */}

        {/* Booking Status Dropdown */}
        {!isClosed && (
          <div className="relative">
            <select
              className="appearance-none h-10 px-4 pr-10 rounded-lg border border-[var(--hz-border)] bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--hz-primary)]"
              defaultValue={t?.bookingStatus || ""}
              onChange={(e) => handleBookingStatusUpdate(e.target.value)}
              disabled={isShowBtnLoader}
              data-testid="details-profile-status-update"
            >
              <option value="" disabled>
                Update Status
              </option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              {isShowBtnLoader ? (
                <div className="size-4 border-2 border-[var(--hz-primary)] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {!isClosed && isConfirmedBooking && (
          <button
            className="text-white h-10 px-5 rounded-lg font-medium text-sm transition-colors bg-[#C04235] hover:bg-[#A03228] inline-flex items-center gap-2"
            onClick={() => setCloseOpen(true)}
            data-testid="details-profile-close-booking"
          >
            <XCircle className="size-4" />
            Close booking
          </button>
        )}

        {isClosed && booking?.closureNumber && (
          <button
            className="hz-btn-primary"
            onClick={() => navigate(`/closure-slip/${booking.id}`)}
            data-testid="details-profile-closure-slip"
          >
            <Printer className="size-4" />
            Print closure slip
          </button>
        )}
      </>
    }
    >
      <div className="space-y-5">
        {/* Header summary */}
        <div className="hz-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-gradient-to-br from-[var(--hz-hover)] to-white">

  {/* Package Image */}
  <div className="relative size-24 sm:size-28 rounded-2xl overflow-hidden border border-[var(--hz-border)] shrink-0 bg-white">

    <img
      src={
        t?.packageImages?.length > 0
          ? t?.packageImages?.[0]?.imagePath
          : "https://placehold.co/600x400?text=No+Image"
      }
      alt={t?.packageName || "Package"}
      className="w-full h-full object-cover"
    />

    {/* Image Count */}
    {t?.packageImages?.length > 1 && (
      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/70 text-white text-[10px] font-medium backdrop-blur">
        +{t.packageImages.length - 1}
      </div>
    )}
  </div>

  {/* Package Details */}
  <div className="flex-1 min-w-0">

    {/* Package Name */}
    <div className="hz-heading text-2xl font-medium tracking-tight line-clamp-2">
      {t?.packageName || "Package Name"}
    </div>

    {/* Booking Number */}
    <div className="text-xs text-[var(--hz-text-2)] mt-1 hz-mono">
      Booking No · {t?.bookingNo}
    </div>
    <div className="text-xs text-[var(--hz-text-2)] mt-1 hz-mono">
      Booking Date · {t?.bookingDate}
    </div>

    {/* Details */}
    <div className="flex flex-wrap items-center gap-2 mt-3">

      {/* Package Type */}
      {t?.packageType && (
        <span className="hz-badge hz-badge--paid">
          {t?.packageType}
        </span>
      )}

      {/* Plan Type */}
      {/* {t?.planType && (
        <span className="hz-badge hz-badge--inactive">
          {t?.planType}
        </span>
      )} */}

      {/* Duration */}
      {t?.durationName && (
        <span className="hz-badge hz-badge--inactive">
          {t?.durationName} Days
        </span>
      )}

      {/* Destination */}
      {t?.cityName && (
        <span className="hz-badge hz-badge--inactive">
          {booking?.cityName}
        </span>
      )}

      {/* Status */}
      {t?.bookingStatus && (
        <span
          className={`hz-badge ${
            t?.bookingStatus === "Pending"
              ? "hz-badge--pending"
              : booking?.bookingStatus === "Confirmed"
              ? "hz-badge--paid"
              : "hz-badge--inactive"
          }`}
        >
          {t?.bookingStatus}
        </span>
      )}
    </div>

    {/* Amounts */}
    <div className="mt-4 flex flex-wrap items-center gap-5">

      <div>
        <div className="text-[11px] text-[var(--hz-text-3)] uppercase tracking-wide">
          Total Amount
        </div>

        <div className="text-lg font-semibold text-[var(--hz-text)]">
          ₹{t?.totalAmount?.toLocaleString()}
        </div>
      </div>

      {/* <div>
        <div className="text-[11px] text-[var(--hz-text-3)] uppercase tracking-wide">
          Pending
        </div>

        <div className="text-lg font-semibold text-red-500">
          ₹{booking?.pendingAmount?.toLocaleString()}
        </div>
      </div> */}

    </div>
  </div>
</div>

        {/* Personal */}
        <Section title="Personal details" icon={BadgeCheck} accent="cta">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4">
            <Field label="First name" value={t.firstName} />
            <Field label="Last name" value={t.lastName} />
            <Field label="Gender" value={t.gender} />
            <Field label="Marital status" value={t.maritalStatus} />
            <Field label="Date of birth" value={t.dateOfBirth} />
            <Field label="Nationality" value={t.nationality} />
            <Field label="Guardian" value={t.guardianName ? `${t.guardianName}${t.guardianRelation ? " (" + t.guardianRelation + ")" : ""}` : null} />
            <Field label="Relation" value={t.relation} />
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact" icon={Phone} accent="info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="Mobile" value={t.mobileNumber} />
            <Field label="WhatsApp" value={t.whatsAppNumber} />
            <Field label="Email" value={t.emailId ?? '-'} />
            <Field label="Address" value={`${t.address} ${t.cityName} ${t.stateName} `} />
          </div>
        </Section>
        {/* Gurdian Details */}
        <Section title="Guardian" icon={Shield} accent="info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field label="Name" value={t.guardianName ?? '-'} />
            <Field label="Relation" value={t.guardianRelation ?? '-'} />
          </div>
        </Section>

        {/* Identification */}
        <Section title="Passport" icon={FileText} accent="cta">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4">
            <Field label="Passport Number" value={t.passportNumber ? t.passportNumber : '-'} />
            <Field label="Issue Date" value={t.passportIssueDate ?? '-'} />
            <Field label="Expiry Date" value={t.passportExpiryDate ?? '-'} />
            <Field label="Issue place" value={t.passportIssuePlace ?? '-'} />
          </div>
        </Section>
        

        {/* Emergency */}
        <Section title="Emergency contact" icon={ShieldAlert} accent="warning">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-4">
            <Field label="Contact Name" value={t.emergencyContactName ?? '-'} />
            <Field label="Number" value={t.emergencyContactNumber ?? '-'} />
            <Field label="Relation" value={t.emergencyRelation ?? '-'} />
          </div>
        </Section>

        {/* Nominee */}
        <Section title="Nominee details" icon={Heart} accent="cta">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-4">
            <Field label="Name" value={t.nomineeName ?? '-'} />
            <Field label="Date of birth" value={t.nomineeDateOfBirth ?? '-'} />
            <Field label="Relation" value={t.nomineeRelation ?? '-'} />
          </div>
        </Section>

        {/* Package */}
        {pkg && (
          <Section title="Purchased package" icon={Plane} accent="info">
            <div className="flex flex-col sm:flex-row gap-4">
              {pkg.images?.[0] && (
                <img src={pkg.images[0]} alt={pkg.name} className="w-full sm:w-44 h-32 sm:h-32 rounded-xl object-cover" />
              )}
              <div className="flex-1 grid grid-cols-2 gap-x-5 gap-y-3">
                <Field label="Package" value={pkg.name} />
                <Field label="Booking ID" value={booking?.id} />
                <Field label="Duration" value={booking ? `${booking.durationDays} days` : null} />
                <Field label="Travel date" value={booking ? formatDate(booking.travelDate) : null} />
                <Field label="Booked on" value={booking ? formatDate(booking.bookingDate) : null} />
                <Field label="Booked by" value={booking?.bookedBy === "admin" ? "Admin" : "Self"} />
                <Field label="Total amount" value={booking ? formatCurrency(booking.totalAmount) : null} />
                <Field label="Status" value={booking?.status === "closed" ? "Closed" : "Active"} />
                {booking?.discount > 0 && <Field label="Discount applied" value={formatCurrency(booking.discount)} />}
                {booking?.closeReason && <Field label="Closure remark" value={booking.closeReason} />}
                {booking?.winnerName && <Field label="Winner" value={booking.winnerName} />}
              </div>
            </div>
          </Section>
        )}

        {/* Documents */}
        {(t.documents || []).length > 0 && (
          <Section title="Documents" icon={FileText} accent="cta">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {t.documents.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--hz-hover)]"
                  data-testid={`tpm-doc-${i}`}
                >
                  <div className="size-10 rounded-lg bg-white flex items-center justify-center shrink-0 text-[var(--hz-text-2)]">
                    <FileText className="size-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate font-medium">{d.fileName}</div>
                    <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--hz-text-2)]">{d.documentType}</div>
                  </div>
                  <button
                    className="hz-btn-ghost !h-8 !px-3 text-xs"
                    onClick={() => setViewDoc(d)}
                    data-testid={`tpm-doc-view-${i}`}
                  >
                    <Eye className="size-3.5" strokeWidth={1.5} /> View
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Transaction statement */}
        {booking && (
          <Section title="Transaction statement" icon={Receipt} accent="success">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead className="bg-[var(--hz-hover)]">
                  <tr className="text-left">
                    <th className="px-3 py-2.5 hz-label !text-[10px]">Date</th>
                    <th className="px-3 py-2.5 hz-label !text-[10px]">Method</th>
                    <th className="px-3 py-2.5 hz-label !text-[10px]">Transaction ID</th>
                    <th className="px-3 py-2.5 hz-label !text-[10px]">Installment</th>
                    <th className="px-3 py-2.5 hz-label !text-[10px]">Status</th>
                    <th className="px-3 py-2.5 hz-label !text-[10px] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((x) => (
                    <tr key={x.id} className="hz-stripes-row border-t border-[var(--hz-border-soft)]">
                      <td className="px-3 py-2.5 hz-mono text-[12px] text-[var(--hz-text-2)]">{formatDateTime(x.date)}</td>
                      <td className="px-3 py-2.5">{x.method}</td>
                      <td className="px-3 py-2.5 hz-mono text-[12px]">{x.transactionId}</td>
                      <td className="px-3 py-2.5 text-[var(--hz-text-2)]">{x.installment}</td>
                      <td className="px-3 py-2.5"><span className={`hz-badge ${STATUS_BADGE[x.status]}`}>{x.status}</span></td>
                      <td className="px-3 py-2.5 hz-mono text-right">{formatCurrency(x.amount)}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-[var(--hz-text-2)]">No transactions on this booking yet.</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--hz-border)]">
                    <td colSpan={5} className="px-3 py-2.5 text-right hz-label !text-[10px]">Paid</td>
                    <td className="px-3 py-2.5 hz-mono text-right font-semibold">{formatCurrency(paid)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right hz-label !text-[10px]">Pending</td>
                    <td className="px-3 py-2 hz-mono text-right">{formatCurrency(pending)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right hz-label !text-[10px]">Remaining</td>
                    <td className="px-3 py-2 hz-mono text-right text-[var(--hz-cta)]">{formatCurrency(remaining)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>
        )}

        {/* Remarks */}
        {(t.remarks || (t.isAddedByAdmin && t.adminRemarks)) && (
          <Section title="Notes" icon={FileText} accent="warning">
            <div className="space-y-3 text-sm">
              {t.remarks && <Field label="Traveller remarks" value={t.remarks} />}
              {t.isAddedByAdmin && t.adminRemarks && <Field label="Admin remarks" value={t.adminRemarks} />}
            </div>
          </Section>
        )}
      </div>
      {t.bookingStatus === "Confirmed" && (
        <BookingClosureModal
          open={closeOpen}
          onClose={() => setCloseOpen(false)}
          booking={booking}
          packageData={pkg}
          transactions={transactions}
          onClosed={() => {
            setRefreshKey((k) => k + 1);
            onSaved?.();
          }}
        />
      )}
      <DocumentViewerModal doc={viewDoc} onClose={() => setViewDoc(null)} travellerName={fullName} />
    </HzModal>
  );
}
