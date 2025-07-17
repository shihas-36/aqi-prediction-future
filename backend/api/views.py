from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging
import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.preprocessing import StandardScaler
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Global variables for data and model caching
_data_cache = None
_last_load_time = None

def load_data():
    """Load and preprocess the AQI data"""
    global _data_cache, _last_load_time
    
    # Cache data for 1 hour
    if _data_cache is not None and _last_load_time is not None:
        if (datetime.now() - _last_load_time).seconds < 3600:
            return _data_cache
    
    # Load data
    # Try multiple possible paths for the data file
    possible_paths = [
        os.path.join(os.path.dirname(__file__), '..', 'data1.csv'),
        os.path.join(os.path.dirname(__file__), '..', 'data.csv'),
        os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data.csv'),
        'data1.csv',
        'data.csv'
    ]
    
    data_path = None
    for path in possible_paths:
        if os.path.exists(path):
            data_path = path
            break
    
    if data_path is None:
        raise FileNotFoundError("Data file not found in any of the expected locations")
    
    data = pd.read_csv(data_path)
    
    # Clean column names
    data.columns = data.columns.str.strip().str.lower()
    
    # Ensure pollutant values are floats
    for col in ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co']:
        if col in data.columns:
            data[col] = (
                data[col]
                .astype(str)
                .str.extract(r'([\d\.]+)')[0]
                .astype(float)
            )
    
    data['date'] = pd.to_datetime(data['date'], format='mixed')
    
    # Extract features from 'date'
    data['day'] = data['date'].dt.day
    data['month'] = data['date'].dt.month
    data['year'] = data['date'].dt.year
    
    # Remove early years
    data = data[~data['year'].isin([2015, 2016, 2017, 2018])]
    
    # Handle missing values
    for col in ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co']:
        for city in data['city'].unique():
            med_val = data[data['city'] == city][col].median()
            data.loc[
                (data['city'] == city) & (data[col].isnull()),
                col
            ] = med_val
    
    # Remove outliers
    cols = ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co']
    for col in cols:
        for city in data['city'].unique():
            city_data = data[data['city'] == city][col]
            Q1 = city_data.quantile(0.25)
            Q3 = city_data.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            data.loc[data['city'] == city, col] = city_data.clip(lower_bound, upper_bound)
    
    # Drop duplicates
    data.drop_duplicates(inplace=True)
    
    # Calculate AQI
    data['aqi'] = data.apply(calculate_aqi, axis=1)
    
    _data_cache = data
    _last_load_time = datetime.now()
    
    return data

def calculate_aqi(row):
    """Calculate AQI based on pollutant values"""
    # Define breakpoint tables for each pollutant (CPCB India standard)
    breakpoints = {
        'pm25': [
            (0, 30, 0, 50), (31, 60, 51, 100), (61, 90, 101, 200),
            (91, 120, 201, 300), (121, 250, 301, 400), (251, 350, 401, 500)
        ],
        'pm10': [
            (0, 50, 0, 50), (51, 100, 51, 100), (101, 250, 101, 200),
            (251, 350, 201, 300), (351, 430, 301, 400), (431, 500, 401, 500)
        ],
        'o3': [
            (0, 50, 0, 50), (51, 100, 51, 100), (101, 168, 101, 200),
            (169, 208, 201, 300), (209, 748, 301, 400), (749, 1000, 401, 500)
        ],
        'no2': [
            (0, 40, 0, 50), (41, 80, 51, 100), (81, 180, 101, 200),
            (181, 280, 201, 300), (281, 400, 301, 400), (401, 500, 401, 500)
        ],
        'so2': [
            (0, 40, 0, 50), (41, 80, 51, 100), (81, 380, 101, 200),
            (381, 800, 201, 300), (801, 1600, 301, 400), (1601, 2000, 401, 500)
        ],
        'co': [
            (0, 1, 0, 50), (1.1, 2, 51, 100), (2.1, 10, 101, 200),
            (10.1, 17, 201, 300), (17.1, 34, 301, 400), (34.1, 50, 401, 500)
        ]
    }
    
    def calc_subindex(pollutant, value):
        for bp_low, bp_high, index_low, index_high in breakpoints[pollutant]:
            if bp_low <= value <= bp_high:
                return ((index_high - index_low) / (bp_high - bp_low)) * (value - bp_low) + index_low
        return None
    
    sub_indices = {}
    for pollutant in ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co']:
        if pollutant in row and pd.notna(row[pollutant]):
            value = row[pollutant]
            sub_index = calc_subindex(pollutant, value)
            if sub_index is not None:
                sub_indices[pollutant] = round(sub_index)
    
    return max(sub_indices.values()) if sub_indices else None

def get_aqi_category(aqi):
    """Get AQI category based on value"""
    if pd.isna(aqi):
        return 'Unknown'
    elif aqi <= 50:
        return 'Good'
    elif aqi <= 100:
        return 'Moderate'
    elif aqi <= 150:
        return 'Unhealthy for Sensitive Groups'
    elif aqi <= 200:
        return 'Unhealthy'
    elif aqi <= 300:
        return 'Very Unhealthy'
    else:
        return 'Hazardous'

def predict_city_aqi(city_name, target_date):
    """Predict AQI for a city on a specific date"""
    data = load_data()
    
    # Filter city data
    df_city = data[data['city'].str.lower() == city_name.lower()][['date', 'aqi']].copy()
    
    if df_city.empty:
        return None, f"City '{city_name}' not found in data"
    
    # Prepare for Prophet
    df_city = df_city.rename(columns={'date': 'ds', 'aqi': 'y'})
    df_city = df_city.set_index('ds').asfreq('D')
    df_city['y'] = df_city['y'].interpolate()
    df_city = df_city.reset_index()
    
    # Train Prophet model
    model = Prophet()
    model.fit(df_city)
    
    # Make future dataframe
    future = model.make_future_dataframe(periods=60)
    forecast = model.predict(future)
    
    # Find prediction for target date
    target_forecast = forecast[forecast['ds'] == pd.to_datetime(target_date)]
    
    if not target_forecast.empty:
        predicted_aqi = round(target_forecast['yhat'].values[0], 2)
        category = get_aqi_category(predicted_aqi)
        return predicted_aqi, category
    
    return None, "Date out of range"

@csrf_exempt
@require_http_methods(["POST"])
def predict_aqi(request):
    """
    API endpoint to predict AQI for a given city and date.
    """
    try:
        # Parse request data
        data = json.loads(request.body)
        city = data.get('city', '').strip()
        date = data.get('date', None)
        
        logger.info(f"Received prediction request for city: {city}, date: {date}")
        
        if not city:
            return JsonResponse({
                'error': 'City name is required',
                'status': 'error'
            }, status=400)
        
        # Use today's date if not provided
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Generate 7-day predictions
        predictions = []
        start_date = datetime.strptime(date, '%Y-%m-%d')

        for i in range(-3, 4):
            pred_date = start_date + timedelta(days=i)
            pred_date_str = pred_date.strftime('%Y-%m-%d')
            
            predicted_aqi, category = predict_city_aqi(city, pred_date_str)
            
            if predicted_aqi is not None:
                predictions.append({
                    'date': pred_date_str,
                    'aqi': predicted_aqi,
                    'category': category
                })
            else:
                predictions.append({
                    'date': pred_date_str,
                    'aqi': None,
                    'category': 'Unknown'
                })
        
        response_data = {
            'city': city,
            'predictions': predictions,
            'status': 'success',
            'message': f'AQI predictions for {city} using ML model'
        }
        
        logger.info(f"Returning predictions for {city}")
        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request body")
        return JsonResponse({
            'error': 'Invalid JSON format',
            'status': 'error'
        }, status=400)
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JsonResponse({
            'error': f'Internal server error: {str(e)}',
            'status': 'error'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Health check endpoint to verify backend is running.
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'AQI Backend API is running',
        'timestamp': datetime.now().isoformat()
    })

@csrf_exempt
@require_http_methods(["GET"])
def get_cities(request):
    """
    Get list of available cities from the dataset.
    """
    try:
        data = load_data()
        cities = sorted(data['city'].unique().tolist())
        
        logger.info(f"Returning {len(cities)} cities")
        return JsonResponse({
            'cities': cities,
            'status': 'success',
            'count': len(cities)
        })
        
    except Exception as e:
        logger.error(f"Error getting cities: {str(e)}")
        return JsonResponse({
            'error': f'Failed to get cities: {str(e)}',
            'status': 'error'
        }, status=500)
