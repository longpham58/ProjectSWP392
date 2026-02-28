import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

type CourseData = {
  name: string;
  completion: number;
};

type Props = {
  courseData: CourseData[];
};

export default function TopCoursesChart({ courseData }: Props) {
  // 🔥 Sort & take Top 10
  const topCourses = [...courseData]
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 10);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Top 10 Course Completion Rates
        </h3>

        <span className="text-sm text-gray-500">
          Sorted by highest completion
        </span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={topCourses}
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" domain={[0, 100]} />

          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
  formatter={(value) =>
    value == null ? "" : `${value}%`
  }
/>
          <Bar dataKey="completion" radius={[0, 6, 6, 0]}>
            {topCourses.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.completion < 70
                    ? "#dc2626" // red for risk
                    : "#2563eb" // blue normal
                }
              />
            ))}

            <LabelList
              dataKey="completion"
              position="right"
              formatter={(value) =>
    value == null ? "" : `${value}%`
  }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Risk Legend */}
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded" />
          <span>Healthy Performance</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded" />
          <span>Below 70% (Needs Attention)</span>
        </div>
      </div>
    </div>
  );
}