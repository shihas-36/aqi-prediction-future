from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.predict_aqi, name='predict_aqi'),
    path('health/', views.health_check, name='health_check'),
    path('cities/', views.get_cities, name='get_cities'),
]
