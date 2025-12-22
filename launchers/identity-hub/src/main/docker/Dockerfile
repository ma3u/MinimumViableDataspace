# -buster is required to have apt available
FROM eclipse-temurin:23.0.2_7-jre-alpine

# Optional JVM arguments, such as memory settings
ARG JVM_ARGS=""
ARG JAR
ARG OTEL_AGENT_VERSION=2.10.0

RUN apk --no-cache add curl

WORKDIR /app

# Download OpenTelemetry Java Agent for distributed tracing
RUN curl -L -o opentelemetry-javaagent.jar \
    "https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_AGENT_VERSION}/opentelemetry-javaagent.jar"

COPY ${JAR} identity-hub.jar

EXPOSE 8188

ENV WEB_HTTP_PORT="8080"
ENV WEB_HTTP_PATH="/api"

HEALTHCHECK --interval=5s --timeout=5s --retries=10 CMD sh -c 'curl --fail http://localhost:${WEB_HTTP_PORT:-8080}/api/check/readiness || exit 1'

# Use "exec" for graceful termination (SIGINT) to reach JVM.
# ARG can not be used in ENTRYPOINT so storing value in an ENV variable
ENV ENV_JVM_ARGS=$JVM_ARGS
ENTRYPOINT [ "sh", "-c", "exec java -javaagent:/app/opentelemetry-javaagent.jar $ENV_JVM_ARGS -jar identity-hub.jar --log-level=debug"]