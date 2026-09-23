import {
  BookOpen,
  CircleDollarSign,
  CreditCard,
  Eye,
  NotebookText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import adminService from "../../services/admin.service";
import { formatCurrency, formatMillions } from "../../utils/format";
import QuickStatCard from "./components/QuickStatCard";
import StatCard from "./components/StatCard";
import TopRankCard from "./components/TopRankCard";
import CustomTooltipRevenue from "./components/CustomTooltipRevenue";



const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [topTopics, setTopTopics] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, revenueRes, coursesRes, topicsRes, txRes] =
          await Promise.all([
            adminService.getDashboardStats(),
            adminService.getMonthlyRevenue(),
            adminService.getTopCourses(),
            adminService.getTopTopics(),
            adminService.getLatestTransactions(),
          ]);
        setStats(statsRes);
        setRevenueData(revenueRes);
        setTopCourses(
          (coursesRes ?? []).map((c, i) => ({
            rank: i + 1,
            name: c.title,
            enrollmentCount: c.enrollmentCount,
          })),
        );
        setTopTopics(topicsRes ?? []);
        setTransactions(txRes ?? []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Tính tỷ lệ premium
  const premiumRatio =
    stats && stats.totalUsers > 0
      ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
      : "0.0";
  const freeRatio =
    stats && stats.totalUsers > 0
      ? (100 - Number(premiumRatio)).toFixed(1)
      : "100.0";

  const accountTypeData = [
    { name: "Premium", value: Number(premiumRatio), color: "#eab308" },
    { name: "Free", value: Number(freeRatio), color: "#e5e7eb" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Dashboard tổng quan
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Xem tổng quan hệ thống THCHI AI Study
          </p>
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              iconBg="bg-blue-400"
              label="Tổng người dùng"
              value={stats?.totalUsers?.toLocaleString("vi-VN")}
            />
            <StatCard
              icon={TrendingUp}
              iconBg="bg-yellow-400"
              label="Người dùng Premium"
              value={stats?.premiumUsers?.toLocaleString("vi-VN")}
            />
            <StatCard
              icon={CircleDollarSign}
              iconBg="bg-green-500"
              label="Tổng doanh thu"
              value={
                stats?.totalRevenue
                  ? formatCurrency(Number(stats.totalRevenue))
                  : "0₫"
              }
            />
            <StatCard
              icon={CreditCard}
              iconBg="bg-purple-400"
              label="Tỷ lệ Premium / Free"
              value={`${premiumRatio}%`}
            />
          </>
        )}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Revenue Area Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-700">
                Doanh thu (6 tháng gần nhất)
              </h2>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-[220px]" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={revenueData}
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatMillions}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#eab308"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{
                    fill: "#eab308",
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#eab308",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart – Account Types */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-base font-bold text-gray-700 mb-4">
            Tỷ lệ tài khoản
          </h2>
          {loading ? (
            <Skeleton className="flex-1" />
          ) : (
            <>
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={accountTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {accountTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, ""]}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 justify-center">
                  {accountTypeData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-gray-600">
                        {entry.name}: <strong>{entry.value}%</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-yellow-600 font-medium">Premium</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {premiumRatio}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 font-medium">Free</p>
                  <p className="text-lg font-bold text-gray-500">
                    {freeRatio}%
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Tables Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Top Courses */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))
        ) : (
          <>
            <TopRankCard
              title="Top khóa học được học nhiều"
              icon={BookOpen}
              items={topCourses}
              valueKey="enrollmentCount"
              valueSuffix="lượt học"
            />

            {/* Top Topics */}
            <TopRankCard
              title="Top bài học được học nhiều"
              icon={NotebookText}
              items={topTopics}
              valueKey="learnerCount"
              valueSuffix="lượt học"
            />

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <CircleDollarSign size={16} className="text-yellow-500" />
                  Giao dịch mới nhất
                </h2>
              </div>
              <div className="space-y-3">
                {transactions.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Chưa có giao dịch
                  </p>
                )}
                {transactions.map((tx, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <span className="text-xs text-gray-700 font-medium truncate max-w-[130px]">
                        {tx.email}
                      </span>
                      <span className="text-xs text-gray-400 truncate">{tx.plan}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-gray-700">
                        {formatCurrency(Number(tx.amount))}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-600">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          <>
            <QuickStatCard
              icon={BookOpen}
              iconBg="bg-yellow-50"
              iconColor="text-yellow-500"
              label="Tổng khóa học"
              value={stats?.totalCourses}
            />
            <QuickStatCard
              icon={NotebookText}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              label="Tổng bài học"
              value={stats?.totalTopics}
            />
            <QuickStatCard
              icon={Eye}
              iconBg="bg-purple-50"
              iconColor="text-purple-500"
              label="Người dùng Free"
              value={stats?.freeUsers}
            />
            <QuickStatCard
              icon={Users}
              iconBg="bg-green-50"
              iconColor="text-green-500"
              label="Người dùng mới hôm nay"
              value={stats?.newUsersToday}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
