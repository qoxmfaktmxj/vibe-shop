Status: current
Owner: deploy
Last reviewed: 2026-03-24

# shop.minseok91.cloud Deployment Guide

This guide deploys all runtime services defined in `compose.deploy.yaml`:

- PostgreSQL
- API
- storefront web app (customer + admin routes)

## 1. Prepare environment variables

```bash
cd /root/.openclaw/workspace/vibe-shop
cp .env.deploy.example .env.deploy
```

At minimum, set these values in `.env.deploy`:

- `DOMAIN`
- `POSTGRES_PASSWORD`
- `DB_PASSWORD`
- `CORS_ALLOWED_ORIGINS`
- `APP_SESSION_COOKIE_SECURE`
- `APP_DEMO_SEED_ENABLED`
- `MANAGEMENT_HEALTH_SHOW_DETAILS`
- host ports if your server already uses the defaults

## 2. Build and start the stack

```bash
docker compose --env-file .env.deploy -f compose.deploy.yaml up -d --build
docker compose --env-file .env.deploy -f compose.deploy.yaml ps
```

## 3. Nginx reverse proxy

Create `/etc/nginx/sites-available/shop.minseok91.cloud`:

```nginx
server {
    listen 80;
    server_name shop.minseok91.cloud;

    location /api/ {
        proxy_pass http://127.0.0.1:38080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
```

Enable it:

```bash
ln -s /etc/nginx/sites-available/shop.minseok91.cloud /etc/nginx/sites-enabled/shop.minseok91.cloud
nginx -t
systemctl reload nginx
```

## 4. TLS

After DNS for both domains points at the server:

```bash
certbot --nginx -d shop.minseok91.cloud
```

## 5. Health checks

- API: `http://127.0.0.1:38080/actuator/health`
- storefront: `https://shop.minseok91.cloud`
- admin: `https://shop.minseok91.cloud/admin`

## 6. Rolling out updates

```bash
cd /root/.openclaw/workspace/vibe-shop
git fetch origin
git checkout main
git pull --ff-only origin main
docker compose --env-file .env.deploy -f compose.deploy.yaml up -d --build
```
