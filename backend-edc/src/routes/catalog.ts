/**
 * Catalog Routes
 * 
 * Provides catalog endpoints that proxy to EDC Consumer Connector.
 * Transforms EDC catalog responses to frontend-friendly format.
 */

import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { edcConsumerClient, handleEdcError } from '../services/edcClient.js';

export const catalogRouter = Router();

/**
 * GET /api/catalog
 * Request catalog from provider via EDC
 */
catalogRouter.get('/', async (req: Request, res: Response) => {
  try {
    const catalog = await edcConsumerClient.requestCatalog({
      counterPartyAddress: config.provider.dspUrl,
      counterPartyId: config.provider.participantId,
      querySpec: {
        offset: parseInt(req.query.offset as string) || 0,
        limit: parseInt(req.query.limit as string) || 50,
      },
    });

    res.json(catalog);
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Catalog request failed', message });
  }
});

/**
 * GET /api/catalog/cached
 * Query cached catalogs from federated catalog
 */
catalogRouter.get('/cached', async (req: Request, res: Response) => {
  try {
    const catalog = await edcConsumerClient.queryCachedCatalog({
      offset: parseInt(req.query.offset as string) || 0,
      limit: parseInt(req.query.limit as string) || 50,
    });

    res.json(catalog);
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ error: 'Cached catalog query failed', message });
  }
});

/**
 * GET /api/catalog/assets
 * Get catalog assets transformed for frontend consumption
 */
catalogRouter.get('/assets', async (req: Request, res: Response) => {
  try {
    const catalog = await edcConsumerClient.requestCatalog({
      counterPartyAddress: config.provider.dspUrl,
      counterPartyId: config.provider.participantId,
      querySpec: {
        offset: parseInt(req.query.offset as string) || 0,
        limit: parseInt(req.query.limit as string) || 50,
      },
    });

    // Transform DCAT catalog to frontend asset format
    const assets = transformCatalogToAssets(catalog);

    res.json({
      assets,
      totalCount: assets.length,
      source: 'edc-federated',
      providerDsp: config.provider.dspUrl,
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ 
      error: 'Asset query failed', 
      message,
      assets: [],
      totalCount: 0,
      source: 'error',
    });
  }
});

/**
 * Transform EDC catalog to frontend-friendly asset format
 */
interface CatalogDataset {
  '@id'?: string;
  'dct:title'?: string;
  'dct:description'?: string;
  'healthdcatap:healthCategory'?: string;
  'healthdcatap:ageRange'?: string;
  'healthdcatap:biologicalSex'?: string;
  'healthdcatap:clinicalTrialPhase'?: string;
  'healthdcatap:meddraVersion'?: string;
  'healthdcatap:sensitiveCategory'?: string;
  'odrl:hasPolicy'?: unknown[];
  [key: string]: unknown;
}

interface Catalog {
  'dcat:dataset'?: CatalogDataset[];
  [key: string]: unknown;
}

interface TransformedAsset {
  ehrId: string;
  assetId: string;
  title: string;
  description: string;
  healthCategory: string;
  ageBand: string;
  biologicalSex: string;
  clinicalPhase: string;
  meddraVersion: string;
  sensitiveCategory: string;
  policies: unknown[];
}

function transformCatalogToAssets(catalog: unknown): TransformedAsset[] {
  const typedCatalog = catalog as Catalog;
  const datasets = typedCatalog['dcat:dataset'] ?? [];
  
  return datasets.map((dataset: CatalogDataset) => {
    const assetId = dataset['@id'] ?? '';
    const ehrId = assetId.replace(/^asset:ehr:/, '').replace(/^ehr:/, '');

    return {
      ehrId,
      assetId,
      title: dataset['dct:title'] ?? `EHR ${ehrId}`,
      description: dataset['dct:description'] ?? '',
      healthCategory: dataset['healthdcatap:healthCategory'] ?? 'unknown',
      ageBand: dataset['healthdcatap:ageRange'] ?? 'unknown',
      biologicalSex: dataset['healthdcatap:biologicalSex'] ?? 'unknown',
      clinicalPhase: dataset['healthdcatap:clinicalTrialPhase'] ?? 'unknown',
      meddraVersion: dataset['healthdcatap:meddraVersion'] ?? '27.0',
      sensitiveCategory: dataset['healthdcatap:sensitiveCategory'] ?? 'standard',
      policies: dataset['odrl:hasPolicy'] ?? [],
    };
  });
}
