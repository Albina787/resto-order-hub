# Multi-stage build for Spring Boot application

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and download dependencies (with caching)
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:resolve -B

# Copy source code and build
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create uploads directory and seed directory
RUN mkdir -p /app/uploads/images /app/uploads-seed

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Copy seed images into the image (separate from the volume mount point)
COPY uploads/ /app/uploads-seed/

# Copy and set up entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application via entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]