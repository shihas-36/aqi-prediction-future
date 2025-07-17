// Django API service
const DJANGO_API_URL = process.env.NODE_ENV === 'production' 
  ? "https://aqi-prediction-future.onrender.com/api"  // Replace with your actual Render URL
  : "http://localhost:8000/api";

export interface PredictionRequest {
  city: string;
  date?: string | null;
}

export interface PredictionResponse {
  city: string;
  predictions: Array<{
    date: string;
    aqi: number;
    category: string;
  }>;
  status: string;
  message?: string;
}

export interface CitiesResponse {
  cities: string[];
  status: string;
  count: number;
}

export class DjangoApiService {
  private static baseUrl = DJANGO_API_URL;
  private static readonly WAKE_UP_TIMEOUT = 45000; // 45 seconds for wake-up

  static async predictAQI(data: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseUrl}/predict/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      // Longer timeout for potential wake-up
      signal: AbortSignal.timeout(this.WAKE_UP_TIMEOUT),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Django API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  static async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(this.WAKE_UP_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  }

  static async getCities(): Promise<CitiesResponse> {
    const response = await fetch(`${this.baseUrl}/cities/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Cities API error: ${response.status}`);
    }

    return response.json();
  }
}
