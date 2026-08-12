import { useState, useEffect } from "react";
import { data, useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  CalendarDays,
  Wallet,
  CircleDollarSign,
  Clock3,
  XCircle,
  Calendar,
  X,
  Copy,
  ReceiptText,
  CircleX,
  RefreshCw,
  Printer,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Package,
  UserRound,
  UsersRound,
  History,
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
  const [page, setPage] = useState(1);
  const [debouncedQ, setDebouncedQ] = useState("");
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [fromDate, setFromDate] = useState(formatDate(firstDayOfMonth));
  const [toDate, setToDate] = useState(formatDate(today));
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);
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
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDrawer(true);
  };
  
  const closeTransactionDrawer = () => {
    setShowTransactionDrawer(false);
  
    setTimeout(() => {
      setSelectedTransaction(null);
    }, 250);
  };
  // React Query
  const {
    data: paymentData,
    isLoading,
    isFetching,
    error,
    refetch,
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
  const transactions = paymentData?.transactions || [];

  const paymentSummary = transactions.reduce(
    (acc, item) => {
      const status = item.paymentStatus?.toUpperCase() || "UNKNOWN";
      const amount = Number(item.amount || 0);

      if (status === "CHARGED" || status === "SUCCESS") {
        acc.paid += amount;
        acc.paidCount += 1;
      } else if (status === "NEW" || status === "PENDING") {
        acc.pending += amount;
        acc.pendingCount += 1;
      } else {
        acc.failed += amount;
        acc.failedCount += 1;
      }

      acc.total += amount;
      acc.totalCount += 1;

      return acc;
    },
    {
      paid: 0,
      pending: 0,
      failed: 0,
      total: 0,
      paidCount: 0,
      pendingCount: 0,
      failedCount: 0,
      totalCount: 0,
    }
  );

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  };
    
  const handlePrint = () => {
    window.print();
  };
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
        <div className="space-y-5">

{/* ================= PAYMENT HEADER ================= */}
<div
  className="
    relative overflow-hidden rounded-2xl
    border border-[var(--hz-border)]
    bg-white
    shadow-sm
  "
>
  {/* Decorative background */}
  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-100/40 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-11 w-11 items-center justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-600
                  ring-1 ring-emerald-100
                "
              >
                <Wallet className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[var(--hz-text)]">
                  Payment Overview
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Real-time transaction and collection summary
                </p>
              </div>
            </div>
          </div>
          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              className="
                group inline-flex h-10 items-center gap-2
                rounded-xl
                border border-gray-200
                bg-white
                px-4
                text-sm font-semibold text-gray-700
                shadow-sm
                transition-all duration-200
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetching ? "animate-spin" : "group-hover:rotate-180"
                } transition-transform duration-500`}
              />

              <span>
                {isFetching ? "Refreshing..." : "Refresh"}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="
                inline-flex h-10 items-center gap-2
                rounded-xl
                bg-[var(--hz-text)]
                px-4
                text-sm font-semibold text-white
                shadow-sm
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

          </div>
        </div>
      </div>
      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL PAID */}
        <div
          className="
            group relative overflow-hidden
            rounded-2xl
            border border-emerald-100
            bg-gradient-to-br from-emerald-50 via-white to-white
            p-5
            shadow-sm
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-md
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Total Paid
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                {formatAmount(paymentSummary.paid)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {paymentSummary.paidCount} successful transactions
              </p>
            </div>

            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-xl
                bg-emerald-100
                text-emerald-600
                transition-transform
                group-hover:scale-110
              "
            >
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full w-full rounded-full bg-emerald-500" />
          </div>
        </div>
        {/* PENDING */}
        <div
          className="
            group relative overflow-hidden
            rounded-2xl
            border border-amber-100
            bg-gradient-to-br from-amber-50 via-white to-white
            p-5
            shadow-sm
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-md
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Pending
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                {formatAmount(paymentSummary.pending)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {paymentSummary.pendingCount} transactions awaiting payment
              </p>
            </div>

            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-xl
                bg-amber-100
                text-amber-600
                transition-transform
                group-hover:scale-110
              "
            >
              <Clock3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-amber-100">
            <div className="h-full w-full rounded-full bg-amber-500" />
          </div>
        </div>
        {/* FAILED */}
        <div
          className="
            group relative overflow-hidden
            rounded-2xl
            border border-red-100
            bg-gradient-to-br from-red-50 via-white to-white
            p-5
            shadow-sm
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-md
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Failed
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                {formatAmount(paymentSummary.failed)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {paymentSummary.failedCount} failed transactions
              </p>
            </div>

            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-xl
                bg-red-100
                text-red-600
                transition-transform
                group-hover:scale-110
              "
            >
              <CircleX className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-red-100">
            <div className="h-full w-full rounded-full bg-red-500" />
          </div>
        </div>
        {/* TOTAL TRANSACTIONS */}
        <div
          className="
            group relative overflow-hidden
            rounded-2xl
            border border-blue-100
            bg-gradient-to-br from-blue-50 via-white to-white
            p-5
            shadow-sm
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-md
          "
        >
          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Transactions
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                {paymentSummary.totalCount.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Total transactions in current view
              </p>
            </div>

            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
                transition-transform
                group-hover:scale-110
              "
            >
              <ReceiptText className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-600">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>
              Collection {formatAmount(paymentSummary.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
      {/* Table */}
      <div className="hz-card overflow-hidden mt-3">
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
      {/* ============================================================    TRANSACTION DETAIL DRAWER============================================================ */}

      {showTransactionDrawer && selectedTransaction && (
        <div className="fixed inset-0 z-[100]">

          {/* BACKDROP */}
          <div
            className="
              absolute inset-0
              bg-slate-950/40
              backdrop-blur-[2px]
              transition-opacity
            "
            onClick={closeTransactionDrawer}
          />

          {/* RIGHT DRAWER */}
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.18)] animate-in slide-in-from-right duration-300">

            {/* ======================================================          HEADER      ====================================================== */}

            <div
              className="
                relative
                border-b border-slate-200
                bg-white
                px-5 py-4
              "
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex h-11 w-11
                      items-center justify-center
                      rounded-xl
                      bg-emerald-50
                      text-emerald-600
                      ring-1 ring-emerald-100
                    "
                  >
                    <ReceiptText className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Transaction Details
                    </p>

                    <h2 className="mt-0.5 text-base font-bold text-slate-900">
                      {selectedTransaction.orderId || "Payment"}
                    </h2>
                  </div>

                </div>


                <button
                  type="button"
                  onClick={closeTransactionDrawer}
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-lg
                    border border-slate-200
                    bg-white
                    text-slate-500
                    transition
                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-900
                  "
                >
                  <X className="h-4 w-4" />
                </button>

              </div>


              {/* PAYMENT HERO */}

              <div
                className="
                  mt-4
                  rounded-2xl
                  border border-slate-200
                  bg-gradient-to-br
                  from-slate-50
                  via-white
                  to-emerald-50/40
                  p-4
                "
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Payment Amount
                    </p>

                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                      ₹
                      {Number(
                        selectedTransaction.amount || 0
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>


                  {(() => {

                    const status =
                      selectedTransaction.paymentStatus?.toUpperCase() ||
                      "UNKNOWN";

                    const success =
                      status === "CHARGED" ||
                      status === "SUCCESS";

                    const pending =
                      status === "NEW" ||
                      status === "PENDING";

                    return (
                      <span
                        className={`
                          inline-flex items-center gap-2
                          rounded-full
                          px-3 py-1.5
                          text-xs font-bold
                          uppercase tracking-wide
                          ${
                            success
                              ? "bg-emerald-100 text-emerald-700"
                              : pending
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        <span
                          className={`
                            h-2 w-2 rounded-full
                            ${
                              success
                                ? "bg-emerald-500"
                                : pending
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }
                          `}
                        />

                        {success
                          ? "Paid"
                          : pending
                          ? "Pending"
                          : "Failed"}
                      </span>
                    );

                  })()}

                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">

                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Payment ID
                    </p>

                    <p className="mt-1 font-mono text-xs font-semibold text-slate-700">
                      {selectedTransaction.orderId || "--"}
                    </p>
                  </div>


                  <div className="text-right">

                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Method
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {selectedTransaction.paymentMethod?.toUpperCase() || "--"}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* ====================================================== SCROLLABLE CONTENT      ====================================================== */}

            <div className="flex-1 overflow-y-auto px-5 py-5">

              {/* ==================================================== PAYMENT TIMELINE==================================================== */}

              <TransactionSection
                title="Payment Timeline"
                icon={<Clock3 className="h-4 w-4" />}
              >

                <div className="relative ml-2">

                  {/* vertical line */}
                  <div
                    className="
                      absolute left-[9px]
                      top-3 bottom-3
                      w-px
                      bg-slate-200
                    "
                  />


                  {/* INITIATED */}

                  <TimelineItem
                    title="Payment Initiated"
                    date={
                      selectedTransaction.paymentInitiatedOn ||
                      "--"
                    }
                    description="Payment request was created."
                    status="completed"
                    icon={<CreditCard className="h-3.5 w-3.5" />}
                  />


                  {/* PROCESSING */}

                  <TimelineItem
                    title="Payment Processing"
                    date={
                      selectedTransaction.paymentInitiatedOn ||
                      "--"
                    }
                    description="Payment request was sent to the payment gateway."
                    status="completed"
                    icon={<RefreshCw className="h-3.5 w-3.5" />}
                  />


                  {/* CURRENT STATUS */}

                  {(() => {

                    const status =
                      selectedTransaction.paymentStatus?.toUpperCase() ||
                      "UNKNOWN";

                    const success =
                      status === "CHARGED" ||
                      status === "SUCCESS";

                    const pending =
                      status === "NEW" ||
                      status === "PENDING";

                    return (
                      <TimelineItem
                        title={
                          success
                            ? "Payment Successful"
                            : pending
                            ? "Payment Pending"
                            : "Payment Failed"
                        }
                        date={
                          selectedTransaction.paymentCompletedOn ||
                          selectedTransaction.paymentInitiatedOn ||
                          "--"
                        }
                        description={
                          success
                            ? "Payment has been successfully completed."
                            : pending
                            ? "Payment is currently awaiting confirmation."
                            : "Payment was not successfully completed."
                        }
                        status={
                          success
                            ? "success"
                            : pending
                            ? "pending"
                            : "failed"
                        }
                        icon={
                          success ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : pending ? (
                            <Clock3 className="h-3.5 w-3.5" />
                          ) : (
                            <CircleX className="h-3.5 w-3.5" />
                          )
                        }
                        last
                      />
                    );

                  })()}

                </div>

              </TransactionSection>


              {/* ====================================================
                  PAYMENT DETAILS
              ==================================================== */}

              <TransactionSection
                title="Payment Details"
                icon={<CreditCard className="h-4 w-4" />}
              >

                <DetailGrid>

                  <DetailItem
                    label="Transaction ID"
                    value={
                      selectedTransaction.gatewayTransactionId ||
                      selectedTransaction.transactionId ||
                      "--"
                    }
                    mono
                  />

                  <DetailItem
                    label="Payment ID"
                    value={selectedTransaction.orderId || "--"}
                    mono
                  />

                  <DetailItem
                    label="Payment Method"
                    value={
                      selectedTransaction.paymentMethod?.toUpperCase() ||
                      "--"
                    }
                  />

                  <DetailItem
                    label="Amount"
                    value={`₹${Number(
                      selectedTransaction.amount || 0
                    ).toLocaleString("en-IN")}`}
                    highlight
                  />

                  <DetailItem
                    label="Currency"
                    value={selectedTransaction.currency || "INR"}
                  />

                  <DetailItem
                    label="Gateway Payment ID"
                    value={
                      selectedTransaction.gatewayPaymentId ||
                      "--"
                    }
                    mono
                  />

                  <DetailItem
                    label="Gateway Transaction ID"
                    value={
                      selectedTransaction.gatewayTransactionId ||
                      "--"
                    }
                    mono
                  />

                  <DetailItem
                    label="Gateway Reference"
                    value={
                      selectedTransaction.gatewayReferenceNo ||
                      "--"
                    }
                    mono
                  />

                </DetailGrid>

              </TransactionSection>


              {/* ====================================================
                  PRODUCT DETAILS
              ==================================================== */}

              <TransactionSection
                title="Product Details"
                icon={<Package className="h-4 w-4" />}
              >

                <DetailGrid>

                  <DetailItem
                    label="Package"
                    value={
                      selectedTransaction.productName ||
                      selectedTransaction.packageName ||
                      selectedTransaction.productTitle ||
                      "--"
                    }
                    full
                  />

                  <DetailItem
                    label="Product ID"
                    value={
                      selectedTransaction.productId || "--"
                    }
                  />

                  <DetailItem
                    label="Package Code"
                    value={
                      selectedTransaction.productCode || "--"
                    }
                  />

                </DetailGrid>

              </TransactionSection>


              {/* ====================================================
                  CUSTOMER DETAILS
              ==================================================== */}

              <TransactionSection
                title="Customer Details"
                icon={<UserRound className="h-4 w-4" />}
              >

                <DetailGrid>

                  <DetailItem
                    label="Customer Name"
                    value={
                      selectedTransaction.customerName || "--"
                    }
                    full
                  />

                  <DetailItem
                    label="Email"
                    value={
                      selectedTransaction.customerEmail || "--"
                    }
                  />

                  <DetailItem
                    label="Phone"
                    value={
                      selectedTransaction.customerPhoneNo ||
                      selectedTransaction.customerPhone ||
                      "--"
                    }
                  />

                  <DetailItem
                    label="Customer ID"
                    value={
                      selectedTransaction.customerId || "--"
                    }
                  />

                </DetailGrid>

              </TransactionSection>


              {/* ====================================================
                  TRAVELLER DETAILS
              ==================================================== */}

              <TransactionSection
                title="Traveller Details"
                icon={<UsersRound className="h-4 w-4" />}
              >

                <DetailGrid>

                  <DetailItem
                    label="Traveller Name"
                    value={
                      selectedTransaction.travellerName || "--"
                    }
                    full
                  />

                  <DetailItem
                    label="Traveller ID"
                    value={
                      selectedTransaction.travellerId || "--"
                    }
                  />

                  <DetailItem
                    label="Email"
                    value={
                      selectedTransaction.travellerEmail || "--"
                    }
                  />

                  <DetailItem
                    label="Phone"
                    value={
                      selectedTransaction.travellerPhone ||
                      selectedTransaction.travellerPhoneNo ||
                      "--"
                    }
                  />

                </DetailGrid>

              </TransactionSection>


              {/* ====================================================
                  PAYMENT HISTORY
              ==================================================== */}

              <TransactionSection
                title="Payment History"
                icon={<History className="h-4 w-4" />}
              >

                {selectedTransaction.paymentHistory?.length > 0 ? (

                  <div className="space-y-3">

                    {selectedTransaction.paymentHistory.map(
                      (history, index) => (
                        <div
                          key={history.id || index}
                          className="
                            rounded-xl
                            border border-slate-200
                            bg-slate-50/70
                            p-3
                          "
                        >

                          <div className="flex items-center justify-between">

                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Attempt #{index + 1}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-500">
                                {history.date ||
                                  history.createdOn ||
                                  "--"}
                              </p>
                            </div>

                            <span
                              className="
                                rounded-full
                                bg-slate-100
                                px-2.5 py-1
                                text-[10px]
                                font-bold
                                uppercase
                                text-slate-600
                              "
                            >
                              {history.status || "--"}
                            </span>

                          </div>

                          <div className="mt-3 flex justify-between border-t border-slate-200 pt-2">

                            <span className="text-[11px] text-slate-500">
                              Amount
                            </span>

                            <span className="text-xs font-bold text-slate-800">
                              ₹
                              {Number(
                                history.amount || 0
                              ).toLocaleString("en-IN")}
                            </span>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                ) : (

                  <div
                    className="
                      rounded-xl
                      border border-dashed border-slate-200
                      bg-slate-50/60
                      px-4 py-6
                      text-center
                    "
                  >

                    <History className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-2 text-xs font-semibold text-slate-600">
                      No payment history available
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      Historical payment attempts were not returned by the API.
                    </p>

                  </div>

                )}

              </TransactionSection>

            </div>


            {/* ======================================================
                FOOTER
            ====================================================== */}

            <div
              className="
                border-t border-slate-200
                bg-white
                px-5 py-3
              "
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Transaction
                  </p>

                  <p className="font-mono text-[11px] font-semibold text-slate-600">
                    {selectedTransaction.gatewayTransactionId ||
                      selectedTransaction.transactionId ||
                      "--"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeTransactionDrawer}
                  className="
                    rounded-lg
                    bg-slate-900
                    px-4 py-2
                    text-xs font-semibold
                    text-white
                    transition
                    hover:bg-slate-800
                  "
                >
                  Close
                </button>

              </div>

            </div>

          </aside>
        </div>
      )}
      {/* =========================================================  ENTERPRISE PRINT REPORT    ========================================================= */}
      <div id="payment-print-report" className="hidden print:block">

      {/* REPORT HEADER */}
      <div className="print-report-header">

        <div className="company-header">

          <div className="company-info">
            <h1>HS Travel Zone</h1>

            <p>
              Travel & Payment Management System
            </p>

            <p>
              Payment Transaction Report
            </p>
          </div>

          <div className="report-meta">
            <div>
              <span>Report Date</span>
              <strong>
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </div>

            <div>
              <span>Generated At</span>
              <strong>
                {new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </div>
          </div>

        </div>


        {/* DATE RANGE */}
        <div className="report-period">

          <div>
            <span>Reporting Period</span>

            <strong>
              {fromDate
                ? new Date(fromDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                : "All Dates"}

              {"  —  "}

              {toDate
                ? new Date(toDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                : "Present"}
            </strong>
          </div>

          <div>
            <span>Total Transactions</span>

            <strong>
              {paymentSummary.totalCount.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>


        {/* SUMMARY */}
        <div className="print-summary">

          <div>
            <span>Total Paid</span>
            <strong>
              {formatAmount(paymentSummary.paid)}
            </strong>
          </div>

          <div>
            <span>Pending</span>
            <strong>
              {formatAmount(paymentSummary.pending)}
            </strong>
          </div>

          <div>
            <span>Failed</span>
            <strong>
              {formatAmount(paymentSummary.failed)}
            </strong>
          </div>

          <div>
            <span>Total Value</span>
            <strong>
              {formatAmount(paymentSummary.total)}
            </strong>
          </div>

        </div>

      </div>


      {/* TRANSACTION TABLE */}
      <table className="print-payment-table">

        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Traveller</th>
            <th>Transaction ID</th>
            <th>Payment ID</th>
            <th>Method</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>

          {paymentData?.transactions?.map((item, index) => {

            const paymentStatus =
              item.paymentStatus?.toUpperCase() || "UNKNOWN";

            const isSuccess =
              paymentStatus === "CHARGED" ||
              paymentStatus === "SUCCESS";

            const isPending =
              paymentStatus === "NEW" ||
              paymentStatus === "PENDING";

            const status = isSuccess
              ? "PAID"
              : isPending
              ? "PENDING"
              : "FAILED";

            const transactionId =
              item.gatewayTransactionId ||
              item.transactionId ||
              "--";

            return (
              <tr key={item.id || `${transactionId}-${index}`}>

                <td>
                  {String(index + 1).padStart(2, "0")}
                </td>

                <td>
                  {item.customerName || "--"}
                </td>

                <td>
                  {item.travellerName || "--"}
                </td>

                <td className="print-mono">
                  {transactionId}
                </td>

                <td className="print-mono">
                  {item.orderId || "--"}
                </td>

                <td>
                  {item.paymentMethod?.toUpperCase() || "--"}
                </td>

                <td>
                  {status}
                </td>

                <td className="print-amount">
                  ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                </td>

                <td>
                  {item.paymentCompletedOn ||
                    item.paymentInitiatedOn ||
                    "--"}
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>


      {/* FOOTER */}
      <div className="print-report-footer">

        <div>
          <strong>HS Travel Zone</strong>
          <span>
            Confidential • Payment Transaction Report
          </span>
        </div>

        <div>
          <span>
            This report is system generated and does not require a signature.
          </span>
        </div>

      </div>

      </div>
    </div>
  ); 
}
const TransactionSection = ({
  title,
  icon,
  children,
}) => (
  <section className="mb-6">

    <div className="mb-3 flex items-center gap-2">

      <div
        className="
          flex h-7 w-7
          items-center justify-center
          rounded-lg
          bg-slate-100
          text-slate-600
        "
      >
        {icon}
      </div>

      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {title}
      </h3>

    </div>

    {children}

  </section>
);


const DetailGrid = ({ children }) => (
  <div className="grid grid-cols-2 gap-2.5">
    {children}
  </div>
);


const DetailItem = ({
  label,
  value,
  mono = false,
  highlight = false,
  full = false,
}) => (
  <div
    className={`
      rounded-xl
      border border-slate-200
      bg-white
      px-3 py-2.5
      ${full ? "col-span-2" : ""}
    `}
  >

    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p
      className={`
        mt-1 break-words
        text-xs font-semibold
        ${
          highlight
            ? "text-emerald-600"
            : "text-slate-700"
        }
        ${mono ? "font-mono text-[10px]" : ""}
      `}
    >
      {value || "--"}
    </p>

  </div>
);


const TimelineItem = ({
  title,
  date,
  description,
  status,
  icon,
  last = false,
}) => {

  const styles = {
    completed:
      "bg-slate-100 text-slate-600 ring-slate-200",

    success:
      "bg-emerald-100 text-emerald-600 ring-emerald-200",

    pending:
      "bg-amber-100 text-amber-600 ring-amber-200",

    failed:
      "bg-red-100 text-red-600 ring-red-200",
  };

  return (
    <div className="relative flex gap-3 pb-5">

      <div
        className={`
          relative z-10
          flex h-5 w-5 shrink-0
          items-center justify-center
          rounded-full
          ring-4
          ${styles[status] || styles.completed}
        `}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-3">

          <div>
            <p className="text-xs font-bold text-slate-800">
              {title}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {date}
            </p>
          </div>

          {status === "success" && (
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
              COMPLETED
            </span>
          )}

        </div>

        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
};


