import { useState } from "react";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import HzInput from "@/components/shared/HzInput";
import HzModal from "@/components/modals/HzModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { db } from "@/lib/mockData";
import { toast } from "sonner";
import Helper from "@/Utils/Helper";
import apiService from "@/Utils/ApiService";
import { useQuery } from "@tanstack/react-query";

export default function CategoryMaster() {
  const [state, setState] = useState(() => db.load());
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#D9734E" });
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const loggedInUser = Helper.getLoginUserDetails();
  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", color: "#D9734E" });
    setErrors({});
    setOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || "", color: c.color });
    setErrors({});
    setOpen(true);
  };
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const save = async() => {
    if (!validate()) return;
    // const s = db.load();
    // if (editing) {
    //   const idx = s.categories.findIndex((c) => c.id === editing.id);
    //   s.categories[idx] = { ...editing, ...form };
    //   toast.success("Category updated");
    // } else {
    //   s.categories.unshift({ id: db.newId("cat"), ...form });
    //   toast.success("Category added");
    // }
    // db.save(s);
    // setState({ ...s });
    // setOpen(false);
    console.log("logg", loggedInUser);
    const payload = {
      categoryName: form.name,
      categoryDesc: form.description,
      accentColor: form.color,
      userId: loggedInUser.id ?? 0
    }
    console.log("Payload for API", payload);
    try{
      const {status ,message} = await apiService.post("admin/createCategory", payload);
      if(status === 1){
        setOpen(false);
        toast.success(message || "Category saved");
      }
      else{
        toast.error(message || "Failed to save category");
      }
    }
    catch(err){
      console.error("Error saving category", err);
      toast.error("Failed to save category");
    }
    finally{
      setIsLoading(false);
    }
  };
  const remove = () => {
    const s = db.load();
    s.categories = s.categories.filter((c) => c.id !== confirm.id);
    db.save(s);
    setState({ ...s });
    setConfirm({ open: false, id: null });
    toast.success("Category removed");
  };
  const getCategoryList = async () => {
    const { status, message, responseValue } =
      await apiService.get("admin/GetCategoryList");

    if (status === 1) {
      return responseValue || [];
    } else {
      throw new Error(message || "Failed to fetch category list");
    }
  };
  // React Query
  const { data: categories = [], isLoading :isCategoryApiLoading } = useQuery({
    queryKey: ["categories"], 
    queryFn: getCategoryList,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  console.log("Fetched categories:", categories);
  return (
    <div data-testid="category-master-page">
      <HzPageHeader
        kicker="Master · Categories"
        title="Travel categories"
        description="Group packages by experience type — honeymoon, adventure, cultural and more."
        actions={
          <button className="hz-btn-primary" onClick={openNew} data-testid="category-new">
            <Plus className="size-4" strokeWidth={1.75} /> New category
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length > 0 && categories.map((c) => {
          return (
            <div key={c.categoryId} className="hz-card p-5 flex items-start gap-4" data-testid={`category-card-${c.categoryId}`}>
              <div className="size-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.accentColor}1a`, color: c.accentColor }}>
                <Tag className="size-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="hz-heading text-lg font-medium">{c.categoryName}</div>
                <div className="text-sm text-[var(--hz-text-2)] mt-1 line-clamp-2">{c.description || "No description."}</div>
                {/* <div className="hz-label mt-3">{usage} package{usage !== 1 ? "s" : ""}</div> */}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(c)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" data-testid={`category-edit-${c.id}`}><Edit2 className="size-4" /></button>
                <button onClick={() => setConfirm({ open: true, id: c.id })} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center text-[var(--hz-error)]" data-testid={`category-delete-${c.id}`}><Trash2 className="size-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      <HzModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit category" : "New category"}
        description="Categories help travellers find the right experience faster."
        testid="category-modal"
        footer={
          <>
            <button className="hz-btn-ghost" onClick={() => setOpen(false)} data-testid="category-modal-cancel">Cancel</button>
            <button className="hz-btn-primary" onClick={save} data-testid="category-modal-save" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <HzInput label="Name" placeholder="e.g. Wellness" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} testid="category-name" />
          <div>
            <label className="hz-label block mb-2">Description</label>
            <textarea
              className="hz-input !h-24 !pl-4 !py-3 resize-none"
              data-testid="category-description"
              placeholder="What does this category include?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="hz-label block mb-2">Accent color</label>
            <input type="color" className="size-10 rounded-lg border border-[var(--hz-border)] cursor-pointer" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} data-testid="category-color" />
          </div>
        </div>
      </HzModal>

      <ConfirmModal open={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={remove} title="Delete category?" description="Existing packages will keep their current categorisation." confirmLabel="Delete" tone="danger" testid="category-delete" />
    </div>
  );
}
