/**
 * Catalog Service
 * 
 * Provides enhanced DCAT-AP and HealthDCAT-AP property extraction
 * from EDC catalog responses. Transforms raw EDC catalog data into
 * rich, frontend-friendly format with full metadata.
 * 
 * @see https://healthdcat-ap.github.io/ for HealthDCAT-AP specification
 * @see https://www.w3.org/TR/vocab-dcat-3/ for DCAT 3.0 specification
 */

import axios from 'axios';
import { config } from '../config.js';

// ============================================================
// Type Definitions
// ============================================================

/**
 * Publisher information following DCAT-AP publisher requirements
 */
export interface Publisher {
  name: string;
  identifier: string;
  type: 'public-body' | 'research-institution' | 'hospital' | 'biobank' | 'registry' | 'pharma' | 'unknown';
  homepage?: string;
}

/**
 * Contact point following DCAT-AP contactPoint pattern
 */
export interface ContactPoint {
  email?: string;
  url?: string;
  name?: string;
}

/**
 * Distribution information (how the data can be accessed)
 */
export interface Distribution {
  format: string;
  mediaType?: string;
  accessService?: string;
  byteSize?: number;
}

/**
 * Policy summary derived from ODRL policies
 */
export interface PolicySummary {
  type: 'open' | 'consent-required' | 'restricted';
  requiredConsents?: string[];
  constraints?: string[];
}

/**
 * Enhanced Catalog Asset with full DCAT-AP and HealthDCAT-AP properties
 */
export interface EnhancedCatalogAsset {
  // Core identifiers
  ehrId: string;
  assetId: string;
  
  // DCT core properties
  title: string;
  description: string;
  language: string[];
  issued: string;
  modified: string;
  
  // Publisher & contact
  publisher: Publisher;
  contactPoint?: ContactPoint;
  
  // HealthDCAT-AP properties
  healthCategory: string;
  healthTheme?: string[];
  ageBand: string;
  minAge?: number;
  maxAge?: number;
  biologicalSex: string;
  populationCoverage?: string;
  clinicalPhase: string;
  meddraVersion: string;
  sensitiveCategory: string;
  
  // Clinical context
  sponsor?: {
    name: string;
    type: string;
    country: string;
  };
  therapeuticArea?: string;
  euCtNumber?: string;
  
  // DCAT distribution
  distributions: Distribution[];
  
  // Policy information
  policy: PolicySummary;
  
  // Quality & provenance
  qualityScore?: number;
  sourceSystem?: string;
  deIdentificationMethod?: string;
}

/**
 * Raw EDC catalog dataset structure
 */
interface EdcCatalogDataset {
  '@id'?: string;
  'edc:id'?: string;
  
  // DCT properties
  'dct:title'?: string;
  'dct:description'?: string;
  'dct:publisher'?: {
    'foaf:name'?: string;
    '@id'?: string;
    'dct:type'?: string;
    'foaf:homepage'?: string;
  } | string;
  'dct:contactPoint'?: {
    'vcard:hasEmail'?: string;
    'vcard:hasURL'?: string;
    'vcard:fn'?: string;
  };
  'dct:issued'?: string;
  'dct:modified'?: string;
  'dct:language'?: string | string[];
  
  // HealthDCAT-AP properties
  'healthdcatap:healthCategory'?: string;
  'healthdcatap:healthTheme'?: string | string[];
  'healthdcatap:ageRange'?: string;
  'healthdcatap:minAge'?: number;
  'healthdcatap:maxAge'?: number;
  'healthdcatap:biologicalSex'?: string;
  'healthdcatap:populationCoverage'?: string;
  'healthdcatap:clinicalTrialPhase'?: string;
  'healthdcatap:meddraVersion'?: string;
  'healthdcatap:sensitiveCategory'?: string;
  
  // Distribution
  'dcat:distribution'?: Array<{
    'dct:format'?: string;
    'dcat:mediaType'?: string;
    'dcat:accessService'?: string;
    'dcat:byteSize'?: number;
  }>;
  
  // ODRL policies
  'odrl:hasPolicy'?: unknown[];
  
  // Allow additional properties
  [key: string]: unknown;
}

interface EdcCatalog {
  'dcat:dataset'?: EdcCatalogDataset[];
  [key: string]: unknown;
}

/**
 * Raw EHR mock record structure from /api/ehr (simplified list format)
 * The list endpoint returns a flat structure, while /api/ehr/:id returns full credential
 */
interface EhrMockRecord {
  // Direct fields from /api/ehr list endpoint
  id?: string;
  ehrId?: string;
  pseudonymId?: string;
  ageBand?: string;
  biologicalSex?: string;
  primaryDiagnosis?: string;
  icdCode?: string;
  studyEligibility?: boolean;
  consentPurposes?: string[];
  qualityScore?: number;
  
  // Full credential fields (from /api/ehr/:id)
  issuer?: string;
  issuanceDate?: string;
  credentialSubject?: {
    id?: string;
    demographicsNode?: {
      ageBand?: string;
      biologicalSex?: string;
      region?: string;
    };
    conditionsNode?: {
      primaryDiagnosis?: {
        display?: string;
        code?: string;
      };
    };
    provenanceNode?: {
      sourceSystem?: string;
      qualityScore?: number;
      deIdentificationMethod?: string;
    };
    clinicalTrialNode?: {
      phase?: string;
      sponsor?: {
        name?: string;
        type?: string;
        country?: string;
      };
      therapeuticArea?: {
        name?: string;
      };
      euCtNumber?: string;
    };
    medDRANode?: {
      version?: string;
      primarySOC?: {
        name?: string;
      };
    };
    consentScope?: {
      purposes?: string[];
    };
  };
  [key: string]: unknown;
}

// ============================================================
// Service Functions
// ============================================================

/**
 * Extract publisher type from various formats
 */
function extractPublisherType(typeStr?: string): Publisher['type'] {
  if (!typeStr) return 'unknown';
  const lower = typeStr.toLowerCase();
  if (lower.includes('hospital') || lower.includes('klinik')) return 'hospital';
  if (lower.includes('research') || lower.includes('institut')) return 'research-institution';
  if (lower.includes('pharma')) return 'pharma';
  if (lower.includes('biobank')) return 'biobank';
  if (lower.includes('registry')) return 'registry';
  if (lower.includes('public') || lower.includes('government')) return 'public-body';
  return 'unknown';
}

/**
 * Extract policy type from ODRL policies
 */
function extractPolicyType(policies?: unknown[]): PolicySummary {
  if (!policies || policies.length === 0) {
    return { type: 'open' };
  }
  
  const requiredConsents: string[] = [];
  const constraints: string[] = [];
  
  for (const policy of policies) {
    if (typeof policy === 'object' && policy !== null) {
      const p = policy as Record<string, unknown>;
      
      // Check for consent constraints
      if (p['odrl:permission']) {
        const permissions = Array.isArray(p['odrl:permission']) 
          ? p['odrl:permission'] 
          : [p['odrl:permission']];
        
        for (const perm of permissions) {
          if (typeof perm === 'object' && perm !== null) {
            const permObj = perm as Record<string, unknown>;
            if (permObj['odrl:constraint']) {
              const constraintList = Array.isArray(permObj['odrl:constraint'])
                ? permObj['odrl:constraint']
                : [permObj['odrl:constraint']];
              
              for (const constraint of constraintList) {
                if (typeof constraint === 'object' && constraint !== null) {
                  const c = constraint as Record<string, unknown>;
                  if (c['odrl:leftOperand'] === 'consentPurpose' || 
                      String(c['odrl:leftOperand']).includes('consent')) {
                    const value = c['odrl:rightOperand'];
                    if (typeof value === 'string') {
                      requiredConsents.push(value);
                    } else if (Array.isArray(value)) {
                      requiredConsents.push(...value.filter((v): v is string => typeof v === 'string'));
                    }
                  }
                  constraints.push(String(c['odrl:leftOperand'] || 'unknown'));
                }
              }
            }
          }
        }
      }
    }
  }
  
  if (requiredConsents.length > 0) {
    return {
      type: 'consent-required',
      requiredConsents: [...new Set(requiredConsents)],
      constraints: [...new Set(constraints)],
    };
  }
  
  if (constraints.length > 0) {
    return {
      type: 'restricted',
      constraints: [...new Set(constraints)],
    };
  }
  
  return { type: 'open' };
}

/**
 * Transform EDC catalog to enhanced frontend format
 */
export function transformEdcCatalog(catalog: unknown): EnhancedCatalogAsset[] {
  const typedCatalog = catalog as EdcCatalog;
  const datasets = typedCatalog['dcat:dataset'] ?? [];
  
  return datasets.map((dataset: EdcCatalogDataset) => {
    const assetId = dataset['@id'] || dataset['edc:id'] || '';
    const ehrId = assetId.replace(/^asset:ehr:/, '').replace(/^ehr:/, '');
    
    // Extract publisher
    let publisher: Publisher;
    const rawPublisher = dataset['dct:publisher'];
    if (typeof rawPublisher === 'object' && rawPublisher !== null) {
      publisher = {
        name: rawPublisher['foaf:name'] || 'Unknown Provider',
        identifier: rawPublisher['@id'] || '',
        type: extractPublisherType(rawPublisher['dct:type']),
        homepage: rawPublisher['foaf:homepage'],
      };
    } else {
      publisher = {
        name: String(rawPublisher || 'Unknown Provider'),
        identifier: '',
        type: 'unknown',
      };
    }
    
    // Extract contact point
    let contactPoint: ContactPoint | undefined;
    const rawContact = dataset['dct:contactPoint'];
    if (rawContact) {
      contactPoint = {
        email: rawContact['vcard:hasEmail'],
        url: rawContact['vcard:hasURL'],
        name: rawContact['vcard:fn'],
      };
    }
    
    // Extract distributions
    const distributions: Distribution[] = [];
    const rawDists = dataset['dcat:distribution'];
    if (rawDists) {
      for (const dist of rawDists) {
        distributions.push({
          format: dist['dct:format'] || 'unknown',
          mediaType: dist['dcat:mediaType'],
          accessService: dist['dcat:accessService'],
          byteSize: dist['dcat:byteSize'],
        });
      }
    }
    if (distributions.length === 0) {
      // Default distribution for FHIR data
      distributions.push({
        format: 'application/fhir+json',
        mediaType: 'application/fhir+json',
      });
    }
    
    // Extract health theme as array
    const rawTheme = dataset['healthdcatap:healthTheme'];
    const healthTheme = rawTheme 
      ? (Array.isArray(rawTheme) ? rawTheme : [rawTheme])
      : undefined;
    
    // Extract language as array
    const rawLang = dataset['dct:language'];
    const language = rawLang
      ? (Array.isArray(rawLang) ? rawLang : [rawLang])
      : ['de', 'en'];
    
    // Build enhanced asset
    return {
      ehrId,
      assetId,
      title: dataset['dct:title'] || `EHR ${ehrId}`,
      description: dataset['dct:description'] || '',
      language,
      issued: dataset['dct:issued'] || new Date().toISOString(),
      modified: dataset['dct:modified'] || new Date().toISOString(),
      publisher,
      contactPoint,
      healthCategory: dataset['healthdcatap:healthCategory'] || 'unknown',
      healthTheme,
      ageBand: dataset['healthdcatap:ageRange'] || 'unknown',
      minAge: dataset['healthdcatap:minAge'],
      maxAge: dataset['healthdcatap:maxAge'],
      biologicalSex: dataset['healthdcatap:biologicalSex'] || 'unknown',
      populationCoverage: dataset['healthdcatap:populationCoverage'],
      clinicalPhase: dataset['healthdcatap:clinicalTrialPhase'] || 'unknown',
      meddraVersion: dataset['healthdcatap:meddraVersion'] || '27.0',
      sensitiveCategory: dataset['healthdcatap:sensitiveCategory'] || 'standard',
      distributions,
      policy: extractPolicyType(dataset['odrl:hasPolicy']),
    };
  });
}

/**
 * Fetch and transform mock EHR records to enhanced catalog format
 * Enriches with DCAT-like properties from the actual record data
 * 
 * The /api/ehr endpoint returns a simplified flat structure with these fields:
 * - id, pseudonymId, ageBand, biologicalSex, primaryDiagnosis, icdCode
 * - studyEligibility, consentPurposes, qualityScore
 */
export async function fetchEnhancedMockAssets(): Promise<EnhancedCatalogAsset[]> {
  try {
    const response = await axios.get(`${config.backendMock.url}/api/ehr`);
    const data = response.data;
    
    // Handle both array and { records: [...] } format
    const ehrRecords = Array.isArray(data) ? data : (data.records || []);
    
    return ehrRecords.map((ehr: EhrMockRecord): EnhancedCatalogAsset => {
      const ehrId = ehr.id || ehr.ehrId || 'unknown';
      const subject = ehr.credentialSubject;
      
      // Use flat fields first, fall back to nested credentialSubject
      const ageBand = ehr.ageBand || subject?.demographicsNode?.ageBand || 'unknown';
      const biologicalSex = ehr.biologicalSex || subject?.demographicsNode?.biologicalSex || 'unknown';
      const primaryDiagnosis = ehr.primaryDiagnosis || subject?.conditionsNode?.primaryDiagnosis?.display || '';
      const icdCode = ehr.icdCode || subject?.conditionsNode?.primaryDiagnosis?.code || '';
      const qualityScore = ehr.qualityScore || subject?.provenanceNode?.qualityScore;
      const consentPurposes = ehr.consentPurposes || subject?.consentScope?.purposes || [];
      
      // Extract sponsor info if available (from full credential only)
      let sponsor: EnhancedCatalogAsset['sponsor'] | undefined;
      if (subject?.clinicalTrialNode?.sponsor) {
        sponsor = {
          name: subject.clinicalTrialNode.sponsor.name || 'Unknown',
          type: subject.clinicalTrialNode.sponsor.type || 'unknown',
          country: subject.clinicalTrialNode.sponsor.country || 'EU',
        };
      }
      
      // Determine policy from consent purposes
      let policy: PolicySummary;
      if (consentPurposes.length > 0) {
        policy = {
          type: 'consent-required',
          requiredConsents: consentPurposes,
        };
      } else {
        policy = { type: 'open' };
      }
      
      // Map health category from ICD-10 code
      let healthCategory = 'General';
      if (icdCode) {
        const chapter = icdCode.charAt(0);
        const categoryMap: Record<string, string> = {
          'A': 'Infectious Disease',
          'B': 'Infectious Disease',
          'C': 'Oncology',
          'D': 'Hematology',
          'E': 'Endocrinology',
          'F': 'Psychiatry',
          'G': 'Neurology',
          'H': 'Ophthalmology',
          'I': 'Cardiology',
          'J': 'Pulmonology',
          'K': 'Gastroenterology',
          'L': 'Dermatology',
          'M': 'Rheumatology',
          'N': 'Nephrology',
          'O': 'Obstetrics',
          'P': 'Pediatrics',
          'Q': 'Rare Disease',
          'R': 'General',
          'S': 'Trauma',
          'T': 'Trauma',
          'Z': 'Prevention',
        };
        healthCategory = categoryMap[chapter] || 'General';
      }
      
      return {
        ehrId,
        assetId: `ehr:${ehrId}`,
        title: `EHR ${ehrId} - ${primaryDiagnosis || 'Clinical Record'}`,
        description: primaryDiagnosis,
        language: ['de', 'en'],
        issued: ehr.issuanceDate || new Date().toISOString(),
        modified: ehr.issuanceDate || new Date().toISOString(),
        publisher: {
          name: 'Rheinland Universitätsklinikum',
          identifier: ehr.issuer || 'did:web:rheinland-uklinikum.de',
          type: 'hospital',
          homepage: 'https://rheinland-uklinikum.de',
        },
        contactPoint: {
          email: 'dataoffice@rheinland-uklinikum.de',
          name: 'Health Data Office',
        },
        healthCategory,
        healthTheme: subject?.medDRANode?.primarySOC?.name 
          ? [subject.medDRANode.primarySOC.name] 
          : undefined,
        ageBand,
        biologicalSex,
        clinicalPhase: subject?.clinicalTrialNode?.phase || 'N/A',
        meddraVersion: subject?.medDRANode?.version || '27.0',
        sensitiveCategory: 'standard',
        sponsor,
        therapeuticArea: subject?.clinicalTrialNode?.therapeuticArea?.name,
        euCtNumber: subject?.clinicalTrialNode?.euCtNumber,
        distributions: [
          {
            format: 'application/fhir+json',
            mediaType: 'application/fhir+json',
          },
        ],
        policy,
        qualityScore,
        sourceSystem: subject?.provenanceNode?.sourceSystem,
        deIdentificationMethod: subject?.provenanceNode?.deIdentificationMethod,
      };
    });
  } catch (error) {
    console.error('[CatalogService] Failed to fetch from backend-mock:', error);
    return [];
  }
}

/**
 * Get catalog assets with enhanced DCAT properties
 * Uses EDC when available, falls back to enriched mock data
 */
export async function getEnhancedCatalogAssets(
  options: {
    offset?: number;
    limit?: number;
    useEdcFirst?: boolean;
  } = {}
): Promise<{
  assets: EnhancedCatalogAsset[];
  totalCount: number;
  source: 'edc-federated' | 'mock-fallback';
}> {
  const { offset = 0, limit = 50, useEdcFirst = true } = options;
  
  // Try EDC first if requested (in both hybrid and full mode)
  if (useEdcFirst) {
    try {
      // Import dynamically to avoid circular dependencies
      const { edcConsumerClient } = await import('./edcClient.js');
      
      const catalog = await edcConsumerClient.requestCatalog({
        counterPartyAddress: config.provider.dspUrl,
        counterPartyId: config.provider.participantId,
        querySpec: { offset, limit },
      });
      
      const assets = transformEdcCatalog(catalog);
      return {
        assets,
        totalCount: assets.length,
        source: 'edc-federated',
      };
    } catch (error) {
      console.log('[CatalogService] EDC unavailable, falling back to mock');
    }
  }
  
  // Fallback to enhanced mock
  const assets = await fetchEnhancedMockAssets();
  return {
    assets: assets.slice(offset, offset + limit),
    totalCount: assets.length,
    source: 'mock-fallback',
  };
}
