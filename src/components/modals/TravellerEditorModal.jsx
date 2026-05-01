import { useEffect, useState } from "react";
import HzModal from "./HzModal";
import HzInput from "@/components/shared/HzInput";
import { db } from "@/lib/mockData";
import {
  User, Mail, Phone, MessageCircle, MapPin, Calendar, BadgeCheck,
  ShieldAlert, Heart, FileText, Save, UserPlus,
} from "lucide-react";

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
const RELATIONS = ["Self", "Spouse", "Father", "Mother", "Sibling", "Child", "Friend", "Other"];
const MARITAL = ["Single", "Married", "Divorced", "Widowed", "Other"];

const empty = {
  firstName: "", lastName: "", guardianName: "", guardianRelation: "Father",
  gender: "Female", maritalStatus: "Single", dateOfBirth: "", nationality: "",
  mobileNumber: "", whatsAppNumber: "", emailId: "", address: "",
  passportNumber: "", passportIssueDate: "", passportExpiryDate: "", passportIssuePlace: "",
  aadhaarNumber: "", panNumber: "",
  emergencyContactName: "", emergencyContactNumber: "", emergencyRelation: "",
  nomineeName: "", nomineeDateOfBirth: "", nomineeRelation: "",
  remarks: "", relation: "Self",
  isAddedByAdmin: true, adminRemarks: "",
  documents: [],
};

function Section({ title, icon: Icon, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="size-4 text-[var(--hz-cta)]" strokeWidth={1.5} />}
        <h4 className="hz-label">{title}</h4>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </section>
  );
}

export default function TravellerEditorModal({ open, onClose, bookingId, traveller, onSaved }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(traveller ? { ...empty, ...traveller } : { ...empty });
      setErrors({});
    }
  }, [open, traveller]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.gender) e.gender = "Gender is required.";
    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required.";
    if (!form.mobileNumber.trim()) e.mobileNumber = "Mobile is required.";
    if (form.emailId && !/^\S+@\S+\.\S+$/.test(form.emailId)) e.emailId = "Invalid email.";
    if (!form.passportNumber.trim()) e.passportNumber = "Passport number is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const s = db.load();
    const booking = s.bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    booking.travellers = booking.travellers || [];
    if (traveller) {
      const idx = booking.travellers.findIndex((t) => t.id === traveller.id);
      if (idx >= 0) booking.travellers[idx] = { ...booking.travellers[idx], ...form };
    } else {
      booking.travellers.push({
        ...form,
        id: db.newId("tr"),
        documents: form.documents || [],
      });
    }
    db.save(s);
    onSaved?.();
    onClose();
  };

  return (
    <HzModal
      open={open}
      onClose={onClose}
      title={traveller ? `Edit traveller — ${form.firstName || traveller.firstName || traveller.name}` : "Add traveller to booking"}
      description={traveller ? "Update the traveller record. Changes are preserved in the audit trail." : "Capture identity, contact, document and emergency information for this traveller."}
      size="2xl"
      accent="cta"
      icon={traveller ? <User className="size-5" strokeWidth={1.5} /> : <UserPlus className="size-5" strokeWidth={1.5} />}
      testid="traveller-editor-modal"
      footer={
        <>
          <button className="hz-btn-ghost" onClick={onClose} data-testid="traveller-editor-cancel">Cancel</button>
          <button className="hz-btn-primary" onClick={save} data-testid="traveller-editor-save">
            <Save className="size-4" strokeWidth={1.75} /> {traveller ? "Save changes" : "Add traveller"}
          </button>
        </>
      }
    >
      <div className="space-y-7">
        <Section title="Identity" icon={User}>
          <HzInput label="First name" icon={User} value={form.firstName} onChange={set("firstName")} error={errors.firstName} testid="te-firstname" />
          <HzInput label="Last name" icon={User} value={form.lastName} onChange={set("lastName")} error={errors.lastName} testid="te-lastname" />
          <div>
            <label className="hz-label block mb-2">Gender</label>
            <select className={`hz-input !pl-4 ${errors.gender ? "hz-input--error" : ""}`} value={form.gender} onChange={set("gender")} data-testid="te-gender">
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
            {errors.gender && <div className="hz-input-error-msg">{errors.gender}</div>}
          </div>
          <div>
            <label className="hz-label block mb-2">Marital status</label>
            <select className="hz-input !pl-4" value={form.maritalStatus} onChange={set("maritalStatus")} data-testid="te-marital">
              {MARITAL.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <HzInput label="Date of birth" icon={Calendar} type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} error={errors.dateOfBirth} testid="te-dob" />
          <HzInput label="Nationality" icon={BadgeCheck} value={form.nationality} onChange={set("nationality")} placeholder="e.g. Indian" testid="te-nationality" />
          <HzInput label="Guardian name" icon={User} value={form.guardianName} onChange={set("guardianName")} placeholder="Optional" testid="te-guardian" />
          <div>
            <label className="hz-label block mb-2">Guardian relation</label>
            <select className="hz-input !pl-4" value={form.guardianRelation} onChange={set("guardianRelation")} data-testid="te-guardian-rel">
              {RELATIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="hz-label block mb-2">Relation to booker</label>
            <select className="hz-input !pl-4" value={form.relation} onChange={set("relation")} data-testid="te-relation">
              {RELATIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </Section>

        <Section title="Contact" icon={Phone}>
          <HzInput label="Mobile" icon={Phone} value={form.mobileNumber} onChange={set("mobileNumber")} error={errors.mobileNumber} testid="te-mobile" />
          <HzInput label="WhatsApp" icon={MessageCircle} value={form.whatsAppNumber} onChange={set("whatsAppNumber")} testid="te-whatsapp" />
          <HzInput label="Email" icon={Mail} type="email" value={form.emailId} onChange={set("emailId")} error={errors.emailId} testid="te-email" />
          <div className="sm:col-span-2 lg:col-span-3">
            <HzInput label="Address" icon={MapPin} value={form.address} onChange={set("address")} testid="te-address" />
          </div>
        </Section>

        <Section title="Identification & passport" icon={FileText}>
          <HzInput label="Passport number" value={form.passportNumber} onChange={set("passportNumber")} error={errors.passportNumber} testid="te-passport" />
          <HzInput label="Passport issue date" type="date" value={form.passportIssueDate} onChange={set("passportIssueDate")} testid="te-passport-issue" />
          <HzInput label="Passport expiry date" type="date" value={form.passportExpiryDate} onChange={set("passportExpiryDate")} testid="te-passport-expiry" />
          <HzInput label="Passport issue place" value={form.passportIssuePlace} onChange={set("passportIssuePlace")} testid="te-passport-place" />
          <HzInput label="Aadhaar number" value={form.aadhaarNumber} onChange={set("aadhaarNumber")} placeholder="Optional" testid="te-aadhaar" />
          <HzInput label="PAN number" value={form.panNumber} onChange={set("panNumber")} placeholder="Optional" testid="te-pan" />
        </Section>

        <Section title="Emergency contact" icon={ShieldAlert}>
          <HzInput label="Name" value={form.emergencyContactName} onChange={set("emergencyContactName")} testid="te-emerg-name" />
          <HzInput label="Number" icon={Phone} value={form.emergencyContactNumber} onChange={set("emergencyContactNumber")} testid="te-emerg-number" />
          <div>
            <label className="hz-label block mb-2">Relation</label>
            <select className="hz-input !pl-4" value={form.emergencyRelation} onChange={set("emergencyRelation")} data-testid="te-emerg-rel">
              <option value="">Select</option>
              {RELATIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </Section>

        <Section title="Nominee" icon={Heart}>
          <HzInput label="Nominee name" value={form.nomineeName} onChange={set("nomineeName")} testid="te-nominee" />
          <HzInput label="Nominee DOB" type="date" value={form.nomineeDateOfBirth} onChange={set("nomineeDateOfBirth")} testid="te-nominee-dob" />
          <div>
            <label className="hz-label block mb-2">Nominee relation</label>
            <select className="hz-input !pl-4" value={form.nomineeRelation} onChange={set("nomineeRelation")} data-testid="te-nominee-rel">
              <option value="">Select</option>
              {RELATIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </Section>

        <div>
          <label className="hz-label block mb-2">Remarks</label>
          <textarea className="hz-input !h-20 !pl-4 !py-3 resize-none" value={form.remarks} onChange={set("remarks")} placeholder="Dietary, accessibility, or seating notes" data-testid="te-remarks" />
        </div>

        <div className="hz-card p-4 sm:p-5 bg-[var(--hz-warning-bg)] border-[#E5DCC4]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAddedByAdmin}
              onChange={(e) => setForm({ ...form, isAddedByAdmin: e.target.checked })}
              className="mt-1 size-4 accent-[var(--hz-cta)]"
              data-testid="te-by-admin"
            />
            <div>
              <div className="text-sm font-medium">Added by admin</div>
              <div className="text-xs text-[#8A6024] mt-0.5">Tags this record internally for audit purposes.</div>
            </div>
          </label>
          {form.isAddedByAdmin && (
            <div className="mt-3">
              <label className="hz-label block mb-2">Admin remarks</label>
              <textarea
                className="hz-input !h-20 !pl-4 !py-3 resize-none"
                value={form.adminRemarks}
                onChange={set("adminRemarks")}
                placeholder="e.g. Walk-in at Mumbai partner desk, agent: Riya P."
                data-testid="te-admin-remarks"
              />
            </div>
          )}
        </div>
      </div>
    </HzModal>
  );
}
