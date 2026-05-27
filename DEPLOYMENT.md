# 🚀 Deployment Guide для site-1.phfk.college

## 📋 Архітектура

```
Cloudflare Tunnel (HTTPS site-1.phfk.college)
           ↓
    localhost:20001 (Frontend Container)
           ↓
    Next.js rewrites:
    - /api/v1/* → backend:8080/api/v1/*
    - /images/* → backend:8080/images/*
           ↓
    Backend Container (8080, internal)
           ↓
    MySQL Container (3306, internal)
```

## 🔧 Підготовка до деплою

### 1. Налаштування OAuth2 Redirect URIs

Додай наступний Authorized Redirect URI в Google Cloud Console:

```
https://site-1.phfk.college/login/oauth2/code/google
```

**Де налаштувати:**
- Google Cloud Console → APIs & Services → Credentials
- Вибери свій OAuth 2.0 Client ID
- Додай URI в "Authorized redirect URIs"

### 2. Налаштування Cloudflare Tunnel

Переконайся що Cloudflare Tunnel налаштований на:
- **Public hostname**: `site-1.phfk.college`
- **Service**: `http://localhost:20001`

### 3. Перевірка .env файлу

Файл `.env` вже створений з production конфігурацією. Перевір що всі значення коректні:

```bash
cat .env
```

**Важливі параметри:**
- `DOMAIN=site-1.phfk.college`
- `FRONTEND_PORT=20001`
- `CORS_ALLOWED_ORIGINS=https://site-1.phfk.college`
- `OAUTH2_REDIRECT_URI=https://site-1.phfk.college/oauth2/redirect`
- `NEXT_PUBLIC_API_URL=https://site-1.phfk.college/api/v1`

## 🐳 Запуск Docker Compose

### Перший запуск (build + start)

```bash
docker-compose up -d --build
```

### Перевірка статусу

```bash
docker-compose ps
```

### Перегляд логів

```bash
# Всі сервіси
docker-compose logs -f

# Тільки backend
docker-compose logs -f backend

# Тільки frontend
docker-compose logs -f frontend
```

### Зупинка

```bash
docker-compose down
```

### Зупинка з видаленням volumes (⚠️ видалить дані БД)

```bash
docker-compose down -v
```

## 🔍 Перевірка після деплою

1. **Frontend**: https://site-1.phfk.college
2. **Backend API**: https://site-1.phfk.college/api/v1/health (якщо є health endpoint)
3. **OAuth2 Login**: Спробуй увійти через Google

## 🛠️ Troubleshooting

### Backend не може підключитися до MySQL

```bash
docker-compose logs mysql
docker-compose restart backend
```

### Frontend не може підключитися до Backend

Перевір що `BACKEND_INTERNAL_URL=http://backend:8080` в `.env`

### OAuth2 redirect не працює

1. Перевір що в Google Console додано правильний redirect URI
2. Перевір що `OAUTH2_REDIRECT_URI` в `.env` правильний
3. Перевір логи backend: `docker-compose logs -f backend`

### CORS помилки

Перевір що `CORS_ALLOWED_ORIGINS=https://site-1.phfk.college` в `.env`

## 📦 Backup та Restore

### Backup MySQL

```bash
docker exec resto-order-hub-mysql mysqldump -u resto_user -p resto_order_hub > backup.sql
```

### Restore MySQL

```bash
docker exec -i resto-order-hub-mysql mysql -u resto_user -p resto_order_hub < backup.sql
```

## 🔄 Оновлення додатку

```bash
# Зупинити контейнери
docker-compose down

# Оновити код (git pull, etc.)
git pull

# Перебудувати та запустити
docker-compose up -d --build
```

## 📝 Важливі нотатки

- **FLYWAY_CLEAN_ENABLED=false** - захист від випадкового видалення даних
- **MySQL порт 3306** - не exposed назовні, тільки internal
- **Backend порт 8080** - не exposed назовні, тільки internal
- **Frontend порт 20001** - exposed для Cloudflare Tunnel
- Всі секрети в `.env` файлі (не комітити в git!)
