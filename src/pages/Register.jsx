import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Lock, MapPin, ArrowLeft, ArrowRight, Compass,
  MessageCircle, Calendar, ShieldCheck, KeyRound, UserCog, Users as UsersIcon,
} from "lucide-react";
import HzInput from "@/components/shared/HzInput";
import { db } from "@/lib/mockData";
import { toast } from "sonner";
import apiService from "../Utils/ApiService";
import HzPageHeader from "@/components/shared/HzPageHeader";

const GENDERS = ["Male", "Female","Other","Prefer not to say"];
const RELATIONS = ["Father", "Mother", "Spouse", "Sibling", "Child", "Guardian", "Other"];

function Section({ kicker, title, description, children }) {
  return (
    <section className="hz-card p-6 sm:p-7">
      <div className="hz-label">{kicker}</div>
      <h2 className="hz-heading text-xl sm:text-2xl font-medium mt-1">{title}</h2>
      {description && <p className="text-sm text-[var(--hz-text-2)] mt-1.5 max-w-xl">{description}</p>}
      <div className="mt-6 grid sm:grid-cols-2 gap-5">{children}</div>
    </section>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    guardianName: "",
    guardianRelation: "Father",
    gender: "Male",
    dateOfBirth: "",
    mobileNumber: "",
    whatsAppNumber: "",
    sameWhatsApp: true,
    emailId: "",
    address: "",
    password: "",
    confirmPassword: "",
    mpin: "",
    confirmMpin: "",
    isRegisteredByAdmin: false,
    adminRemarks: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (k) => (e) => {
    const v = e.target ? e.target.value : e;
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "mobileNumber" && f.sameWhatsApp) next.whatsAppNumber = v;
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.gender) e.gender = "Pick a gender.";
    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required.";
    else if (new Date(form.dateOfBirth) > new Date()) e.dateOfBirth = "DOB cannot be in the future.";
    if (form.guardianName && !form.guardianRelation) e.guardianRelation = "Pick relation.";
    if (!form.mobileNumber.trim()) e.mobileNumber = "Mobile is required.";
    else if (form.mobileNumber.replace(/\D/g, "").length < 8) e.mobileNumber = "Mobile looks too short.";
    if (form.whatsAppNumber && form.whatsAppNumber.replace(/\D/g, "").length < 8) e.whatsAppNumber = "WhatsApp looks too short.";
    if (!form.emailId.trim()) e.emailId = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.emailId)) e.emailId = "Enter a valid email.";
    if (!form.address.trim()) e.address = "Address is required.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "At least 6 characters.";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match.";
    if (!form.mpin.trim()) e.mpin = "MPIN is required.";
    else if (!/^\d{4,6}$/.test(form.mpin)) e.mpin = "MPIN must be 4–6 digits.";
    if (form.confirmMpin !== form.mpin) e.confirmMpin = "MPIN does not match.";
    if (form.isRegisteredByAdmin && !form.adminRemarks.trim()) e.adminRemarks = "Add a short admin note.";
    if (!form.terms) e.terms = "Please accept the terms to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      guardianName: "",
      guardianRelation: "Father",
      gender: "Male",
      dateOfBirth: "",
      mobileNumber: "",
      whatsAppNumber: "",
      sameWhatsApp: true,
      emailId: "",
      address: "",
      password: "",
      confirmPassword: "",
      mpin: "",
      confirmMpin: "",
      isRegisteredByAdmin: false,
      adminRemarks: "",
      terms: false,
    })
  }
  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const passwordHash = (typeof window !== "undefined" && window.btoa) ? window.btoa(form.password) : form.password;
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      guardianName: form.guardianName || "",
      guardianRelation: form.guardianName ? form.guardianRelation : "",
      gender: form.gender,
      dateOfBirth: form.dateOfBirth, 
      mobileNumber: form.mobileNumber,
      whatsAppNumber: form.whatsAppNumber || form.mobileNumber,
      emailId: form.emailId,
      address: form.address,
      passwordHash: passwordHash,
      mpin: form.mpin,
      // ✅ Required flags
      isMobileVerified: true,
      isEmailVerified: true,
      // ✅ Admin fields
      createdByAdmin: true,
      remark:form.adminRemarks || "Registered by admin via web portal.",
      adminUserId: 1 
    };
    console.log("Submitting payload:", payload);
    try{
      const { status, message, responseValue } = await apiService.post("admin/CreateUserAccount", payload);
      if (status) {
        toast.success("Account created successfully!");
        resetForm();
      } else {
        toast.error(message || "Failed to create profile. Please try again.");
      }
    }
    catch(error){
      console.error("Error during registration:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
    finally{
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="user-list-page">
      <HzPageHeader
        kicker="New User · Registration"
        title="Register a users"
        description="HZ Travel Zone."
        actions={
          <>
            <Link to="/users" className="hz-btn-ghost" data-testid="register-back-to-login">
            <ArrowLeft className="size-4" strokeWidth={1.5} /> Back 
          </Link>
          </>
        }
      />
      <form onSubmit={onSubmit} className="space-y-5" noValidate data-testid="register-form">
          <Section kicker="Identity" title="Personal details" description="Used for travel documents and traveller listings.">
            <HzInput label="First name" icon={User} placeholder="Aria" value={form.firstName} onChange={setField("firstName")} error={errors.firstName} testid="register-firstname" />
            <HzInput label="Last name" icon={User} placeholder="Mendez" value={form.lastName} onChange={setField("lastName")} error={errors.lastName} testid="register-lastname" />
            <div>
              <label className="hz-label block mb-2">Gender</label>
              <select className={`hz-input !pl-4 ${errors.gender ? "hz-input--error" : ""}`} data-testid="register-gender" value={form.gender} onChange={setField("gender")}>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
              {errors.gender && <div className="hz-input-error-msg">{errors.gender}</div>}
            </div>
            <HzInput label="Date of birth" icon={Calendar} type="date" value={form.dateOfBirth} onChange={setField("dateOfBirth")} error={errors.dateOfBirth} testid="register-dob" />
          </Section>

          <Section kicker="Guardian" title="Guardian details" description="Optional — useful for minors or for emergency reference.">
            <HzInput label="Guardian name" icon={UsersIcon} placeholder="Optional" value={form.guardianName} onChange={setField("guardianName")} testid="register-guardian-name" />
            <div>
              <label className="hz-label block mb-2">Relation</label>
              <select className={`hz-input !pl-4 ${errors.guardianRelation ? "hz-input--error" : ""}`} data-testid="register-guardian-relation" value={form.guardianRelation} onChange={setField("guardianRelation")}>
                {RELATIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              {errors.guardianRelation && <div className="hz-input-error-msg">{errors.guardianRelation}</div>}
            </div>
          </Section>

          <Section kicker="Contact" title="How can we reach them?" description="Mobile and email are required for booking confirmations.">
            <HzInput label="Mobile number" icon={Phone} placeholder="+91 98765 43210" value={form.mobileNumber} onChange={setField("mobileNumber")} error={errors.mobileNumber} testid="register-mobile" />
            <div>
              <HzInput label="WhatsApp number" icon={MessageCircle} placeholder="+91 98765 43210" value={form.whatsAppNumber} onChange={setField("whatsAppNumber")} error={errors.whatsAppNumber} testid="register-whatsapp" disabled={form.sameWhatsApp} />
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--hz-text-2)] cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="register-same-whatsapp"
                  checked={form.sameWhatsApp}
                  onChange={(e) => setForm((f) => ({ ...f, sameWhatsApp: e.target.checked, whatsAppNumber: e.target.checked ? f.mobileNumber : f.whatsAppNumber }))}
                  className="size-3.5 accent-[var(--hz-cta)]"
                />
                Same as mobile
              </label>
            </div>
            <HzInput label="Email" icon={Mail} type="email" placeholder="you@email.com" value={form.emailId} onChange={setField("emailId")} error={errors.emailId} testid="register-email" />
            <div className="sm:col-span-2">
              <HzInput label="Address" icon={MapPin} placeholder="Street, City, Country" value={form.address} onChange={setField("address")} error={errors.address} testid="register-address" />
            </div>
          </Section>

          <Section kicker="Security" title="Password & MPIN" description="Set a password for the web portal and a 4–6 digit MPIN for the mobile app.">
            <HzInput label="Password" icon={Lock} type="password" placeholder="••••••••" value={form.password} onChange={setField("password")} error={errors.password} testid="register-password" />
            <HzInput label="Confirm password" icon={Lock} type="password" placeholder="••••••••" value={form.confirmPassword} onChange={setField("confirmPassword")} error={errors.confirmPassword} testid="register-confirm-password" />
            <HzInput label="MPIN (4–6 digits)" icon={KeyRound} type="password" inputMode="numeric" maxLength={6} placeholder="••••" value={form.mpin} onChange={setField("mpin")} error={errors.mpin} testid="register-mpin" />
            <HzInput label="Confirm MPIN" icon={KeyRound} type="password" inputMode="numeric" maxLength={6} placeholder="••••" value={form.confirmMpin} onChange={setField("confirmMpin")} error={errors.confirmMpin} testid="register-confirm-mpin" />
          </Section>

          <Section kicker="Admin meta" title="Operator-handled registration" description="Toggle on if this account is being created on behalf of a walk-in or partner-desk traveller.">
            <label className="sm:col-span-2 flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--hz-hover)]">
              <input
                type="checkbox"
                data-testid="register-by-admin"
                checked={true}
                onChange={(e) => setForm({ ...form, isRegisteredByAdmin: e.target.checked })}
                className="mt-1 size-4 accent-[var(--hz-cta)]"
                disabled
              />
              <div>
                <div className="text-sm font-medium inline-flex items-center gap-2"><UserCog className="size-4 text-[var(--hz-cta)]" /> Registered by admin</div>
                <div className="text-xs text-[var(--hz-text-2)] mt-0.5">Marks the profile internally and requires a short note for audit trail.</div>
              </div>
            </label>
              <div className="sm:col-span-2">
                <label className="hz-label block mb-2">Admin remarks</label>
                <textarea
                  className={`hz-input !h-24 !pl-4 !py-3 resize-none ${errors.adminRemarks ? "hz-input--error" : ""}`}
                  data-testid="register-admin-remarks"
                  placeholder="e.g. Walk-in at Lucknow partner desk, agent: Your name."
                  value={form.adminRemarks}
                  onChange={setField("adminRemarks")}
                />
                {errors.adminRemarks && <div className="hz-input-error-msg">{errors.adminRemarks}</div>}
              </div>
           
          </Section>

          <div className="hz-card p-5 sm:p-6">
            <label className="flex items-start gap-3 cursor-pointer text-sm text-[var(--hz-text-2)]">
              <input
                type="checkbox"
                data-testid="register-terms"
                checked={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                className="mt-1 size-4 rounded accent-[var(--hz-cta)]"
              />
              <span>
                I confirm the traveller has agreed to the HZ Travel Zone <a className="text-[var(--hz-cta)] hover:underline" href="#">Terms of Service</a> and <a className="text-[var(--hz-cta)] hover:underline" href="#">Privacy Policy</a>.
              </span>
            </label>
            {errors.terms && <div className="hz-input-error-msg" data-testid="register-terms-error">{errors.terms}</div>}
            <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-[var(--hz-border-soft)]">
              <button type="button" className="hz-btn-ghost" onClick={() => navigate(-1)} data-testid="register-cancel">
                Cancel
              </button>
              <button type="submit" className="hz-btn-primary" disabled={submitting} data-testid="register-submit">
                {submitting ? "Saving…" : (
                  <>
                    <ShieldCheck className="size-4" strokeWidth={1.75} /> Create profile
                    <ArrowRight className="size-4" strokeWidth={1.75} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
    </div>
  );
}
