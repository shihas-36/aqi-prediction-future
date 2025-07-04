
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface AQIData {
  date: string;
  aqi: number;
  category: string;
}

interface AQIChartProps {
  data: AQIData[];
}

const AQIChart = ({ data }: AQIChartProps) => {
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981"; // Green
    if (aqi <= 100) return "#f59e0b"; // Yellow
    if (aqi <= 150) return "#f97316"; // Orange
    if (aqi <= 200) return "#ef4444"; // Red
    if (aqi <= 300) return "#8b5cf6"; // Purple
    return "#6b7280"; // Maroon
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold">{formatDate(label)}</p>
          <p className="text-sm text-gray-600 mb-2">Air Quality Index</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: getAQIColor(data.aqi) }}
            ></div>
            <span className="font-bold text-lg">{data.aqi}</span>
            <span className="text-sm text-gray-500">({data.category})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
    fullDate: item.date
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            label={{ 
              value: 'AQI', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#aqiGradient)"
          />
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#1d4ed8"
            strokeWidth={2}
            dot={{ fill: '#1d4ed8', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: '#1d4ed8', strokeWidth: 2, fill: '#ffffff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AQIChart;
