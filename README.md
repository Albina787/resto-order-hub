# RestoOrderHub

Повнофункціональна система управління замовленнями для ресторанів з підтримкою QR-кодів, онлайн-бронювання та управління меню.

## 🚀 Огляд проєкту

RestoOrderHub - це сучасна платформа для автоматизації роботи ресторанів, яка включає:

- **Система замовлень через QR-коди** - гості можуть сканувати QR-код на столику та робити замовлення зі свого телефону
- **Онлайн бронювання столиків** - зручна система резервації з вибором дати, часу та кількості гостей
- **Управління меню** - повний CRUD для категорій, страв, цін та наявності
- **Панель управління для персоналу** - окремі інтерфейси для офіціантів, кухарів та менеджерів
- **OAuth2 авторизація** - вхід через Google та Facebook
- **Мультиресторанність** - підтримка декількох ресторанів в одній системі

## 🏗️ Архітектура

Проєкт складається з трьох основних компонентів:

```
resto-order-hub/
├── backend/          # Spring Boot REST API
├── frontend/         # Next.js 15 (App Router)
└── docker-compose.yml
```

### Backend
- **Framework**: Spring Boot 3.4.2
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT
- **Migrations**: Flyway
- **API Docs**: SpringDoc OpenAPI (Swagger)

### Frontend
- **Framework**: Next.js 15.5.15 (App Router)
- **UI**: React 19 + React Aria Components
- **State**: Redux Toolkit + RTK Query
- **Styling**: CSS Modules

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Next.js rewrites (API proxy)
- **Database**: MySQL 8.0 with persistent volumes

## 🚀 Швидкий старт

### Вимоги

- Docker & Docker Compose
- Node.js 22+ (для локальної розробки)
- Java 21+ (для локальної розробки)
- Maven 3.9+ (для локальної розробки)

### Запуск через Docker Compose

1. Клонуйте репозиторій:
```bash
git clone <repository-url>
cd resto-order-hub
```

2. Скопіюйте `.env.example` в `.env` та налаштуйте змінні:
```bash
cp .env.example .env
```

3. Запустіть всі сервіси:
```bash
docker-compose up -d --build
```

4. Відкрийте браузер:
- Frontend: http://localhost:20001
- Backend API: http://localhost:20001/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html

### Локальна розробка

Дивіться детальні інструкції в:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## 📚 Документація

- [Deployment Guide](./DEPLOYMENT.md) - Інструкції для production деплою
- [Backend API Documentation](./backend/README.md) - REST API endpoints
- [Frontend Documentation](./frontend/README.md) - Компоненти та архітектура

## 🔐 Змінні оточення

Основні змінні в `.env`:

```env
# Domain
DOMAIN=site-1.phfk.college
FRONTEND_PORT=20001

# Database
MYSQL_ROOT_PASSWORD=your-password
MYSQL_DATABASE=resto_order_hub
MYSQL_USER=resto_user
MYSQL_PASSWORD=your-password

# JWT
JWT_SECRET=your-256-bit-secret

# OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH2_REDIRECT_URI=https://site-1.phfk.college/oauth2/redirect

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

## 🎯 Основні функції

### Для гостей
- Сканування QR-коду столика
- Перегляд меню з фото та описами
- Створення замовлень
- Відстеження статусу замовлення в реальному часі
- Виклик офіціанта
- Онлайн бронювання столиків

### Для офіціантів
- Перегляд активних замовлень
- Управління столиками
- Створення замовлень для гостей
- Обробка викликів

### Для кухарів
- Перегляд активних замовлень
- Оновлення статусу приготування страв
- Критичні сповіщення (замовлення > 30 хв)
- Статистика кухні

### Для менеджерів
- Управління меню (категорії, страви)
- Управління столиками та планами залу
- Управління персоналом
- Перегляд бронювань
- Статистика та звіти

## 🛠️ Технології

### Backend
- Spring Boot 3.4.2
- Spring Security + JWT
- Spring Data JPA
- Flyway Migrations
- MySQL 8.0
- MapStruct
- Lombok
- SpringDoc OpenAPI
- OAuth2 Client (Google, Facebook)
- JavaMail

### Frontend
- Next.js 15.5.15 (App Router)
- React 19
- Redux Toolkit + RTK Query
- React Aria Components
- CSS Modules
- Axios
- React Hook Form + Zod
- Lucide Icons
- React Big Calendar
- Recharts

### DevOps
- Docker & Docker Compose
- Flyway Migrations
- Multi-stage Docker builds
- Health checks
- Volume persistence

## 📦 Структура бази даних

Основні таблиці:
- `users` - Користувачі системи
- `restaurants` - Ресторани
- `categories` - Категорії меню
- `menu_items` - Страви
- `restaurant_tables` - Столики
- `reservations` - Бронювання
- `orders` - Замовлення
- `order_items` - Позиції замовлень
- `staff_assignments` - Призначення персоналу
- `floor_plans` - Плани залів
- `working_hours` - Графік роботи

## 🔒 Безпека

- JWT токени (Access + Refresh)
- HttpOnly cookies для Refresh токенів
- OAuth2 інтеграція (Google, Facebook)
- CORS налаштування
- Password hashing (BCrypt)
- Email верифікація
- Role-based access control (CLIENT, WAITER, CHEF, MANAGER, ADMIN)

## 🌐 API Endpoints

Основні групи endpoints:

- `/api/v1/auth` - Авторизація та реєстрація
- `/api/v1/users` - Управління користувачами
- `/api/v1/restaurants` - Ресторани
- `/api/v1/menu` - Меню та категорії
- `/api/v1/orders` - Замовлення
- `/api/v1/reservations` - Бронювання
- `/api/v1/tables` - Столики
- `/api/v1/kitchen` - Кухня
- `/api/v1/waiter-calls` - Виклики офіціантів

Повна документація: http://localhost:8080/swagger-ui.html

## 🚀 Production Deployment

Дивіться [DEPLOYMENT.md](./DEPLOYMENT.md) для детальних інструкцій з деплою на production сервер з Cloudflare Tunnel.

## 📝 Ліцензія

Цей проєкт є приватним та призначений для внутрішнього використання.

## 👥 Автори

RestoOrderHub Team

## 🤝 Контрибуція

Цей проєкт є приватним. Для контрибуції зв'яжіться з власником репозиторію.
