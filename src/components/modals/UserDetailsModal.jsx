import HzModal from "./HzModal";
import { Mail, Phone, MapPin, Calendar, Receipt, Printer } from "lucide-react";
import { formatDate } from "@/lib/mockData";

export default function UserDetailsModal({ user, onClose, onOpenTransactions }) {
  if (!user) return null;

  // initials fallback
  const getInitials = (f, l) =>
    `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  return (
    <HzModal
      open={!!user}
      onClose={onClose}
      title={`${user.firstName} ${user.lastName}`}
      description="Full profile details"
      size="lg"
      footer={
        <>
          {/* <button className="hz-btn-ghost" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </button> */}
          <button
            className="hz-btn-primary"
            onClick={() => onOpenTransactions(user.id)}
          >
            <Receipt className="size-4" /> View transactions
          </button>
        </>
      }
    >
      {/* PROFILE */}
      <div className="grid sm:grid-cols-[120px_1fr] gap-5">
        <div className="size-24 rounded-2xl overflow-hidden bg-gray-300 flex items-center justify-center text-lg font-semibold">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerText = getInitials(
                  user.firstName,
                  user.lastName
                );
              }}
            />
          ) : (
            getInitials(user.firstName, user.lastName)
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[var(--hz-text-2)]">
            <Mail className="size-4" />
            {user.emailId || "-"}
          </div>

          <div className="flex items-center gap-2 text-[var(--hz-text-2)]">
            <Phone className="size-4" />
            {user.mobileNumber || "-"}
          </div>

          <div className="flex items-center gap-2 text-[var(--hz-text-2)]">
            <MapPin className="size-4" />
            {user.address || "-"}
          </div>

          <div className="flex items-center gap-2 text-[var(--hz-text-2)]">
            <Calendar className="size-4" />
            Joined {formatDate(user.createdDate)}
          </div>
        </div>
      </div>

      {/* EXTRA DETAILS */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="hz-card p-4">
          <div className="hz-label">Gender</div>
          <div className="hz-heading mt-1">{user.gender || "-"}</div>
        </div>

        <div className="hz-card p-4">
          <div className="hz-label">Guardian</div>
          <div className="hz-heading mt-1">
            {user.guardianName || "-"}
          </div>
          <div className="text-xs text-[var(--hz-text-2)]">
            {user.guardianRelation || ""}
          </div>
        </div>

        <div className="hz-card p-4">
          <div className="hz-label">Status</div>
          <div className="mt-2">
            <span className="hz-badge hz-badge--active">
              {user.userStatus || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* MORE INFO */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="hz-card p-4">
          <div className="hz-label">DOB</div>
          <div className="hz-heading mt-1">
            {user.dateOfBirth
              ? formatDate(user.dateOfBirth)
              : "-"}
          </div>
        </div>

        <div className="hz-card p-4">
          <div className="hz-label">WhatsApp</div>
          <div className="hz-heading mt-1">
            {user.whatsAppNumber || "-"}
          </div>
        </div>

        <div className="hz-card p-4">
          <div className="hz-label">Created By Admin</div>
          <div className="hz-heading mt-1">
            {user.isRegisteredByAdmin ? "Yes" : "No"}
          </div>
        </div>
      </div>

      {/* VERIFICATION */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="hz-card p-4">
          <div className="hz-label">Mobile Verified</div>
          <div className="hz-heading mt-1">
            {user.isMobileVerified ? "Yes" : "No"}
          </div>
        </div>

        <div className="hz-card p-4">
          <div className="hz-label">Email Verified</div>
          <div className="hz-heading mt-1">
            {user.isEmailVerified ? "Yes" : "No"}
          </div>
        </div>
      </div>

      {/* EMPTY BOOKING SECTION (SAFE) */}
      <div className="mt-6">
        <div className="hz-label mb-3">Purchased packages</div>
        <div className="text-sm text-[var(--hz-text-2)] italic">
          No purchases yet.
        </div>
      </div>
    </HzModal>
  );
}