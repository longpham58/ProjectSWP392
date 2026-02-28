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

export default function EmployeePerformanceChart({ data }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">
        Employee Performance Distribution
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="level"
            outerRadius={110}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) =>
              value == null ? "" : `${value} Employees`
            }
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend Explanation */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p>
          <span className="text-green-600 font-medium">High:</span> Performing above expectations
        </p>
        <p>
          <span className="text-yellow-500 font-medium">Medium:</span> Acceptable performance
        </p>
        <p>
          <span className="text-red-600 font-medium">Low:</span> Needs attention
        </p>
      </div>
    </div>
  );
}