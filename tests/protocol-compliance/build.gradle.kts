/*
 *  Copyright (c) 2024 Metaform Systems, Inc.
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 *
 *  Contributors:
 *       Metaform Systems, Inc. - initial API and implementation
 *
 */

plugins {
    `java-library`
}

repositories {
    mavenCentral()
    maven {
        url = uri("https://oss.sonatype.org/content/repositories/snapshots/")
        mavenContent {
            snapshotsOnly()
        }
    }
}

dependencies {
    // JUnit 5
    testImplementation(libs.edc.junit)
    
    // DSP TCK dependencies
    // Note: These are snapshots - check https://github.com/eclipse-dataspacetck/dsp-tck for releases
    testImplementation("org.eclipse.dataspacetck:boot:0.1.0-SNAPSHOT")
    testImplementation("org.eclipse.dataspacetck:dsp:0.1.0-SNAPSHOT")
    
    // DCP TCK dependencies
    // Note: These are snapshots - check https://github.com/eclipse-dataspacetck/dcp-tck for releases
    testImplementation("org.eclipse.dataspacetck:dcp-tck:0.1.0-SNAPSHOT")
    
    // RestAssured for HTTP testing
    testImplementation(libs.restAssured)
    testImplementation(libs.awaitility)
    
    // JSON processing
    testImplementation(libs.jakarta.json.api)
    testImplementation(libs.jackson.datatype.jakarta.jsonp)
    testImplementation(libs.parsson)
}

tasks.test {
    // Protocol compliance tests require a running MVD dataspace
    // Skip by default, enable with -PrunProtocolComplianceTests=true
    enabled = project.hasProperty("runProtocolComplianceTests")
    
    if (enabled) {
        systemProperty("dataspacetck.dsp.connector.base.url", 
            project.findProperty("tck.dsp.base.url") ?: "http://localhost")
        systemProperty("dataspacetck.dsp.connector.protocol.url", 
            project.findProperty("tck.dsp.protocol.url") ?: "http://provider-qna-controlplane:8082")
        systemProperty("dataspacetck.dcp.cs.url",
            project.findProperty("tck.dcp.cs.url") ?: "http://provider-identityhub:7083/api/identity/v1alpha")
    }
    
    // Increase timeout for TCK tests
    systemProperty("junit.jupiter.execution.timeout.default", "5m")
}
