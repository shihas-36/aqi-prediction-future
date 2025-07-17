"""
URL configuration for aqi_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({"status": "Django API is running", "message": "Use /api/ endpoints"})

urlpatterns = [
    path('', root_view, name='root'),  # Add root URL handler
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
