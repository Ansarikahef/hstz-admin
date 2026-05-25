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
  CalendarDays,
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
import TravellerProfileModal from "@/components/modals/TravellerProfileModal";
import BookingDetailsModal from "@/components/modals/BookingDetailsModal";



export default function Bookings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = new Date();
  // First day of current month
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };
  const [searchKey, setSearchKey] = useState("");
  const [isShowBtnLoader, setIsShowBtnLoader] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(null);
  const [filter, setFilter] = useState("thisMonth");
  const [page, setPage] = useState(1);
  const [openUser, setOpenUser] = useState(null);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [updateUserStatus, setUpdateUserStatus] = useState({ open: false, id: null });
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [fromDate, setFromDate] = useState(formatDate(firstDayOfMonth));
  const [toDate, setToDate] = useState(formatDate(today));
  const [bookingStatus, setBookingStatus] = useState("all");
  const loggedInUser = Helper.getLoginUserDetails();

  const handleDateFilter = (value) => {
    setDateFilter(value);
  
    // Current Month
    if (value === "thisMonth") {
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
  
      setFromDate(start.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
    }
  
    // Last 3 Months
    else if (value === "last3Months") {
      const start = new Date(
        today.getFullYear(),
        today.getMonth() - 2,
        1
      );
  
      setFromDate(start.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
    }
  
    // This Year
    else if (value === "thisYear") {
      const start = new Date(today.getFullYear(), 0, 1);
  
      setFromDate(start.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
    }
  
    // Custom
    else if (value === "custom") {
      setFromDate("");
      setToDate("");
    }
  
    // All
    else {
      setFromDate("");
      setToDate("");
    }
  };

  const getBookingList = async (payload) => {
    console.log("API Payload:", payload);
  
    const queryParams = new URLSearchParams({
      userId: loggedInUser.id || 0,
      bookingNo: payload?.bookingNo || "",
      bookingStatus: payload?.bookingStatus || "",
      fromDate: payload?.fromDate || "",
      toDate: payload?.toDate || "",
    });
  
    const { status, message, responseValue } =
      await apiService.get(
        `admin/GetBookingList?${queryParams.toString()}`
      );
  
    if (status === 1) {
      return (responseValue || []).map((item) => ({
        ...item,
  
        // Parse JSON fields
        documents: item.documents
          ? JSON.parse(item.documents)
          : [],
  
        packageImages: item.packageImages
          ? JSON.parse(item.packageImages)
          : [],
      }));
    }
  
    throw new Error(message || "Failed to fetch booking list");
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
  const { data: bookingList = [], isLoading } = useQuery({
    queryKey: [
      "bookingList",
      debouncedQ,
      bookingStatus,
      fromDate,
      toDate,
    ],
  
    queryFn: () =>
      getBookingList({
        bookingNo: debouncedQ || "",
        bookingStatus:
          bookingStatus === "all"
            ? null
            : bookingStatus,
        fromDate: fromDate || null,
        toDate: toDate || null
      }),
  
    keepPreviousData: true,
  
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(searchKey);
      setPage(1);
    }, 500);
  
    return () => clearTimeout(t);
  }, [searchKey]);
  
  return (
    <div data-testid="user-list-page">
      <HzPageHeader
        kicker="Bookings · Management"
        title="Booking directory"
        description="View and manage all customer bookings on HS Travel Zone."
        
      />

      {/* Search + Filter */}
      <div className="hz-card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--hz-text-3)]" />

            <input
              type="text"
              placeholder="Search by booking..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--hz-border-soft)] bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-4 text-[var(--hz-text-2)]" />

            {[
              "all",
              "Pending",
              "Confirmed",
              "Cancelled",
              "Completed",
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setBookingStatus(s);
                }}
                className={`px-3.5 h-9 rounded-full text-xs transition ${
                  bookingStatus === s
                    ? "bg-[var(--hz-sidebar)] text-white"
                    : "bg-[var(--hz-hover)] text-[var(--hz-text-2)] hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--hz-text-2)]" />

            <select
              value={dateFilter}
              onChange={(e) => handleDateFilter(e.target.value)}
              className="h-10 px-4 rounded-xl border border-[var(--hz-border-soft)] bg-white text-sm outline-none"
            >
              <option value="thisMonth">This Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Custom Date */}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[var(--hz-border-soft)] text-sm outline-none"
              />

              <span className="text-sm text-[var(--hz-text-3)]">
                to
              </span>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-10 px-3 rounded-xl border border-[var(--hz-border-soft)] text-sm outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* 📋 Table */}
      <div className="hz-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--hz-hover)] border-b">
              <tr>
                <th className="py-3 text-start tbl-serial-no">S No.</th>
                {/* <th className="px-5 py-3 text-start">User Name</th>
                <th className="px-5 py-3 text-start">Contact No.</th>
                <th className="px-5 py-3 text-start">Email</th>
                <th className="px-5 py-3 text-start">Registered</th>
                <th className="px-5 py-3 text-start">Bookings</th>
                <th className="px-5 py-3 text-start">Status</th> */}
                <th className="px-6 py-3">Booking</th>
                <th className="px-6 py-3">Traveller</th>
                <th className="px-6 py-3">Package</th>
                <th className="px-6 py-3">Booking Date</th>
                <th className="px-6 py-3 txtNoWrap">Package Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right"> Amount</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* {Array.isArray(users) && users.map((u,ind) => (
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

                  <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setOpenUser(u)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="View details" data-testid={`user-view-${u.id}`}><Eye className="size-4" /></button>
                        <button onClick={() => navigate(`/users/${u.id}/transactions`)} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="View transactions" data-testid={`user-txn-${u.id}`}><Receipt className="size-4" /></button>
                        <button onClick={() => setUpdateUserStatus({open: true, id : u.id ?? 0 })} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center" title="Update Status" data-testid={`user-print-${u.id}`}><UserCog  className="size-4" /></button>
                        <button onClick={() => setConfirm({ open: true, id: u.id ?? 0 })} className="hz-btn-ghost !h-9 !w-9 !p-0 justify-center text-[var(--hz-error)]"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                </tr>
              ))} */}
              {Array.isArray(bookingList) && bookingList.length > 0 ? (
                bookingList.map((b,ind) => {
                const statusColors = {
                  Pending:
                    "bg-yellow-100 text-yellow-700 border-yellow-200",
                  Confirmed:
                    "bg-green-100 text-green-700 border-green-200",
                  Cancelled:
                    "bg-red-100 text-red-700 border-red-200",
                  Completed:
                    "bg-blue-100 text-blue-700 border-blue-200",
                };
                const packageColors = {
                  Domestic:
                    "bg-purple-100 text-purple-700 border-purple-200",
                  International:
                    "bg-indigo-100 text-indigo-700 border-indigo-200",
                  Premium:
                    "bg-pink-100 text-pink-700 border-pink-200",
                };

                return (
                  <tr
                    key={b.bookingId}
                    className={`border-t border-[var(--hz-border-soft)] hover:bg-[var(--hz-hover)] transition`}>
                    {/* Booking */}
                    <td className="px-5 py-3">{ind + 1}</td>
                    <td className="px-6 py-4">
                      <div className="hz-mono text-[12px] font-semibold">
                        {b.bookingNo}
                      </div>
                    </td>
                    {/* Traveller */}
                    <td className="px-6 py-4 txtNoWrap">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold uppercase shadow-sm">
                          {`${b?.firstName?.[0] || ""}${
                            b?.lastName?.[0] || ""
                          }`}
                        </div>

                        <div>
                          <div className="font-medium text-[13px]">
                            {b?.firstName} {b?.lastName}
                          </div>

                          {/* <div className="text-[11px] text-[var(--hz-text-3)]">
                            {b?.mobileNumber}
                          </div> */}
                        </div>
                      </div>
                    </td>

                    {/* Package */}
                    <td className="px-6 py-4 text-[var(--hz-text-2)] font-medium txtNoWrap">
                      {b?.packageName}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-[var(--hz-text-2)] whitespace-nowrap">
                      {b?.bookingDate}
                    </td>

                    {/* Package Type Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${
                          packageColors[b?.packageType] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {b?.packageType}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${
                          statusColors[b?.bookingStatus] ||
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {b?.bookingStatus}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 hz-mono text-right font-semibold whitespace-nowrap">
                      {b?.totalAmount}
                    </td>
                    <td className="px-4 py-3 hz-no-print">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setBookingOpen(b)} className="hz-btn-ghost !h-8 !w-8 !p-0 justify-center" title="View Booking Details" data-testid={`traveller-row-view-booking${b.bookingId}`}>
                          <Eye className="size-3.5" />
                        </button>
                        {/* <button onClick={() => setWinnerOpen(t)} className="hz-btn-ghost !h-8 !w-8 !p-0 justify-center text-[var(--hz-cta)]" title="Mark winner" data-testid={`traveller-row-winner-${t.id}`}>
                          <Trophy className="size-3.5" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                );
              })
              ): (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                      📦
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-700">
                      No Bookings Found
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {/* No booking records are available for the selected filters. */}
                      No booking records are available right now.

                    </p>
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

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
      <BookingDetailsModal
        open={!!bookingOpen}
        onClose={() => setBookingOpen(null)}
        details={bookingOpen}
      />
      <Loader isLoading={isLoading} title="Please wait, Fetching Booking Details..." />
    </div>
  );
}