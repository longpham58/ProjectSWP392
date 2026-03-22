import React from 'react';
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

export default function TopCoursesChart({ courseData }: Props): React.ReactNode {
  // Sort & take Top 10
  const topCourses = [...courseData]
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 10);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Top 10 Course Completion Rates
        </h3>

        <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
          Sorted by highest completion
        </span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={topCourses}
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />

          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fontSize: 11 }}
          />

          <Tooltip
            formatter={(value) =>
              value == null ? "" : `${value}%`
            }
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
          />
          <Bar dataKey="completion" radius={[0, 6, 6, 0]}>
            {topCourses.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.completion < 70
                    ? "#ef4444" // red for risk
                    : "url(#barGradient2)" // gradient normal
                }
              />
            ))}

            <LabelList
              dataKey="completion"
              position="right"
              formatter={(value) =>
                value == null ? "" : `${value}%`
              }
              style={{ fontSize: 12, fontWeight: 500 }}
            />
          </Bar>
          <defs>
            <linearGradient id="barGradient2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      {/* Risk Legend */}
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-indigo-500 to-purple-500" />
          <span className="text-gray-600">Healthy Performance</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-gray-600">Below 70% (Needs Attention)</span>
        </div>
      </div>
    </div>
  );
}
