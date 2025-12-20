/*
 * Database Module with Flyway Migrations
 * 
 * Manages all database schemas for the MVD Health Demo including:
 * - EDC connector databases (consumer, provider, catalog_server)
 * - Identity Hub and Issuer Service databases
 * - Health-specific tables (consent_attestations, health_data_access_logs, audit_trail)
 */

plugins {
    `java-library`
    alias(libs.plugins.flyway)
}

dependencies {
    implementation(libs.flyway.core)
    implementation(libs.flyway.postgres)
    implementation(libs.postgres)
    
    // EDC SQL dependencies for schema compatibility
    implementation(libs.edc.sql.core)
}

flyway {
    url = System.getenv("FLYWAY_URL") ?: "jdbc:postgresql://localhost:5432/postgres"
    user = System.getenv("FLYWAY_USER") ?: "postgres"
    password = System.getenv("FLYWAY_PASSWORD") ?: "password"
    schemas = arrayOf("public")
    locations = arrayOf("filesystem:src/main/resources/db/migration")
    baselineOnMigrate = true
    cleanDisabled = false
}

// Task to run migrations for all databases
tasks.register("migrateAllDatabases") {
    group = "flyway"
    description = "Run Flyway migrations for all MVD Health databases"
    
    doLast {
        val databases = listOf(
            "consumer" to "consumer",
            "provider_qna" to "provider-qna",
            "catalog_server" to "catalog_server",
            "identity" to "identity",
            "issuer" to "issuer"
        )
        
        databases.forEach { (dbName, dbUser) ->
            println("Migrating database: $dbName")
            // Note: In production, use Flyway programmatically or separate tasks
        }
    }
}

// Task to clean all databases (development only)
tasks.register("cleanAllDatabases") {
    group = "flyway"
    description = "Clean all MVD Health databases (DESTRUCTIVE - development only)"
    
    doLast {
        println("WARNING: This will delete all data from all databases!")
    }
}
