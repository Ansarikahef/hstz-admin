import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  Receipt,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Mail,
  Phone,
  Trash2,
  UserCog,
} from "lucide-react";
import HzPageHeader from "@/components/shared/HzPageHeader";
import UserDetailsModal from "@/components/modals/UserDetailsModal";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import apiService from "@/Utils/ApiService";
import { formatDate } from "@/lib/mockData"; // keep your formatter
import Loader from "@/components/Loader/Loader";
import ConfirmModal from "@/components/modals/ConfirmModal";
import UpdateUserStatusModal from "@/components/modals/UpdateUserStatusModal";
import Helper from "@/Utils/Helper";
import { useQueryClient } from "@tanstack/react-query";



export default function UserList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [q, setQ] = useState("");
  const [isShowBtnLoader, setIsShowBtnLoader] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openUser, setOpenUser] = useState(null);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [updateUserStatus, setUpdateUserStatus] = useState({ open: false, id: null });
  const pageSize = 6;
  const loggedInUser = Helper.getLoginUserDetails();
  const getUserList = async (payload) => {
    const { status, message, responseValue } =
      await apiService.post("admin/GetUserList", payload);

    if (status === 1) {
      return responseValue || [];
    } else {
      throw new Error(message || "Failed to fetch users");
    }
  };
  const remove = async() => {
    try{
      setIsShowBtnLoader(true);
      const payload = {
        key: confirm.id ,
        userId: loggedInUser?.id || 0,
      }
      const { status, message } = await apiService.post("admin/DeleteUser", payload);
      console.log("Delete user response:", { status, message });
      if(status === 1){
        setConfirm({ open: false, id: null });
        toast.success(message || "User removed");
        queryClient.invalidateQueries({
          queryKey: ["users"],
        });
      }
      else{
        toast.error(message || "Failed to remove user");
      }
    }
    catch(e){
      toast.error("Failed to remove user");
    }
    finally{
      setIsShowBtnLoader(false);
    }
  };
  const handleUpdateUserStatus = async (data) => {
    console.log("Status update data:", data);
    try{
      setIsShowBtnLoader(true);
      const payload = {
        key: updateUserStatus.id,
        userStatus: data.status,
        userId: loggedInUser?.id || 0,
        actionType: data.status === "Active" ? "User Account Activated" : data.status === "Inactive" ? "User Account Deactivated" : "User Account Suspended",
        remark: data.remark?.trim() || (data.status === "Active" ? "User account has been successfully activated and restored." : data.status === "Inactive" ? "User account has been marked as inactive temporarily." : "User account has been suspended due to administrative action."),
      }
      const { status, message } = await apiService.post("admin/UpdateUserStatus", payload);
      console.log("Update user status response:", { status, message });
      if(status === 1){
        setUpdateUserStatus({ open: false, id: null });
        toast.success(message || "User status updated");
        queryClient.invalidateQueries({
          queryKey: ["users"],
        });
      }
      else{
        toast.error(message || "Failed to update user status");
      }
    }
    catch(e){
      toast.error("Failed to update user status");
    }
    finally{
      setIsShowBtnLoader(false);
    }
  };
  // React Query
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", page, debouncedQ, filter], 
    queryFn: () =>
      getUserList({
        pageNumber: page,
        pageSize: pageSize,
        searchKey: debouncedQ || "", 
        userStatus: filter === "all" ? null : filter,
        createdByAdmin: null,
        fromDate: null,
        toDate: null,
      }),
    keepPreviousData: true,
  
    // ✅ caching (no repeat API for same params)
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  //Pagination from API
  const totalRecords = users.length > 0 ? users[0].totalRecords : 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const exportCsv = () => {
    if (!users || users.length === 0) {
      toast.error("No data to export");
      return;
    }
  
    // ✅ Headers (all fields)
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Full Name",
      "Guardian Name",
      "Guardian Relation",
      "Gender",
      "Mobile Number",
      "WhatsApp Number",
      "Email",
      "Date of Birth",
      "Address",
      "Mobile Verified",
      "Email Verified",
      "Registered By Admin",
      "Admin User ID",
      "User Status",
      "Created Date",
      "Updated Date",
    ];
  
    const rows = [headers];
  
    // ✅ Map all fields
    users.forEach((u) => {
      rows.push([
        u.id,
        u.firstName,
        u.lastName,
        u.fullName,
        u.guardianName,
        u.guardianRelation,
        u.gender,
        u.mobileNumber,
        u.whatsAppNumber,
        u.emailId,
        u.dateOfBirth,
        u.address,
        u.isMobileVerified ? "Yes" : "No",
        u.isEmailVerified ? "Yes" : "No",
        u.isRegisteredByAdmin ? "Yes" : "No",
        u.adminUserId,
        u.userStatus,
        u.createdDate,
        u.updatedDate,
      ]);
    });
  
    // Convert to CSV
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
  
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hz-users-full.csv";
    a.click();
  
    toast.success("Full user data exported");
  };
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 500);
  
    return () => clearTimeout(t);
  }, [q]);
  
  return (
    <div data-testid="user-list-page">
      <HzPageHeader
        kicker="Travellers · Directory"
        title="Registered users"
        description="View and manage all registered users on HS Travel Zone."
        actions={
          <>
            <button
              className="hz-btn-ghost"
              onClick={exportCsv}
              data-testid="users-export-csv"
            >
              <Download className="size-4" strokeWidth={1.5} /> Export
            </button>
            <button
              className="hz-btn-primary"
              onClick={() => navigate("/register")}
              data-testid="users-new"
            >
              <UserPlus className="size-4" strokeWidth={1.75} /> Register user
            </button>
          </>
        }
      />

      {/* 🔍 Search + Filter */}
      <div className="hz-card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="hz-input-wrap flex-1">
          <Search className="hz-input-icon size-4" strokeWidth={1.5} />
          <input
            className="hz-input"
            placeholder="Search by name, email or phone"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-[var(--hz-text-2)]" />
          {["all", "Active", "Inactive"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(1);
              }}
              className={`px-3.5 h-9 rounded-full text-xs ${
                filter === s
                  ? "bg-[var(--hz-sidebar)] text-white"
                  : "bg-[var(--hz-hover)] text-[var(--hz-text-2)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Table */}
      <div className="hz-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--hz-hover)] border-b">
              <tr>
                <th className="py-3 text-start tbl-serial-no">S No.</th>
                <th className="px-5 py-3 text-start">User Name</th>
                <th className="px-5 py-3 text-start">Contact No.</th>
                <th className="px-5 py-3 text-start">Email</th>
                <th className="px-5 py-3 text-start">Registered</th>
                <th className="px-5 py-3 text-start">Bookings</th>
                <th className="px-5 py-3 text-start">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(users) && users.map((u,ind) => (
                <tr key={u.id} className="border-t">
                  <td className="px-5 py-3">
                    {ind + 1 + (page - 1) * pageSize}
                  </td>
                  <td className="px-5 py-3 flex items-center gap-3">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt=""
                        className="size-9 rounded-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <div className="size-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {(u.firstName?.[0] || "").toUpperCase()}
                        {(u.lastName?.[0] || "").toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="font-medium">
                        {u.firstName} {u.lastName}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Phone size={12} /> {u.mobileNumber}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <Mail size={12} /> {u.emailId}
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    {formatDate(u.createdDate)}
                  </td>

                  <td className="px-5 py-3">0</td>
                  <td className="px-5 py-3">
                    <span
                      className={`user-status-badge ${
                        u.userStatus === "Active"
                          ? "status-active"
                          : u.userStatus === "Inactive"
                          ? "status-inactive"
                          : "status-suspend"
                      }`}
                    >
                      {u.userStatus}
                    </span>
                  </td>
                  {/* <td className="px-5 py-3 text-right">₹0</td> */}

                  <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setOpenUser(u)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="View details" data-testid={`user-view-${u.id}`}><Eye className="size-4" /></button>
                        <button onClick={() => navigate(`/users/${u.id}/transactions`)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="View transactions" data-testid={`user-txn-${u.id}`}><Receipt className="size-4" /></button>
                        {/* <button onClick={() => window.print()} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="Print" data-testid={`user-print-${u.id}`}><Printer className="size-4" /></button> */}
                        <button onClick={() => setUpdateUserStatus({open: true, id : u.id ?? 0 })} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="Update Status" data-testid={`user-print-${u.id}`}><UserCog  className="size-4" /></button>
                        <button onClick={() => setConfirm({ open: true, id: u.id ?? 0 })} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center text-[var(--hz-error)]"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-5">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📄 Pagination */}
      {totalRecords > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <div>
            Page {page} of {totalPages}
          </div>

          <div className="flex gap-1">
            <button
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page === 1}
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              disabled={page === totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}

      <UserDetailsModal
        user={openUser}
        onClose={() => setOpenUser(null)}
      />
      <ConfirmModal open={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={remove} title="Delete User?" description="Deleting this user will permanently remove their account and related access details." confirmLabel={isShowBtnLoader ? 'Deleting...' : 'Delete'} isBtnDisabled={isShowBtnLoader} tone="danger" testid="user-delete" />
      <UpdateUserStatusModal
        isOpen={updateUserStatus.open}
        onClose={() => setUpdateUserStatus({ open: false, id: null })}
        onSubmit={(data) => handleUpdateUserStatus(data)}
        userName=""
        isLoading={isShowBtnLoader}
      />
      <Loader isLoading={isLoading} />
    </div>
  );
}