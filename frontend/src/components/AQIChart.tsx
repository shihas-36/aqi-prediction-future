import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AQIChartProps {
  data: Array<{
    date: string;
    aqi: number;
  }>;
  city: string;
}

const AQIChart: React.FC<AQIChartProps> = ({ data, city }) => {
  console.log('AQIChart received data:', data);
  console.log('City:', city);

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 bg-white rounded-lg shadow-lg mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">📈</span>
          <h2 className="text-xl font-semibold text-gray-800">
            7-Day AQI Forecast for {city}
          </h2>
        </div>
        <p className="text-gray-500 text-sm mb-6">Predicted air quality index values for the next week</p>
        <p className="text-gray-500">No data available to display chart</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Transform data for the chart
  const chartData = data.map((item) => ({
    date: item.date,
    aqi: Number(item.aqi) || 0,
    formattedDate: formatDate(item.date)
  }));

  console.log('Chart data:', chartData);

  // Get AQI category and color
  const getAQIInfo = (aqi: number) => {
    if (aqi <= 50) return { category: 'Good', color: '#22c55e', bgColor: '#dcfce7' };
    if (aqi <= 100) return { category: 'Moderate', color: '#eab308', bgColor: '#fef3c7' };
    if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: '#f97316', bgColor: '#fed7aa' };
    if (aqi <= 200) return { category: 'Unhealthy', color: '#ef4444', bgColor: '#fecaca' };
    if (aqi <= 300) return { category: 'Very Unhealthy', color: '#a855f7', bgColor: '#e9d5ff' };
    return { category: 'Hazardous', color: '#7c2d12', bgColor: '#fecaca' };
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const aqi = Math.round(payload[0].value);
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      const aqiInfo = getAQIInfo(aqi);
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200">
          <div className="text-right">
            <div className="text-gray-600 text-sm font-medium mb-1">{formattedDate}</div>
            <div className="text-gray-500 text-xs mb-2">Air Quality Index</div>
            <div className="flex items-center justify-end">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: aqiInfo.color }}
              ></div>
              <span className="text-xl font-bold text-gray-800">{aqi}</span>
              <span 
                className="text-sm font-medium ml-2 px-2 py-1 rounded" 
                style={{ 
                  color: aqiInfo.color, 
                  backgroundColor: aqiInfo.bgColor 
                }}
              >
                ({aqiInfo.category})
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-8 bg-white rounded-lg shadow-lg mb-8">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-2xl">📈</span>
        <h2 className="text-xl font-semibold text-gray-800">
          7-Day AQI Forecast for {city}
        </h2>
      </div>
      <p className="text-gray-500 text-sm mb-8">Predicted air quality index values for the next week</p>

      {/* Chart Container with explicit white background */}
      <div className="w-full bg-white rounded-lg" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              label={{ 
                value: 'AQI', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#64748b' }
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              domain={[0, 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="aqi" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorAQI)" 
              dot={false}
              activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


export default AQIChart;
