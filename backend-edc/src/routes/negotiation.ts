/**
 * Contract Negotiation Routes
 * 
 * Handles DSP contract negotiation flow with EDC Consumer Connector.
 * Supports initiating, polling, and completing negotiations.
 */

import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { edcConsumerClient, handleEdcError } from '../services/edcClient.js';

export const negotiationRouter = Router();

/**
 * POST /api/negotiations
 * Initiate a new contract negotiation
 */
negotiationRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { assetId, offerId, policyId } = req.body;

    if (!assetId || !offerId) {
      res.status(400).json({ error: 'assetId and offerId are required' });
      return;
    }

    const negotiation = await edcConsumerClient.initiateNegotiation({
      counterPartyAddress: config.provider.dspUrl,
      counterPartyId: config.provider.participantId,
      providerId: config.provider.participantId,
      offer: {
        offerId,
        assetId,
        policyId: policyId ?? offerId,
      },
    });

    res.status(201).json({
      negotiationId: negotiation['@id'],
      state: negotiation['edc:state'],
      message: 'Negotiation initiated',
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Negotiation initiation failed', message });
  }
});

/**
 * GET /api/negotiations/:id
 * Get negotiation status by ID
 */
negotiationRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const negotiation = await edcConsumerClient.getNegotiation(id);

    res.json({
      negotiationId: negotiation['@id'],
      state: negotiation['edc:state'],
      contractAgreementId: negotiation['edc:contractAgreementId'] ?? null,
      counterPartyId: negotiation['edc:counterPartyId'],
      counterPartyAddress: negotiation['edc:counterPartyAddress'],
      errorDetail: negotiation['edc:errorDetail'] ?? null,
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Negotiation query failed', message });
  }
});

/**
 * GET /api/negotiations
 * List all negotiations
 */
negotiationRouter.get('/', async (req: Request, res: Response) => {
  try {
    const negotiations = await edcConsumerClient.queryNegotiations({
      offset: parseInt(req.query.offset as string) || 0,
      limit: parseInt(req.query.limit as string) || 50,
    });

    const transformedNegotiations = negotiations.map((n: Record<string, unknown>) => ({
      negotiationId: n['@id'],
      state: n['edc:state'],
      contractAgreementId: n['edc:contractAgreementId'] ?? null,
      counterPartyId: n['edc:counterPartyId'],
    }));

    res.json({
      negotiations: transformedNegotiations,
      totalCount: transformedNegotiations.length,
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Negotiations query failed', message });
  }
});

/**
 * POST /api/negotiations/:id/poll
 * Poll negotiation until terminal state
 */
negotiationRouter.post('/:id/poll', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const maxWaitMs = parseInt(req.query.timeout as string) || 30000;
    const pollIntervalMs = parseInt(req.query.interval as string) || 1000;

    const result = await edcConsumerClient.pollNegotiation(id, maxWaitMs, pollIntervalMs);

    res.json({
      negotiationId: result['@id'],
      state: result['edc:state'],
      contractAgreementId: result['edc:contractAgreementId'] ?? null,
      isTerminal: isTerminalNegotiationState(result['edc:state'] as string),
      errorDetail: result['edc:errorDetail'] ?? null,
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Negotiation polling failed', message });
  }
});

/**
 * GET /api/negotiations/:id/agreement
 * Get the contract agreement for a completed negotiation
 */
negotiationRouter.get('/:id/agreement', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const negotiation = await edcConsumerClient.getNegotiation(id);

    const agreementId = negotiation['edc:contractAgreementId'];
    if (!agreementId) {
      res.status(404).json({ 
        error: 'No contract agreement yet',
        state: negotiation['edc:state'],
        message: 'Negotiation has not completed successfully',
      });
      return;
    }

    const agreement = await edcConsumerClient.getAgreement(agreementId as string);

    res.json({
      agreementId: agreement['@id'],
      assetId: agreement['edc:assetId'],
      providerId: agreement['edc:providerId'],
      consumerId: agreement['edc:consumerId'],
      contractSigningDate: agreement['edc:contractSigningDate'],
      policy: agreement['odrl:hasPolicy'],
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Agreement query failed', message });
  }
});

/**
 * Check if negotiation state is terminal
 */
function isTerminalNegotiationState(state: string): boolean {
  const terminalStates = ['FINALIZED', 'TERMINATED', 'VERIFIED'];
  return terminalStates.includes(state?.toUpperCase());
}
