import { useState } from "react";
import { DjangoApiService } from "../services/djangoApi";

const Index = () => {
  const [cityName, setCityName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState("");

  // Available cities list
  const availableCities = [
    "Amaravati",
    "Bengaluru", 
    "Chennai",
    "Delhi",
    "Dispur",
    "Hyderabad",
    "Itanagar",
    "Jaipur",
    "Kolkata",
    "Lucknow",
    "Mumbai",
    "Patna",
    "Thiruvananthapuram"
  ];

  const handleSubmit = async () => {
    if (!cityName.trim()) {
      setError("select a city");
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

  const getAQIClass = (aqi) => {
    if (!aqi) return "";
    if (aqi <= 50) return "aqi-good";
    if (aqi <= 100) return "aqi-moderate";
    if (aqi <= 150) return "aqi-unhealthy";
    if (aqi <= 200) return "aqi-very-unhealthy";
    return "aqi-hazardous";
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 0" }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div style={{ 
              padding: "12px", 
              background: "#2563eb", 
              borderRadius: "50%", 
              color: "white",
              fontSize: "24px"
            }}>
              🌪️
            </div>
            <h1 className="text-4xl" style={{ 
              background: "linear-gradient(135deg, #2563eb, #4338ca)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              AQI Predictor
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Get accurate 7-day air quality predictions for any city using advanced machine learning models
          </p>
        </div>

        {/* Input Section */}
        <div className="card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: "600" }}>
            🗺️ Prediction Parameters
          </h2>
          <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
            Select the city from the dropdown and optionally choose a specific date for prediction analysis
          </p>
          
          <div className="grid grid-2">
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                City Name
              </label>
              <select
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                disabled={isLoading}
                style={{ 
                  height: "48px", 
                  cursor: "pointer",
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "white",
                  appearance: "auto"
                }}
              >
                <option value="">Select a city...</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                Reference Date (Optional)
              </label>
              <input
                className="input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button 
            className="btn"
            onClick={handleSubmit}
            disabled={isLoading}
            style={{ width: "100%", marginTop: "1rem", height: "48px" }}
          >
            {isLoading ? "🔄 Getting Prediction..." : "Get AQI Prediction"}
          </button>
        </div>

        {/* Results Section */}
        {predictions.length > 0 && (
          <div className="card">
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: "600" }}>
              7-Day AQI Predictions for {cityName}
            </h2>
            <div className="grid grid-3">
              {predictions.map((prediction, index) => (
                <div key={index} className={`aqi-card ${getAQIClass(prediction.aqi)}`}>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                    📅 {prediction.date}
                  </div>
                  <div style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    {prediction.aqi || "N/A"}
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>
                    {prediction.category}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    {cityName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="card">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.125rem", fontWeight: "600" }}>
            About AQI Categories
          </h2>
          <div className="grid grid-3">
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px", 
              borderRadius: "8px", 
              background: "#f0fdf4" 
            }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#10b981" }}></div>
              <div>
                <div style={{ fontWeight: "500", color: "#065f46" }}>Good (0-50)</div>
                <div style={{ fontSize: "0.875rem", color: "#047857" }}>Air quality is satisfactory</div>
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px", 
              borderRadius: "8px", 
              background: "#fffbeb" 
            }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#f59e0b" }}></div>
              <div>
                <div style={{ fontWeight: "500", color: "#92400e" }}>Moderate (51-100)</div>
                <div style={{ fontSize: "0.875rem", color: "#d97706" }}>Acceptable for most people</div>
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px", 
              borderRadius: "8px", 
              background: "#fff7ed" 
            }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#f97316" }}></div>
              <div>
                <div style={{ fontWeight: "500", color: "#9a3412" }}>Unhealthy (101+)</div>
                <div style={{ fontSize: "0.875rem", color: "#ea580c" }}>May cause health issues</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
