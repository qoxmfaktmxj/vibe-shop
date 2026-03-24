# shop.minseok91.cloud 배포 가이드 (Docker)

## 1) 배포 환경 변수 준비

```bash
cd /root/.openclaw/workspace/vibe-shop
cp .env.deploy.example .env.deploy
```

`.env.deploy`에서 최소한 아래 값 수정:

- `POSTGRES_PASSWORD`
- `DB_PASSWORD` (보통 `POSTGRES_PASSWORD`와 동일)
- 필요 시 포트

## 2) 컨테이너 배포

```bash
docker compose --env-file .env.deploy -f compose.deploy.yaml up -d --build
docker compose --env-file .env.deploy -f compose.deploy.yaml ps
```

## 3) Nginx 리버스 프록시

`/etc/nginx/sites-available/shop.minseok91.cloud`:

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
```

활성화:

```bash
ln -s /etc/nginx/sites-available/shop.minseok91.cloud /etc/nginx/sites-enabled/shop.minseok91.cloud
nginx -t
systemctl reload nginx
```

## 4) SSL 인증서 (DNS 연결 후)

A 레코드가 서버 IP를 가리키는 상태에서:

```bash
certbot --nginx -d shop.minseok91.cloud
```

## 5) 헬스체크

- API 내부: `http://127.0.0.1:38080/actuator/health`
- 외부: `https://shop.minseok91.cloud`

## 6) 업데이트 배포

```bash
cd /root/.openclaw/workspace/vibe-shop
git fetch origin
git checkout main
git pull --ff-only origin main
docker compose --env-file .env.deploy -f compose.deploy.yaml up -d --build
```
