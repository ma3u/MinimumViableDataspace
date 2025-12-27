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
import org.eclipse.edc.policy.model.Operator;
import org.eclipse.edc.policy.model.Permission;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MembershipCredentialEvaluationFunctionTest {

    private static final String MVD_NAMESPACE = "https://w3id.org/mvd/credentials/";
    private MembershipCredentialEvaluationFunction<ParticipantAgentPolicyContext> function;
    private ParticipantAgentPolicyContext policyContext;
    private Permission permission;
    private ParticipantAgent participantAgent;

    @BeforeEach
    void setUp() {
        function = MembershipCredentialEvaluationFunction.create();
        policyContext = mock(ParticipantAgentPolicyContext.class);
        permission = mock(Permission.class);
        participantAgent = mock(ParticipantAgent.class);
        
        when(policyContext.participantAgent()).thenReturn(participantAgent);
    }

    @Test
    void evaluate_withValidMembershipCredential_shouldReturnTrue() {
        // Arrange
        var membershipStartDate = Instant.now().minus(30, ChronoUnit.DAYS);
        var credential = createMembershipCredential(membershipStartDate);
        
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(credential)));

        // Act
        var result = function.evaluate(Operator.EQ, "active", permission, policyContext);

        // Assert
        assertThat(result).isTrue();
        verify(policyContext, never()).reportProblem(anyString());
    }

    @Test
    void evaluate_withFutureMembershipDate_shouldReturnFalse() {
        // Arrange
        var futureMembershipDate = Instant.now().plus(30, ChronoUnit.DAYS);
        var credential = createMembershipCredential(futureMembershipDate);
        
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(credential)));

        // Act
        var result = function.evaluate(Operator.EQ, "active", permission, policyContext);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void evaluate_withInvalidOperator_shouldReturnFalse() {
        // Act
        var result = function.evaluate(Operator.GT, "active", permission, policyContext);

        // Assert
        assertThat(result).isFalse();
        verify(policyContext).reportProblem("Invalid operator 'GT', only accepts 'EQ'");
    }

    @Test
    void evaluate_withInvalidRightOperand_shouldReturnFalse() {
        // Act
        var result = function.evaluate(Operator.EQ, "invalid", permission, policyContext);

        // Assert
        assertThat(result).isFalse();
        verify(policyContext).reportProblem("Right-operand must be equal to 'active', but was 'invalid'");
    }

    @Test
    void evaluate_withNoParticipantAgent_shouldReturnFalse() {
        // Arrange
        when(policyContext.participantAgent()).thenReturn(null);

        // Act
        var result = function.evaluate(Operator.EQ, "active", permission, policyContext);

        // Assert
        assertThat(result).isFalse();
        verify(policyContext).reportProblem("No ParticipantAgent found on context.");
    }

    @Test
    void evaluate_withNoVcClaim_shouldReturnFalse() {
        // Arrange
        when(participantAgent.getClaims()).thenReturn(Map.of());

        // Act
        var result = function.evaluate(Operator.EQ, "active", permission, policyContext);

        // Assert
        assertThat(result).isFalse();
        verify(policyContext).reportProblem("ParticipantAgent did not contain a 'vc' claim.");
    }

    @Test
    void evaluate_withEmptyVcList_shouldReturnFalse() {
        // Arrange
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of()));

        // Act
        var result = function.evaluate(Operator.EQ, "active", permission, policyContext);

        // Assert
        assertThat(result).isFalse();
        verify(policyContext).reportProblem("ParticipantAgent contains a 'vc' claim but it did not contain any VerifiableCredentials.");
    }

    @Test
    void evaluate_withNonMembershipCredential_shouldReturnFalse() {
        // Arrange
        var credential = VerifiableCredential.Builder.newInstance()
                .type("OtherCredential")
                .credentialSubject(CredentialSubject.Builder.newInstance()
                        .id("subject-123")
                        .claim("other", "value")
                        .build())
                .build();
        
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(credential)));

        // Act
        var result = function.evaluate(Operator.EQ, "active", permission, policyContext);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    void evaluate_withMultipleCredentials_onlyOneMembership_shouldReturnTrue() {
        // Arrange
        var membershipDate = Instant.now().minus(30, ChronoUnit.DAYS);
        var membershipCredential = createMembershipCredential(membershipDate);
        
        var otherCredential = VerifiableCredential.Builder.newInstance()
                .type("OtherCredential")
                .credentialSubject(CredentialSubject.Builder.newInstance()
                        .id("subject-123")
                        .claim("other", "value")
                        .build())
                .build();
        
        when(participantAgent.getClaims()).thenReturn(Map.of("vc", List.of(otherCredential, membershipCredential)));

        // Act
        var result = function.evaluate(Operator.EQ, "active", permission, policyContext);

        // Assert
        assertThat(result).isTrue();
    }

    private VerifiableCredential createMembershipCredential(Instant membershipSince) {
        var membershipClaim = Map.of(
                "since", membershipSince.toString(),
                "status", "active"
        );
        
        return VerifiableCredential.Builder.newInstance()
                .type("MembershipCredential")
                .credentialSubject(CredentialSubject.Builder.newInstance()
                        .id("subject-123")
                        .claim(MVD_NAMESPACE + "membership", membershipClaim)
                        .build())
                .build();
    }
}
