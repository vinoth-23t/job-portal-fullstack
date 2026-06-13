FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ENV REACT_APP_API_URL="https://job-portal-fullstack-1-2ms0.onrender.com"
RUN npm run build

FROM python:3.11-slim
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Frontend static files
COPY --from=frontend-build /app/build /usr/share/nginx/html
COPY <<EOF /etc/nginx/sites-enabled/default
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files \$uri /index.html;
    }
    location ~ ^/(register|login|jobs|job|add-job|external-jobs|users|user|apply|my-applications|job-applications|profile|application) {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
    }
}
EOF

# Startup script
COPY <<'EOF' /start.sh
#!/bin/bash
nginx
exec gunicorn app:app --bind 0.0.0.0:5000 --chdir /app
EOF
RUN chmod +x /start.sh

ENV DATABASE_URL=sqlite:////app/job_portal.db
EXPOSE 80
CMD ["/start.sh"]
