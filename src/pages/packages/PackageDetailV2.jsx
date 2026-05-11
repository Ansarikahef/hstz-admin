import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit2, Calendar, MapPin, Layers, IndianRupee, XCircle } from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import { db, formatCurrency, formatDate } from "@/lib/mockData";
import ClosePackageModal from "@/components/modals/ClosePackageModal";
import { toast } from "sonner";
import Helper from "@/Utils/Helper";

export default function PackageDetailV2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(() => db.load());
  const pkg = Helper.retrieveFromSession("selectedPackage") ?? null;
  const [closeOpen, setCloseOpen] = useState(false);

  if (!pkg) {
    return (
      <div className="hz-card p-12 text-center">
        <h2 className="hz-heading text-xl">Package not found</h2>
        <Link to="/packages" className="hz-btn-primary mt-4 inline-flex">Back to packages</Link>
      </div>
    );
  }
  console.log("PackageDetailV2 pkg:", pkg);
  
  // const cats = pkg.categories.map((c) => state.categories.find((x) => x.id === c)).filter(Boolean);
  // const dests = pkg.destinations.map((d) => state.destinations.find((x) => x.id === d)).filter(Boolean);
  // const bookings = state.bookings.filter((b) => b.packageId === pkg.id);
  // const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);

  const onPackageClose = ({ reason, discount, bookingNumber }) => {
    const s = db.load();
    const idx = s.packages.findIndex((p) => p.id === pkg.id);
    s.packages[idx] = {
      ...s.packages[idx],
      status: "closed",
      closeReason: reason,
      closedAt: new Date().toISOString(),
      closeDiscount: discount,
      closeBookingNumber: bookingNumber,
    };
    db.save(s);
    setState({ ...s });
    toast.success("Package closed", { description: `Booking number ${bookingNumber} generated.` });
  };

  const STATUS_CLASS = { active: "hz-badge--active", inactive: "hz-badge--inactive", closed: "hz-badge--closed" };
  const STATUS_LABEL = { active: "Active", inactive: "Inactive", closed: "Closed" };

  return (
    <div data-testid="package-detail-page">
      <HzPageHeader
        kicker="Package details"
        title={pkg?.packageName}
        description={pkg?.description}
        actions={
          <>
            <button className="hz-btn-ghost" onClick={() => navigate("/packages")} data-testid="package-detail-back">
              <ArrowLeft className="size-4" strokeWidth={1.5} /> All packages
            </button>
            <Link to={`/packages/${pkg.id}/edit`} className="hz-btn-ghost" data-testid="package-detail-edit">
              <Edit2 className="size-4" strokeWidth={1.5} /> Edit
            </Link>
            {/* {pkg.status !== "closed" && (
              <button className="hz-btn-primary !bg-[#C04235] hover:!bg-[#A03228]" onClick={() => setCloseOpen(true)} data-testid="package-detail-close">
                <XCircle className="size-4" strokeWidth={1.75} /> Close package
              </button>
            )} */}
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {pkg && pkg.images?.length > 0 && (
            <div className="hz-card overflow-hidden">
              <div className="grid grid-cols-2 gap-1">
                {pkg.images.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.imagePath} alt="" className={`w-full ${i === 0 ? "col-span-2 h-72" : "h-36"} object-cover`} />
                ))}
              </div>
            </div>
          )}

          <section className="hz-card p-6">
            <h3 className="hz-heading text-xl mb-4">Day-wise itinerary</h3>
            <div className="relative pl-10">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-[var(--hz-border)]" />
              {pkg && Array.isArray(pkg.itineraryJson) && pkg.itineraryJson.map((d) => {
                {/* const dest = state.destinations.find((x) => x.id === d.destination); */}
                return (
                  <div key={d.day} className="relative mb-5">
                    <div className="absolute -left-[26px] top-1 size-7 rounded-full bg-[var(--hz-sidebar)] text-white text-[11px] font-semibold flex items-center justify-center hz-mono">{d.day}</div>
                    <div className="hz-heading text-base font-medium ms-10">{d.title}</div>
                    {/* <div className="text-xs text-[var(--hz-text-2)] inline-flex items-center gap-1 mt-0.5"><MapPin className="size-3.5" />{dest?.name || "—"}</div> */}
                    <div className="text-sm text-[var(--hz-text-2)] mt-2 leading-relaxed ms-10">{d.description}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="hz-card p-6">
            <span className="hz-label">Status</span>
            <div className="mt-2"><span className={`hz-badge ${STATUS_CLASS[pkg?.statusName]}`}>{STATUS_LABEL[pkg?.statusName]}</span></div>
            {pkg?.status === "closed" && (
              <div className="mt-4 p-3 rounded-lg bg-[#FCECEC] text-sm">
                <div className="hz-label">Closed on</div>
                <div className="text-[var(--hz-text)] font-medium">{formatDate(pkg.closedAt)}</div>
                <div className="hz-label mt-2">Reason</div>
                <div className="text-[var(--hz-text)]">{pkg.closeReason}</div>
              </div>
            )}
          </section>

          <section className="hz-card p-6">
            <h3 className="hz-heading text-xl mb-4">Pricing</h3>
            <ul className="space-y-2.5">
              {pkg && Array.isArray(pkg.durationJson) && pkg.durationJson.map((d, i) => (
                <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--hz-hover)]">
                  <div>
                    <div className="text-sm font-medium hz-heading">{d.days} days</div>
                    {pkg?.isEMIEnable && <div className="text-xs text-[var(--hz-text-2)] hz-mono">EMI {formatCurrency(d.emiPerMonth)}/mo</div>}
                  </div>
                  <div className="hz-mono font-medium">{formatCurrency(d.price)}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="hz-card p-6">
            <h3 className="hz-heading text-xl mb-3">Meta</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-[var(--hz-text-2)]">Categories</span><span>{pkg?.categories.map((c) => c.name).join(", ")}</span></div>
              <div className="flex justify-between"><span className="text-[var(--hz-text-2)]">Destinations</span><span>{pkg?.destinations.map((d) => d.name).join(", ")}</span></div>
              {/* <div className="flex justify-between"><span className="text-[var(--hz-text-2)]">Bookings</span><span className="hz-mono">{bookings.length}</span></div>
              <div className="flex justify-between"><span className="text-[var(--hz-text-2)]">Revenue tracked</span><span className="hz-mono">{formatCurrency(totalRevenue)}</span></div> */}
            </div>
          </section>
        </div>
      </div>

      <ClosePackageModal open={closeOpen} onClose={() => setCloseOpen(false)} pkg={pkg} onClosed={onPackageClose} />
    </div>
  );
}
