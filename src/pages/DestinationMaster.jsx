import { useState } from "react";
import { Plus, Edit2, Trash2, ImagePlus, MapPin } from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import HzInput from "@/components/shared/HzInput";
import HzModal from "@/components/modals/HzModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { db } from "@/lib/mockData";
import { toast } from "sonner";
import Helper from "@/Utils/Helper";
import apiService from "@/Utils/ApiService";
import { useQuery } from "@tanstack/react-query";

export default function DestinationMaster() {
  const [state, setState] = useState(() => db.load());
  const [open, setOpen] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", country: "", description: "", image: "" });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const openNew = () => { setEditing(null); setForm({ name: "", country: "", description: "", image: "" }); setErrors({}); setOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, country: d.country, description: d.description, image: d.image }); setErrors({}); setOpen(true); };
  const loggedInUser = Helper.getLoginUserDetails();
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Destination name required.";
    if (!form.country.trim()) e.country = "Country required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const save = async () => {
    if (!validate()) return;
    // const s = db.load();
    // if (editing) {
    //   const idx = s.destinations.findIndex((d) => d.id === editing.id);
    //   s.destinations[idx] = { ...editing, ...form };
    //   toast.success("Destination updated");
    // } else {
    //   s.destinations.unshift({ id: db.newId("dst"), ...form, image: form.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?crop=entropy&cs=srgb&fm=jpg&w=800&q=85" });
    //   toast.success("Destination added");
    // }
    // db.save(s);
    // setState({ ...s });
    // setOpen(false);
        setIsBtnLoading(true);
        const formData = new FormData();

        formData.append("destinationName", form.name);
        formData.append("country", form.country);
        formData.append("destinationDesc", form.description);
        formData.append("userId", loggedInUser.id ?? 0);
        
        // image file
        if (form.image) {
          formData.append("CoverImage", form.image);
        }
        try{
          const {status ,message} = await apiService.postMedia("admin/createDestination", formData);
          if(status === 1){
            setOpen(false);
            toast.success(message || "Destination saved");
          }
          else{
            toast.error(message || "Failed to save destination");
          }
        }
        catch(err){
          console.error("Error saving destination", err);
          toast.error("Failed to save destination");
        }
        finally{
          setIsBtnLoading(false);
        }
  };
  const remove = () => {
    const s = db.load();
    s.destinations = s.destinations.filter((d) => d.id !== confirm.id);
    db.save(s);
    setState({ ...s });
    setConfirm({ open: false, id: null });
    toast.success("Destination removed");
  };
  const onImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setForm((f) => ({
      ...f,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };
  const getDestinationList = async () => {
      const { status, message, responseValue } =
        await apiService.get("admin/GetDestinationList");
  
      if (status === 1) {
        return responseValue || [];
      } else {
        throw new Error(message || "Failed to fetch destination list");
      }
  };
  // React Query
    const { data: destination = [], isLoading } = useQuery({
      queryKey: ["destinations"], 
      queryFn: getDestinationList,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false
    });
    console.log("Destinations from API", destination);
  return (
    <div data-testid="destination-master-page">
      <HzPageHeader
        kicker="Master · Destinations"
        title="Destinations"
        description="The places you take travellers — from misty hill towns to caldera coasts."
        actions={
          <button className="hz-btn-primary" onClick={openNew} data-testid="destination-new">
            <Plus className="size-4" strokeWidth={1.75} /> New destination
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {destination.length > 0 && destination.map((d,i) => {
          return (
            <div key={i+1} className="hz-card overflow-hidden flex flex-col" data-testid={`destination-card-${i+1}`}>
              <div className="relative h-40 bg-[var(--hz-hover)]">
                {d.coverImage ? <img src={d.coverImage} alt={d.country} className="w-full h-full object-cover" />
                : <img src='https://placehold.co/1200x800/png?text=No+Image+Available' alt='No Destination Found' className="w-full h-full object-cover" />
                }
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur rounded-full px-2.5 py-1 text-[11px] font-medium inline-flex items-center gap-1.5"><MapPin className="size-3" />{d.country}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="hz-heading text-lg font-medium">{d.destinationName}</div>
                <p className="text-sm text-[var(--hz-text-2)] mt-1 line-clamp-2">{d.description}</p>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  {/* <div className="hz-label">{usage} package{usage !== 1 ? "s" : ""}</div> */}
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" data-testid={`destination-edit-${d.id}`}><Edit2 className="size-4" /></button>
                    <button onClick={() => setConfirm({ open: true, id: d.id })} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center text-[var(--hz-error)]" data-testid={`destination-delete-${d.id}`}><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <HzModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit destination" : "New destination"}
        description="Add a place — and a few words on why travellers should fall in love with it."
        testid="destination-modal"
        footer={
          <>
            <button className="hz-btn-ghost" onClick={() => setOpen(false)} data-testid="destination-modal-cancel">Cancel</button>
            <button className="hz-btn-primary" onClick={save} data-testid="destination-modal-save" disabled={isBtnLoading}>
              {isBtnLoading ? 'Saving...': 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <HzInput label="Name" placeholder="e.g. Tuscany" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} testid="destination-name" />
          <HzInput label="Country" placeholder="e.g. Italy" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} error={errors.country} testid="destination-country" />
          <div className="col-span-2">
            <label className="hz-label block mb-2">Description</label>
            <textarea
              className="hz-input !h-24 !pl-4 !py-3 resize-none"
              data-testid="destination-description"
              placeholder="A line or two of evocative copy…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="hz-label block mb-2">Cover image</label>
            <div className="flex items-center gap-4">
              <div className="size-24 rounded-xl bg-[var(--hz-hover)] overflow-hidden flex items-center justify-center">
                {form.image ? <img src={form.preview} alt="" className="w-full h-full object-cover" /> : <ImagePlus className="size-6 text-[var(--hz-text-2)]" />}
              </div>
              <label className="hz-btn-ghost cursor-pointer">
                <ImagePlus className="size-4" /> Upload image
                <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} data-testid="destination-image-upload" />
              </label>
            </div>
          </div>
        </div>
      </HzModal>

      <ConfirmModal open={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={remove} title="Delete destination?" description="Packages already using this destination will keep their data." confirmLabel="Delete" tone="danger" testid="destination-delete" />
    </div>
  );
}
