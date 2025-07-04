
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Wind, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [cityName, setCityName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Configure your Django backend URL here
  const DJANGO_API_URL = process.env.REACT_APP_DJANGO_API_URL || "http://localhost:8000/api";

  const handleSubmit = async () => {
    if (!cityName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a city name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Sending request to Django backend...");
    console.log("City:", cityName);
    console.log("Date:", selectedDate);

    try {
      const requestData = {
        city: cityName.trim(),
        date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      };

      console.log("Request data:", requestData);

      const response = await fetch(`${DJANGO_API_URL}/predict/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any authentication headers if needed
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Django API error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Django API response:", data);

      toast({
        title: "Success",
        description: "AQI prediction received successfully!",
      });

      // Handle the successful response here
      // You can update state or navigate to results page
      
    } catch (error) {
      console.error("Error calling Django backend:", error);
      
      let errorMessage = "Failed to get AQI prediction";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
                    disabled={isLoading}
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
                        disabled={isLoading}
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
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full mt-6 h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
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
