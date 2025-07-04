
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, TrendingUp, Wind } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AQIChart from "@/components/AQIChart";
import AQICard from "@/components/AQICard";
import { toast } from "@/hooks/use-toast";

// Mock data structure - replace with actual API calls to your ML model
const mockPredictionData = {
  city: "New York",
  predictions: [
    { date: "2025-07-05", aqi: 65, category: "Moderate" },
    { date: "2025-07-06", aqi: 58, category: "Moderate" },
    { date: "2025-07-07", aqi: 72, category: "Moderate" },
    { date: "2025-07-08", aqi: 45, category: "Good" },
    { date: "2025-07-09", aqi: 38, category: "Good" },
    { date: "2025-07-10", aqi: 41, category: "Good" },
    { date: "2025-07-11", aqi: 55, category: "Moderate" },
  ]
};

const Index = () => {
  const [cityName, setCityName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrediction = async () => {
    if (!cityName.trim()) {
      toast({
        title: "City Required",
        description: "Please enter a city name to get predictions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - replace with actual ML model API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
      
      // Here you would make the actual API call to your ML model
      // const response = await fetch('/api/predict-aqi', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ city: cityName, date: selectedDate })
      // });
      // const data = await response.json();
      
      setPredictionData({ ...mockPredictionData, city: cityName });
      
      toast({
        title: "Prediction Generated",
        description: `7-day AQI forecast for ${cityName} is ready!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Wind className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AQI Predictor
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get accurate 7-day air quality predictions for any city using advanced machine learning models
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Prediction Parameters
              </CardTitle>
              <CardDescription>
                Enter the city name and optionally select a specific date for prediction analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* City Input */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City Name
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter city name (e.g., New York, London)"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Reference Date (Optional)
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button 
                onClick={handlePrediction}
                disabled={isLoading}
                className="w-full mt-6 h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating Prediction...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Generate 7-Day Prediction
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {predictionData && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Current AQI Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <AQICard 
                title="Current AQI" 
                value={predictionData.predictions[0].aqi}
                category={predictionData.predictions[0].category}
                city={predictionData.city}
              />
              <AQICard 
                title="7-Day Average" 
                value={Math.round(predictionData.predictions.reduce((sum, p) => sum + p.aqi, 0) / predictionData.predictions.length)}
                category="Moderate"
                city={predictionData.city}
              />
              <AQICard 
                title="Trend" 
                value={predictionData.predictions[6].aqi - predictionData.predictions[0].aqi > 0 ? "↗" : "↘"}
                category={predictionData.predictions[6].aqi - predictionData.predictions[0].aqi > 0 ? "Increasing" : "Decreasing"}
                city={predictionData.city}
                isTrend={true}
              />
            </div>

            {/* Chart */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  7-Day AQI Forecast for {predictionData.city}
                </CardTitle>
                <CardDescription>
                  Predicted air quality index values for the next week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AQIChart data={predictionData.predictions} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">About AQI Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium text-green-800">Good (0-50)</div>
                    <div className="text-sm text-green-600">Air quality is satisfactory</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <div>
                    <div className="font-medium text-yellow-800">Moderate (51-100)</div>
                    <div className="text-sm text-yellow-600">Acceptable for most people</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <div>
                    <div className="font-medium text-orange-800">Unhealthy (101+)</div>
                    <div className="text-sm text-orange-600">May cause health issues</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
