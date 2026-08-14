# Multi-stage Dockerfile for Victory Apartment Management Backend (Spring Boot 3.2.5)

# Stage 1: Build JAR using Maven & Java 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production JAR (skipping test execution during docker build)
RUN mvn clean package -DskipTests -B

# Stage 2: Lightweight JRE Runtime
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose Spring Boot default port
EXPOSE 8080

# Environment defaults
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
