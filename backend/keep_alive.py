import requests
import time
import schedule
from datetime import datetime

# Your deployed backend URL (replace with actual URL after deployment)
BACKEND_URL = "https://your-app-name.onrender.com/api/health/"

def ping_server():
    """Ping the server to keep it awake"""
    try:
        response = requests.get(BACKEND_URL, timeout=10)
        print(f"[{datetime.now()}] Ping successful: {response.status_code}")
    except Exception as e:
        print(f"[{datetime.now()}] Ping failed: {e}")

# Schedule pings every 14 minutes (before the 15-minute sleep)
schedule.every(14).minutes.do(ping_server)

if __name__ == "__main__":
    print("Keep-alive service started...")
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute
