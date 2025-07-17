# Gunicorn configuration file
import os

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', '10000')}"
backlog = 2048

# Worker processes
workers = 1  # Use only 1 worker for free tier
worker_class = "sync"
worker_connections = 1000
timeout = 120  # 2 minutes timeout instead of default 30 seconds
keepalive = 2

# Restart workers after this many requests, to prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Process naming
proc_name = "aqi_backend"

# Server mechanics
preload_app = True
daemon = False
pidfile = "/tmp/gunicorn.pid"
user = None
group = None
tmp_upload_dir = None

# SSL
keyfile = None
certfile = None
