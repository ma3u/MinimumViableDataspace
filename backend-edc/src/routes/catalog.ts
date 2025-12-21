/**
 * Catalog Routes
 * 
 * Provides catalog endpoints that proxy to EDC Consumer Connector.
 * Transforms EDC catalog responses to frontend-friendly format with
 * full DCAT-AP and HealthDCAT-AP metadata.
 * Falls back to backend-mock in hybrid mode when EDC is unavailable.
 */

import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { edcConsumerClient, handleEdcError } from '../services/edcClient.js';
import { 
  getEnhancedCatalogAssets
} from '../services/catalogService.js';

export const catalogRouter = Router();

// ============================================================
// Legacy Type Definitions (for backward compatibility)
// ============================================================

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

interface LegacyTransformedAsset {
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

// ============================================================
// Routes
// ============================================================

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
 * Get catalog assets transformed for frontend consumption with full DCAT-AP metadata.
 * Falls back to backend-mock in hybrid mode when EDC is unavailable.
 * 
 * Query parameters:
 * - offset: number (default 0)
 * - limit: number (default 50)
 * - enhanced: boolean (default true) - return enhanced DCAT properties
 */
catalogRouter.get('/assets', async (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 50;
  const useEnhanced = req.query.enhanced !== 'false';
  
  try {
    if (useEnhanced) {
      // Use enhanced catalog service with full DCAT properties
      const result = await getEnhancedCatalogAssets({ offset, limit, useEdcFirst: true });
      
      return res.json({
        assets: result.assets,
        totalCount: result.totalCount,
        source: result.source,
        providerDsp: config.provider.dspUrl,
        enhanced: true,
      });
    }
    
    // Legacy mode: simple transformation
    const catalog = await edcConsumerClient.requestCatalog({
      counterPartyAddress: config.provider.dspUrl,
      counterPartyId: config.provider.participantId,
      querySpec: { offset, limit },
    });

    const assets = transformCatalogToLegacyAssets(catalog);

    res.json({
      assets,
      totalCount: assets.length,
      source: 'edc-federated',
      providerDsp: config.provider.dspUrl,
      enhanced: false,
    });
  } catch (error) {
    // In hybrid mode, fall back to enhanced mock data when EDC is unavailable
    if (config.mode === 'hybrid') {
      console.log('[Catalog] EDC unavailable, using enhanced mock fallback');
      const result = await getEnhancedCatalogAssets({ offset, limit, useEdcFirst: false });
      
      if (result.assets.length > 0) {
        return res.json({
          assets: result.assets,
          totalCount: result.totalCount,
          source: 'mock-fallback',
          message: 'EDC unavailable, showing enriched mock data',
          enhanced: true,
        });
      }
    }
    
    const { status, message } = handleEdcError(error);
    res.status(status).json({ 
      error: 'Asset query failed', 
      message,
      assets: [],
      totalCount: 0,
      source: 'error',
      enhanced: false,
    });
  }
});

/**
 * GET /api/catalog/assets/enhanced
 * Dedicated endpoint for enhanced catalog assets with full DCAT-AP metadata.
 * Always returns the richest available data.
 */
catalogRouter.get('/assets/enhanced', async (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 50;
  
  try {
    const result = await getEnhancedCatalogAssets({ offset, limit, useEdcFirst: true });
    
    res.json({
      assets: result.assets,
      totalCount: result.totalCount,
      source: result.source,
      providerDsp: config.provider.dspUrl,
    });
  } catch (error) {
    const { status, message } = handleEdcError(error);
    res.status(status).json({ 
      error: 'Enhanced catalog query failed', 
      message,
      assets: [],
      totalCount: 0,
      source: 'error',
    });
  }
});

// ============================================================
// Legacy Transform Functions (backward compatibility)
// ============================================================

function transformCatalogToLegacyAssets(catalog: unknown): LegacyTransformedAsset[] {
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
