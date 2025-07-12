import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Wind, Loader2 } from "lucide-react";
import { DjangoApiService } from "@/services/djangoApi";
import AQICard from "@/components/AQICard";

const Index = () => {
  const [cityName, setCityName] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!cityName.trim()) {
      setError("Please enter a city name");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const requestData = {
        city: cityName.trim(),
        date: selectedDate || null,
      };

      const data = await DjangoApiService.predictAQI(requestData);
      setPredictions(data.predictions);
      setError("");
    } catch (error) {
      console.error("Error calling Django backend:", error);
      setError(error instanceof Error ? error.message : "Failed to get AQI prediction");
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
                    placeholder="Enter city name (e.g., Delhi, Mumbai)"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Reference Date (Optional)
                  </Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full mt-6 h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Prediction...
                  </>
                ) : (
                  "Get AQI Prediction"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {predictions.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>7-Day AQI Predictions for {cityName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {predictions.map((prediction, index) => (
                    <AQICard
                      key={index}
                      title={prediction.date}
                      value={prediction.aqi || "N/A"}
                      category={prediction.category}
                      city={cityName}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Section */}
        <div className="max-w-4xl mx-auto">
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
