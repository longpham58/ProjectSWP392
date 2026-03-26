import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type PerformanceData = {
  level: string;
  value: number;
};

type Props = {
  data: PerformanceData[];
};

const COLORS = ["#16a34a", "#f59e0b", "#dc2626"];
const GRADIENTS = [
  { start: "#22c55e", end: "#16a34a" },
  { start: "#fbbf24", end: "#f59e0b" },
  { start: "#ef4444", end: "#dc2626" },
];

export default function EmployeePerformanceChart({ data }: Props): React.ReactNode {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Phân bổ hiệu suất nhân viên
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="level"
            outerRadius={110}
            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
            labelLine={true}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) =>
              value == null ? "" : `${value} Nhân viên`
            }
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
          />

          <Legend 
            formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend Explanation */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600"><span className="text-green-600 font-medium">Cao:</span> Hiệu suất vượt kỳ vọng</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-600"><span className="text-amber-600 font-medium">Trung bình:</span> Hiệu suất chấp nhận được</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600"><span className="text-red-600 font-medium">Thấp:</span> Cần chú ý</span>
        </div>
      </div>
    </div>
  );
}
