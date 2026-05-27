# RestoOrderHub Backend

Spring Boot 3.4 REST API для ресторанної платформи бронювання столиків.

## Технології

- Java 21
- Spring Boot 3.4
- Spring Data JPA + MySQL
- Spring Security + OAuth2
- Flyway (міграції)
- JWT Authentication
- MapStruct
- OpenAPI/Swagger

## Quick Start

```bash
# Build
./mvnw clean package -DskipTests

# Run
./mvnw spring-boot:run
```

## Docker

```bash
docker build -t resto-order-hub-backend .
docker run -p 8080:8080 --env-file .env resto-order-hub-backend
```

## API Documentation

Після запуску: http://localhost:8080/swagger-ui.html

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection URL |
| `DATABASE_USERNAME` | DB username |
| `DATABASE_PASSWORD` | DB password |
| `JWT_SECRET` | JWT signing secret |
| `OAUTH2_GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `OAUTH2_GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `FRONTEND_URL` | Frontend URL for CORS |

See `.env.example` for full configuration.