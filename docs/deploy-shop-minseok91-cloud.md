Status: current
Owner: deploy
Last reviewed: 2026-07-11

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
- `APP_RUNTIME_MODE`
- `APP_PAYMENT_MOCK_ENABLED`
- `NEXT_PUBLIC_DEMO_MODE`
- `MANAGEMENT_HEALTH_SHOW_DETAILS`
- host ports if your server already uses the defaults

이 저장소에는 실제 PG 어댑터가 아직 없으므로 데모 배포는 다음 조합을 명시적으로 사용한다.

```dotenv
APP_RUNTIME_MODE=demo
APP_PAYMENT_MOCK_ENABLED=true
NEXT_PUBLIC_DEMO_MODE=true
```

이 조합에서는 모든 스토어 화면 상단에 실제 주문·결제가 발생하지 않는다는 안내가 표시된다. 실제 개인정보를 입력하면 안 된다.

실서비스 배포는 `APP_RUNTIME_MODE=production`, `APP_PAYMENT_MOCK_ENABLED=false`, `NEXT_PUBLIC_DEMO_MODE=false`를 사용하고 실제 `PaymentGatewayAdapter` 구현을 먼저 설치해야 한다. production 모드에서 mock 결제를 활성화하면 API는 의도적으로 시작에 실패한다.

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
