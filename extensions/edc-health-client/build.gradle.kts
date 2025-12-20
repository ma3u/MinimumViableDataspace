/*
 * EDC Health Client Module
 * 
 * Generates Java DTOs from OpenAPI specifications using openapi-generator.
 * Provides type-safe access to EDC Management API and Identity Hub API.
 */

import java.io.File

plugins {
    `java-library`
    id("org.openapi.generator")
}

val edcVersion: String by extra("0.5.1")

dependencies {
    // OpenAPI generator runtime dependencies
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.0")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.17.0")
    implementation("jakarta.annotation:jakarta.annotation-api:2.1.1")
    implementation("jakarta.validation:jakarta.validation-api:3.0.2")
    implementation("org.hibernate.validator:hibernate-validator:8.0.1.Final")
    
    // Optional: OkHttp for generated API clients
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // EDC SPI for integration with policy evaluation
    implementation("org.eclipse.edc:policy-model:${edcVersion}")
    implementation("org.eclipse.edc:json-ld-spi:${edcVersion}")
}

// OpenAPI Generator configuration for EDC Management API
openApiGenerate {
    generatorName.set("java")
    inputSpec.set("${rootProject.projectDir}/specs/edc-management-api.yaml")
    outputDir.set("${layout.buildDirectory.get()}/generated/edc-management")
    
    apiPackage.set("org.eclipse.edc.demo.health.client.management.api")
    modelPackage.set("org.eclipse.edc.demo.health.client.management.model")
    invokerPackage.set("org.eclipse.edc.demo.health.client.management")
    
    configOptions.set(mapOf(
        "library" to "native",
        "dateLibrary" to "java8",
        "useJakartaEe" to "true",
        "openApiNullable" to "false",
        "useBeanValidation" to "true",
        "performBeanValidation" to "true",
        "serializationLibrary" to "jackson",
        "hideGenerationTimestamp" to "true",
        "additionalModelTypeAnnotations" to "@com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)"
    ))
    
    // Generate models + APIs + supporting files (ApiClient/JSON/etc.)
    globalProperties.set(mapOf(
        "models" to "",
        "apis" to "",
        "supportingFiles" to ""
    ))
}

// Additional task for Identity Hub API generation
tasks.register<org.openapitools.generator.gradle.plugin.tasks.GenerateTask>("generateIdentityHubClient") {
    generatorName.set("java")
    inputSpec.set("${rootProject.projectDir}/specs/identity-hub-api.yaml")
    outputDir.set("${layout.buildDirectory.get()}/generated/identity-hub")
    
    apiPackage.set("org.eclipse.edc.demo.health.client.identity.api")
    modelPackage.set("org.eclipse.edc.demo.health.client.identity.model")
    invokerPackage.set("org.eclipse.edc.demo.health.client.identity")
    
    configOptions.set(mapOf(
        "library" to "native",
        "dateLibrary" to "java8",
        "useJakartaEe" to "true",
        "openApiNullable" to "false",
        "useBeanValidation" to "true",
        "serializationLibrary" to "jackson",
        "hideGenerationTimestamp" to "true"
    ))
    
    globalProperties.set(mapOf(
        "models" to "",
        "apis" to "",
        "supportingFiles" to ""
    ))
}

// Additional task for EHR Health API generation
tasks.register<org.openapitools.generator.gradle.plugin.tasks.GenerateTask>("generateEhrClient") {
    generatorName.set("java")
    inputSpec.set("${rootProject.projectDir}/specs/ehr-health-api.yaml")
    outputDir.set("${layout.buildDirectory.get()}/generated/ehr-health")
    
    apiPackage.set("org.eclipse.edc.demo.health.client.ehr.api")
    modelPackage.set("org.eclipse.edc.demo.health.client.ehr.model")
    invokerPackage.set("org.eclipse.edc.demo.health.client.ehr")
    
    configOptions.set(mapOf(
        "library" to "native",
        "dateLibrary" to "java8",
        "useJakartaEe" to "true",
        "openApiNullable" to "false",
        "useBeanValidation" to "true",
        "serializationLibrary" to "jackson",
        "hideGenerationTimestamp" to "true"
    ))
    
    globalProperties.set(mapOf(
        "models" to "",
        "apis" to "",
        "supportingFiles" to ""
    ))
}

// Add generated sources to source sets
sourceSets {
    main {
        java {
            srcDir("${layout.buildDirectory.get()}/generated/edc-management/src/main/java")
            srcDir("${layout.buildDirectory.get()}/generated/identity-hub/src/main/java")
            srcDir("${layout.buildDirectory.get()}/generated/ehr-health/src/main/java")
        }
    }
}

// Post-process OpenAPI-generated sources to work around known openapi-generator issues
// (invalid List<...>.class literals / method names for oneOf inline array schemas)
tasks.register("fixOpenApiGeneratedSources") {
    dependsOn("openApiGenerate", "generateIdentityHubClient", "generateEhrClient")

    // Capture build directory path at configuration time for configuration cache compatibility
    val buildDir = layout.buildDirectory.get().asFile
    val managementModelDir = File(buildDir, 
        "generated/edc-management/src/main/java/org/eclipse/edc/demo/health/client/management/model")

    doLast {
        fun patchFile(path: java.io.File, transform: (String) -> String) {
            if (!path.exists()) return
            val original = path.readText()
            val updated = transform(original)
            if (original != updated) {
                path.writeText(updated)
            }
        }

        // oneOf: string | array[string]
        patchFile(File(managementModelDir, "CriterionOperandRight.java")) { src ->
            src
                // Java doesn't allow parameterized .class literals or instanceof checks
                .replace("List<String>.class", "List.class")
                // Java doesn't allow instanceof with parameterized types
                .replace("instanceof List<String>", "instanceof List")
                // Fix cast to parameterized type
                .replace("(List<String>)getActualInstance()", "((List<?>)getActualInstance())")
                // Fix uncast getActualInstance().get(i) calls
                .replace("getActualInstance().get(i)", "((List<?>)getActualInstance()).get(i)")
                // Preserve element typing for Jackson
                .replace(
                    "tree.traverse(jp.getCodec()).readValueAs(List.class)",
                    "tree.traverse(jp.getCodec()).readValueAs(new TypeReference<List<String>>() {})"
                )
                // Fix invalid method name
                .replace("getList<String>()", "getStringList()")
        }

        // oneOf: Duty | array[Duty]
        patchFile(File(managementModelDir, "ContractOfferObligation.java")) { src ->
            src
                .replace("List<@Valid Duty>.class", "List.class")
                .replace(
                    "tree.traverse(jp.getCodec()).readValueAs(List.class)",
                    "tree.traverse(jp.getCodec()).readValueAs(new TypeReference<List<Duty>>() {})"
                )
                // Java doesn't allow instanceof with parameterized types
                .replace("instanceof List<@Valid Duty>", "instanceof List")
                // Fix invalid method name
                .replace("getList<@Valid Duty>()", "getDutyList()")
                // Fix broken list URL query serialization
                .replace(
                    "    if (getActualInstance() instanceof List) {\n" +
                        "        if (getActualInstance() != null) {\n" +
                        "          for (int i = 0; i < ((List<@Valid Duty>)getActualInstance()).size(); i++) {\n" +
                        "            if (((List<@Valid Duty>)getActualInstance()).get(i) != null) {\n" +
                        "              joiner.add(((Duty)getActualInstance()).get(i).toUrlQueryString(String.format(Locale.ROOT, \"%sone_of_1%s%s\", prefix, suffix,\n" +
                        "              \"\".equals(suffix) ? \"\" : String.format(Locale.ROOT, \"%s%d%s\", containerPrefix, i, containerSuffix))));\n" +
                        "            }\n" +
                        "          }\n" +
                        "        }\n" +
                        "        return joiner.toString();\n" +
                        "    }",
                    "    if (getActualInstance() instanceof List) {\n" +
                        "        if (getActualInstance() != null) {\n" +
                        "          for (int i = 0; i < ((List<@Valid Duty>)getActualInstance()).size(); i++) {\n" +
                        "            Duty item = ((List<@Valid Duty>)getActualInstance()).get(i);\n" +
                        "            if (item != null) {\n" +
                        "              joiner.add(item.toUrlQueryString(String.format(Locale.ROOT, \"%sone_of_1%s%s\", prefix, suffix,\n" +
                        "              \"\".equals(suffix) ? \"\" : String.format(Locale.ROOT, \"%s%d%s\", containerPrefix, i, containerSuffix))));\n" +
                        "            }\n" +
                        "          }\n" +
                        "        }\n" +
                        "        return joiner.toString();\n" +
                        "    }"
                )
        }
    }
}

// Ensure generation + patching runs before compilation
tasks.named("compileJava") {
    dependsOn("fixOpenApiGeneratedSources")
}

// Ensure sourcesJar also depends on the generated sources
tasks.withType<Jar>().configureEach {
    if (name == "sourcesJar") {
        dependsOn("fixOpenApiGeneratedSources")
    }
}

// Exclude generated sources from checkstyle (they're auto-generated and don't follow our style)
tasks.withType<Checkstyle>().configureEach {
    exclude("**/org/eclipse/edc/demo/health/client/**")
}

// Clean generated sources
tasks.named<Delete>("clean") {
    delete(layout.buildDirectory.dir("generated"))
}
