import { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { CalendarRange, IndianRupee, Package as PackageIcon, Eye, ArrowUpRight } from "lucide-react";
import { db, formatCurrency, formatDate } from "@/lib/mockData";
import HzPageHeader from "@/components/shared/HzPageHeader";
import HzStatCard from "@/components/shared/HzStatCard";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const state = db.load();
  const { bookings, packages, transactions, users } = state;

  const totalBookings = bookings.length;
  const totalSales = transactions.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const activePackages = packages.filter((p) => p.status === "active").length;
  const visitors = 12480;

  const trendData = useMemo(() => {
    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    return months.map((m, i) => ({
      month: m,
      bookings: 8 + i * 4 + (i % 2 === 0 ? 6 : 2),
      revenue: 220000 + i * 90000 + (i === 4 ? 60000 : 0),
    }));
  }, []);

  const visitorPie = [
    { name: "Direct", value: 4200, fill: "#162D24" },
    { name: "Referral", value: 3100, fill: "#D9734E" },
    { name: "Search", value: 3500, fill: "#4A7856" },
    { name: "Social", value: 1680, fill: "#D4A373" },
  ];

  const packagePopularity = useMemo(() => {
    return packages.slice(0, 5).map((p) => {
      const count = bookings.filter((b) => b.packageId === p.id).length;
      return { name: p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name, count: count + 4 };
    });
  }, [packages, bookings]);

  const recentBookings = bookings.slice().sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)).slice(0, 5);

  const userById = (id) => users.find((u) => u.id === id);
  const pkgById = (id) => packages.find((p) => p.id === id);

  return (
    <div data-testid="dashboard-page">
      <HzPageHeader
        kicker="Operator console"
        title="Welcome back, Hari."
        description="A quiet overview of bookings, revenue, and traveller activity across HZ Travel Zone."
        testid="dashboard-header"
        actions={
          <button className="hz-btn-ghost" data-testid="dashboard-export">
            <CalendarRange className="size-4" strokeWidth={1.5} />
            Last 30 days
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <HzStatCard label="Total Bookings" value={totalBookings} delta={12.4} deltaLabel="vs last month" icon={CalendarRange} accent="default" testid="stat-bookings" />
        <HzStatCard label="Total Sales" value={formatCurrency(totalSales)} delta={8.2} deltaLabel="vs last month" icon={IndianRupee} accent="cta" testid="stat-sales" />
        <HzStatCard label="Active Packages" value={activePackages} delta={2.1} deltaLabel="new this week" icon={PackageIcon} accent="success" testid="stat-packages" />
        <HzStatCard label="Visitors" value={visitors.toLocaleString()} delta={-1.8} deltaLabel="vs last week" icon={Eye} accent="info" testid="stat-visitors" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
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
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
        <div className="hz-card p-6 xl:col-span-2" data-testid="recent-bookings">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="hz-label">Activity</span>
              <h3 className="hz-heading text-xl mt-1">Recent bookings</h3>
            </div>
            <Link to="/users" className="text-sm text-[var(--hz-cta)] font-medium inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-3 hz-label !text-[10px]">Booking</th>
                  <th className="px-6 py-3 hz-label !text-[10px]">Traveller</th>
                  <th className="px-6 py-3 hz-label !text-[10px]">Package</th>
                  <th className="px-6 py-3 hz-label !text-[10px]">Date</th>
                  <th className="px-6 py-3 hz-label !text-[10px] text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => {
                  const u = userById(b.userId);
                  const p = pkgById(b.packageId);
                  return (
                    <tr key={b.id} className="border-t border-[var(--hz-border-soft)] hover:bg-[var(--hz-hover)]">
                      <td className="px-6 py-3 hz-mono text-[12px]">{b.id}</td>
                      <td className="px-6 py-3 flex items-center gap-2.5">
                        <img src={u?.avatar} className="size-7 rounded-full object-cover" alt="" />
                        <span className="font-medium">{u?.firstName} {u?.lastName}</span>
                      </td>
                      <td className="px-6 py-3 text-[var(--hz-text-2)]">{p?.name}</td>
                      <td className="px-6 py-3 text-[var(--hz-text-2)]">{formatDate(b.bookingDate)}</td>
                      <td className="px-6 py-3 hz-mono text-right">{formatCurrency(b.totalAmount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hz-card p-6" data-testid="top-packages">
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
        </div>
      </div>
    </div>
  );
}
