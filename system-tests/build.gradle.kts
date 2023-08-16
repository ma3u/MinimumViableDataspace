/*
 *  Copyright (c) 2022 Microsoft Corporation
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 *
 *  Contributors:
 *       Microsoft Corporation - initial API and implementation
 *       Bayerische Motoren Werke Aktiengesellschaft (BMW AG)
 *
 */

plugins {
    `java-library`
}

val gatlingVersion: String by project

dependencies {
    testImplementation(libs.gatling.highcharts) {
        exclude(group = "io.gatling", module = "gatling-jms")
        exclude(group = "io.gatling", module = "gatling-jms-java")
        exclude(group = "io.gatling", module = "gatling-mqtt")
        exclude(group = "io.gatling", module = "gatling-mqtt-java")
        exclude(group = "io.gatling", module = "gatling-jdbc")
        exclude(group = "io.gatling", module = "gatling-jdbc-java")
        exclude(group = "io.gatling", module = "gatling-redis")
        exclude(group = "io.gatling", module = "gatling-redis-java")
        exclude(group = "io.gatling", module = "gatling-graphite")
    }

    testImplementation(libs.apache.commons.lang3)

    testImplementation(edc.ext.azure.blob.core)
    testImplementation(edc.util)
    // testImplementation(libs.azure.storageblob)
    testImplementation("com.azure:azure-storage-blob:12.0.0")
    
    // testImplementation(libs.restAssured)
    testImplementation("io.rest-assured:rest-assured:4.4.0")
    // testImplementation(libs.awaitility)
    testImplementation("org.awaitility:awaitility:4.0.3")
    // testImplementation(libs.okhttp)
    testImplementation("com.squareup.okhttp3:okhttp:4.9.1")

    // testImplementation(libs.azure.identity)
    // testImplementation(libs.azure.keyvault)
    testImplementation("com.azure:azure-identity:1.4.2")
    testImplementation("com.azure:azure-keyvault-secrets:4.2.0")
    testImplementation(edc.spi.contract)
    testImplementation(fcc.spi)
    testImplementation(edc.policy.evaluator)

    // Identity Hub
    testImplementation(identityHub.core.client)
    testImplementation(identityHub.ext.credentials.jwt)
    testImplementation(edc.junit)
}

