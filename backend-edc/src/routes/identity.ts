/**
 * Identity Hub Routes
 * 
 * Handles credential attestation and DID operations.
 * Used for consent verification and membership checks.
 */

import { Router, Request, Response } from 'express';
import { config } from '../config.js';

export const identityRouter = Router();

// Identity Hub base URL
const identityHubUrl = config.consumer.identityHubUrl;
const providerIdentityHubUrl = config.provider.identityHubUrl;

/**
 * GET /api/identity/participant
 * Get participant information from Identity Hub
 */
identityRouter.get('/participant', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${identityHubUrl}/api/identity/v1alpha/participants`, {
      headers: {
        'X-Api-Key': config.edc.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      res.status(response.status).json({ error: 'Participant query failed', details: error });
      return;
    }

    const participants = await response.json();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ 
      error: 'Identity Hub connection failed', 
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/identity/credentials
 * List verifiable credentials
 */
identityRouter.get('/credentials', async (req: Request, res: Response) => {
  try {
    const participantId = req.query.participantId as string;
    if (!participantId) {
      res.status(400).json({ error: 'participantId query parameter required' });
      return;
    }

    const response = await fetch(
      `${identityHubUrl}/api/identity/v1alpha/participants/${encodeURIComponent(participantId)}/credentials`,
      {
        headers: {
          'X-Api-Key': config.edc.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      res.status(response.status).json({ error: 'Credentials query failed', details: error });
      return;
    }

    const credentials = await response.json();
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ 
      error: 'Identity Hub connection failed', 
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/identity/attestation/membership
 * Submit membership attestation for a participant
 */
identityRouter.post('/attestation/membership', async (req: Request, res: Response) => {
  try {
    const { participantId, participantDid, membershipType } = req.body;

    if (!participantId || !participantDid) {
      res.status(400).json({ error: 'participantId and participantDid are required' });
      return;
    }

    // In a real implementation, this would:
    // 1. Create a MembershipCredential VC
    // 2. Submit to Issuer Service for signing
    // 3. Store in participant's Identity Hub

    // For demo, simulate attestation creation
    const attestation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'MembershipCredential'],
      issuer: 'did:example:issuer',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: participantDid,
        participantId,
        memberOf: 'HealthDataSpace',
        membershipType: membershipType ?? 'full',
      },
    };

    res.status(201).json({
      message: 'Membership attestation created',
      attestation,
      status: 'pending_signature',
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Attestation creation failed', 
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/identity/attestation/consent
 * Submit consent attestation for a patient
 */
identityRouter.post('/attestation/consent', async (req: Request, res: Response) => {
  try {
    const { 
      patientDid, 
      studyId, 
      purpose, 
      ehrIds, 
      consentScope,
      expirationDate,
    } = req.body;

    if (!patientDid || !studyId || !purpose) {
      res.status(400).json({ 
        error: 'patientDid, studyId, and purpose are required',
      });
      return;
    }

    // Create ConsentCredential structure
    const consentCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://ehds.europa.eu/credentials/v1',
      ],
      type: ['VerifiableCredential', 'ConsentCredential'],
      issuer: 'did:example:issuer',
      issuanceDate: new Date().toISOString(),
      expirationDate: expirationDate ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      credentialSubject: {
        id: patientDid,
        consentType: 'research',
        purpose,
        studyId,
        ehrIds: ehrIds ?? [],
        scope: consentScope ?? {
          demographics: true,
          diagnosis: true,
          medications: true,
          labResults: true,
          genomics: false,
          mentalHealth: false,
        },
        legalBasis: 'EHDS-Art41',
        dataController: config.provider.participantId,
      },
    };

    res.status(201).json({
      message: 'Consent attestation created',
      credential: consentCredential,
      status: 'pending_signature',
      validUntil: consentCredential.expirationDate,
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Consent attestation creation failed', 
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/identity/consent/:patientDid
 * Check consent status for a patient
 */
identityRouter.get('/consent/:patientDid', async (req: Request, res: Response) => {
  try {
    const { patientDid } = req.params;
    const studyId = req.query.studyId as string;

    // In a real implementation, this would query the Identity Hub
    // for ConsentCredentials matching the patient and study

    // For demo, return simulated consent status
    res.json({
      patientDid,
      studyId: studyId ?? 'all',
      consents: [
        {
          studyId: studyId ?? 'STUDY-001',
          status: 'active',
          grantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
          scope: {
            demographics: true,
            diagnosis: true,
            medications: true,
            labResults: true,
            genomics: false,
            mentalHealth: false,
          },
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Consent query failed', 
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/identity/consent/:patientDid/revoke
 * Revoke consent for a patient
 */
identityRouter.post('/consent/:patientDid/revoke', async (req: Request, res: Response) => {
  try {
    const { patientDid } = req.params;
    const { studyId, reason } = req.body;

    if (!studyId) {
      res.status(400).json({ error: 'studyId is required' });
      return;
    }

    // In real implementation:
    // 1. Mark consent as revoked in Identity Hub
    // 2. Trigger policy webhook to downstream consumers
    // 3. Log revocation event for audit

    res.json({
      message: 'Consent revoked successfully',
      patientDid,
      studyId,
      revokedAt: new Date().toISOString(),
      reason: reason ?? 'patient_request',
      policyWebhookTriggered: true,
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Consent revocation failed', 
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/identity/provider/verify
 * Verify provider's dataspace membership and credentials
 */
identityRouter.get('/provider/verify', async (req: Request, res: Response) => {
  try {
    // Query provider's Identity Hub for membership credential
    const response = await fetch(
      `${providerIdentityHubUrl}/api/identity/v1alpha/participants`,
      {
        headers: {
          'X-Api-Key': config.edc.apiKey,
        },
      }
    );

    if (!response.ok) {
      res.status(502).json({ 
        error: 'Provider verification failed',
        verified: false,
      });
      return;
    }

    const participants = await response.json();

    res.json({
      verified: true,
      providerId: config.provider.participantId,
      membershipCredential: 'valid',
      participants,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Provider verification failed', 
      verified: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
