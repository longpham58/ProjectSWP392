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
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCompletion" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis 
          domain={[0, 100]} 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: 'none', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            padding: '12px 16px'
          }}
          formatter={(value) => [`${value}%`, 'Hoàn thành']}
          labelStyle={{ color: '#64748b', marginBottom: '4px' }}
        />
        <Line
          type="monotone"
          dataKey="completion"
          stroke="url(#colorCompletion)"
          strokeWidth={4}
          dot={{ fill: '#6366f1', strokeWidth: 2, stroke: '#fff', r: 6 }}
          activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
