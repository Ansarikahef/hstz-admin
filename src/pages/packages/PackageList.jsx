import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Edit2, Trash2, Eye, Download, Calendar, MapPin, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import { db, formatCurrency } from "@/lib/mockData";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { toast } from "sonner";
import apiService from "@/Utils/ApiService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Helper from "@/Utils/Helper";
import Loader from "@/components/Loader/Loader";

const STATUS_LABEL = { active: "Active", inactive: "Inactive", closed: "Closed" };
const STATUS_CLASS = { active: "hz-badge--active", inactive: "hz-badge--inactive", closed: "hz-badge--closed" };

export default function PackageList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState(() => db.load());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [isShowBtnLoader, setIsShowBtnLoader] = useState(false);
  const loggedInUser = Helper.getLoginUserDetails();
  const pageSize = 6;
  
  const filtered = useMemo(() => {
    return state.packages.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.description.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [state.packages, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleStatus = (id) => {
    const s = db.load();
    const p = s.packages.find((x) => x.id === id);
    if (!p) return;
    p.status = p.status === "active" ? "inactive" : "active";
    db.save(s);
    setState({ ...s });
    toast.success(`Package ${p.status === "active" ? "activated" : "deactivated"}`);
  };

  const removePkg = async () => {
    setIsShowBtnLoader(true);
    const key = confirm.id;
    setConfirm({ open: false, id: null });
    try{
      const payload = {
        key:key,
        userId:loggedInUser?.id || 0,
      }
      const {status, message} = await apiService.post(`admin/DeletePackage`, payload);
      if(status !== 1){
        toast.error(message || "Failed to delete package");
        return;
      }
      toast.success(message || "Package removed", { description: "It will no longer appear in listings." });
      queryClient.invalidateQueries({
        queryKey: ["packages"],
      });
    }
    catch(error){
      toast.error(error.message || "An error occurred while deleting the package");
    }
    finally{
      setIsShowBtnLoader(false);
    }

    
  };

  const exportCsv = () => {
    const rows = [["ID", "Name", "Status", "Categories", "Destinations", "Min Price"]];
    state.packages.forEach((p) => {
      const minP = Math.min(...p.durations.map((d) => d.price));
      rows.push([p.id, p.name, p.status, p.categories.join("|"), p.destinations.join("|"), minP]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "hz-packages.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };
  const handleViewPackage = (pkg) => {
    Helper.storeToSession("selectedPackage", pkg);
    navigate(`/packages-details`);
  }
  const handleEditPackage = (pkg) => {
    Helper.storeToSession("editPackageData", pkg);
    navigate(`/edit-package`);
  }
  const getPackageList = async () => {
      const { status, message, responseValue } =
        await apiService.get("admin/PackageList");
  
      if (status === 1) {
        return responseValue || [];
      } else {
        throw new Error(message || "Failed to fetch destination list");
      }
  };
  // React Query
  const { data: packages = [],isLoading } = useQuery({
    queryKey: ["packages"], 
    queryFn: getPackageList,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  const packageList = useMemo(() => {
    return packages.map((item) => ({
      ...item,
      statusName: item.status === 1 ? "active" : item.status === 2 ? "inactive" : "closed",
  
      durationJson: item.durationJson
        ? JSON.parse(item.durationJson)
        : [],
  
      itineraryJson: item.itineraryJson
        ? JSON.parse(item.itineraryJson)
        : [],
  
      categories: item.categories
        ? JSON.parse(item.categories)
        : [],
  
      destinations: item.destinations
        ? JSON.parse(item.destinations)
        : [],
  
      images: item.images
        ? JSON.parse(item.images)
        : [],
    }));
  }, [packages]);
  return (
    <div data-testid="package-list-page">
      <HzPageHeader
        kicker="Catalog"
        title="Packages"
        description="Curate, price, and orchestrate every itinerary in your portfolio."
        actions={
          <>
            <button className="hz-btn-ghost" onClick={exportCsv} data-testid="packages-export-csv">
              <Download className="size-4" strokeWidth={1.5} /> Export CSV
            </button>
            <Link to="/packages/new" className="hz-btn-primary" data-testid="packages-new-button">
              <Plus className="size-4" strokeWidth={1.75} /> New package
            </Link>
          </>
        }
      />

      <div className="hz-card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3" data-testid="packages-filters">
        <div className="hz-input-wrap flex-1">
          <Search className="hz-input-icon size-4" strokeWidth={1.5} />
          <input
            data-testid="packages-search"
            className="hz-input"
            placeholder="Search packages by name or description"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-[var(--hz-text-2)]" strokeWidth={1.5} />
          {["all", "active", "inactive", "closed"].map((s) => (
            <button
              key={s}
              data-testid={`packages-filter-${s}`}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3.5 h-9 rounded-full text-xs font-medium transition ${
                status === s
                  ? "bg-[var(--hz-sidebar)] text-white"
                  : "bg-[var(--hz-hover)] text-[var(--hz-text-2)] hover:text-[var(--hz-text)]"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {packageList.length > 0 && packageList.map((p) => {
           const minPrice = Math.min(...p.durationJson.map((d) => d.price));
          {/*const cats = p.categories.map((c) => state.categories.find((x) => x.id === c)?.name).filter(Boolean);
          const dests = p.destinations.map((d) => state.destinations.find((x) => x.id === d)?.name).filter(Boolean); */}
          return (
            <div key={p.packageId} className="hz-card overflow-hidden flex flex-col" data-testid={`package-card-${p.packageId}`}>
              <div className="relative h-44 overflow-hidden bg-[var(--hz-hover)]">
                {p.images?.[0] && <img src={p.images[0].imagePath} alt={p.packageName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <div className="absolute top-3 left-3"><span className={`hz-badge ${STATUS_CLASS[p.statusName]}`}>{STATUS_LABEL[p.statusName]}</span></div>
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur rounded-lg px-2.5 py-1 text-[11px] hz-mono">{p.durationJson.length} durations</div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="hz-heading text-lg font-medium leading-tight">{p.packageName}</h3>
                <p className="text-[13px] text-[var(--hz-text-2)] mt-1.5 line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-[var(--hz-text-2)] flex-wrap">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" strokeWidth={1.5} /> {p.destinations?.map((d) => d.name).join(", ")}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1"><Layers className="size-3.5" strokeWidth={1.5} />{p.categories?.map((c) => c.name).join(", ")}</span>
                </div>
                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] tracking-[0.18em] uppercase text-[var(--hz-text-2)]">From</div>
                    <div className="hz-heading text-2xl font-medium hz-mono">{formatCurrency(minPrice)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* <button onClick={() => navigate(`/packages/${p.packageId}`)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" data-testid={`package-view-${p.packageId}`} title="View"><Eye className="size-4" strokeWidth={1.5} /></button> */}
                    <button onClick={() => handleViewPackage(p)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" data-testid={`package-view-${p.packageId}`} title="View"><Eye className="size-4" strokeWidth={1.5} /></button>
                    <button onClick={() => handleEditPackage(p)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" data-testid={`package-edit-${p.packageId}`} title="Edit"><Edit2 className="size-4" strokeWidth={1.5} /></button>
                    {/* <button onClick={() => toggleStatus(p.packageId)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" data-testid={`package-toggle-${p.packageId}`} title="Toggle status"><Calendar className="size-4" strokeWidth={1.5} /></button> */}
                    <button onClick={() => setConfirm({ open: true, id: p.packageId })} disabled={isShowBtnLoader} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center text-[var(--hz-error)]" data-testid={`package-delete-${p.packageId}`} title="Delete">
                      {isShowBtnLoader ? (
                          <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="size-4" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {packageList.length === 0 && (
          <div className="hz-card p-12 col-span-full text-center" data-testid="packages-empty">
            <div className="hz-heading text-lg mb-1">No packages match your filter</div>
            <div className="text-sm text-[var(--hz-text-2)]">Try clearing the search or change the status.</div>
          </div>
        )}
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between mt-6" data-testid="packages-pagination">
          <div className="text-sm text-[var(--hz-text-2)]">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</div>
          <div className="flex gap-1">
            <button className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="size-4" /></button>
            <button className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="size-4" /></button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={removePkg}
        title="Delete this package?"
        description="This will remove the package from listings. Bookings already made will keep their history."
        confirmLabel="Delete"
        tone="danger"
        testid="package-delete"
      />
      <Loader isLoading={isLoading} title="Please wait, loading packages..." />
    </div>
  );
}
