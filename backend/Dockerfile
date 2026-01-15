# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN apt-get update && apt-get install -y gnupg
RUN mvn clean package -DskipTests


# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /appdocker inspect itms-sqlserver

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]