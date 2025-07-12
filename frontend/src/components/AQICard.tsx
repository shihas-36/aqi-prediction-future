import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface AQICardProps {
  title: string;
  value: number | string;
  category: string;
  city: string;
  isTrend?: boolean;
}

const AQICard = ({ title, value, category, city, isTrend = false }: AQICardProps) => {
  const getAQIColor = (aqi: number | string) => {
    if (isTrend) return "text-gray-600";
    
    const numericAqi = typeof aqi === 'string' ? 0 : aqi;
    if (numericAqi <= 50) return "text-green-600";
    if (numericAqi <= 100) return "text-yellow-600";
    if (numericAqi <= 150) return "text-orange-600";
    if (numericAqi <= 200) return "text-red-600";
    if (numericAqi <= 300) return "text-purple-600";
    return "text-gray-600";
  };

  const getAQIBackground = (aqi: number | string) => {
    if (isTrend) return "bg-gray-50";
    
    const numericAqi = typeof aqi === 'string' ? 0 : aqi;
    if (numericAqi <= 50) return "bg-green-50";
    if (numericAqi <= 100) return "bg-yellow-50";
    if (numericAqi <= 150) return "bg-orange-50";
    if (numericAqi <= 200) return "bg-red-50";
    if (numericAqi <= 300) return "bg-purple-50";
    return "bg-gray-50";
  };

  const getBorderColor = (aqi: number | string) => {
    if (isTrend) return "border-gray-200";
    
    const numericAqi = typeof aqi === 'string' ? 0 : aqi;
    if (numericAqi <= 50) return "border-green-200";
    if (numericAqi <= 100) return "border-yellow-200";
    if (numericAqi <= 150) return "border-orange-200";
    if (numericAqi <= 200) return "border-red-200";
    if (numericAqi <= 300) return "border-purple-200";
    return "border-gray-200";
  };

  return (
    <Card className={`shadow-md border-2 ${getBorderColor(value)} ${getAQIBackground(value)} backdrop-blur-sm`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <div className={`text-3xl font-bold ${getAQIColor(value)}`}>
            {isTrend && typeof value === 'string' ? (
              <span className="text-2xl">{value}</span>
            ) : (
              value
            )}
          </div>
          <div className="text-sm font-medium text-gray-700">
            {category}
          </div>
          <div className="text-xs text-gray-500">
            {city}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AQICard;
