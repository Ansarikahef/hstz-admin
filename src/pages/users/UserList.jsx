import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye, Receipt, Printer, Download, ChevronLeft, ChevronRight, UserPlus, Mail, Phone } from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import { db, formatDate, formatCurrency } from "@/lib/mockData";
import UserDetailsModal from "@/components/modals/UserDetailsModal";
import { toast } from "sonner";

export default function UserList() {
  const navigate = useNavigate();
  const [state] = useState(() => db.load());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openUser, setOpenUser] = useState(null);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return state.users.filter((u) => {
      const text = `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (filter === "active" && u.status !== "active") return false;
      if (filter === "inactive" && u.status === "active") return false;
      return true;
    });
  }, [state.users, q, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const rows = [["ID", "First", "Last", "Email", "Phone", "Registered"]];
    state.users.forEach((u) => rows.push([u.id, u.firstName, u.lastName, u.email, u.phone, u.registeredAt]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hz-users.csv";
    a.click();
    toast.success("CSV exported");
  };

  return (
    <div data-testid="user-list-page">
      <HzPageHeader
        kicker="Travellers · Directory"
        title="Registered users"
        description="Browse, filter, and manage every traveller who has booked through HZ Travel Zone."
        actions={
          <>
            <button className="hz-btn-ghost" onClick={exportCsv} data-testid="users-export-csv">
              <Download className="size-4" strokeWidth={1.5} /> Export
            </button>
            <button className="hz-btn-primary" onClick={() => navigate("/register")} data-testid="users-new">
              <UserPlus className="size-4" strokeWidth={1.75} /> Register user
            </button>
          </>
        }
      />

      <div className="hz-card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="hz-input-wrap flex-1">
          <Search className="hz-input-icon size-4" strokeWidth={1.5} />
          <input data-testid="users-search" className="hz-input" placeholder="Search by name, email or phone" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-[var(--hz-text-2)]" strokeWidth={1.5} />
          {["all", "active", "inactive"].map((s) => (
            <button
              key={s}
              data-testid={`users-filter-${s}`}
              onClick={() => setFilter(s)}
              className={`px-3.5 h-9 rounded-full text-xs font-medium transition ${
                filter === s ? "bg-[var(--hz-sidebar)] text-white" : "bg-[var(--hz-hover)] text-[var(--hz-text-2)] hover:text-[var(--hz-text)]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="hz-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--hz-hover)] border-b border-[var(--hz-border)]">
              <tr className="text-left">
                <th className="px-5 py-3 hz-label !text-[10px]">Traveller</th>
                <th className="px-5 py-3 hz-label !text-[10px]">Contact</th>
                <th className="px-5 py-3 hz-label !text-[10px]">Registered</th>
                <th className="px-5 py-3 hz-label !text-[10px]">Bookings</th>
                <th className="px-5 py-3 hz-label !text-[10px] text-right">Lifetime value</th>
                <th className="px-5 py-3 hz-label !text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => {
                const userBookings = state.bookings.filter((b) => b.userId === u.id);
                const ltv = userBookings.reduce((s, b) => s + b.totalAmount, 0);
                return (
                  <tr key={u.id} className="border-t border-[var(--hz-border-soft)] hover:bg-[var(--hz-hover)]/60 transition" data-testid={`user-row-${u.id}`}>
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img src={u.avatar} alt="" className="size-9 rounded-full object-cover" />
                      <div>
                        <div className="font-medium">{u.firstName} {u.lastName}</div>
                        <div className="text-[11px] text-[var(--hz-text-2)] hz-mono">{u.id}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm flex items-center gap-1.5"><Mail className="size-3.5 text-[var(--hz-text-2)]" />{u.email}</div>
                      <div className="text-xs text-[var(--hz-text-2)] flex items-center gap-1.5 mt-0.5"><Phone className="size-3" />{u.phone}</div>
                    </td>
                    <td className="px-5 py-3 text-[var(--hz-text-2)]">{formatDate(u.registeredAt)}</td>
                    <td className="px-5 py-3 hz-mono">{userBookings.length}</td>
                    <td className="px-5 py-3 hz-mono text-right">{formatCurrency(ltv)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setOpenUser(u)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="View details" data-testid={`user-view-${u.id}`}><Eye className="size-4" /></button>
                        <button onClick={() => navigate(`/users/${u.id}/transactions`)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="View transactions" data-testid={`user-txn-${u.id}`}><Receipt className="size-4" /></button>
                        <button onClick={() => window.print()} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="Print" data-testid={`user-print-${u.id}`}><Printer className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--hz-text-2)]" data-testid="users-empty">No travellers match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-[var(--hz-text-2)]">Page {page} of {totalPages}</div>
          <div className="flex gap-1">
            <button className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="size-4" /></button>
            <button className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="size-4" /></button>
          </div>
        </div>
      )}

      <UserDetailsModal user={openUser} onClose={() => setOpenUser(null)} state={state} onOpenTransactions={(uid) => { setOpenUser(null); navigate(`/users/${uid}/transactions`); }} />
    </div>
  );
}
