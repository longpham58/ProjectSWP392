import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import TrainingPerformanceTrend from "./components/TrainingPerformanceTrend";
import TopCoursesChart from "./components/TopCoursesChart";
import EmployeePerformanceChart from "./components/EmployeePerformanceChart";

type DepartmentData = {
  name: string;
  completion: number;
};

type CourseData = {
  name: string;
  completion: number;
};


type TrainingHoursData = {
  month: string;
  totalHours: number;
  avgHours: number;
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<
  "completion" | "attendance" | "enrollment"
>("completion");
  // 🔹 KPI Values
  const kpis = [
    { title: "Total Employees", value: 128 },
    { title: "Active Users", value: "86%" },
    { title: "Completion Rate", value: "82%" },
    { title: "Compliance Rate", value: "91%" },
    { title: "Overdue Trainings", value: 7 },
  ];

 // 📊 Training trend data (12 months)
  const trendData = [
    { month: "Jan", completion: 70, attendance: 82, enrollment: 120 },
    { month: "Feb", completion: 75, attendance: 85, enrollment: 140 },
    { month: "Mar", completion: 72, attendance: 80, enrollment: 135 },
    { month: "Apr", completion: 78, attendance: 88, enrollment: 160 },
    { month: "May", completion: 80, attendance: 90, enrollment: 170 },
    { month: "Jun", completion: 85, attendance: 92, enrollment: 180 },
    { month: "Jul", completion: 88, attendance: 94, enrollment: 190 },
    { month: "Aug", completion: 84, attendance: 89, enrollment: 175 },
    { month: "Sep", completion: 86, attendance: 91, enrollment: 185 },
    { month: "Oct", completion: 90, attendance: 95, enrollment: 200 },
    { month: "Nov", completion: 92, attendance: 96, enrollment: 210 },
    { month: "Dec", completion: 95, attendance: 97, enrollment: 230 },
  ];
  // 🔹 Department Completion
  const departmentData: DepartmentData[] = [
    { name: "IT", completion: 92 },
    { name: "HR", completion: 88 },
    { name: "Sales", completion: 61 },
    { name: "Marketing", completion: 74 },
  ];

  // 🔹 Course Completion (Expanded + Realistic)
const courseData: CourseData[] = [
  { name: "Workplace Compliance 2026", completion: 96 },
  { name: "Data Security & GDPR", completion: 92 },
  { name: "Health & Safety Training", completion: 89 },
  { name: "Leadership Fundamentals", completion: 84 },
  { name: "Advanced React Development", completion: 78 },
  { name: "Project Management Basics", completion: 75 },
  { name: "Cybersecurity Awareness", completion: 73 },
  { name: "Effective Communication", completion: 69 },
  { name: "Time Management Skills", completion: 65 },
  { name: "Conflict Resolution", completion: 61 },
  { name: "Sales Negotiation Mastery", completion: 58 },
  { name: "Customer Service Excellence", completion: 55 },
  { name: "Diversity & Inclusion Training", completion: 82 },
  { name: "Cloud Computing Essentials", completion: 74 },
];

  // 🔹 Role Distribution
  const trainingHoursData: TrainingHoursData[] = [
  { month: "Jan", totalHours: 420, avgHours: 3.2 },
  { month: "Feb", totalHours: 510, avgHours: 4.1 },
  { month: "Mar", totalHours: 610, avgHours: 5.0 },
  { month: "Apr", totalHours: 580, avgHours: 4.8 },
  { month: "May", totalHours: 640, avgHours: 5.3 },
  { month: "Jun", totalHours: 720, avgHours: 6.0 },
];

// 🔹 Employee Performance Distribution
const performanceData = [
  { level: "High (80-100%)", value: 72 },
  { level: "Medium (60-79%)", value: 38 },
  { level: "Low (<60%)", value: 18 },
];

  const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea"];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">{kpi.title}</p>
            <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Completion Trend */}
      <TrainingPerformanceTrend
  trendData={trendData}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
/>
      {/* Department & Course Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Completion by Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar
  dataKey="completion"
  fill="#3B82F6"
  radius={[6, 6, 0, 0]}
  barSize={35}
/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <TopCoursesChart courseData={courseData} />
      </div>
{/* Employee Performance Distribution */}
<div className="mb-8">
  <EmployeePerformanceChart data={performanceData} />
</div>
      {/* Training Hours Trend + Risk Alerts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  
  {/* Training Hours Trend */}
  <div className="bg-white p-5 rounded-2xl shadow h-[320px]">
    <h3 className="text-lg font-semibold mb-4">
      Training Hours Trend (Last 6 Months)
    </h3>

    <ResponsiveContainer width="100%" height="85%">
      <LineChart data={trainingHoursData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          dataKey="totalHours"
          stroke="#2563eb"
          strokeWidth={3}
          name="Total Hours"
        />

        <Line
          type="monotone"
          dataKey="avgHours"
          stroke="#16a34a"
          strokeWidth={3}
          name="Avg Hours / Employee"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Risk Alerts */}
  <div className="bg-white p-6 rounded-2xl shadow">
    <h3 className="text-lg font-semibold mb-4">
      Risk & Alerts Summary
    </h3>
    <ul className="space-y-3 text-sm text-gray-700">
      <li>⚠ 7 employees have overdue mandatory training.</li>
      <li>⚠ Sales department below 70% completion rate.</li>
      <li>⚠ 3 employees inactive for more than 30 days.</li>
      <li>⚠ 2 courses have failure rates above 25%.</li>
    </ul>
  </div>
<div style={{ height: "80px" }}></div>
</div>
      </div>
  );
}