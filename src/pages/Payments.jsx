import { useState, useEffect } from "react";
import { data, useNavigate } from "react-router-dom";
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
  Wallet,
  CircleDollarSign,
  Clock3,
  XCircle,
  RefreshCw,
  CreditCard,
  User,
  Users,
  IndianRupee,
  RotateCcw,
  ChevronDown,
  BadgeCheck,
  SlidersHorizontal,
  Calendar,
  X,
  Copy,
  ReceiptText
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
import HzInput from "@/components/shared/HzInput";



export default function Payments() {
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
  const [searchTypeList, setSearchTypeList] = useState([{id:0,name:'Select Search Type'},{id:1,name:"Payment ID"},{id:2,name:"Transaction ID"},{id:3,name:"Customer ID"}]);
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [searchType, setSearchType] = useState(0);
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

  const getPaymentTransactionsAdmin = async (payload) => {
    console.log("Payment API Payload:", payload);
  
    const { status, message, responseValue } =
      await apiService.post(
        "admin/GetPaymentTransactionsAdmin",
        {
          customerId: payload?.customerId || 0,
          travellerId: payload?.travellerId || 0,
          productId: payload?.productId || 0,
          search: payload?.search || "",
          status: payload?.status || "ALL",
          fromDate: payload?.fromDate || null,
          toDate: payload?.toDate || null,
        }
      );
  
    if (status === 1 && responseValue.length > 0) {
      return {
        dashboard: responseValue[0] || {},
        transactions: responseValue[1] || [],
      };
    }
  
    throw new Error(
      message || "Failed to fetch payment transactions"
    );
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
  // React Query
  const {
    data: paymentData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "paymentTransactionsAdmin",
      0,
      0,
      0,
      debouncedQ,
      paymentStatus,
      fromDate,
      toDate,
    ],
  
    queryFn: () =>
      getPaymentTransactionsAdmin({
        customerId: 0,
        travellerId: 0,
        productId:  0,
        search: debouncedQ || "",
        status:
          paymentStatus === "all"
            ? "ALL"
            : paymentStatus || "ALL",
        fromDate: fromDate || null,
        toDate: toDate || null,
      }),
  
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  
    refetchOnWindowFocus: false,
  });
  const dashboard = paymentData?.dashboard?.[0] || {};

  
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(searchKey);
      setPage(1);
    }, 500);
  
    return () => clearTimeout(t);
  }, [searchKey]);

  
const clearFilters = () => {
  
};
const filtersActive = true;
console.log("Payment Data:", paymentData);
  return (
    <div data-testid="payment-page">
      <HzPageHeader
        kicker="Payment · Management"
        title="Payment Dashboard"
        description="Manage customer payments and transactions."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {[
          {
            title: "Total Collection",
            value: `₹${Number(dashboard.totalCollection || 0).toLocaleString("en-IN")}`,
            icon: (
              <Wallet className="size-6 text-green-600" />
            ),
          },
          {
            title: "Successful Amount",
            value: `₹${Number(dashboard.successfulAmount || 0).toLocaleString("en-IN")}`,
            icon: (
              <CircleDollarSign className="size-6 text-blue-600" />
            ),
          },
          {
            title: "Successful",
            value: dashboard.successful || 0,
            icon: (
              <CircleDollarSign className="size-6 text-blue-600" />
            ),
          },
          {
            title: "Pending",
            value: dashboard.pending || 0,
            icon: (
              <Clock3 className="size-6 text-yellow-600" />
            ),
          },
          {
            title: "Failed",
            value: dashboard.failed || 0,
            icon: (
              <XCircle className="size-6 text-red-600" />
            ),
          },
        ].map((x, i) => (
          <div key={i} className="hz-card p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[13px] text-[var(--hz-text-3)]">
                  {x.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {x.value}
                </h2>
              </div>

              <div className="size-14 rounded-2xl bg-[var(--hz-hover)] flex items-center justify-center">
                {x.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
    
      <div className="hz-card p-4 sm:p-5 mb-6" data-testid="travellers-filters">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-2">
              <select className="hz-input !pl-4" value={searchType} onChange={(e) => setSearchType(e.target.value)} data-testid="travellers-filter-gender">
                {searchTypeList && searchTypeList.map((item) => {
                  return(
                    <option value={item.id} key={item.id}>{item.name}</option>
                  )
                })}
                
              </select>
            </div>
            <div className="md:col-span-4">
              <HzInput
                icon={Search}
                placeholder="Search..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                testid="travellers-search"
              />
            </div>
            
            {/* <div className="md:col-span-3">
              <select className="hz-input !pl-4" value={packageId} onChange={(e) => setPackageId(e.target.value)} data-testid="travellers-filter-package">
                <option value="all">All packages</option>
                {state.packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div> */}
            {/* <div className="md:col-span-3"> */}
              {/* <button
                onClick={() => setWinnersOnly((v) => !v)}
                className={`h-11 px-4 rounded-[10px] border w-full text-sm font-medium inline-flex items-center justify-center gap-2 transition ${winnersOnly ? "bg-[var(--hz-cta)] text-white border-[var(--hz-cta)]" : "bg-white border-[var(--hz-border)] text-[var(--hz-text-2)] hover:text-[var(--hz-text)]"}`}
                data-testid="travellers-filter-winners"
              >
                <Trophy className="size-4" strokeWidth={1.75} /> {winnersOnly ? "Showing winners only" : "Show winners only"}
              </button> */}
            {/* </div> */}
            <div className="md:col-span-3">
              <HzInput icon={Calendar} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} testid="travellers-filter-from" />
            </div>
            <div className="md:col-span-3">
              <HzInput icon={Calendar} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} testid="travellers-filter-to" />
            </div>
            <div className="md:col-span-6 flex items-center justify-between gap-3">
              {/* <div className="text-xs text-[var(--hz-text-2)] inline-flex items-center gap-1.5">
                <Filter className="size-3.5" /> {travellerList.length} traveller 
              </div> */}
              {filtersActive && (
                <button onClick={clearFilters} className="text-xs text-[var(--hz-cta)] inline-flex items-center gap-1 hover:underline" data-testid="travellers-filter-clear">
                  <X className="size-3.5" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Table */}
      <div className="hz-card overflow-hidden">
        <div className="
          w-full
          max-h-[650px]
          overflow-auto
          rounded-2xl
          border
          border-[var(--hz-border)]
          bg-white
          scrollbar-thin
          scrollbar-thumb-gray-300
          scrollbar-track-transparent
        ">
        <table className="min-w-[1500px] w-full text-sm">
            <thead className="bg-[var(--hz-hover)] border-b">
              <tr>
                {["#","Customer","Traveller","Transaction ID","Payment ID","Method","Status","Amount","Date","Actions"].map(h=><th key={h} className="px-5 py-3 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hz-border)]">
              {paymentData?.transactions?.length > 0 ? (
                paymentData.transactions.map((item, index) => {
                  const customerName = item.customerName || "--";
                  const travellerName = item.travellerName || "--";
                  const customerInitial =
                    customerName !== "--"
                      ? customerName.charAt(0).toUpperCase()
                      : "?";

                  const travellerInitial =
                    travellerName !== "--"
                      ? travellerName.charAt(0).toUpperCase()
                      : "?";

                  const transactionId =
                    item.gatewayTransactionId || item.transactionId || "--";

                  const paymentId = item.orderId || "--";

                  const paymentStatus =
                    item.paymentStatus?.toUpperCase() || "UNKNOWN";
                  console.log("Payment Status:", paymentStatus);
                  const paymentMethod =
                    item.paymentMethod?.toUpperCase() || "--";

                  const isSuccess =
                    paymentStatus === "CHARGED" ||
                    paymentStatus === "SUCCESS";

                  const isPending =
                    paymentStatus === "NEW" ||
                    paymentStatus === "PENDING";

                  const isFailed =
                    !isSuccess && !isPending;

                  return (
                    <tr
                      key={item.id || `${transactionId}-${index}`}
                      className="
                        group
                        border-b
                        border-[var(--hz-border)]
                        bg-white
                        transition-all
                        duration-200
                        hover:bg-[var(--hz-hover)]
                      "
                    >
                      {/* # */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-[var(--hz-hover)]
                            text-sm
                            font-semibold
                            text-[var(--hz-text)]
                          "
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-[170px]">
                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-gradient-to-br
                              from-emerald-100
                              to-teal-100
                              text-sm
                              font-bold
                              text-emerald-700
                              ring-4
                              ring-emerald-50
                            "
                          >
                            {customerInitial}
                          </div>

                          <div className="min-w-0">
                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-[var(--hz-text)]
                              "
                              title={customerName}
                            >
                              {customerName}
                            </p>

                            {item.customerEmail && (
                              <p
                                className="
                                  max-w-[160px]
                                  truncate
                                  text-xs
                                  text-gray-400
                                "
                                title={item.customerEmail}
                              >
                                {item.customerEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* TRAVELLER */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-[170px]">
                          <div
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-gray-100
                              text-xs
                              font-bold
                              text-gray-600
                              ring-4
                              ring-gray-50
                            "
                          >
                            {travellerInitial}
                          </div>

                          <div className="min-w-0">
                            <p
                              className="
                                truncate
                                text-sm
                                font-medium
                                text-[var(--hz-text)]
                              "
                              title={travellerName}
                            >
                              {travellerName}
                            </p>

                            {/* {item.travellerId && (
                              <p className="text-xs text-gray-400">
                                ID: {item.travellerId}
                              </p>
                            )} */}
                          </div>
                        </div>
                      </td>

                      {/* TRANSACTION ID */}
                      <td className="px-5 py-4">
                        <div className="min-w-[190px]">
                          <p
                            className="
                              max-w-[220px]
                              truncate
                              rounded-md
                              bg-gray-50
                              px-2.5
                              py-1.5
                              font-mono
                              text-xs
                              font-medium
                              text-gray-600
                              transition-colors
                              group-hover:bg-white
                            "
                            title={transactionId}
                          >
                            {transactionId}
                          </p>
                        </div>
                      </td>

                      {/* PAYMENT ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="
                            inline-flex
                            items-center
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            px-3
                            py-1.5
                            font-mono
                            text-xs
                            font-semibold
                            text-gray-700
                          "
                          title={paymentId}
                        >
                          {paymentId}
                        </span>
                      </td>

                      {/* METHOD */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {paymentMethod === "--" ? (
                          <span className="text-sm text-gray-400">--</span>
                        ) : (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              bg-gray-100
                              px-3
                              py-1.5
                              text-xs
                              font-semibold
                              text-gray-700
                            "
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                            {paymentMethod}
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide

                            ${
                              isSuccess
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : isPending
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                : isFailed
                                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                                : "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
                            }
                          `}
                        >
                          <span
                            className={`
                              h-2
                              w-2
                              rounded-full

                              ${
                                isSuccess
                                  ? "bg-emerald-500"
                                  : isPending
                                  ? "bg-amber-500"
                                  : isFailed
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                              }
                            `}
                          />

                          {paymentStatus === "NEW" ? "Pending" : paymentStatus}
                        </span>
                      </td>

                      {/* AMOUNT */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-right sm:text-left">
                          <p className="text-sm font-bold text-[var(--hz-text)]">
                            ₹
                            {Number(item.amount || 0).toLocaleString("en-IN")}
                          </p>

                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                            {item.currency || "INR"}
                          </p>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-gray-50
                              text-gray-500
                            "
                          >
                            <CalendarDays className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {item.paymentCompletedOn ||
                                item.paymentInitiatedOn ||
                                "--"}
                            </p>

                            {item.paymentCompletedOn && (
                              <p className="text-[10px] font-medium text-emerald-600">
                                Completed
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() => handleViewTransaction(item)}
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-gray-200
                              bg-white
                              text-gray-500
                              shadow-sm
                              transition-all
                              hover:border-emerald-200
                              hover:bg-emerald-50
                              hover:text-emerald-600
                            "
                            title="View transaction"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyTransaction(transactionId)}
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-gray-200
                              bg-white
                              text-gray-500
                              shadow-sm
                              transition-all
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                            title="Copy transaction ID"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">

                      <div
                        className="
                          mb-4
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gray-100
                          text-gray-400
                        "
                      >
                        <ReceiptText className="h-7 w-7" />
                      </div>

                      <h3 className="text-sm font-semibold text-gray-700">
                        No transactions found
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        Try changing your search or filter criteria.
                      </p>

                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* <PaymentDetailsModal /> */}
      <Loader
        isLoading={isLoading}
        title="Fetching Payment Transactions"
        message="We're retrieving payment details and transaction records. Please wait..."
      />
    </div>
  ); 
}


