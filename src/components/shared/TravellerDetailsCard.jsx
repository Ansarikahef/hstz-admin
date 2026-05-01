import { useState } from "react";
import { User, FileText, Eye, ChevronDown } from "lucide-react";
import DocumentViewerModal from "@/components/modals/DocumentViewerModal";

function Field({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div data-testid={`traveller-field-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="hz-label !text-[10px]">{label}</div>
      <div className="text-sm text-[var(--hz-text)] mt-0.5 break-words">{value}</div>
    </div>
  );
}

export default function TravellerDetailsCard({ traveller, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [viewDoc, setViewDoc] = useState(null);
  const t = traveller;
  const fullName =
    t.firstName && t.lastName
      ? `${t.firstName} ${t.lastName}`
      : t.name || "Unnamed traveller";
  const summary = [
    t.relation || t.guardianRelation,
    t.gender,
    t.dateOfBirth ? `DOB ${t.dateOfBirth}` : t.age ? `Age ${t.age}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="hz-card p-5" data-testid={`traveller-details-${t.id}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 text-left"
        data-testid={`traveller-toggle-${t.id}`}
      >
        <div className="size-11 rounded-full bg-[var(--hz-hover)] flex items-center justify-center text-[var(--hz-text-2)] shrink-0">
          <User className="size-5" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="hz-heading text-base font-medium leading-tight">{fullName}</div>
          <div className="text-xs text-[var(--hz-text-2)] mt-0.5">{summary || "Traveller"}</div>
        </div>
        {t.isAddedByAdmin && (
          <span className="hz-badge hz-badge--inactive shrink-0">Added by Admin</span>
        )}
        <ChevronDown
          className={`size-4 text-[var(--hz-text-2)] transition-transform shrink-0 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          className="mt-4 pt-4 border-t border-[var(--hz-border-soft)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 hz-fade-up"
          data-testid={`traveller-details-body-${t.id}`}
        >
          <Field label="First name" value={t.firstName} />
          <Field label="Last name" value={t.lastName} />
          <Field label="Gender" value={t.gender} />
          <Field label="Marital status" value={t.maritalStatus} />
          <Field label="Date of birth" value={t.dateOfBirth} />
          <Field label="Nationality" value={t.nationality} />
          <Field
            label="Guardian"
            value={t.guardianName ? `${t.guardianName}${t.guardianRelation ? " (" + t.guardianRelation + ")" : ""}` : null}
          />
          <Field label="Mobile" value={t.mobileNumber} />
          <Field label="WhatsApp" value={t.whatsAppNumber} />
          <Field label="Email" value={t.emailId} />
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Address" value={t.address} />
          </div>
          <Field label="Passport no." value={t.passportNumber} />
          <Field label="Passport issued" value={t.passportIssueDate} />
          <Field label="Passport expires" value={t.passportExpiryDate} />
          <Field label="Issue place" value={t.passportIssuePlace} />
          <Field label="Aadhaar" value={t.aadhaarNumber} />
          <Field label="PAN" value={t.panNumber} />
          <Field
            label="Emergency contact"
            value={
              t.emergencyContactName
                ? `${t.emergencyContactName}${t.emergencyRelation ? " (" + t.emergencyRelation + ")" : ""}${t.emergencyContactNumber ? " · " + t.emergencyContactNumber : ""}`
                : null
            }
          />
          <Field
            label="Nominee"
            value={
              t.nomineeName
                ? `${t.nomineeName}${t.nomineeRelation ? " (" + t.nomineeRelation + ")" : ""}${t.nomineeDateOfBirth ? " · DOB " + t.nomineeDateOfBirth : ""}`
                : null
            }
          />
          {t.remarks && (
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Remarks" value={t.remarks} />
            </div>
          )}
          {t.isAddedByAdmin && t.adminRemarks && (
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Admin remarks" value={t.adminRemarks} />
            </div>
          )}
        </div>
      )}

      {(t.documents || []).length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--hz-border-soft)]">
          <div className="hz-label mb-3">Documents</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {t.documents.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--hz-hover)]"
                data-testid={`traveller-doc-item-${t.id}-${i}`}
              >
                <div className="size-9 rounded-lg bg-white flex items-center justify-center shrink-0 text-[var(--hz-text-2)]">
                  <FileText className="size-4" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{d.name}</div>
                  <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--hz-text-2)]">{d.type}</div>
                </div>
                <button
                  className="hz-btn-ghost !h-8 !px-3 text-xs"
                  onClick={() => setViewDoc(d)}
                  data-testid={`traveller-doc-view-${t.id}-${i}`}
                >
                  <Eye className="size-3.5" strokeWidth={1.5} /> View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <DocumentViewerModal doc={viewDoc} onClose={() => setViewDoc(null)} travellerName={fullName} />
    </div>
  );
}
