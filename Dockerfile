FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ENV REACT_APP_API_URL=""
RUN npm run build

FROM python:3.11-slim
RUN apt-get update && apt-get install -y nginx mariadb-server && rm -rf /var/lib/apt/lists/*

# Init MariaDB with proper permissions
RUN mysql_install_db --user=mysql --datadir=/var/lib/mysql && \
    mysqld_safe --datadir=/var/lib/mysql & sleep 3 && \
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY ''; FLUSH PRIVILEGES; CREATE DATABASE job_portal;" && \
    mysqladmin shutdown

# Backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Database init
COPY database/job_portal.sql /init.sql

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
    location ~ ^/(register|login|jobs|job|add-job|external-jobs)  {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
    }
}
EOF

# Startup script
COPY <<'EOF' /start.sh
#!/bin/bash
mysqld_safe --datadir=/var/lib/mysql &
sleep 3
mysql job_portal < /init.sql 2>/dev/null || true
nginx
exec gunicorn app:app --bind 0.0.0.0:5000 --chdir /app
EOF
RUN chmod +x /start.sh

ENV DATABASE_URL=mysql+pymysql://root@localhost/job_portal
EXPOSE 80 5000
CMD ["/start.sh"]
