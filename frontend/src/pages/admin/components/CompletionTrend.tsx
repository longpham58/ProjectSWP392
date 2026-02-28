import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type CompletionTrendProps = {
  monthlyData: {
    month: string;
    completion: number;
  }[];
};

export default function CompletionTrend({
  monthlyData,
}: CompletionTrendProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">
        Training Completion Trend
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="completion"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}