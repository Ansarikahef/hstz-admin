import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save, ArrowLeft, Plus, Trash2, ImagePlus, X, IndianRupee, Calendar, GripVertical, MapPin,
} from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import HzInput from "@/components/shared/HzInput";
import { db, formatCurrency } from "@/lib/mockData";
import { toast } from "sonner";

function MultiPicker({ label, options, selected, onChange, testid }) {
  return (
    <div>
      <label className="hz-label block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o.id);
          return (
            <button
              type="button"
              key={o.id}
              data-testid={`${testid}-${o.id}`}
              onClick={() =>
                active ? onChange(selected.filter((s) => s !== o.id)) : onChange([...selected, o.id])
              }
              className={`px-3.5 h-9 rounded-full text-xs font-medium transition border ${
                active
                  ? "bg-[var(--hz-sidebar)] text-white border-[var(--hz-sidebar)]"
                  : "bg-white text-[var(--hz-text-2)] border-[var(--hz-border)] hover:bg-[var(--hz-hover)]"
              }`}
            >
              {o.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [state] = useState(() => db.load());
  const existing = isEdit ? state.packages.find((p) => p.id === id) : null;

  const [form, setForm] = useState(() => existing ? { ...existing, durations: [...existing.durations], itinerary: [...existing.itinerary], images: [...(existing.images || [])] } : {
    name: "",
    description: "",
    categories: [],
    destinations: [],
    durations: [{ days: 5, price: 50000, emiPerMonth: 4500 }],
    itinerary: [{ day: 1, title: "", destination: "", description: "" }],
    images: [],
    status: "active",
    emiSupported: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && !existing) navigate("/packages");
  }, [isEdit, existing, navigate]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (form.categories.length === 0) e.categories = "Pick at least one category.";
    if (form.destinations.length === 0) e.destinations = "Pick at least one destination.";
    if (form.durations.length === 0) e.durations = "Add at least one duration.";
    form.durations.forEach((d, i) => {
      if (!d.days || d.days < 1) e[`dur-${i}-days`] = "Days required.";
      if (!d.price || d.price < 1) e[`dur-${i}-price`] = "Price required.";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    const s = db.load();
    if (isEdit) {
      const idx = s.packages.findIndex((p) => p.id === id);
      s.packages[idx] = { ...s.packages[idx], ...form };
    } else {
      s.packages.unshift({ ...form, id: db.newId("pkg"), createdAt: new Date().toISOString() });
    }
    db.save(s);
    toast.success(isEdit ? "Package updated" : "Package created", {
      description: `${form.name} has been ${isEdit ? "saved" : "added"} to your catalog.`,
    });
    navigate("/packages");
  };

  // Itinerary
  const addItineraryDay = () => {
    setForm((f) => ({
      ...f,
      itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: "", destination: f.destinations[0] || "", description: "" }],
    }));
  };
  const updateItinerary = (i, k, v) => {
    setForm((f) => {
      const it = [...f.itinerary]; it[i] = { ...it[i], [k]: v }; return { ...f, itinerary: it };
    });
  };
  const removeItinerary = (i) => {
    setForm((f) => ({ ...f, itinerary: f.itinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })) }));
  };

  // Durations
  const addDuration = () => setForm((f) => ({ ...f, durations: [...f.durations, { days: 7, price: 0, emiPerMonth: 0 }] }));
  const updateDuration = (i, k, v) => {
    setForm((f) => { const d = [...f.durations]; d[i] = { ...d[i], [k]: Number(v) || 0 }; return { ...f, durations: d }; });
  };
  const removeDuration = (i) => setForm((f) => ({ ...f, durations: f.durations.filter((_, idx) => idx !== i) }));

  // Images
  const onImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    Promise.all(files.map((f) => new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(f);
    }))).then((urls) => setForm((f) => ({ ...f, images: [...f.images, ...urls] })));
  };
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  return (
    <div data-testid="package-form-page">
      <HzPageHeader
        kicker={isEdit ? "Edit package" : "New package"}
        title={isEdit ? form.name || "Edit package" : "Compose a new itinerary"}
        description="Define the story, destinations, durations and pricing. Build a day-wise plan and upload media."
        actions={
          <>
            <button className="hz-btn-ghost" onClick={() => navigate(-1)} data-testid="package-form-back">
              <ArrowLeft className="size-4" strokeWidth={1.5} /> Back
            </button>
            <button className="hz-btn-primary" onClick={save} data-testid="package-form-save">
              <Save className="size-4" strokeWidth={1.75} /> {isEdit ? "Save changes" : "Create package"}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="hz-card p-6">
            <h3 className="hz-heading text-xl mb-5">Basics</h3>
            <div className="space-y-5">
              <HzInput
                label="Package name"
                placeholder="e.g. Bali Bliss Escape"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
                testid="package-form-name"
              />
              <div>
                <label className="hz-label block mb-2">Description</label>
                <textarea
                  data-testid="package-form-description"
                  className={`hz-input !h-32 !pl-4 !py-3 resize-none ${errors.description ? "hz-input--error" : ""}`}
                  placeholder="What makes this itinerary unforgettable?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                {errors.description && <div className="hz-input-error-msg">{errors.description}</div>}
              </div>
              <MultiPicker label="Categories" options={state.categories} selected={form.categories} onChange={(v) => setForm({ ...form, categories: v })} testid="package-form-cat" />
              {errors.categories && <div className="hz-input-error-msg">{errors.categories}</div>}
              <MultiPicker label="Destinations" options={state.destinations} selected={form.destinations} onChange={(v) => setForm({ ...form, destinations: v })} testid="package-form-dest" />
              {errors.destinations && <div className="hz-input-error-msg">{errors.destinations}</div>}
            </div>
          </section>

          <section className="hz-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="hz-heading text-xl">Durations & pricing</h3>
              <button onClick={addDuration} className="hz-btn-ghost" data-testid="package-form-add-duration">
                <Plus className="size-4" strokeWidth={1.5} /> Add duration
              </button>
            </div>
            <div className="space-y-3">
              {form.durations.map((d, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-start" data-testid={`package-form-duration-${i}`}>
                  <div className="col-span-12 sm:col-span-3">
                    <HzInput icon={Calendar} label="Days" type="number" min="1" value={d.days} onChange={(e) => updateDuration(i, "days", e.target.value)} error={errors[`dur-${i}-days`]} testid={`package-form-duration-days-${i}`} />
                  </div>
                  <div className="col-span-6 sm:col-span-4">
                    <HzInput icon={IndianRupee} label="Price (INR)" type="number" min="0" value={d.price} onChange={(e) => updateDuration(i, "price", e.target.value)} error={errors[`dur-${i}-price`]} testid={`package-form-duration-price-${i}`} />
                  </div>
                  <div className="col-span-6 sm:col-span-4">
                    <HzInput icon={IndianRupee} label="EMI / month" type="number" min="0" value={d.emiPerMonth} onChange={(e) => updateDuration(i, "emiPerMonth", e.target.value)} testid={`package-form-duration-emi-${i}`} />
                  </div>
                  <div className="col-span-12 sm:col-span-1 flex sm:justify-end pt-7">
                    <button onClick={() => removeDuration(i)} className="hz-btn-ghost !h-10 !w-10 !p-0 justify-center text-[var(--hz-error)]" data-testid={`package-form-duration-remove-${i}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--hz-text-2)]">
              <input
                type="checkbox"
                data-testid="package-form-emi-supported"
                checked={form.emiSupported}
                onChange={(e) => setForm({ ...form, emiSupported: e.target.checked })}
                className="size-4 accent-[var(--hz-cta)]"
              />
              Enable EMI options for this package
            </label>
          </section>

          <section className="hz-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="hz-heading text-xl">Day-wise itinerary</h3>
              <button onClick={addItineraryDay} className="hz-btn-ghost" data-testid="package-form-add-day">
                <Plus className="size-4" strokeWidth={1.5} /> Add day
              </button>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-[var(--hz-border)]" />
              {form.itinerary.map((d, i) => (
                <div key={i} className="relative mb-5" data-testid={`package-form-itinerary-${i}`}>
                  <div className="absolute -left-[26px] top-2 size-7 rounded-full bg-[var(--hz-sidebar)] text-white text-[11px] font-semibold flex items-center justify-center hz-mono">
                    {d.day}
                  </div>
                  <div className="hz-card p-4">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 sm:col-span-7">
                        <HzInput label="Day title" placeholder="e.g. Tegalalang & Tirta Empul" value={d.title} onChange={(e) => updateItinerary(i, "title", e.target.value)} testid={`package-form-itinerary-title-${i}`} />
                      </div>
                      <div className="col-span-12 sm:col-span-5">
                        <label className="hz-label block mb-2">Destination</label>
                        <select
                          data-testid={`package-form-itinerary-dest-${i}`}
                          className="hz-input !pl-4"
                          value={d.destination}
                          onChange={(e) => updateItinerary(i, "destination", e.target.value)}
                        >
                          <option value="">Select destination</option>
                          {state.destinations.filter((x) => form.destinations.includes(x.id)).map((dst) => (
                            <option key={dst.id} value={dst.id}>{dst.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-12">
                        <label className="hz-label block mb-2">Notes</label>
                        <textarea
                          data-testid={`package-form-itinerary-desc-${i}`}
                          className="hz-input !h-20 !pl-4 !py-3 resize-none"
                          placeholder="What happens on this day?"
                          value={d.description}
                          onChange={(e) => updateItinerary(i, "description", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button onClick={() => removeItinerary(i)} className="text-xs text-[var(--hz-error)] hover:underline inline-flex items-center gap-1" data-testid={`package-form-itinerary-remove-${i}`}>
                        <Trash2 className="size-3.5" /> Remove day
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="hz-card p-6">
            <h3 className="hz-heading text-xl mb-4">Status</h3>
            <div className="flex flex-col gap-2">
              {[
                { v: "active", l: "Active", d: "Visible and bookable on the storefront." },
                { v: "inactive", l: "Inactive", d: "Hidden from public, drafts visible internally." },
                { v: "closed", l: "Closed", d: "Sold-out or paused; ledger preserved." },
              ].map((opt) => (
                <label key={opt.v} className={`p-3 rounded-lg border cursor-pointer transition ${form.status === opt.v ? "border-[var(--hz-cta)] bg-[var(--hz-cta)]/5" : "border-[var(--hz-border)] hover:bg-[var(--hz-hover)]"}`}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <input type="radio" name="status" checked={form.status === opt.v} onChange={() => setForm({ ...form, status: opt.v })} className="accent-[var(--hz-cta)]" data-testid={`package-form-status-${opt.v}`} />
                    {opt.l}
                  </div>
                  <div className="text-xs text-[var(--hz-text-2)] mt-1 ml-6">{opt.d}</div>
                </label>
              ))}
            </div>
          </section>

          <section className="hz-card p-6">
            <h3 className="hz-heading text-xl mb-4">Media</h3>
            <label className="block w-full border-2 border-dashed border-[var(--hz-border)] rounded-xl p-6 text-center cursor-pointer hover:bg-[var(--hz-hover)] transition" data-testid="package-form-upload-label">
              <ImagePlus className="size-8 mx-auto text-[var(--hz-text-2)]" strokeWidth={1.25} />
              <div className="mt-2 text-sm font-medium">Upload images</div>
              <div className="text-xs text-[var(--hz-text-2)] mt-0.5">PNG, JPG up to 5MB each</div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onImagesUpload} data-testid="package-form-upload" />
            </label>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {form.images.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group" data-testid={`package-form-image-${i}`}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 size-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition" data-testid={`package-form-image-remove-${i}`}>
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="hz-card p-6">
            <h3 className="hz-heading text-xl mb-2">Summary</h3>
            <div className="text-sm text-[var(--hz-text-2)]">
              <div className="flex justify-between py-1.5 border-b border-[var(--hz-border-soft)]"><span>Categories</span><span className="text-[var(--hz-text)]">{form.categories.length}</span></div>
              <div className="flex justify-between py-1.5 border-b border-[var(--hz-border-soft)]"><span>Destinations</span><span className="text-[var(--hz-text)]">{form.destinations.length}</span></div>
              <div className="flex justify-between py-1.5 border-b border-[var(--hz-border-soft)]"><span>Durations</span><span className="text-[var(--hz-text)]">{form.durations.length}</span></div>
              <div className="flex justify-between py-1.5"><span>Lowest price</span><span className="text-[var(--hz-text)] hz-mono">{formatCurrency(Math.min(...(form.durations.map((d) => d.price).length ? form.durations.map((d) => d.price) : [0])))}</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
