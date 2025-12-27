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

package org.eclipse.edc.demo.dcp.policy;

import org.eclipse.edc.iam.verifiablecredentials.spi.model.CredentialSubject;
import org.eclipse.edc.iam.verifiablecredentials.spi.model.VerifiableCredential;
import org.eclipse.edc.participant.spi.ParticipantAgent;
import org.eclipse.edc.participant.spi.ParticipantAgentPolicyContext;
import org.eclipse.edc.policy.model.Duty;
import org.eclipse.edc.policy.model.Operator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DataAccessLevelFunctionTest {

    private static final String MVD_NAMESPACE = "https://w3id.org/mvd/credentials/";
    private DataAccessLevelFunction<ParticipantAgentPolicyContext> function;
    private ParticipantAgentPolicyContext policyContext;
    private Duty duty;
    private ParticipantAgent participantAgent;

    @BeforeEach
    void setUp() {
        function = DataAccessLevelFunction.create();
        policyContext = mock(ParticipantAgentPolicyContext.class);
        duty = mock(Duty.class);
        participantAgent = mock(ParticipantAgent.class);
        
        when(policyContext.participantAgent()).thenReturn(participantAgent);
    }

    @Test
    void evaluate_withValidDataProcessorCredential_shouldReturnTrue() {
        // Arrange
        var credential = createDataProcessorCredential("processing", "v1.0");
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(credential)));

        // Act
        var result = function.evaluate(Operator.EQ, "processing", duty, policyContext);

        // Assert
        assertThat(result).isTrue();
        verify(policyContext, never()).reportProblem(anyString());
    }

    @Test
    void evaluate_withSensitiveDataLevel_shouldReturnTrue() {
        // Arrange
        var credential = createDataProcessorCredential("sensitive", "v1.0");
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(credential)));

        // Act
        var result = function.evaluate(Operator.EQ, "sensitive", duty, policyContext);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    void evaluate_withWrongLevel_shouldReturnFalse() {
        // Arrange
        var credential = createDataProcessorCredential("processing", "v1.0");
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(credential)));

        // Act
        var result = function.evaluate(Operator.EQ, "sensitive", duty, policyContext);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void evaluate_withInvalidOperator_shouldReturnFalse() {
        // Act
        var result = function.evaluate(Operator.GT, "processing", duty, policyContext);

        // Assert
        assertThat(result).isFalse();
        verify(policyContext).reportProblem("Cannot evaluate operator GT, only EQ is supported");
    }

    @Test
    void evaluate_withNoParticipantAgent_shouldReturnFalse() {
        // Arrange
        when(policyContext.participantAgent()).thenReturn(null);

        // Act
        var result = function.evaluate(Operator.EQ, "processing", duty, policyContext);

        // Assert
        assertThat(result).isFalse();
        verify(policyContext).reportProblem("ParticipantAgent not found on PolicyContext");
    }

    @Test
    void evaluate_withNoVcClaim_shouldReturnFalse() {
        // Arrange
        when(participantAgent.getClaims()).thenReturn(Map.of());

        // Act
        var result = function.evaluate(Operator.EQ, "processing", duty, policyContext);

        // Assert
        assertThat(result).isFalse();
        verify(policyContext).reportProblem("ParticipantAgent did not contain a 'vc' claim.");
    }

    @Test
    void evaluate_withNonDataProcessorCredential_shouldReturnFalse() {
        // Arrange
        var credential = VerifiableCredential.Builder.newInstance()
                .type("OtherCredential")
                .credentialSubject(CredentialSubject.Builder.newInstance()
                        .id("subject-123")
                        .claim(MVD_NAMESPACE + "level", "processing")
                        .build())
                .build();
        
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(credential)));

        // Act
        var result = function.evaluate(Operator.EQ, "processing", duty, policyContext);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void evaluate_withMissingContractVersion_shouldReturnFalse() {
        // Arrange
        var credential = VerifiableCredential.Builder.newInstance()
                .type("DataProcessorCredential")
                .credentialSubject(CredentialSubject.Builder.newInstance()
                        .id("subject-123")
                        .claim(MVD_NAMESPACE + "level", "processing")
                        // Missing contractVersion
                        .build())
                .build();
        
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(credential)));

        // Act
        var result = function.evaluate(Operator.EQ, "processing", duty, policyContext);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void evaluate_withMultipleCredentials_onlyOneMatching_shouldReturnTrue() {
        // Arrange
        var otherCred = VerifiableCredential.Builder.newInstance()
                .type("OtherCredential")
                .credentialSubject(CredentialSubject.Builder.newInstance()
                        .id("subject-123")
                        .claim("other", "value")
                        .build())
                .build();
        
        var dataProcessorCred = createDataProcessorCredential("processing", "v1.0");
        
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(otherCred, dataProcessorCred)));

        // Act
        var result = function.evaluate(Operator.EQ, "processing", duty, policyContext);

        // Assert
        assertThat(result).isTrue();
    }

    private VerifiableCredential createDataProcessorCredential(String level, String contractVersion) {
        return VerifiableCredential.Builder.newInstance()
                .type("DataProcessorCredential")
                .credentialSubject(CredentialSubject.Builder.newInstance()
                        .id("subject-123")
                        .claim(MVD_NAMESPACE + "level", level)
                        .claim(MVD_NAMESPACE + "contractVersion", contractVersion)
                        .build())
                .build();
    }
}
