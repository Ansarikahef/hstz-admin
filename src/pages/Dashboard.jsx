import { useMemo, useState } from "react";
import { CalendarRange, IndianRupee, Package as PackageIcon, Eye, ArrowUpRight, Clock, CheckCircle, Users, UserRound } from "lucide-react";
import { db, formatCurrency, formatDate } from "@/lib/mockData";
import HzPageHeader from "@/components/shared/HzPageHeader";
import HzStatCard from "@/components/shared/HzStatCard";
import { Link } from "react-router-dom";
import Helper from "@/Utils/Helper";
import { useQuery } from "@tanstack/react-query";
import apiService from "@/Utils/ApiService";
import Loader from "@/components/Loader/Loader";

export default function Dashboard() {
  const [bookingStatus, setBookingStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [debouncedBookingNo, setDebouncedBookingNo] = useState("");

  const loggedInUser = Helper.getLoginUserDetails() ?? null; 
  const visitorPie = [
    { name: "Direct", value: 4200, fill: "#162D24" },
    { name: "Referral", value: 3100, fill: "#D9734E" },
    { name: "Search", value: 3500, fill: "#4A7856" },
    { name: "Social", value: 1680, fill: "#D4A373" },
  ];
  const getDashboardSummary = async () => {
    
    const { status, message, responseValue } =
      await apiService.get(`admin/GetAdminDashboardSummary?userId=${loggedInUser.id}`);
  
    if (status === 1 && Array.isArray(responseValue) && responseValue.length > 0) {
      return responseValue[0] || null;
    }
  
    throw new Error(message || "Failed to fetch booking list");
  };
  const getBookingList = async (payload) => {
    console.log("API Payload:", payload);
    const { status, message, responseValue } =
      await apiService.get(`admin/GetBookingList?userId=${loggedInUser.id}&bookingStatus=Recent Bookings`);
  
    if (status === 1) {
      return responseValue || [];
    }
  
    throw new Error(message || "Failed to fetch booking list");
  };
  // React Query
  const { data: dashboardData = [], isDashboardLoading } = useQuery({
    queryKey: [
      "dashboardSummary"
    ],
  
    queryFn: () =>
      getDashboardSummary(),
  
    keepPreviousData: true,
  
    // caching
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const { data: bookingList = [], isLoading } = useQuery({
    queryKey: [
      "bookingList",
      debouncedBookingNo,
      bookingStatus,
      fromDate,
      toDate,
    ],
  
    queryFn: () =>
      getBookingList({
        bookingNo: debouncedBookingNo || null,
        bookingStatus:
          bookingStatus === "all" ? null : bookingStatus,
        fromDate: fromDate || null,
        toDate: toDate || null,
      }),
  
    keepPreviousData: true,
  
    // caching
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  console.log("Dashboard Data:", dashboardData);
  return (
    <div data-testid="dashboard-page">
      <HzPageHeader
        kicker="Admin console"
        title={`Welcome back, ${loggedInUser.firstName} ${loggedInUser.lastName}`}
        description="A quiet overview of bookings, revenue, and traveller activity across HS Travel Zone."
        testid="dashboard-header"
        // actions={
        //   <button className="hz-btn-ghost" data-testid="dashboard-export">
        //     <CalendarRange className="size-4" strokeWidth={1.5} />
        //     Last 30 days
        //   </button>
        // }
      />

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <HzStatCard label="Total Bookings" value={totalBookings} delta={12.4} deltaLabel="vs last month" icon={CalendarRange} accent="default" testid="stat-bookings" />
        <HzStatCard label="Total Sales" value={formatCurrency(totalSales)} delta={8.2} deltaLabel="vs last month" icon={IndianRupee} accent="cta" testid="stat-sales" />
        <HzStatCard label="Active Packages" value={activePackages} delta={2.1} deltaLabel="new this week" icon={PackageIcon} accent="success" testid="stat-packages" />
        <HzStatCard label="Visitors" value={visitors.toLocaleString()} delta={-1.8} deltaLabel="vs last week" icon={Eye} accent="info" testid="stat-visitors" />
      </div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <HzStatCard
          label="Total Bookings"
          value={dashboardData?.totalBookings ?? "-"}
          icon={CalendarRange}
          accent="default"
          testid="stat-total-bookings"
        />

        <HzStatCard
          label="Total Sales"
          value={dashboardData?.totalSales ?? "-"}
          icon={IndianRupee}
          accent="cta"
          testid="stat-total-sales"
        />

        <HzStatCard
          label="Active Bookings"
          value={dashboardData?.activeBookings ?? "-"}
          icon={PackageIcon}
          accent="success"
          testid="stat-active-bookings"
        />

        <HzStatCard
          label="Pending Bookings"
          value={dashboardData?.pendingBookings ?? "-"}
          icon={Clock}
          accent="warning"
          testid="stat-pending-bookings"
        />

        <HzStatCard
          label="Closed Bookings"
          value={dashboardData?.closeBookings ?? "-"}
          icon={CheckCircle}
          accent="default"
          testid="stat-closed-bookings"
        />

        <HzStatCard
          label="Active Users"
          value={dashboardData?.totalActiveUser ?? "-"}
          icon={Users}
          accent="success"
          testid="stat-active-users"
        />

        <HzStatCard
          label="Active Travellers"
          value={dashboardData?.totalActiveTraveller ?? "-"}
          icon={UserRound}
          accent="success"
          testid="stat-active-travellers"
        />
      </div>

      {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
        <div className="hz-card p-6 xl:col-span-2" data-testid="chart-trends">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="hz-label">Booking & revenue trend</span>
              <h3 className="hz-heading text-xl mt-1">Last 7 months</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--hz-text-2)]">
              <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#162D24]" /> Bookings</span>
              <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#D9734E]" /> Revenue</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#162D24" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#162D24" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9734E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D9734E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EFECE3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#5C5C5C", fontSize: 12 }} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "#5C5C5C", fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "#5C5C5C", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #E5E2D9", boxShadow: "0 8px 24px -12px rgba(22,45,36,0.18)", fontFamily: "Satoshi" }}
                  labelStyle={{ color: "#162D24", fontWeight: 600 }}
                />
                <Area yAxisId="left" type="monotone" dataKey="bookings" stroke="#162D24" strokeWidth={2} fill="url(#gPine)" />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#D9734E" strokeWidth={2} fill="url(#gCta)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hz-card p-6" data-testid="chart-visitors">
          <span className="hz-label">Visitor sources</span>
          <h3 className="hz-heading text-xl mt-1 mb-4">By channel</h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={visitorPie} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                  {visitorPie.map((e) => <Cell key={e.name} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E2D9" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {visitorPie.map((v) => (
              <div key={v.name} className="flex items-center gap-2 text-xs text-[var(--hz-text-2)]">
                <span className="size-2 rounded-full" style={{ backgroundColor: v.fill }} />
                {v.name} <span className="ml-auto hz-mono text-[var(--hz-text)]">{v.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-5 mt-6">
        <div className="hz-card p-6 xl:col-span-2" data-testid="recent-bookings">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="hz-label">Activity</span>
              <h3 className="hz-heading text-xl mt-1">Recent bookings</h3>
            </div>
            <Link to="/bookings" className="text-sm text-[var(--hz-cta)] font-medium inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--hz-border-soft)]">
                  <th className="px-6 py-3 hz-label !text-[10px]">Booking</th>
                  <th className="px-6 py-3 hz-label !text-[10px]">Traveller</th>
                  <th className="px-6 py-3 hz-label !text-[10px]">Package</th>
                  <th className="px-6 py-3 hz-label !text-[10px]">Booking Date</th>
                  <th className="px-6 py-3 hz-label !text-[10px] txtNoWrap">Package Type</th>
                  <th className="px-6 py-3 hz-label !text-[10px]">Status</th>
                  <th className="px-6 py-3 hz-label !text-[10px] text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(bookingList) &&
                  bookingList.length > 0 ? (
                  bookingList.map((b) => {
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
                        className={`border-t border-[var(--hz-border-soft)] hover:bg-[var(--hz-hover)] transition`}
                        // // ${
                        // //   b?.bookingStatus === "Pending"
                        // //     ? "pending-row"
                        // //     : ""
                        // // }
                      >
                        {/* Booking */}
                        <td className="px-6 py-4">
                          <div className="hz-mono text-[12px] font-semibold">
                            {b.bookingNo}
                          </div>
                        </td>

                        {/* Traveller */}
                        <td className="px-6 py-4">
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

                              <div className="text-[11px] text-[var(--hz-text-3)]">
                                {b?.mobileNumber}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Package */}
                        <td className="px-6 py-4 text-[var(--hz-text-2)] font-medium">
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
                          {formatCurrency(b?.totalAmount)}
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

        {/* <div className="hz-card p-6" data-testid="top-packages">
          <span className="hz-label">Demand</span>
          <h3 className="hz-heading text-xl mt-1 mb-4">Top selling packages</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={packagePopularity} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#EFECE3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#5C5C5C", fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: "#1A1A1A", fontSize: 12 }} width={120} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E2D9" }} />
                <Bar dataKey="count" fill="#D9734E" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>
      <Loader isLoading={isLoading} />
    </div>
  );
}
