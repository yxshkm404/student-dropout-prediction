# ── Spring Boot Backend (Multi-stage) ─────────────────────

# Stage 1: Build the JAR
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven wrapper and pom first (layer caching)
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
RUN chmod +x mvnw

# Download dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src/ src/
RUN mvn package -DskipTests -B

# Stage 2: Run the JAR
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR from stage 1
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Activate the 'docker' Spring profile
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=docker"]
