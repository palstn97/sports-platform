FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app
COPY SportsPlatform-BE/ .
RUN chmod +x ./gradlew && ./gradlew bootJar -x test

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
