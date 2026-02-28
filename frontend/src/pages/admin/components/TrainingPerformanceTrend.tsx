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

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Training Performance Trend (1 Year)
        </h3>

        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm capitalize ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(value) =>
              activeTab === "enrollment" ? value : `${value}%`
            }
          />
          <Tooltip
            formatter={(value: number | undefined) => {
              if (value === undefined) return "";
              return activeTab === "enrollment" ? value : `${value}%`;
            }}
          />
          <Line
            type="monotone"
            dataKey={activeTab}
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}