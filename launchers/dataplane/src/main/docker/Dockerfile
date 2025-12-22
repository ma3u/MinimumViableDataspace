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

COPY ${JAR} edc-dataplane.jar

EXPOSE 8080

ENV WEB_HTTP_PORT="8080"
ENV WEB_HTTP_PATH="/"

HEALTHCHECK --interval=5s --timeout=5s --retries=10 CMD sh -c 'curl --fail http://localhost:${WEB_HTTP_PORT:-8080}/api/check/readiness || exit 1'

# Use "exec" for graceful termination (SIGINT) to reach JVM.
# ARG can not be used in ENTRYPOINT so storing value in an ENV variable
ENV ENV_JVM_ARGS=$JVM_ARGS
# need the sh -c syntax so that the SECRETS variable gets expanded
# use the "exec" syntax so that SIGINT reaches the JVM -> graceful termination
CMD ["sh", "-c", "exec java -javaagent:/app/opentelemetry-javaagent.jar -Dedc.fs.config=/app/configuration.properties -Dedc.vault.secrets=\"${SECRETS}\" -Djava.util.logging.config.file=/app/logging.properties -Djava.security.egd=file:/dev/urandom -jar edc-dataplane.jar --log-level=debug"]
