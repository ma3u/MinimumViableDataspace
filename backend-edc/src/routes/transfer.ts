/**
 * Data Transfer Routes
 * 
 * Handles data transfer process with EDC.
 * Supports initiating transfers, polling status, and fetching data via EDR.
 */

import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { edcConsumerClient, handleEdcError } from '../services/edcClient.js';
import { dataFetcher } from '../services/dataFetcher.js';

export const transferRouter = Router();

/**
 * POST /api/transfers
 * Initiate a new data transfer
 */
transferRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { contractAgreementId, assetId } = req.body;

    if (!contractAgreementId || !assetId) {
      res.status(400).json({ error: 'contractAgreementId and assetId are required' });
      return;
    }

    const transfer = await edcConsumerClient.initiateTransfer({
      contractId: contractAgreementId,
      assetId,
      counterPartyAddress: config.provider.dspUrl,
      transferType: 'HttpData-PULL',
      dataDestination: {
        type: 'HttpData',
      },
    });

    res.status(201).json({
      transferId: transfer['@id'],
      state: transfer['edc:state'],
      message: 'Transfer initiated',
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Transfer initiation failed', message });
  }
});

/**
 * GET /api/transfers/:id
 * Get transfer status by ID
 */
transferRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await edcConsumerClient.getTransfer(id);

    res.json({
      transferId: transfer['@id'],
      state: transfer['edc:state'],
      type: transfer['edc:type'],
      assetId: transfer['edc:assetId'],
      contractId: transfer['edc:contractId'],
      correlationId: transfer['edc:correlationId'] ?? null,
      errorDetail: transfer['edc:errorDetail'] ?? null,
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Transfer query failed', message });
  }
});

/**
 * GET /api/transfers
 * List all transfers
 */
transferRouter.get('/', async (req: Request, res: Response) => {
  try {
    const transfers = await edcConsumerClient.queryTransfers({
      offset: parseInt(req.query.offset as string) || 0,
      limit: parseInt(req.query.limit as string) || 50,
    });

    const transformedTransfers = transfers.map((t: Record<string, unknown>) => ({
      transferId: t['@id'],
      state: t['edc:state'],
      assetId: t['edc:assetId'],
      contractId: t['edc:contractId'],
      type: t['edc:type'],
    }));

    res.json({
      transfers: transformedTransfers,
      totalCount: transformedTransfers.length,
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Transfers query failed', message });
  }
});

/**
 * POST /api/transfers/:id/poll
 * Poll transfer until terminal state
 */
transferRouter.post('/:id/poll', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const maxWaitMs = parseInt(req.query.timeout as string) || 30000;
    const pollIntervalMs = parseInt(req.query.interval as string) || 1000;

    const result = await edcConsumerClient.pollTransfer(id, maxWaitMs, pollIntervalMs);

    res.json({
      transferId: result['@id'],
      state: result['edc:state'],
      isTerminal: isTerminalTransferState(result['edc:state'] as string),
      errorDetail: result['edc:errorDetail'] ?? null,
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Transfer polling failed', message });
  }
});

/**
 * GET /api/transfers/:id/edr
 * Get the Endpoint Data Reference for a completed transfer
 */
transferRouter.get('/:id/edr', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const edr = await edcConsumerClient.getEdrDataAddress(id);

    if (!edr) {
      res.status(404).json({ 
        error: 'No EDR available',
        message: 'Transfer has not completed or EDR not yet issued',
      });
      return;
    }

    res.json({
      transferId: id,
      endpoint: edr['edc:endpoint'],
      authType: edr['edc:authType'],
      // Note: authCode/token not exposed for security
      hasCredentials: !!edr['edc:authCode'] || !!edr['edc:authorization'],
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'EDR query failed', message });
  }
});

/**
 * GET /api/transfers/:id/data
 * Fetch the actual data using the EDR
 */
transferRouter.get('/:id/data', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // First get the EDR, then fetch data using it
    const edr = await edcConsumerClient.getEdrDataAddress(id);
    const data = await edcConsumerClient.fetchDataViaEdr(edr);

    res.json({
      transferId: id,
      data,
      fetchedAt: new Date().toISOString(),
      source: 'edc-dataplane',
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ 
      error: 'Data fetch failed', 
      message,
      transferId: id,
    });
  }
});

/**
 * Check if transfer state is terminal
 */
function isTerminalTransferState(state: string): boolean {
  const terminalStates = ['COMPLETED', 'STARTED', 'TERMINATED', 'SUSPENDED'];
  return terminalStates.includes(state?.toUpperCase());
}

// ============================================================
// Hybrid Mode Routes - Use dataFetcher for mode-aware fetching
// ============================================================

/**
 * GET /api/ehr/:id
 * Fetch EHR record - mode-aware (hybrid uses mock, full uses EDC)
 */
transferRouter.get('/ehr/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await dataFetcher.fetch(id);

    res.json({
      ...result.data,
      _meta: {
        source: result.source,
        mode: config.mode,
        transferId: result.transferId,
        fromCache: result.fromCache,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'EHR fetch failed', message });
  }
});

/**
 * POST /api/ehr/:id/transfer
 * Initiate full EDC transfer for an EHR record
 * Returns contract agreement ID and transfer ID for tracking
 */
transferRouter.post('/ehr/:id/transfer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { offerId, policyId } = req.body;

    if (!offerId) {
      res.status(400).json({ error: 'offerId is required (from catalog query)' });
      return;
    }

    const assetId = `ehr:${id}`;

    // Step 1: Initiate negotiation
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

    const negotiationId = negotiation['@id'] as string;

    // Step 2: Poll until negotiation completes
    const completedNegotiation = await edcConsumerClient.pollNegotiation(
      negotiationId,
      config.timeouts.negotiationMaxWaitMs,
      config.timeouts.negotiationPollMs
    );

    const contractAgreementId = completedNegotiation['edc:contractAgreementId'] as string;
    if (!contractAgreementId) {
      res.status(400).json({ 
        error: 'Negotiation did not produce agreement',
        state: completedNegotiation['edc:state'],
        errorDetail: completedNegotiation['edc:errorDetail'],
      });
      return;
    }

    // Step 3: Initiate transfer
    const transfer = await edcConsumerClient.initiateTransfer({
      contractId: contractAgreementId,
      assetId,
      connectorId: config.provider.participantId,
      counterPartyAddress: config.provider.dspUrl,
      transferType: 'HttpData-PULL',
      dataDestination: {
        type: 'HttpData',
      },
    });

    res.status(201).json({
      ehrId: id,
      negotiationId,
      contractAgreementId,
      transferId: transfer['@id'],
      message: 'Transfer initiated - poll /api/transfers/:id for status',
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'EHR transfer initiation failed', message });
  }
});
