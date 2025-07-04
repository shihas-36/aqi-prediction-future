
// Django API service
const DJANGO_API_URL = process.env.REACT_APP_DJANGO_API_URL || "http://localhost:8000/api";

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

export class DjangoApiService {
  private static baseUrl = DJANGO_API_URL;

  static async predictAQI(data: PredictionRequest): Promise<PredictionResponse> {
    const response = await fetch(`${this.baseUrl}/predict/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers if needed
        // "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  }
}
