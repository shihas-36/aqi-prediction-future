import React, { useState, useEffect } from 'react';
import { DjangoApiService, PredictionResponse } from './services/djangoApi';
import AQIChart from './components/AQIChart';

const SimpleApp = () => {
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('chart'); // Default to chart view
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  // Keep-alive mechanism to prevent Render server from sleeping
  useEffect(() => {
    const keepServerAwake = async () => {
      try {
        await DjangoApiService.healthCheck();
        console.log('Keep-alive ping sent to server');
      } catch (error) {
        console.log('Keep-alive ping failed (server may be sleeping):', error);
      }
    };

    // Send keep-alive ping every 10 minutes (600,000 ms)
    const keepAliveInterval = setInterval(keepServerAwake, 10 * 60 * 1000);

    // Initial ping after 30 seconds to let the app load first
    const initialPing = setTimeout(keepServerAwake, 30000);

    // Cleanup intervals when component unmounts
    return () => {
      clearInterval(keepAliveInterval);
      clearTimeout(initialPing);
    };
  }, []);

  // Load cities when component mounts
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await DjangoApiService.getCities();
        setCities(response.cities);
      } catch (err) {
        console.error('Failed to load cities:', err);
        setError('Failed to load cities from server');
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  const handleSubmit = async () => {
    if (!city.trim()) {
      setError('Please select a city');
      return;
    }

    setLoading(true);
    setError(null);
    setPredictions(null);

    try {
      const response = await DjangoApiService.predictAQI({
        city: city.trim(),
        date: date || null
      });
      setPredictions(response);
    } catch (err) {
      console.error('API Error:', err);
      
      if (err instanceof Error) {
        const errorMessage = err.message;
        
        // Check if it's a city not found error
        if (errorMessage.includes('City') && errorMessage.includes('not found')) {
          setError(`City "${city}" not found in our database. Please try selecting a different city.`);
        } else if (errorMessage.includes('400')) {
          setError('Invalid city selection. Please select a valid city from the dropdown.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('An error occurred while fetching predictions');
      }
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#8b5cf6';
    return '#7c2d12';
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #e0e7ff 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1e40af',
          marginBottom: '20px'
        }}>
          AQI Predictor
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#64748b',
          marginBottom: '40px'
        }}>
          Get accurate 7-day air quality predictions for any city
        </p>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#1f2937'
          }}>
            City Prediction
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: '#374151'
              }}>
                City Name
              </label>
              {loadingCities ? (
                <div style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  color: '#6b7280'
                }}>
                  Loading cities...
                </div>
              ) : (
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select a city...</option>
                  {cities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              )}
              <div style={{
                marginTop: '8px',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                {cities.length > 0 ? `${cities.length} cities available` : 'Loading available cities...'}
              </div>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '8px',
                color: '#374151'
              }}>
                Date (Optional)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {loading ? 'Loading... (Server may be waking up, please wait 30-45 seconds)' : 'Get AQI Prediction'}
          </button>

          {error && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
        </div>

        {predictions && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                AQI Predictions for {predictions.city}
              </h2>
              
              <div style={{
                display: 'flex',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                padding: '4px'
              }}>
                <button
                  onClick={() => setViewMode('chart')}
                  style={{
                    backgroundColor: viewMode === 'chart' ? '#2563eb' : 'transparent',
                    color: viewMode === 'chart' ? 'white' : '#6b7280',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  📈 Chart
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  style={{
                    backgroundColor: viewMode === 'cards' ? '#2563eb' : 'transparent',
                    color: viewMode === 'cards' ? 'white' : '#6b7280',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  🔲 Cards
                </button>
              </div>
            </div>
            
            {viewMode === 'chart' ? (
              <AQIChart 
                data={predictions.predictions.map(p => ({
                  date: p.date,
                  aqi: p.aqi
                }))}
                city={predictions.city}
              />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '15px'
              }}>
                {predictions.predictions.map((prediction, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: `2px solid ${getAQIColor(prediction.aqi)}`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontWeight: '500', color: '#1f2937' }}>
                        {new Date(prediction.date).toLocaleDateString()}
                      </span>
                      <span style={{
                        backgroundColor: getAQIColor(prediction.aqi),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        AQI {prediction.aqi}
                      </span>
                    </div>
                    <div style={{
                      color: '#64748b',
                      fontSize: '0.875rem'
                    }}>
                      {getAQICategory(prediction.aqi)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#1f2937'
          }}>
            AQI Categories
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#22c55e',
                borderRadius: '50%'
              }}></div>
              <div>
                <div style={{ fontWeight: '500', color: '#15803d' }}>Good (0-50)</div>
                <div style={{ fontSize: '0.875rem', color: '#16a34a' }}>Air quality is satisfactory</div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              backgroundColor: '#fffbeb',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#eab308',
                borderRadius: '50%'
              }}></div>
              <div>
                <div style={{ fontWeight: '500', color: '#a16207' }}>Moderate (51-100)</div>
                <div style={{ fontSize: '0.875rem', color: '#ca8a04' }}>Acceptable for most people</div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              backgroundColor: '#fff7ed',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#f97316',
                borderRadius: '50%'
              }}></div>
              <div>
                <div style={{ fontWeight: '500', color: '#c2410c' }}>Unhealthy (101+)</div>
                <div style={{ fontSize: '0.875rem', color: '#ea580c' }}>May cause health issues</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
