import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type TrendData = {
  month: string;
  completion: number;
  attendance: number;
  enrollment: number;
};

type Props = {
  trendData: TrendData[];
  activeTab: "completion" | "attendance" | "enrollment";
  setActiveTab: React.Dispatch<
    React.SetStateAction<"completion" | "attendance" | "enrollment">
  >;
};

export default function TrainingPerformanceTrend({
  trendData,
  activeTab,
  setActiveTab,
}: Props) {
    const tabs: ("completion" | "attendance" | "enrollment")[] = [
  "completion",
  "attendance",
  "enrollment",
];

  const getTabColors = (tab: string) => {
    switch (tab) {
      case "completion":
        return { bg: "bg-indigo-600", active: "from-indigo-500 to-purple-600", hover: "hover:from-indigo-600 hover:to-purple-700" };
      case "attendance":
        return { bg: "bg-green-600", active: "from-green-500 to-emerald-600", hover: "hover:from-green-600 hover:to-emerald-700" };
      case "enrollment":
        return { bg: "bg-amber-600", active: "from-amber-500 to-orange-600", hover: "hover:from-amber-600 hover:to-orange-700" };
      default:
        return { bg: "bg-indigo-600", active: "from-indigo-500 to-purple-600", hover: "hover:from-indigo-600 hover:to-purple-700" };
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Training Performance Trend (1 Year)
        </h3>

        <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl">
          {tabs.map((tab) => {
            const colors = getTabColors(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm capitalize font-medium transition-all ${
                  activeTab === tab
                    ? `bg-gradient-to-r ${colors.active} text-white shadow-md`
                    : "text-gray-600 hover:bg-white hover:shadow-sm"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(value) =>
              activeTab === "enrollment" ? value : `${value}%`
            }
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number | undefined) => {
              if (value === undefined) return "";
              return activeTab === "enrollment" ? value : `${value}%`;
            }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
          />
          <Line
            type="monotone"
            dataKey={activeTab}
            stroke={activeTab === "completion" ? "#6366f1" : activeTab === "attendance" ? "#16a34a" : "#f59e0b"}
            strokeWidth={3}
            dot={{ fill: activeTab === "completion" ? "#6366f1" : activeTab === "attendance" ? "#16a34a" : "#f59e0b", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
