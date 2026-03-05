FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
VOLUME /tmp
COPY --from=build /app/target/*.jar app.jar
USER appuser
ENTRYPOINT ["java", "-Xms128m", "-Xmx384m", "-jar", "/app.jar"]
