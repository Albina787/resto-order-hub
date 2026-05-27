# Технічне завдання: Платформа бронювання столиків RestoOrderHub

## 1. Загальний опис проєкту

### 1.1 Назва проєкту

**RestoOrderHub** - вебплатформа для бронювання столиків з інтегрованою системою керування замовленнями для рестораного бізнесу.

### 1.2 Мета проєкту

Створення комплексної системи для автоматизації процесів бронювання столиків та управління замовленнями в мережі ресторанів, що забезпечить зручну взаємодію між клієнтами, персоналом ресторану та адміністрацією.

### 1.3 Цільова аудиторія

- **Клієнти** - відвідувачі ресторанів, які бронюють столики та замовляють страви
- **Менеджери ресторанів** - керують бронюваннями, столиками, меню
- **Офіціанти** - обробляють замовлення клієнтів
- **Кухарі** - отримують та обробляють замовлення на кухні
- **Власники ресторанів** - переглядають аналітику та звіти

### 1.4 Тип платформи

Мультитенантна система для мережі ресторанів одного власника з можливістю масштабування.

---

## 2. Технологічний стек

### 2.1 Backend

- **Мова програмування**: Java 21 LTS (OpenJDK)
- **Фреймворк**: Spring Boot 3.2+
- **Система збірки**: Apache Maven
- **Архітектура**: Монолітна з модульною структурою
- **API**: RESTful HTTP API
- **Безпека**: Spring Security з JWT-based автентифікацією
- **ORM**: Spring Data JPA
- **База даних**: MySQL 8.x
- **Контейнеризація**: Docker Compose
- **Документація API**: OpenAPI 3.0 / Swagger
- **Тестування**:
    - JUnit 5 (unit тести)
    - Mockito (мокування)
    - TestContainers (інтеграційні тести)

### 2.2 Frontend

- **Мова**: TypeScript
- **Фреймворк**: React 18
- **SSR/SSG**: Next.js 15
- **UI компоненти**: React Aria (accessibility-first)
- **Стилізація**: CSS Modules (без Tailwind)
- **Управління станом**: Redux Toolkit
- **API запити**: RTK Query
- **Форми**: React Hook Form
- **Валідація**: Zod
- **Іконки**: Lucide React

### 2.3 Інфраструктура

- **Контейнеризація**: Docker + Docker Compose
- **Версіонування**: Git
- **CI/CD**: GitHub Actions (рекомендовано)
- **Логування**: SLF4J + Logback
- **Моніторинг**: Spring Boot Actuator

### 2.4 Додаткові інструменти

- **Міграції БД**: Flyway або Liquibase
- **Валідація**: Jakarta Bean Validation
- **Маппінг об'єктів**: MapStruct
- **Lombok**: Для зменшення boilerplate коду

---

## 3. Ролі користувачів та права доступу

### 3.1 Гість (неавторизований користувач)

**Права доступу:**

- Перегляд списку ресторанів
- Перегляд меню ресторанів
- Перегляд доступних слотів для бронювання
- Реєстрація в системі

### 3.2 Клієнт (авторизований користувач)

**Права доступу:**

- Всі права гостя
- Створення бронювання столиків
- Перегляд своїх бронювань
- Скасування/перенесення бронювань (за 24 години)
- Попереднє замовлення страв при бронюванні (опціонально)
- Замовлення страв під час перебування в ресторані
- Виклик офіціанта через додаток
- Перегляд історії відвідувань та замовлень
- Управління профілем

### 3.3 Офіціант

**Права доступу:**

- Перегляд активних столиків та бронювань
- Створення замовлень для клієнтів
- Зміна статусу замовлень
- Перегляд меню
- Виклик від клієнтів

### 3.4 Кухар

**Права доступу:**

- Перегляд активних замовлень на кухні
- Зміна статусу приготування страв
- Позначення страв як готових
- Перегляд черги замовлень

### 3.5 Менеджер ресторану

**Права доступу:**

- Всі права офіціанта
- Управління бронюваннями (підтвердження, скасування)
- Управління столиками (додавання, редагування, видалення)
- Управління планом залу
- Управління меню (додавання, редагування, видалення страв)
- Управління робочим графіком ресторану
- Управління слотами бронювання
- Перегляд звітів по ресторану
- Управління персоналом ресторану

### 3.6 Власник ресторану

**Права доступу:**

- Всі права менеджера
- Перегляд аналітики по всіх ресторанах мережі
- Перегляд фінансових звітів
- Управління ресторанами (додавання нових)
- Призначення менеджерів ресторанів
- Налаштування глобальних параметрів



## 4. Функціональні вимоги

### 4.1 Модуль автентифікації та авторизації

#### 4.1.1 Реєстрація користувачів

**Способи реєстрації:**

- Email + пароль
- Google OAuth 2.0
- Facebook OAuth 2.0

**Поля реєстрації (email/пароль):**

- Ім'я (обов'язкове)
- Прізвище (обов'язкове)
- Email (обов'язкове, унікальне)
- Пароль (мінімум 8 символів, обов'язкове)
- Номер телефону (опціонально)

**Бізнес-правила:**

- Email повинен бути унікальним в системі
- Підтвердження email через лист з посиланням
- Пароль повинен містити: мінімум 1 велику літеру, 1 цифру, 1 спеціальний символ
- При реєстрації через OAuth автоматично створюється профіль користувача

#### 4.1.2 Авторизація

**Механізм:**

- JWT (JSON Web Token) based автентифікація
- Access Token (термін дії: 15 хвилин)
- Refresh Token (термін дії: 7 днів)

**Ендпойнти:**

- `POST /api/v1/auth/register` - реєстрація
- `POST /api/v1/auth/login` - вхід
- `POST /api/v1/auth/logout` - вихід
- `POST /api/v1/auth/refresh` - оновлення токену
- `POST /api/v1/auth/forgot-password` - відновлення паролю
- `POST /api/v1/auth/reset-password` - скидання паролю
- `GET /api/v1/auth/verify-email` - підтвердження email
- `POST /api/v1/auth/oauth/google` - авторизація через Google
- `POST /api/v1/auth/oauth/facebook` - авторизація через Facebook

### 4.2 Модуль управління ресторанами

#### 4.2.1 Сутність Restaurant

**Поля:**

- `id` (UUID, PK)
- `name` (String, обов'язкове)
- `description` (Text, опціонально)
- `address` (String, обов'язкове)
- `city` (String, обов'язкове)
- `phone` (String, обов'язкове)
- `email` (String, обов'язкове)
- `cuisineType` (String, опціонально)
- `priceRange` (Enum: BUDGET, MODERATE, EXPENSIVE, LUXURY)
- `capacity` (Integer, загальна кількість місць)
- `images` (List<String>, URLs фотографій)
- `isActive` (Boolean, статус активності)
- `ownerId` (UUID, FK до User)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Ендпойнти:**

- `GET /api/v1/restaurants` - список ресторанів (публічний)
- `GET /api/v1/restaurants/{id}` - деталі ресторану (публічний)
- `POST /api/v1/restaurants` - створення ресторану (власник)
- `PUT /api/v1/restaurants/{id}` - оновлення ресторану (менеджер/власник)
- `DELETE /api/v1/restaurants/{id}` - видалення ресторану (власник)
- `GET /api/v1/restaurants/{id}/stats` - статистика ресторану (менеджер/власник)

#### 4.2.2 Робочий графік ресторану (WorkingHours)

**Поля:**

- `id` (UUID, PK)
- `restaurantId` (UUID, FK)
- `dayOfWeek` (Enum: MONDAY, TUESDAY, ..., SUNDAY)
- `openTime` (Time)
- `closeTime` (Time)
- `isClosed` (Boolean, вихідний день)

**Ендпойнти:**

- `GET /api/v1/restaurants/{id}/working-hours` - графік роботи
- `PUT /api/v1/restaurants/{id}/working-hours` - оновлення графіку (менеджер/власник)

### 4.3 Модуль управління столиками

#### 4.3.1 Сутність Table

**Поля:**

- `id` (UUID, PK)
- `restaurantId` (UUID, FK)
- `tableNumber` (String, обов'язкове)
- `capacity` (Integer, кількість місць)
- `minCapacity` (Integer, мінімальна кількість гостей)
- `maxCapacity` (Integer, максимальна кількість гостей)
- `location` (Enum: INDOOR, OUTDOOR, TERRACE, VIP)
- `shape` (Enum: SQUARE, ROUND, RECTANGULAR)
- `positionX` (Integer, координата на плані залу)
- `positionY` (Integer, координата на плані залу)
- `isActive` (Boolean)
- `isAvailable` (Boolean, доступний для бронювання)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Ендпойнти:**

- `GET /api/v1/restaurants/{restaurantId}/tables` - список столиків
- `GET /api/v1/restaurants/{restaurantId}/tables/{id}` - деталі столика
- `POST /api/v1/restaurants/{restaurantId}/tables` - створення столика (менеджер/власник)
- `PUT /api/v1/restaurants/{restaurantId}/tables/{id}` - оновлення столика (менеджер/власник)
- `DELETE /api/v1/restaurants/{restaurantId}/tables/{id}` - видалення столика (менеджер/власник)
- `GET /api/v1/restaurants/{restaurantId}/tables/available` - доступні столики для бронювання
- `PUT /api/v1/restaurants/{restaurantId}/tables/{id}/status` - зміна статусу столика

#### 4.3.2 План залу (FloorPlan)

**Поля:**

- `id` (UUID, PK)
- `restaurantId` (UUID, FK)
- `name` (String, назва залу)
- `width` (Integer, ширина плану)
- `height` (Integer, висота плану)
- `backgroundImage` (String, URL зображення)
- `isActive` (Boolean)

**Ендпойнти:**

- `GET /api/v1/restaurants/{restaurantId}/floor-plans` - список планів залу
- `POST /api/v1/restaurants/{restaurantId}/floor-plans` - створення плану (менеджер/власник)
- `PUT /api/v1/restaurants/{restaurantId}/floor-plans/{id}` - оновлення плану (менеджер/власник)
- `DELETE /api/v1/restaurants/{restaurantId}/floor-plans/{id}` - видалення плану (менеджер/власник)

### 4.4 Модуль бронювання

#### 4.4.1 Сутність Reservation

**Поля:**

- `id` (UUID, PK)
- `restaurantId` (UUID, FK)
- `userId` (UUID, FK, клієнт)
- `tableId` (UUID, FK, nullable - може бути призначений пізніше)
- `guestCount` (Integer, кількість гостей)
- `reservationDate` (Date, дата бронювання)
- `reservationTime` (Time, час початку)
- `duration` (Integer, тривалість в хвилинах, за замовчуванням 120)
- `status` (Enum: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
- `confirmationType` (Enum: AUTO, MANUAL)
- `specialRequests` (Text, особливі побажання)
- `customerName` (String)
- `customerPhone` (String)
- `customerEmail` (String)
- `cancellationReason` (Text, nullable)
- `cancelledAt` (Timestamp, nullable)
- `confirmedAt` (Timestamp, nullable)
- `confirmedBy` (UUID, FK до User, менеджер)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Статуси бронювання:**

- `PENDING` - очікує підтвердження
- `CONFIRMED` - підтверджено
- `CANCELLED` - скасовано
- `COMPLETED` - завершено
- `NO_SHOW` - клієнт не з'явився

**Ендпойнти:**

- `POST /api/v1/reservations` - створення бронювання (клієнт)
- `GET /api/v1/reservations` - список бронювань користувача (клієнт)
- `GET /api/v1/reservations/{id}` - деталі бронювання
- `PUT /api/v1/reservations/{id}` - оновлення бронювання (клієнт, до 24 годин)
- `DELETE /api/v1/reservations/{id}` - скасування бронювання (клієнт, до 24 годин)
- `GET /api/v1/restaurants/{restaurantId}/reservations` - бронювання ресторану (менеджер/власник)
- `PUT /api/v1/reservations/{id}/confirm` - підтвердження бронювання (менеджер)
- `PUT /api/v1/reservations/{id}/cancel` - скасування менеджером
- `PUT /api/v1/reservations/{id}/assign-table` - призначення столика
- `GET /api/v1/restaurants/{restaurantId}/availability` - перевірка доступності слотів

#### 4.4.2 Бізнес-правила бронювання

1. **Створення бронювання:**
    - Клієнт може бронювати на будь-яку дату в майбутньому
    - Мінімальний час до бронювання: 1 година
    - Максимальний час наперед: 90 днів
    - Стандартна тривалість бронювання: 2 години
    - Клієнт може вказати кількість гостей та особливі побажання

2. **Підтвердження бронювання:**
    - Автоматичне підтвердження: якщо є вільні столики відповідної місткості
    - Ручне підтвердження менеджером: для VIP столиків або великих груп (>8 осіб)
    - Менеджер може призначити конкретний столик або залишити автоматичний вибір

3. **Скасування бронювання:**
    - Клієнт може скасувати за 24 години до бронювання
    - Менеджер може скасувати в будь-який час з вказанням причини
    - При скасуванні надсилається повідомлення клієнту

4. **Перенесення бронювання:**
    - Клієнт може перенести за 24 години до бронювання
    - Перенесення можливе тільки на доступні слоти

5. **Алгоритм призначення столиків:**
    - Система автоматично підбирає столик з оптимальною місткістю
    - Пріоритет: столики з місткістю найближчою до кількості гостей
    - Враховується локація (indoor/outdoor) якщо вказано в побажаннях

### 4.5 Модуль меню

#### 4.5.1 Сутність Category

**Поля:**

- `id` (UUID, PK)
- `restaurantId` (UUID, FK)
- `name` (String, обов'язкове)
- `description` (Text, опціонально)
- `displayOrder` (Integer, порядок відображення)
- `isActive` (Boolean)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Ендпойнти:**

- `GET /api/v1/restaurants/{restaurantId}/categories` - список категорій
- `POST /api/v1/restaurants/{restaurantId}/categories` - створення категорії (менеджер/власник)
- `PUT /api/v1/restaurants/{restaurantId}/categories/{id}` - оновлення категорії
- `DELETE /api/v1/restaurants/{restaurantId}/categories/{id}` - видалення категорії

#### 4.5.2 Сутність MenuItem

**Поля:**

- `id` (UUID, PK)
- `restaurantId` (UUID, FK)
- `categoryId` (UUID, FK)
- `name` (String, обов'язкове)
- `description` (Text)
- `price` (Decimal, обов'язкове)
- `images` (List<String>, URLs фотографій)
- `ingredients` (List<String>, список інгредієнтів)
- `allergens` (List<String>, алергени)
- `isVegetarian` (Boolean)
- `isVegan` (Boolean)
- `isGlutenFree` (Boolean)
- `spicyLevel` (Enum: NONE, MILD, MEDIUM, HOT, EXTRA_HOT)
- `preparationTime` (Integer, час приготування в хвилинах)
- `calories` (Integer, опціонально)
- `isAvailable` (Boolean, доступність)
- `isPopular` (Boolean, популярна страва)
- `displayOrder` (Integer)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Ендпойнти:**

- `GET /api/v1/restaurants/{restaurantId}/menu` - повне меню ресторану (публічний)
- `GET /api/v1/restaurants/{restaurantId}/menu-items` - список страв
- `GET /api/v1/restaurants/{restaurantId}/menu-items/{id}` - деталі страви
- `POST /api/v1/restaurants/{restaurantId}/menu-items` - створення страви (менеджер/власник)
- `PUT /api/v1/restaurants/{restaurantId}/menu-items/{id}` - оновлення страви
- `DELETE /api/v1/restaurants/{restaurantId}/menu-items/{id}` - видалення страви
- `PUT /api/v1/restaurants/{restaurantId}/menu-items/{id}/availability` - зміна доступності

### 4.6 Модуль замовлень

#### 4.6.1 Сутність Order

**Поля:**

- `id` (UUID, PK)
- `restaurantId` (UUID, FK)
- `reservationId` (UUID, FK, nullable - може бути без бронювання)
- `tableId` (UUID, FK, nullable)
- `userId` (UUID, FK, клієнт)
- `orderNumber` (String, унікальний номер замовлення)
- `orderType` (Enum: PRE_ORDER, DINE_IN)
- `status` (Enum: PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED)
- `totalAmount` (Decimal)
- `notes` (Text, коментарі до замовлення)
- `createdBy` (UUID, FK до User, хто створив)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `completedAt` (Timestamp, nullable)

**Типи замовлень:**

- `PRE_ORDER` - попереднє замовлення при бронюванні
- `DINE_IN` - замовлення під час перебування в ресторані

**Статуси замовлення:**

- `PENDING` - очікує підтвердження
- `CONFIRMED` - підтверджено
- `PREPARING` - готується на кухні
- `READY` - готове до подачі
- `SERVED` - подано клієнту
- `COMPLETED` - завершено
- `CANCELLED` - скасовано

#### 4.6.2 Сутність OrderItem

**Поля:**

- `id` (UUID, PK)
- `orderId` (UUID, FK)
- `menuItemId` (UUID, FK)
- `quantity` (Integer)
- `price` (Decimal, ціна на момент замовлення)
- `subtotal` (Decimal, quantity \* price)
- `status` (Enum: PENDING, PREPARING, READY, SERVED)
- `specialInstructions` (Text, особливі інструкції)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Ендпойнти:**

- `POST /api/v1/orders` - створення замовлення (клієнт/офіціант)
- `GET /api/v1/orders/{id}` - деталі замовлення
- `GET /api/v1/orders` - список замовлень користувача (клієнт)
- `PUT /api/v1/orders/{id}` - оновлення замовлення
- `DELETE /api/v1/orders/{id}` - скасування замовлення
- `GET /api/v1/restaurants/{restaurantId}/orders` - замовлення ресторану (персонал)
- `PUT /api/v1/orders/{id}/status` - зміна статусу замовлення
- `PUT /api/v1/orders/{id}/items/{itemId}/status` - зміна статусу позиції
- `GET /api/v1/kitchen/orders` - замовлення для кухні (кухар)
- `POST /api/v1/orders/{id}/items` - додавання позицій до замовлення

#### 4.6.3 Бізнес-правила замовлень

1. **Попереднє замовлення (PRE_ORDER):**
    - Клієнт може додати страви при створенні бронювання
    - Попереднє замовлення опціональне
    - Можна редагувати до 2 годин до бронювання
    - Автоматично передається на кухню за 30 хвилин до бронювання

2. **Замовлення в ресторані (DINE_IN):**
    - Клієнт може замовляти через додаток після підтвердження столика
    - Офіціант може створювати замовлення для клієнтів
    - Можна додавати позиції до існуючого замовлення
    - Кожна позиція має свій статус приготування

3. **Робота кухні:**
    - Кухарі бачать всі активні замовлення в черзі
    - Можуть змінювати статус кожної позиції окремо
    - Позиції сортуються за часом створення
    - Відображається час очікування для кожного замовлення

4. **Виклик офіціанта:**
    - Клієнт може викликати офіціанта через додаток
    - Офіціант отримує push-повідомлення з номером столика
    - Запит автоматично закривається після 15 хвилин

### 4.7 Модуль аналітики та звітів

#### 4.7.1 Звіти для менеджера ресторану

**Доступні звіти:**

- Статистика бронювань (за період)
- Популярні страви
- Завантаженість ресторану по днях/годинах
- Середній чек
- Кількість скасувань
- Час обробки замовлень

**Ендпойнти:**

- `GET /api/v1/restaurants/{restaurantId}/analytics/reservations` - аналітика бронювань
- `GET /api/v1/restaurants/{restaurantId}/analytics/orders` - аналітика замовлень
- `GET /api/v1/restaurants/{restaurantId}/analytics/popular-items` - популярні страви
- `GET /api/v1/restaurants/{restaurantId}/analytics/revenue` - аналітика доходів
- `GET /api/v1/restaurants/{restaurantId}/analytics/occupancy` - завантаженість

#### 4.7.2 Звіти для власника

**Доступні звіти:**

- Порівняльна аналітика по всіх ресторанах
- Загальний дохід мережі
- Найефективніші ресторани
- Тренди по мережі

**Ендпойнти:**

- `GET /api/v1/analytics/network/overview` - загальний огляд мережі
- `GET /api/v1/analytics/network/comparison` - порівняння ресторанів
- `GET /api/v1/analytics/network/trends` - тренди

### 4.8 Модуль користувачів

#### 4.8.1 Сутність User

**Поля:**

- `id` (UUID, PK)
- `email` (String, унікальне, обов'язкове)
- `passwordHash` (String, nullable для OAuth)
- `firstName` (String, обов'язкове)
- `lastName` (String, обов'язкове)
- `phone` (String, опціонально)
- `avatar` (String, URL)
- `role` (Enum: GUEST, CLIENT, WAITER, CHEF, MANAGER, OWNER)
- `isEmailVerified` (Boolean)
- `isActive` (Boolean)
- `authProvider` (Enum: LOCAL, GOOGLE, FACEBOOK)
- `providerId` (String, ID від OAuth провайдера)
- `lastLoginAt` (Timestamp)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Ендпойнти:**

- `GET /api/v1/users/me` - профіль поточного користувача
- `PUT /api/v1/users/me` - оновлення профілю
- `PUT /api/v1/users/me/password` - зміна паролю
- `DELETE /api/v1/users/me` - видалення акаунту

#### 4.8.2 Сутність StaffAssignment

**Поля:**

- `id` (UUID, PK)
- `userId` (UUID, FK)
- `restaurantId` (UUID, FK)
- `position` (Enum: WAITER, CHEF, MANAGER)
- `isActive` (Boolean)
- `assignedAt` (Timestamp)
- `assignedBy` (UUID, FK до User)

**Ендпойнти:**

- `POST /api/v1/restaurants/{restaurantId}/staff` - призначення персоналу (менеджер/власник)
- `GET /api/v1/restaurants/{restaurantId}/staff` - список персоналу
- `DELETE /api/v1/restaurants/{restaurantId}/staff/{id}` - видалення призначення

---

## 5. Нефункціональні вимоги

### 5.1 Продуктивність

- Час відгуку API: < 200ms для 95% запитів
- Підтримка одночасних користувачів: до 1000
- Час завантаження сторінки: < 2 секунди

### 5.2 Безпека

- HTTPS для всіх з'єднань
- JWT токени з коротким терміном дії
- Хешування паролів: BCrypt (strength 12)
- Захист від CSRF атак
- Rate limiting для API (100 запитів/хвилину на користувача)
- Валідація всіх вхідних даних
- SQL injection prevention через параметризовані запити
- XSS protection

### 5.3 Доступність (Availability)

- Uptime: 99.5%
- Резервне копіювання БД: щоденно
- Disaster recovery plan

### 5.4 Масштабованість

- Горизонтальне масштабування backend
- Підтримка до 50 ресторанів в мережі
- Можливість додавання нових ресторанів без downtime

### 5.5 Локалізація

- Підтримка української мови
- Формат дати: DD.MM.YYYY
- Формат часу: 24-годинний
- Валюта: UAH (₴)

### 5.6 Сумісність

- Браузери: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- Мобільні пристрої: iOS 14+, Android 10+
- Адаптивний дизайн для всіх розмірів екранів

---

## 6. Структура бази даних

### 6.1 Основні таблиці

#### users

- id (UUID, PK)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255))
- first_name (VARCHAR(100), NOT NULL)
- last_name (VARCHAR(100), NOT NULL)
- phone (VARCHAR(20))
- avatar (VARCHAR(500))
- role (ENUM, NOT NULL)
- is_email_verified (BOOLEAN, DEFAULT FALSE)
- is_active (BOOLEAN, DEFAULT TRUE)
- auth_provider (ENUM, DEFAULT 'LOCAL')
- provider_id (VARCHAR(255))
- last_login_at (TIMESTAMP)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Індекси:**

- UNIQUE INDEX idx_users_email (email)
- INDEX idx_users_role (role)
- INDEX idx_users_provider (auth_provider, provider_id)

#### restaurants

- id (UUID, PK)
- name (VARCHAR(255), NOT NULL)
- description (TEXT)
- address (VARCHAR(500), NOT NULL)
- city (VARCHAR(100), NOT NULL)
- phone (VARCHAR(20), NOT NULL)
- email (VARCHAR(255), NOT NULL)
- cuisine_type (VARCHAR(100))
- price_range (ENUM: 'BUDGET', 'MODERATE', 'EXPENSIVE', 'LUXURY')
- capacity (INT, NOT NULL)
- images (JSON)
- is_active (BOOLEAN, DEFAULT TRUE)
- owner_id (UUID, FK -> users.id)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Індекси:**

- INDEX idx_restaurants_owner (owner_id)
- INDEX idx_restaurants_city (city)
- INDEX idx_restaurants_active (is_active)

#### working_hours

- id (UUID, PK)
- restaurant_id (UUID, FK -> restaurants.id, NOT NULL)
- day_of_week (ENUM: 'MONDAY', 'TUESDAY', ..., 'SUNDAY', NOT NULL)
- open_time (TIME)
- close_time (TIME)
- is_closed (BOOLEAN, DEFAULT FALSE)

**Індекси:**

- UNIQUE INDEX idx_working_hours_restaurant_day (restaurant_id, day_of_week)

#### tables

- id (UUID, PK)
- restaurant_id (UUID, FK -> restaurants.id, NOT NULL)
- table_number (VARCHAR(50), NOT NULL)
- capacity (INT, NOT NULL)
- min_capacity (INT, NOT NULL)
- max_capacity (INT, NOT NULL)
- location (ENUM: 'INDOOR', 'OUTDOOR', 'TERRACE', 'VIP')
- shape (ENUM: 'SQUARE', 'ROUND', 'RECTANGULAR')
- position_x (INT)
- position_y (INT)
- is_active (BOOLEAN, DEFAULT TRUE)
- is_available (BOOLEAN, DEFAULT TRUE)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Індекси:**

- INDEX idx_tables_restaurant (restaurant_id)
- INDEX idx_tables_available (restaurant_id, is_available)
- UNIQUE INDEX idx_tables_number (restaurant_id, table_number)

#### floor_plans

- id (UUID, PK)
- restaurant_id (UUID, FK -> restaurants.id, NOT NULL)
- name (VARCHAR(255), NOT NULL)
- width (INT, NOT NULL)
- height (INT, NOT NULL)
- background_image (VARCHAR(500))
- is_active (BOOLEAN, DEFAULT TRUE)

**Індекси:**

- INDEX idx_floor_plans_restaurant (restaurant_id)

#### reservations

- id (UUID, PK)
- restaurant_id (UUID, FK -> restaurants.id, NOT NULL)
- user_id (UUID, FK -> users.id, NOT NULL)
- table_id (UUID, FK -> tables.id)
- guest_count (INT, NOT NULL)
- reservation_date (DATE, NOT NULL)
- reservation_time (TIME, NOT NULL)
- duration (INT, DEFAULT 120)
- status (ENUM: 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', NOT NULL)
- confirmation_type (ENUM: 'AUTO', 'MANUAL')
- special_requests (TEXT)
- customer_name (VARCHAR(255), NOT NULL)
- customer_phone (VARCHAR(20), NOT NULL)
- customer_email (VARCHAR(255), NOT NULL)
- cancellation_reason (TEXT)
- cancelled_at (TIMESTAMP)
- confirmed_at (TIMESTAMP)
- confirmed_by (UUID, FK -> users.id)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Індекси:**

- INDEX idx_reservations_restaurant (restaurant_id)
- INDEX idx_reservations_user (user_id)
- INDEX idx_reservations_date (restaurant_id, reservation_date, reservation_time)
- INDEX idx_reservations_status (status)
- INDEX idx_reservations_table (table_id, reservation_date)

#### categories

- id (UUID, PK)
- restaurant_id (UUID, FK -> restaurants.id, NOT NULL)
- name (VARCHAR(255), NOT NULL)
- description (TEXT)
- display_order (INT, DEFAULT 0)
- is_active (BOOLEAN, DEFAULT TRUE)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Індекси:**

- INDEX idx_categories_restaurant (restaurant_id)
- INDEX idx_categories_order (restaurant_id, display_order)

#### menu_items

- id (UUID, PK)
- restaurant_id (UUID, FK -> restaurants.id, NOT NULL)
- category_id (UUID, FK -> categories.id, NOT NULL)
- name (VARCHAR(255), NOT NULL)
- description (TEXT)
- price (DECIMAL(10,2), NOT NULL)
- images (JSON)
- ingredients (JSON)
- allergens (JSON)
- is_vegetarian (BOOLEAN, DEFAULT FALSE)
- is_vegan (BOOLEAN, DEFAULT FALSE)
- is_gluten_free (BOOLEAN, DEFAULT FALSE)
- spicy_level (ENUM: 'NONE', 'MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT', DEFAULT 'NONE')
- preparation_time (INT)
- calories (INT)
- is_available (BOOLEAN, DEFAULT TRUE)
- is_popular (BOOLEAN, DEFAULT FALSE)
- display_order (INT, DEFAULT 0)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Індекси:**

- INDEX idx_menu_items_restaurant (restaurant_id)
- INDEX idx_menu_items_category (category_id)
- INDEX idx_menu_items_available (restaurant_id, is_available)
- INDEX idx_menu_items_popular (restaurant_id, is_popular)

#### orders

- id (UUID, PK)
- restaurant_id (UUID, FK -> restaurants.id, NOT NULL)
- reservation_id (UUID, FK -> reservations.id)
- table_id (UUID, FK -> tables.id)
- user_id (UUID, FK -> users.id, NOT NULL)
- order_number (VARCHAR(50), UNIQUE, NOT NULL)
- order_type (ENUM: 'PRE_ORDER', 'DINE_IN', NOT NULL)
- status (ENUM: 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED', NOT NULL)
- total_amount (DECIMAL(10,2), NOT NULL)
- notes (TEXT)
- created_by (UUID, FK -> users.id, NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- completed_at (TIMESTAMP)

**Індекси:**

- UNIQUE INDEX idx_orders_number (order_number)
- INDEX idx_orders_restaurant (restaurant_id)
- INDEX idx_orders_user (user_id)
- INDEX idx_orders_reservation (reservation_id)
- INDEX idx_orders_status (restaurant_id, status)
- INDEX idx_orders_created (restaurant_id, created_at)

#### order_items

- id (UUID, PK)
- order_id (UUID, FK -> orders.id, NOT NULL)
- menu_item_id (UUID, FK -> menu_items.id, NOT NULL)
- quantity (INT, NOT NULL)
- price (DECIMAL(10,2), NOT NULL)
- subtotal (DECIMAL(10,2), NOT NULL)
- status (ENUM: 'PENDING', 'PREPARING', 'READY', 'SERVED', NOT NULL)
- special_instructions (TEXT)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**Індекси:**

- INDEX idx_order_items_order (order_id)
- INDEX idx_order_items_menu (menu_item_id)
- INDEX idx_order_items_status (status)

#### staff_assignments

- id (UUID, PK)
- user_id (UUID, FK -> users.id, NOT NULL)
- restaurant_id (UUID, FK -> restaurants.id, NOT NULL)
- position (ENUM: 'WAITER', 'CHEF', 'MANAGER', NOT NULL)
- is_active (BOOLEAN, DEFAULT TRUE)
- assigned_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- assigned_by (UUID, FK -> users.id, NOT NULL)

**Індекси:**

- UNIQUE INDEX idx_staff_user_restaurant (user_id, restaurant_id)
- INDEX idx_staff_restaurant (restaurant_id)

#### refresh_tokens

- id (UUID, PK)
- user_id (UUID, FK -> users.id, NOT NULL)
- token (VARCHAR(500), UNIQUE, NOT NULL)
- expires_at (TIMESTAMP, NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

**Індекси:**

- UNIQUE INDEX idx_refresh_tokens_token (token)
- INDEX idx_refresh_tokens_user (user_id)
- INDEX idx_refresh_tokens_expires (expires_at)

### 6.2 Зв'язки між таблицями

- `restaurants.owner_id` -> `users.id` (Many-to-One)
- `working_hours.restaurant_id` -> `restaurants.id` (Many-to-One)
- `tables.restaurant_id` -> `restaurants.id` (Many-to-One)
- `floor_plans.restaurant_id` -> `restaurants.id` (Many-to-One)
- `reservations.restaurant_id` -> `restaurants.id` (Many-to-One)
- `reservations.user_id` -> `users.id` (Many-to-One)
- `reservations.table_id` -> `tables.id` (Many-to-One)
- `reservations.confirmed_by` -> `users.id` (Many-to-One)
- `categories.restaurant_id` -> `restaurants.id` (Many-to-One)
- `menu_items.restaurant_id` -> `restaurants.id` (Many-to-One)
- `menu_items.category_id` -> `categories.id` (Many-to-One)
- `orders.restaurant_id` -> `restaurants.id` (Many-to-One)
- `orders.reservation_id` -> `reservations.id` (Many-to-One)
- `orders.table_id` -> `tables.id` (Many-to-One)
- `orders.user_id` -> `users.id` (Many-to-One)
- `orders.created_by` -> `users.id` (Many-to-One)
- `order_items.order_id` -> `orders.id` (Many-to-One)
- `order_items.menu_item_id` -> `menu_items.id` (Many-to-One)
- `staff_assignments.user_id` -> `users.id` (Many-to-One)
- `staff_assignments.restaurant_id` -> `restaurants.id` (Many-to-One)
- `staff_assignments.assigned_by` -> `users.id` (Many-to-One)
- `refresh_tokens.user_id` -> `users.id` (Many-to-One)

---

## 7. API Endpoints Summary

### 7.1 Автентифікація (`/api/v1/auth`)

| Метод | Endpoint           | Опис                | Доступ        |
| ----- | ------------------ | ------------------- | ------------- |
| POST  | `/register`        | Реєстрація          | Public        |
| POST  | `/login`           | Вхід                | Public        |
| POST  | `/logout`          | Вихід               | Authenticated |
| POST  | `/refresh`         | Оновлення токену    | Public        |
| POST  | `/forgot-password` | Відновлення паролю  | Public        |
| POST  | `/reset-password`  | Скидання паролю     | Public        |
| GET   | `/verify-email`    | Підтвердження email | Public        |
| POST  | `/oauth/google`    | OAuth Google        | Public        |
| POST  | `/oauth/facebook`  | OAuth Facebook      | Public        |

### 7.2 Ресторани (`/api/v1/restaurants`)

| Метод  | Endpoint              | Опис                 | Доступ              |
| ------ | --------------------- | -------------------- | -------------------- |
| GET    | `/`                   | Список ресторанів    | Public               |
| GET    | `/{id}`               | Деталі ресторану     | Public               |
| POST   | `/`                   | Створення ресторану  | Owner                |
| PUT    | `/{id}`               | Оновлення ресторану  | Manager, Owner       |
| DELETE | `/{id}`               | Видалення ресторану  | Owner                |
| GET    | `/{id}/stats`         | Статистика ресторану | Manager, Owner       |
| GET    | `/{id}/working-hours` | Графік роботи        | Public               |
| PUT    | `/{id}/working-hours` | Оновлення графіку    | Manager, Owner       |

### 7.3 Столики (`/api/v1/restaurants/{restaurantId}/tables`)

| Метод  | Endpoint       | Опис              | Доступ           |
| ------ | -------------- | ----------------- | ----------------- |
| GET    | `/`            | Список столиків   | Manager, Owner    |
| GET    | `/{id}`        | Деталі столика    | Manager, Owner    |
| POST   | `/`            | Створення столика | Manager, Owner    |
| PUT    | `/{id}`        | Оновлення столика | Manager, Owner    |
| DELETE | `/{id}`        | Видалення столика | Manager, Owner    |
| GET    | `/available`   | Доступні столики  | Public            |
| PUT    | `/{id}/status` | Зміна статусу     | Manager, Owner    |

### 7.4 Бронювання (`/api/v1/reservations`)

| Метод  | Endpoint             | Опис                  | Доступ        |
| ------ | -------------------- | --------------------- | ------------- |
| POST   | `/`                  | Створення бронювання  | Client        |
| GET    | `/`                  | Мої бронювання        | Client        |
| GET    | `/{id}`              | Деталі бронювання     | Client, Staff |
| PUT    | `/{id}`              | Оновлення бронювання  | Client        |
| DELETE | `/{id}`              | Скасування бронювання | Client        |
| PUT    | `/{id}/confirm`      | Підтвердження         | Manager       |
| PUT    | `/{id}/cancel`       | Скасування менеджером | Manager       |
| PUT    | `/{id}/assign-table` | Призначення столика   | Manager       |

### 7.5 Меню (`/api/v1/restaurants/{restaurantId}`)

| Метод  | Endpoint                        | Опис                | Доступ           |
| ------ | ------------------------------- | ------------------- | ----------------- |
| GET    | `/menu`                         | Повне меню          | Public            |
| GET    | `/categories`                   | Список категорій    | Public            |
| POST   | `/categories`                   | Створення категорії | Manager, Owner    |
| PUT    | `/categories/{id}`              | Оновлення категорії | Manager, Owner    |
| DELETE | `/categories/{id}`              | Видалення категорії | Manager, Owner    |
| GET    | `/menu-items`                   | Список страв        | Public            |
| GET    | `/menu-items/{id}`              | Деталі страви       | Public            |
| POST   | `/menu-items`                   | Створення страви    | Manager, Owner    |
| PUT    | `/menu-items/{id}`              | Оновлення страви    | Manager, Owner    |
| DELETE | `/menu-items/{id}`              | Видалення страви    | Manager, Owner    |
| PUT    | `/menu-items/{id}/availability` | Зміна доступності   | Manager, Owner    |

### 7.6 Замовлення (`/api/v1/orders`)

| Метод  | Endpoint                      | Опис                  | Доступ                |
| ------ | ----------------------------- | --------------------- | --------------------- |
| POST   | `/`                           | Створення замовлення  | Client, Waiter        |
| GET    | `/`                           | Мої замовлення        | Client                |
| GET    | `/{id}`                       | Деталі замовлення     | Client, Staff         |
| PUT    | `/{id}`                       | Оновлення замовлення  | Client, Waiter        |
| DELETE | `/{id}`                       | Скасування замовлення | Client, Manager       |
| PUT    | `/{id}/status`                | Зміна статусу         | Waiter, Chef, Manager |
| PUT    | `/{id}/items/{itemId}/status` | Зміна статусу позиції | Chef                  |
| POST   | `/{id}/items`                 | Додавання позицій     | Client, Waiter        |

### 7.7 Кухня (`/api/v1/kitchen`)

| Метод | Endpoint  | Опис               | Доступ |
| ----- | --------- | ------------------ | ------ |
| GET   | `/orders` | Активні замовлення | Chef   |

### 7.8 Користувачі (`/api/v1/users`)

| Метод  | Endpoint       | Опис              | Доступ           |
| ------ | -------------- | ----------------- | ----------------- |
| GET    | `/me`          | Мій профіль       | Authenticated    |
| PUT    | `/me`          | Оновлення профілю | Authenticated    |
| PUT    | `/me/password` | Зміна паролю     | Authenticated    |
| DELETE | `/me`          | Видалення акаунту | Authenticated    |

### 7.9 Персонал (`/api/v1/restaurants/{restaurantId}/staff`)

| Метод  | Endpoint | Опис                  | Доступ        |
| ------ | -------- | --------------------- | ------------- |
| POST   | `/`      | Призначення персоналу | Manager, Owner |
| GET    | `/`      | Список персоналу      | Manager, Owner |
| DELETE | `/{id}`  | Видалення призначення | Manager, Owner |

### 7.10 Аналітика (`/api/v1`)

| Метод | Endpoint                                    | Опис                  | Доступ        |
| ----- | ------------------------------------------- | --------------------- | ------------- |
| GET   | `/restaurants/{id}/analytics/reservations`  | Аналітика бронювань   | Manager, Owner |
| GET   | `/restaurants/{id}/analytics/orders`        | Аналітика замовлень   | Manager, Owner |
| GET   | `/restaurants/{id}/analytics/popular-items` | Популярні страви      | Manager, Owner |
| GET   | `/restaurants/{id}/analytics/revenue`       | Аналітика доходів     | Manager, Owner |
| GET   | `/restaurants/{id}/analytics/occupancy`     | Завантаженість        | Manager, Owner |
| GET   | `/analytics/network/overview`               | Огляд мережі          | Owner          |
| GET   | `/analytics/network/comparison`             | Порівняння ресторанів | Owner          |
| GET   | `/analytics/network/trends`                 | Тренди                | Owner          |

### 7.11 Файли та зображення (`/api/v1/files`)

**Принцип роботи:**

Система файлів використовує простий підхід - файли зберігаються локально на сервері в директорії `uploads/`. URL файлів зберігаються в JSON-полях відповідних сутностей (наприклад, `images` в `Restaurant` або `MenuItem`).

**Етапи роботи з файлами:**

1. **Завантаження файлу** → отримання URL
2. **Оновлення сутності** → передача URL в поле `images`
3. **Отримання сутності** → URL файлів повертаються разом з даними

**Приклад роботи з зображеннями ресторану:**

```bash
# 1. Завантажити файл
curl -X POST http://localhost:8080/api/v1/files/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@restaurant.jpg" \
  -F "directory=restaurants"

# Response:
{
  "fileName": "restaurant.jpg",
  "url": "/images/restaurants/uuid.jpg",
  "contentType": "image/jpeg",
  "size": 102400,
  "uploadedAt": "2025-04-15T10:30:00"
}

# 2. Оновити ресторан з новим зображенням
curl -X PUT http://localhost:8080/api/v1/restaurants/{id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "images": ["/images/restaurants/uuid.jpg"]
  }'
```

**Збережені зображення (Seed Data):**

В системі зберігаються попередньо завантажені зображення для демонстраційних даних:
- Ресторани: `/images/restaurants/{slug}/` (по 3 фото на ресторан)
- Страви українські: `/images/menu/ukrainian/{category}/`
- Страви європейські: `/images/menu/european/`
- Аватари: `/images/avatars/`
- Плани залів: `/images/floor-plans/`

**Доступ до файлів:**

Файли доступні публічно за URL:
```
GET /images/{path-to-file}
GET /api/v1/files/download?url=/images/...
```

| Метод  | Endpoint           | Опис                      | Доступ              |
| ------ | ------------------ | ------------------------- | ------------------- |
| POST   | `/upload`          | Завантаження файлу        | Authenticated       |
| GET    | `/download`        | Скачування файлу          | Public              |
| DELETE | `/?url={url}`      | Видалення файлу           | Manager, Owner      |

**Конфігурація:**

```yaml
# application.yml
file:
  upload-dir: ${FILE_UPLOAD_DIR:uploads}
  max-size: ${FILE_MAX_SIZE:5242880}  # 5MB
  allowed-types: ${FILE_ALLOWED_TYPES:image/jpeg,image/jpg,image/png,image/gif,image/webp}
```

**Обмеження:**
- Максимальний розмір файлу: 5MB
- Дозволені формати: JPEG, JPG, PNG, GIF, WebP
- Файли зберігаються локально (без S3/хмарного сховища)

---

## 8. Структура проєкту (Backend)

```
resto-order-hub/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── restoorderhub/
│   │   │           ├── RestoOrderHubApplication.java
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── JwtConfig.java
│   │   │           │   ├── SwaggerConfig.java
│   │   │           │   ├── CorsConfig.java
│   │   │           │   └── DatabaseConfig.java
│   │   │           ├── controller/
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── RestaurantController.java
│   │   │           │   ├── TableController.java
│   │   │           │   ├── ReservationController.java
│   │   │           │   ├── MenuController.java
│   │   │           │   ├── OrderController.java
│   │   │           │   ├── KitchenController.java
│   │   │           │   ├── UserController.java
│   │   │           │   ├── StaffController.java
│   │   │           │   ├── AnalyticsController.java
│   │   │           │   └── FileController.java
│   │   │           ├── service/
│   │   │           │   ├── AuthService.java
│   │   │           │   ├── RestaurantService.java
│   │   │           │   ├── TableService.java
│   │   │           │   ├── ReservationService.java
│   │   │           │   ├── MenuService.java
│   │   │           │   ├── OrderService.java
│   │   │           │   ├── UserService.java
│   │   │           │   ├── StaffService.java
│   │   │           │   ├── AnalyticsService.java
│   │   │           │   ├── EmailService.java
│   │   │           │   └── FileStorageService.java
│   │   │           ├── repository/
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── RestaurantRepository.java
│   │   │           │   ├── TableRepository.java
│   │   │           │   ├── ReservationRepository.java
│   │   │           │   ├── CategoryRepository.java
│   │   │           │   ├── MenuItemRepository.java
│   │   │           │   ├── OrderRepository.java
│   │   │           │   ├── OrderItemRepository.java
│   │   │           │   ├── StaffAssignmentRepository.java
│   │   │           │   └── RefreshTokenRepository.java
│   │   │           ├── model/
│   │   │           │   ├── entity/
│   │   │           │   │   ├── User.java
│   │   │           │   │   ├── Restaurant.java
│   │   │           │   │   ├── WorkingHours.java
│   │   │           │   │   ├── Table.java
│   │   │           │   │   ├── FloorPlan.java
│   │   │           │   │   ├── Reservation.java
│   │   │           │   │   ├── Category.java
│   │   │           │   │   ├── MenuItem.java
│   │   │           │   │   ├── Order.java
│   │   │           │   │   ├── OrderItem.java
│   │   │           │   │   ├── StaffAssignment.java
│   │   │           │   │   └── RefreshToken.java
│   │   │           │   ├── dto/
│   │   │           │   │   ├── request/
│   │   │           │   │   │   ├── LoginRequest.java
│   │   │           │   │   │   ├── RegisterRequest.java
│   │   │           │   │   │   ├── CreateReservationRequest.java
│   │   │           │   │   │   ├── CreateOrderRequest.java
│   │   │           │   │   │   └── ...
│   │   │           │   │   └── response/
│   │   │           │   │       ├── AuthResponse.java
│   │   │           │   │       ├── UserResponse.java
│   │   │           │   │       ├── RestaurantResponse.java
│   │   │           │   │       ├── ReservationResponse.java
│   │   │           │   │       ├── FileResponse.java
│   │   │           │   │       └── ...
│   │   │           │   └── enums/
│   │   │           │       ├── UserRole.java
│   │   │           │       ├── ReservationStatus.java
│   │   │           │       ├── OrderStatus.java
│   │   │           │       ├── OrderType.java
│   │   │           │       └── ...
│   │   │           ├── security/
│   │   │           │   ├── JwtTokenProvider.java
│   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │           │   ├── CustomUserDetailsService.java
│   │   │           │   └── SecurityUtils.java
│   │   │           ├── exception/
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   ├── ResourceNotFoundException.java
│   │   │           │   ├── BadRequestException.java
│   │   │           │   ├── UnauthorizedException.java
│   │   │           │   └── ...
│   │   │           ├── mapper/
│   │   │           │   ├── UserMapper.java
│   │   │           │   ├── RestaurantMapper.java
│   │   │           │   ├── ReservationMapper.java
│   │   │           │   ├── OrderMapper.java
│   │   │           │   └── ...
│   │   │           └── util/
│   │   │               ├── DateTimeUtils.java
│   │   │               ├── ValidationUtils.java
│   │   │               └── ...
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── db/
│   │       │   └── migration/
│   │       │       ├── V1__initial_schema.sql
│   │       │       └── ...
│   │       └── static/
│   │           └── images/
│   │               ├── restaurants/
│   │               ├── menu/
│   │               ├── avatars/
│   │               └── floor-plans/
│   └── test/
│       └── java/
│           └── com/
│               └── restoorderhub/
│                   ├── controller/
│                   ├── service/
│                   ├── repository/
│                   └── integration/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── pom.xml
├── .gitignore
└── README.md
```

---

## 9. Структура проєкту (Frontend)

```
resto-order-hub-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── restaurants/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── menu/
│   │   │       │   └── page.tsx
│   │   │       └── reserve/
│   │   │           └── page.tsx
│   │   ├── reservations/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── (manager)/
│   │   │   │   ├── reservations/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── tables/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── menu/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── analytics/
│   │   │   │       └── page.tsx
│   │   │   ├── (kitchen)/
│   │   │   │   └── orders/
│   │   │   │       └── page.tsx
│   │   │   ├── (owner)/
│   │   │   │   ├── restaurants/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── analytics/
│   │   │   │       └── page.tsx
│   │   │   └── (admin)/
│   │   │       ├── users/
│   │   │       │   └── page.tsx
│   │   │       └── system/
│   │   │           └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Table/
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── Navigation/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm/
│   │   │   │   └── RegisterForm/
│   │   │   ├── reservations/
│   │   │   │   ├── ReservationForm/
│   │   │   │   ├── ReservationCard/
│   │   │   │   └── ReservationList/
│   │   │   ├── menu/
│   │   │   │   ├── MenuItemCard/
│   │   │   │   └── MenuCategory/
│   │   │   └── orders/
│   │   │       ├── OrderForm/
│   │   │       ├── OrderCard/
│   │   │       └── OrderItemList/
│   │   └── shared/
│   │       ├── LoadingSpinner/
│   │       ├── ErrorMessage/
│   │       └── EmptyState/
│   ├── lib/
│   │   ├── store/
│   │   │   ├── store.ts
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── restaurantSlice.ts
│   │   │   │   ├── reservationSlice.ts
│   │   │   │   └── orderSlice.ts
│   │   │   └── api/
│   │   │       ├── authApi.ts
│   │   │       ├── restaurantApi.ts
│   │   │       ├── reservationApi.ts
│   │   │       ├── menuApi.ts
│   │   │       └── orderApi.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useReservation.ts
│   │   │   └── useOrder.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   └── schemas/
│   │       ├── authSchema.ts
│   │       ├── reservationSchema.ts
│   │       └── orderSchema.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── restaurant.ts
│   │   ├── reservation.ts
│   │   ├── menu.ts
│   │   └── order.ts
│   └── styles/
│       ├── globals.css
│       ├── variables.css
│       └── themes/
├── public/
│   ├── images/
│   └── icons/
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.local
└── README.md
```

---

## 10. Етапи розробки

### Етап 1: Підготовка та налаштування (Тиждень 1-2)

- Налаштування репозиторію Git
- Створення структури проєкту (backend + frontend)
- Налаштування Docker Compose для локальної розробки
- Ініціалізація Spring Boot проєкту з Maven
- Ініціалізація Next.js проєкту
- Налаштування бази даних MySQL
- Налаштування Flyway для міграцій
- Налаштування Swagger для документації API

### Етап 2: Модуль автентифікації (Тиждень 3-4)

- Створення сутності User та репозиторію
- Реалізація JWT автентифікації
- Реалізація реєстрації та логіну
- Інтеграція OAuth 2.0 (Google, Facebook)
- Відновлення паролю
- Підтвердження email
- Frontend: форми логіну та реєстрації
- Тестування модуля автентифікації

### Етап 3: Модуль ресторанів та столиків (Тиждень 5-6)

- Створення сутностей Restaurant, Table, WorkingHours, FloorPlan
- CRUD операції для ресторанів
- CRUD операції для столиків
- Управління робочим графіком
- Управління планом залу
- Frontend: список ресторанів, деталі ресторану
- Frontend: панель менеджера для управління столиками
- Тестування модуля

### Етап 4: Модуль бронювання (Тиждень 7-9)

- Створення сутності Reservation
- Логіка створення бронювання
- Алгоритм перевірки доступності столиків
- Автоматичне та ручне підтвердження
- Скасування та перенесення бронювань
- Призначення столиків
- Frontend: форма бронювання
- Frontend: список бронювань клієнта
- Frontend: панель менеджера для управління бронюваннями
- Тестування модуля

### Етап 5: Модуль меню (Тиждень 10-11)

- Створення сутностей Category, MenuItem
- CRUD операції для категорій
- CRUD операції для страв
- Завантаження зображень
- Frontend: відображення меню для клієнтів
- Frontend: панель менеджера для управління меню
- Тестування модуля

### Етап 6: Модуль замовлень (Тиждень 12-14)

- Створення сутностей Order, OrderItem
- Логіка створення замовлень
- Попереднє замовлення при бронюванні
- Замовлення в ресторані
- Управління статусами замовлень
- Інтеграція з кухнею
- Frontend: форма замовлення
- Frontend: список замовлень клієнта
- Frontend: панель офіціанта
- Frontend: панель кухаря
- Тестування модуля

### Етап 7: Модуль аналітики (Тиждень 15-16)

- Реалізація звітів для менеджера
- Реалізація звітів для власника
- Статистика бронювань
- Статистика замовлень
- Аналітика доходів
- Frontend: дашборди з графіками
- Тестування модуля

### Етап 8: Додатковий функціонал (Тиждень 17-18)

- Управління персоналом
- Виклик офіціанта
- Система ролей та прав доступу
- Логування та моніторинг
- Оптимізація продуктивності
- Тестування

### Етап 9: Тестування та виправлення (Тиждень 19-20)

- Інтеграційне тестування
- E2E тестування
- Виправлення багів
- Оптимізація коду
- Code review

### Етап 10: Деплой та документація (Тиждень 21-22)

- Підготовка production середовища
- Налаштування CI/CD
- Деплой на сервер
- Фінальна документація
- Навчання користувачів

---

## 11. Команди для встановлення залежностей

### 11.1 Backend (Maven)

**Створення проєкту:**

```bash
mvn archetype:generate \
  -DgroupId=com.restoorderhub \
  -DartifactId=resto-order-hub \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false
```

**Додавання залежностей через Maven CLI:**

```bash
# Spring Boot Starter Parent (додати в pom.xml вручну як parent)
# Spring Boot Web
mvn dependency:get -Dartifact=org.springframework.boot:spring-boot-starter-web:LATEST

# Spring Boot Security
mvn dependency:get -Dartifact=org.springframework.boot:spring-boot-starter-security:LATEST

# Spring Boot Data JPA
mvn dependency:get -Dartifact=org.springframework.boot:spring-boot-starter-data-jpa:LATEST

# Spring Boot Validation
mvn dependency:get -Dartifact=org.springframework.boot:spring-boot-starter-validation:LATEST

# MySQL Connector
mvn dependency:get -Dartifact=com.mysql:mysql-connector-j:LATEST

# JWT
mvn dependency:get -Dartifact=io.jsonwebtoken:jjwt-api:LATEST
mvn dependency:get -Dartifact=io.jsonwebtoken:jjwt-impl:LATEST
mvn dependency:get -Dartifact=io.jsonwebtoken:jjwt-jackson:LATEST

# Lombok
mvn dependency:get -Dartifact=org.projectlombok:lombok:LATEST

# MapStruct
mvn dependency:get -Dartifact=org.mapstruct:mapstruct:LATEST

# Flyway
mvn dependency:get -Dartifact=org.flywaydb:flyway-core:LATEST
mvn dependency:get -Dartifact=org.flywaydb:flyway-mysql:LATEST

# Swagger/OpenAPI
mvn dependency:get -Dartifact=org.springdoc:springdoc-openapi-starter-webmvc-ui:LATEST

# Spring Boot Test
mvn dependency:get -Dartifact=org.springframework.boot:spring-boot-starter-test:LATEST

# Testcontainers
mvn dependency:get -Dartifact=org.testcontainers:testcontainers:LATEST
mvn dependency:get -Dartifact=org.testcontainers:mysql:LATEST
mvn dependency:get -Dartifact=org.testcontainers:junit-jupiter:LATEST
```

**Примітка:** Для Maven рекомендується додавати залежності безпосередньо в `pom.xml` без вказання конкретних версій, використовуючи Spring Boot BOM (Bill of Materials) для управління версіями.

### 11.2 Frontend (npm/yarn)

**Створення Next.js проєкту:**

```bash
npx create-next-app@latest resto-order-hub-frontend --typescript --app --no-tailwind
cd resto-order-hub-frontend
```

**Встановлення залежностей:**

```bash
# Redux Toolkit
npm install @reduxjs/toolkit react-redux

# RTK Query (вже включено в Redux Toolkit)

# React Hook Form
npm install react-hook-form

# Zod
npm install zod
npm install @hookform/resolvers

# React Aria
npm install react-aria-components

# Lucide React Icons
npm install lucide-react

# Axios (для HTTP запитів)
npm install axios

# Date-fns (для роботи з датами)
npm install date-fns

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom

# ESLint та Prettier
npm install -D eslint prettier eslint-config-prettier
```

---

## 12. Docker Compose конфігурація

```yaml
version: '3.8'

services:
    mysql:
        image: mysql:8.0
        container_name: resto-mysql
        environment:
            MYSQL_ROOT_PASSWORD: root_password
            MYSQL_DATABASE: resto_order_hub
            MYSQL_USER: resto_user
            MYSQL_PASSWORD: resto_password
        ports:
            - '3306:3306'
        volumes:
            - mysql_data:/var/lib/mysql
        networks:
            - resto-network

    backend:
        build:
            context: ./resto-order-hub
            dockerfile: Dockerfile
        container_name: resto-backend
        environment:
            SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/resto_order_hub
            SPRING_DATASOURCE_USERNAME: resto_user
            SPRING_DATASOURCE_PASSWORD: resto_password
        ports:
            - '8080:8080'
        depends_on:
            - mysql
        networks:
            - resto-network

    frontend:
        build:
            context: ./resto-order-hub-frontend
            dockerfile: Dockerfile
        container_name: resto-frontend
        environment:
            NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1
        ports:
            - '3000:3000'
        depends_on:
            - backend
        networks:
            - resto-network

volumes:
    mysql_data:

networks:
    resto-network:
        driver: bridge
```

---

## 18. Глосарій термінів

| Термін    | Опис                                      |
| --------- | ----------------------------------------- |
| JWT       | JSON Web Token - токен для автентифікації |
| REST API  | Архітектурний стиль API                   |
| CRUD      | Create, Read, Update, Delete              |
| OAuth 2.0 | Протокол авторизації                      |
| Flyway    | Інструмент міграцій БД                    |
| TDE       | Transparent Data Encryption               |
| Uptime    | Час безперебійної роботи                  |

---
