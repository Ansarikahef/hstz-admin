import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HzModal from "./HzModal";
import BookingClosureModal from "./BookingClosureModal";
import DocumentViewerModal from "./DocumentViewerModal";
import {
  User, Mail, Phone, MapPin, Calendar, FileText, Eye,
  Plane, Heart, ShieldAlert, BadgeCheck, Receipt, Printer, XCircle, Trophy,
  Shield,
} from "lucide-react";
import { db, formatCurrency, formatDate, formatDateTime } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import BookingClosureModalV2 from "./BookingClosureModalV2";
import apiService from "@/Utils/ApiService";

const STATUS_BADGE = {
  SUCCESS: "hz-badge--paid",
  CHARGED: "hz-badge--paid",
  PAID: "hz-badge--paid",

  PENDING: "hz-badge--pending",
  NEW: "hz-badge--pending",

  FAILED: "hz-badge--failed",
  FAILURE: "hz-badge--failed",
  DECLINED: "hz-badge--failed",
  CANCELLED: "hz-badge--failed",
  CANCELED: "hz-badge--failed",
};

function Field({ label, value }) {
  //if (value === undefined || value === null || value === "") return null;
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
const getPaymentTransactionsAdmin = async (travellerId) => {
  const payload = {
    customerId: 0,
    travellerId: travellerId,
    productId: 0,
    search: "",
    status: "",
    fromDate: null,
    toDate: null,
  };

  const { status, message, responseValue } =
    await apiService.post(
      "admin/GetPaymentTransactionsAdmin",
      payload
    );

  if (status === 1) {
    return {
      dashboard: responseValue?.[0] || {},
      transactions: responseValue?.[1] || [],
    };
  }

  throw new Error(
    message || "Failed to fetch payment transactions"
  );
};
export default function TravellerProfileModalV2({ open, onClose, traveller, onSaved }) {
  const navigate = useNavigate();
  const [closeOpen, setCloseOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // eslint-disable-line no-unused-vars

  const t = traveller;
  const travellerId = t?.travellerId || null;

  const {
    data: paymentData,
    isLoading: paymentLoading,
    isFetching: paymentFetching,
    isError: paymentError,
    error: paymentQueryError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["adminPaymentTransactions", travellerId],  
    queryFn: () =>
      getPaymentTransactionsAdmin(travellerId),  
    enabled: !!travellerId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
  if (!open || !traveller) return null;
  
  console.log("TravellerProfileModalV2 render", t);

  const fullName =t.fullName; 

  // Booking Details
  const booking = {
    id: t.bookingId,
    bookingNo: t.bookingNo,
    bookingCode: t.bookingCode,
    status: t.bookingStatus,
    bookingDate: t.bookingDate,
    approvedDate: t.approvedDate,
    closedDate: t.closedDate,
    totalAmount: t.totalAmount,
    paidAmount: t.paidAmount,
    pendingAmount: t.pendingAmount,
    netAmount: t.netAmount,
    emiAmount: t.emiAmount,
    packageId: t.packageId,
    userId: t.userId,
    travellerId: t.travellerId,
  };
  // Package Details
  const pkg = {
    id: t.packageId,
    name: t.packageName,
    type: t.packageType,
    planType: t.planType,
    paymentCycle: t.paymentCycle,
    durationName: t.durationName,
    bookingNo: t.bookingNo,
  };
  // User / Traveller Details
  const user = {
    id: t.userId,
    travellerId: t.travellerId,
    firstName: t.firstName,
    lastName: t.lastName,
    fullName,
    gender: t.gender,
    maritalStatus: t.maritalStatus,
    dateOfBirth: t.dateOfBirth,
    nationality: t.nationality,
    mobileNumber: t.mobileNumber,
    whatsAppNumber: t.whatsAppNumber,
    emailId: t.emailId,
    stateName: t.stateName,
    cityName: t.cityName,
    address: t.address,
  };
  const transactions  = t.transactions || [];
  // Transactions / Amounts
  const paid = t.paidAmount || 0;
  const pending = t.pendingAmount || 0;
  const remaining = Math.max(0, t.netAmount - paid);

  // Status Checks
  const isClosed = t.bookingStatus?.toLowerCase() === "closed";

  // Documents
  const documents = t.documents || [];
  
  const transactionsList = paymentData?.transactions || [];
  const paymentSummary = (transactionsList || []).reduce(
    (acc, transaction) => {
      const status =
        transaction.paymentStatus?.toUpperCase() || "UNKNOWN";
  
      const amount = Number(transaction.amount || 0);
  
      if (
        status === "SUCCESS" ||
        status === "CHARGED" ||
        status === "PAID"
      ) {
        acc.paid += amount;
        acc.paidCount += 1;
      } else if (
        status === "PENDING" ||
        status === "NEW"
      ) {
        acc.pending += amount;
        acc.pendingCount += 1;
      } else if (
        status === "FAILED" ||
        status === "FAILURE" ||
        status === "DECLINED" ||
        status === "CANCELLED" ||
        status === "CANCELED"
      ) {
        acc.failed += amount;
        acc.failedCount += 1;
      }
  
      return acc;
    },
    {
      paid: 0,
      pending: 0,
      failed: 0,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0,
    }
  );
  
  const totalPaidAmount = paymentSummary.paid;
  const totalPendingAmount = paymentSummary.pending;
  const totalFailedAmount = paymentSummary.failed;
  console.log("TravellerProfileModalV2 transactionsList", transactionsList);
  return (
    <HzModal
      open={open}
      onClose={onClose}
      title={fullName}
      description={`Traveller profile · Booking - ${t.bookingNo}${pkg ? " · " + pkg.name : ""}`}
      size="2xl"
      accent="cta"
      icon={<User className="size-5" strokeWidth={1.5} />}
      testid="traveller-profile-modal"
      footer={
        <>
          <button className="hz-btn-ghost" onClick={onClose} data-testid="traveller-profile-close-btn">Close</button>
          {/* <button
            className="hz-btn-ghost"
            onClick={() => navigate(`/invoice/${t.bookingId}`)}
            data-testid="traveller-profile-print"
          >
            <Printer className="size-4" /> Print statement
          </button> */}
          {!isClosed && (booking.status === "Completed" || booking.status === "Confirmed")  && (
            <button
              className="text-white h-10 px-5 rounded-lg font-medium text-sm transition-colors bg-[#C04235] hover:bg-[#A03228] inline-flex items-center gap-2"
              onClick={() => setCloseOpen(true)}
              data-testid="traveller-profile-close-booking"
            >
              <XCircle className="size-4" /> Close booking
            </button>
          )}
          {isClosed && booking?.closureNumber && (
            <button
              className="hz-btn-primary"
              onClick={() => navigate(`/closure-slip/${booking.id}`)}
              data-testid="traveller-profile-closure-slip"
            >
              <Printer className="size-4" /> Print closure slip
            </button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Header summary */}
        <div className="hz-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-gradient-to-br from-[var(--hz-hover)] to-white">
          <div className="size-16 sm:size-20 rounded-2xl bg-white border border-[var(--hz-border)] flex items-center justify-center shrink-0 text-[var(--hz-cta)]">
            <User className="size-8 sm:size-10" strokeWidth={1.25} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="hz-heading text-2xl font-medium tracking-tight">{fullName}</div>
            <div className="text-xs text-[var(--hz-text-2)] mt-1 hz-mono">{t.bookingNo}</div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {t.gender && <span className="hz-badge hz-badge--paid">{t.gender}</span>}
              {t.relation && <span className="hz-badge hz-badge--inactive">{t.relation}</span>}
              {t.isAddedByAdmin && <span className="hz-badge hz-badge--inactive">Added by Admin</span>}
              {isClosed && <span className="hz-badge hz-badge--closed">Booking closed</span>}
              {booking?.winnerName && (
                <span className="hz-badge hz-badge--paid inline-flex items-center gap-1">
                  <Trophy className="size-3" /> Winner · {booking.winnerName}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:min-w-[280px]">
            <div className="text-center px-2">
              <div className="hz-label !text-[9px]">Total</div>
              <div className="hz-mono text-sm mt-1">{booking ? formatCurrency(booking.totalAmount) : "—"}</div>
            </div>
            <div className="text-center px-2">
              <div className="hz-label !text-[9px]">Paid</div>
              <div className="hz-mono text-sm mt-1 text-[var(--hz-success)]">{formatCurrency(paid)}</div>
            </div>
            <div className="text-center px-2">
              <div className="hz-label !text-[9px]">Remaining</div>
              <div className="hz-mono text-sm mt-1 text-[var(--hz-cta)]">{formatCurrency(remaining)}</div>
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
            <Field label="Email" value={t.emailId} />
            <Field label="Address" value={t.address} />
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
                <Field label="Booking Number" value={booking?.bookingNo} />
                <Field label="Duration" value={booking ? `${pkg.durationName} days` : null} />
                {/* <Field label="Travel date" value={booking ? formatDate(booking.travelDate) : null} /> */}
                <Field label="Booked on" value={booking ? formatDate(booking.bookingDate) : null} />
                <Field label="Booked by" value={booking?.bookedBy === "admin" ? "Admin" : "Self"} />
                <Field label="Total amount" value={booking ? formatCurrency(booking.totalAmount) : null} />
                <Field label="Booking Status" value={booking?.status} />
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
          <Section
  title="Transaction statement"
  icon={Receipt}
  accent="success"
>
  {/* =====================================================
      PAYMENT SUMMARY
  ====================================================== */}

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">

    {/* PAID */}
    <div
      className="
        rounded-xl
        border border-emerald-200
        bg-emerald-50/60
        p-4
      "
    >
      <div className="flex items-center justify-between">

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
            Total Paid
          </div>

          <div className="mt-1 text-xl font-bold text-emerald-700">
            {formatCurrency(totalPaidAmount)}
          </div>

          <div className="mt-1 text-[10px] text-emerald-600">
            {paymentSummary.paidCount} successful payment
            {paymentSummary.paidCount !== 1 ? "s" : ""}
          </div>
        </div>

        <div
          className="
            size-10
            rounded-xl
            bg-emerald-100
            flex items-center
            justify-center
            text-emerald-600
          "
        >
          ✓
        </div>

      </div>
    </div>


    {/* PENDING */}
    <div
      className="
        rounded-xl
        border border-amber-200
        bg-amber-50/60
        p-4
      "
    >
      <div className="flex items-center justify-between">

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
            Total Pending
          </div>

          <div className="mt-1 text-xl font-bold text-amber-700">
            {formatCurrency(totalPendingAmount)}
          </div>

          <div className="mt-1 text-[10px] text-amber-600">
            {paymentSummary.pendingCount} pending payment
            {paymentSummary.pendingCount !== 1 ? "s" : ""}
          </div>
        </div>

        <div
          className="
            size-10
            rounded-xl
            bg-amber-100
            flex items-center
            justify-center
            text-amber-600
          "
        >
          ⏳
        </div>

      </div>
    </div>


    {/* FAILED */}
    <div
      className="
        rounded-xl
        border border-red-200
        bg-red-50/60
        p-4
      "
    >
      <div className="flex items-center justify-between">

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
            Total Failed
          </div>

          <div className="mt-1 text-xl font-bold text-red-700">
            {formatCurrency(totalFailedAmount)}
          </div>

          <div className="mt-1 text-[10px] text-red-600">
            {paymentSummary.failedCount} failed payment
            {paymentSummary.failedCount !== 1 ? "s" : ""}
          </div>
        </div>

        <div
          className="
            size-10
            rounded-xl
            bg-red-100
            flex items-center
            justify-center
            text-red-600
          "
        >
          ✕
        </div>

      </div>
    </div>

  </div>


  {/* =====================================================
      TRANSACTION TABLE
  ====================================================== */}

  <div className="overflow-x-auto -mx-1">

    <table className="w-full text-sm">

      <thead className="bg-[var(--hz-hover)]">

        <tr className="text-left">

          <th className="px-3 py-2.5 hz-label !text-[10px]">
            Date
          </th>

          <th className="px-3 py-2.5 hz-label !text-[10px]">
            Method
          </th>

          <th className="px-3 py-2.5 hz-label !text-[10px]">
            Payment ID
          </th>

          <th className="px-3 py-2.5 hz-label !text-[10px]">
            Transaction ID
          </th>

          <th className="px-3 py-2.5 hz-label !text-[10px]">
            Status
          </th>

          <th className="px-3 py-2.5 hz-label !text-[10px] text-right">
            Amount
          </th>

        </tr>

      </thead>


      <tbody>

        {transactionsList?.length > 0 ? (

          transactionsList.map((x) => {

            const status =
              x.paymentStatus?.toUpperCase() || "UNKNOWN";

            const badgeClass =
              STATUS_BADGE[status] ||
              "hz-badge--inactive";

            const displayDate =
              x.paymentCompletedOn ||
              x.paymentInitiatedOn ||
              "--";

            const paymentId =
              x.orderId || "--";

            const transactionId =
              x.gatewayTransactionId ||
              x.transactionId ||
              "--";

            const method =
              x.paymentMethod || "--";

            return (
              <tr
                key={x.id || x.transactionId}
                className="
                  hz-stripes-row
                  border-t
                  border-[var(--hz-border-soft)]
                "
              >

                {/* DATE */}
                <td
                  className="
                    px-3 py-2.5
                    hz-mono
                    text-[12px]
                    text-[var(--hz-text-2)]
                    whitespace-nowrap
                  "
                >
                  {displayDate}
                </td>


                {/* METHOD */}
                <td className="px-3 py-2.5">
                  <span className="font-medium">
                    {method}
                  </span>

                  {x.paymentGateway && (
                    <div className="text-[10px] text-[var(--hz-text-2)] mt-0.5">
                      {x.paymentGateway}
                    </div>
                  )}
                </td>


                {/* PAYMENT ID */}
                <td className="px-3 py-2.5">

                  <div
                    className="
                      hz-mono
                      text-[12px]
                      font-medium
                    "
                    title={paymentId}
                  >
                    {paymentId}
                  </div>

                </td>


                {/* TRANSACTION ID */}
                <td className="px-3 py-2.5">

                  <div
                    className="
                      hz-mono
                      text-[11px]
                      max-w-[220px]
                      truncate
                    "
                    title={transactionId}
                  >
                    {transactionId}
                  </div>

                </td>


                {/* STATUS */}
                <td className="px-3 py-2.5">

                  <span
                    className={`
                      hz-badge
                      ${badgeClass}
                    `}
                  >
                    {status === "CHARGED"
                      ? "PAID"
                      : status === "SUCCESS"
                      ? "PAID"
                      : status === "NEW"
                      ? "PENDING"
                      : status}
                  </span>

                </td>


                {/* AMOUNT */}
                <td
                  className="
                    px-3 py-2.5
                    hz-mono
                    text-right
                    font-semibold
                    whitespace-nowrap
                  "
                >
                  {formatCurrency(
                    Number(x.amount || 0)
                  )}
                </td>

              </tr>
            );
          })

        ) : (

          <tr>

            <td
              colSpan={6}
              className="
                px-3 py-8
                text-center
                text-sm
                text-[var(--hz-text-2)]
              "
            >
              No transactions found for this traveller.
            </td>

          </tr>

        )}

      </tbody>


      {/* =================================================
          SUMMARY FOOTER
      ================================================== */}

      <tfoot>

        {/* PAID */}
        <tr
          className="
            border-t-2
            border-[var(--hz-border)]
          "
        >

          <td
            colSpan={5}
            className="
              px-3 py-2.5
              text-right
              hz-label
              !text-[10px]
            "
          >
            Total Paid
          </td>

          <td
            className="
              px-3 py-2.5
              hz-mono
              text-right
              font-bold
              text-[var(--hz-success)]
            "
          >
            {formatCurrency(totalPaidAmount)}
          </td>

        </tr>


        {/* PENDING */}
        <tr>

          <td
            colSpan={5}
            className="
              px-3 py-2
              text-right
              hz-label
              !text-[10px]
            "
          >
            Total Pending
          </td>

          <td
            className="
              px-3 py-2
              hz-mono
              text-right
              font-semibold
              text-amber-600
            "
          >
            {formatCurrency(totalPendingAmount)}
          </td>

        </tr>


        {/* FAILED */}
        <tr>

          <td
            colSpan={5}
            className="
              px-3 py-2
              text-right
              hz-label
              !text-[10px]
            "
          >
            Total Failed
          </td>

          <td
            className="
              px-3 py-2
              hz-mono
              text-right
              font-semibold
              text-red-600
            "
          >
            {formatCurrency(totalFailedAmount)}
          </td>

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

      <BookingClosureModalV2
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
      <DocumentViewerModal doc={viewDoc} onClose={() => setViewDoc(null)} travellerName={fullName} />
    </HzModal>
  );
}
