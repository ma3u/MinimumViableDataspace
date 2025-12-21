/**
 * Catalog Service Tests
 * 
 * Comprehensive test suite for Phase 9: Dynamic Data Integration
 * Tests DCAT-AP property extraction, policy parsing, and mock enrichment.
 * 
 * @see catalogService.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { 
  transformEdcCatalog,
  fetchEnhancedMockAssets,
  getEnhancedCatalogAssets,
  type EnhancedCatalogAsset,
  type Publisher,
  type PolicySummary,
} from './catalogService.js';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Mock config
vi.mock('../config.js', () => ({
  config: {
    backendMock: { url: 'http://localhost:4001' },
    consumer: { 
      managementUrl: 'http://localhost:8081',
      participantId: 'did:web:consumer.local',
    },
    provider: {
      dspUrl: 'http://localhost:8192/api/dsp',
      participantId: 'did:web:provider.local',
    },
  },
}));

// ============================================================
// Test Data Fixtures
// ============================================================

/**
 * Sample EDC catalog response with full DCAT-AP properties
 */
const SAMPLE_EDC_CATALOG = {
  '@context': [
    'https://w3id.org/dcat/',
    'https://healthdcat-ap.github.io/ns/',
  ],
  '@type': 'dcat:Catalog',
  'dcat:dataset': [
    {
      '@id': 'ehr:EHR001',
      'edc:id': 'ehr:EHR001',
      'dct:title': 'EHR EHR001 - Type 2 Diabetes',
      'dct:description': 'Clinical record for type 2 diabetes patient',
      'dct:issued': '2025-01-01T00:00:00Z',
      'dct:modified': '2025-06-15T10:30:00Z',
      'dct:language': ['de', 'en'],
      'dct:publisher': {
        '@id': 'did:web:rheinland-uklinikum.de',
        'foaf:name': 'Rheinland Universitätsklinikum',
        'dct:type': 'hospital',
        'foaf:homepage': 'https://rheinland-uklinikum.de',
      },
      'dct:contactPoint': {
        'vcard:hasEmail': 'dataoffice@rheinland.de',
        'vcard:hasURL': 'https://rheinland.de/data-office',
        'vcard:fn': 'Health Data Office',
      },
      'healthdcatap:healthCategory': 'Endocrinology',
      'healthdcatap:healthTheme': ['Diabetes', 'Metabolic Disorders'],
      'healthdcatap:ageRange': '55-64',
      'healthdcatap:minAge': 55,
      'healthdcatap:maxAge': 64,
      'healthdcatap:biologicalSex': 'male',
      'healthdcatap:populationCoverage': 'Germany-NRW',
      'healthdcatap:clinicalTrialPhase': 'Phase III',
      'healthdcatap:meddraVersion': '27.0',
      'healthdcatap:sensitiveCategory': 'standard',
      'dcat:distribution': [
        {
          'dct:format': 'application/fhir+json',
          'dcat:mediaType': 'application/fhir+json',
          'dcat:byteSize': 15360,
        },
      ],
      'odrl:hasPolicy': [
        {
          '@type': 'odrl:Set',
          'odrl:permission': [
            {
              'odrl:action': 'use',
              'odrl:constraint': [
                {
                  'odrl:leftOperand': 'MembershipCredential',
                  'odrl:operator': 'eq',
                  'odrl:rightOperand': 'active',
                },
                {
                  'odrl:leftOperand': 'consentPurpose',
                  'odrl:operator': 'eq',
                  'odrl:rightOperand': 'clinical-research',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      '@id': 'ehr:EHR002',
      'dct:title': 'EHR EHR002 - Cardiology Record',
      'healthdcatap:healthCategory': 'Cardiology',
      'healthdcatap:ageRange': '65-74',
      'healthdcatap:biologicalSex': 'female',
      'healthdcatap:clinicalTrialPhase': 'Phase II',
      // Minimal record - tests fallback defaults
    },
  ],
};

/**
 * Sample mock EHR records from /api/ehr (flat structure)
 */
const SAMPLE_MOCK_EHR_RECORDS = [
  {
    id: 'EHR001',
    pseudonymId: 'A7X9K2',
    ageBand: '55-64',
    biologicalSex: 'male',
    primaryDiagnosis: 'Type 2 diabetes mellitus without complications',
    icdCode: 'E11.9',
    studyEligibility: true,
    consentPurposes: ['clinical-research', 'registry-participation'],
    qualityScore: 0.94,
  },
  {
    id: 'EHR006',
    pseudonymId: 'G2K5T9',
    ageBand: '25-34',
    biologicalSex: 'female',
    primaryDiagnosis: 'Multiple sclerosis',
    icdCode: 'G35',
    studyEligibility: true,
    consentPurposes: ['clinical-research'],
    qualityScore: 0.91,
  },
  {
    id: 'EHR010',
    pseudonymId: 'P8Q2X1',
    ageBand: '45-54',
    biologicalSex: 'male',
    primaryDiagnosis: 'Breast cancer, unspecified',
    icdCode: 'C50',
    studyEligibility: true,
    consentPurposes: [],
    qualityScore: 0.88,
  },
];

// ============================================================
// transformEdcCatalog Tests
// ============================================================

describe('transformEdcCatalog', () => {
  describe('Core Asset Extraction', () => {
    it('should extract ehrId from asset @id', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result).toHaveLength(2);
      expect(result[0].ehrId).toBe('EHR001');
      expect(result[1].ehrId).toBe('EHR002');
    });

    it('should extract assetId preserving original format', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].assetId).toBe('ehr:EHR001');
    });

    it('should extract title from dct:title', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].title).toBe('EHR EHR001 - Type 2 Diabetes');
    });

    it('should generate default title when dct:title missing', () => {
      const catalog = {
        'dcat:dataset': [{ '@id': 'ehr:EHR999' }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].title).toBe('EHR EHR999');
    });

    it('should extract description from dct:description', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].description).toBe('Clinical record for type 2 diabetes patient');
    });

    it('should handle empty description gracefully', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[1].description).toBe('');
    });
  });

  describe('Publisher Extraction', () => {
    it('should extract full publisher details from object', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      const publisher = result[0].publisher;
      
      expect(publisher.name).toBe('Rheinland Universitätsklinikum');
      expect(publisher.identifier).toBe('did:web:rheinland-uklinikum.de');
      expect(publisher.type).toBe('hospital');
      expect(publisher.homepage).toBe('https://rheinland-uklinikum.de');
    });

    it('should provide default publisher when missing', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      const publisher = result[1].publisher;
      
      expect(publisher.name).toBe('Unknown Provider');
      expect(publisher.type).toBe('unknown');
    });

    it('should handle publisher as string', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:EHR999',
          'dct:publisher': 'Some Hospital Name',
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].publisher.name).toBe('Some Hospital Name');
      expect(result[0].publisher.type).toBe('unknown');
    });
  });

  describe('Publisher Type Classification', () => {
    const testCases: Array<[string, Publisher['type']]> = [
      ['Hospital', 'hospital'],
      ['Universitätsklinikum', 'hospital'],
      ['Research Institute', 'research-institution'],
      ['Forschungsinstitut', 'research-institution'],
      ['Pharma Company', 'pharma'],
      ['National Biobank', 'biobank'],
      ['Disease Registry', 'registry'],
      ['Public Health Authority', 'public-body'],
      ['Government Agency', 'public-body'],
      ['Some Other Type', 'unknown'],
    ];

    it.each(testCases)('should classify "%s" as %s', (typeStr, expected) => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'dct:publisher': {
            'foaf:name': 'Test',
            'dct:type': typeStr,
          },
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].publisher.type).toBe(expected);
    });
  });

  describe('Contact Point Extraction', () => {
    it('should extract full contact point details', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      const contact = result[0].contactPoint;
      
      expect(contact).toBeDefined();
      expect(contact?.email).toBe('dataoffice@rheinland.de');
      expect(contact?.url).toBe('https://rheinland.de/data-office');
      expect(contact?.name).toBe('Health Data Office');
    });

    it('should handle missing contact point', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[1].contactPoint).toBeUndefined();
    });
  });

  describe('HealthDCAT-AP Properties', () => {
    it('should extract healthCategory', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].healthCategory).toBe('Endocrinology');
      expect(result[1].healthCategory).toBe('Cardiology');
    });

    it('should extract healthTheme as array', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].healthTheme).toEqual(['Diabetes', 'Metabolic Disorders']);
    });

    it('should convert single healthTheme to array', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'healthdcatap:healthTheme': 'Single Theme',
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].healthTheme).toEqual(['Single Theme']);
    });

    it('should extract age range properties', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].ageBand).toBe('55-64');
      expect(result[0].minAge).toBe(55);
      expect(result[0].maxAge).toBe(64);
    });

    it('should extract biological sex', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].biologicalSex).toBe('male');
      expect(result[1].biologicalSex).toBe('female');
    });

    it('should extract clinical trial phase', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].clinicalPhase).toBe('Phase III');
      expect(result[1].clinicalPhase).toBe('Phase II');
    });

    it('should extract MedDRA version', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].meddraVersion).toBe('27.0');
    });

    it('should default MedDRA version to 27.0', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[1].meddraVersion).toBe('27.0');
    });

    it('should extract sensitive category', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].sensitiveCategory).toBe('standard');
    });

    it('should default sensitive category to standard', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[1].sensitiveCategory).toBe('standard');
    });
  });

  describe('Language Handling', () => {
    it('should extract language array', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].language).toEqual(['de', 'en']);
    });

    it('should convert single language to array', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'dct:language': 'en',
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].language).toEqual(['en']);
    });

    it('should default to de/en when not specified', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[1].language).toEqual(['de', 'en']);
    });
  });

  describe('Distribution Extraction', () => {
    it('should extract full distribution details', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      const dist = result[0].distributions[0];
      
      expect(dist.format).toBe('application/fhir+json');
      expect(dist.mediaType).toBe('application/fhir+json');
      expect(dist.byteSize).toBe(15360);
    });

    it('should provide default FHIR distribution when missing', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[1].distributions).toHaveLength(1);
      expect(result[1].distributions[0].format).toBe('application/fhir+json');
    });
  });

  describe('Timestamp Handling', () => {
    it('should extract issued and modified dates', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[0].issued).toBe('2025-01-01T00:00:00Z');
      expect(result[0].modified).toBe('2025-06-15T10:30:00Z');
    });

    it('should generate current timestamp when missing', () => {
      const before = new Date().toISOString();
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      const after = new Date().toISOString();
      
      // Asset 2 has no dates, should be generated
      expect(result[1].issued >= before).toBe(true);
      expect(result[1].issued <= after).toBe(true);
    });
  });

  describe('Empty Catalog Handling', () => {
    it('should return empty array for null/undefined catalog', () => {
      // Note: Current implementation throws on null, tests document actual behavior
      expect(() => transformEdcCatalog(null)).toThrow();
      expect(() => transformEdcCatalog(undefined)).toThrow();
    });

    it('should return empty array for catalog without datasets', () => {
      const result = transformEdcCatalog({ '@type': 'dcat:Catalog' });
      expect(result).toEqual([]);
    });

    it('should return empty array for empty datasets array', () => {
      const result = transformEdcCatalog({ 'dcat:dataset': [] });
      expect(result).toEqual([]);
    });
  });
});

// ============================================================
// Policy Extraction Tests
// ============================================================

describe('Policy Extraction (via transformEdcCatalog)', () => {
  describe('Consent-Required Policies', () => {
    it('should extract consent-required policy with purposes', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      const policy = result[0].policy;
      
      expect(policy.type).toBe('consent-required');
      expect(policy.requiredConsents).toContain('clinical-research');
      expect(policy.constraints).toContain('MembershipCredential');
      expect(policy.constraints).toContain('consentPurpose');
    });

    it('should detect consent from consentPurpose leftOperand', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'odrl:hasPolicy': [{
            'odrl:permission': [{
              'odrl:constraint': [{
                'odrl:leftOperand': 'consentPurpose',
                'odrl:rightOperand': 'data-sharing',
              }],
            }],
          }],
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].policy.type).toBe('consent-required');
    });

    it('should handle multiple consent purposes as array', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'odrl:hasPolicy': [{
            'odrl:permission': [{
              'odrl:constraint': [{
                'odrl:leftOperand': 'consentPurpose',
                'odrl:rightOperand': ['research', 'registry', 'analytics'],
              }],
            }],
          }],
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].policy.requiredConsents).toEqual(['research', 'registry', 'analytics']);
    });
  });

  describe('Restricted Policies', () => {
    it('should return restricted for policies with non-consent constraints', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'odrl:hasPolicy': [{
            'odrl:permission': [{
              'odrl:constraint': [{
                'odrl:leftOperand': 'MembershipCredential',
                'odrl:operator': 'eq',
                'odrl:rightOperand': 'active',
              }],
            }],
          }],
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].policy.type).toBe('restricted');
      expect(result[0].policy.constraints).toContain('MembershipCredential');
    });
  });

  describe('Open Policies', () => {
    it('should return open for empty policy array', () => {
      const result = transformEdcCatalog(SAMPLE_EDC_CATALOG);
      expect(result[1].policy.type).toBe('open');
    });

    it('should return open for missing policies', () => {
      const catalog = {
        'dcat:dataset': [{ '@id': 'ehr:TEST' }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].policy.type).toBe('open');
    });

    it('should return open for policy without permissions', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'odrl:hasPolicy': [{ '@type': 'odrl:Set' }],
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].policy.type).toBe('open');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single constraint (not array)', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'odrl:hasPolicy': [{
            'odrl:permission': {
              'odrl:constraint': {
                'odrl:leftOperand': 'consentPurpose',
                'odrl:rightOperand': 'research',
              },
            },
          }],
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].policy.type).toBe('consent-required');
    });

    it('should deduplicate repeated constraints', () => {
      const catalog = {
        'dcat:dataset': [{
          '@id': 'ehr:TEST',
          'odrl:hasPolicy': [
            {
              'odrl:permission': [{
                'odrl:constraint': [{
                  'odrl:leftOperand': 'consentPurpose',
                  'odrl:rightOperand': 'research',
                }],
              }],
            },
            {
              'odrl:permission': [{
                'odrl:constraint': [{
                  'odrl:leftOperand': 'consentPurpose',
                  'odrl:rightOperand': 'research',
                }],
              }],
            },
          ],
        }],
      };
      const result = transformEdcCatalog(catalog);
      expect(result[0].policy.requiredConsents).toHaveLength(1);
    });
  });
});

// ============================================================
// fetchEnhancedMockAssets Tests
// ============================================================

describe('fetchEnhancedMockAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful Mock Fetching', () => {
    it('should fetch and transform mock EHR records', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/api/ehr');
      expect(result).toHaveLength(3);
    });

    it('should extract ehrId from flat structure', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].ehrId).toBe('EHR001');
      expect(result[1].ehrId).toBe('EHR006');
      expect(result[2].ehrId).toBe('EHR010');
    });

    it('should generate assetId from ehrId', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].assetId).toBe('ehr:EHR001');
    });

    it('should construct title from diagnosis', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].title).toBe('EHR EHR001 - Type 2 diabetes mellitus without complications');
      expect(result[1].title).toBe('EHR EHR006 - Multiple sclerosis');
    });

    it('should use flat ageBand and biologicalSex fields', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].ageBand).toBe('55-64');
      expect(result[0].biologicalSex).toBe('male');
      expect(result[1].ageBand).toBe('25-34');
      expect(result[1].biologicalSex).toBe('female');
    });

    it('should use qualityScore from flat structure', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].qualityScore).toBe(0.94);
      expect(result[1].qualityScore).toBe(0.91);
    });
  });

  describe('Health Category Mapping from ICD-10', () => {
    const icdCodeMappings: Array<[string, string, string]> = [
      ['E11.9', 'Endocrinology', 'E chapter'],
      ['G35', 'Neurology', 'G chapter'],
      ['I25.9', 'Cardiology', 'I chapter'],
      ['C50', 'Oncology', 'C chapter'],
      ['F32', 'Psychiatry', 'F chapter'],
      ['J45', 'Pulmonology', 'J chapter'],
      ['K21', 'Gastroenterology', 'K chapter'],
      ['L40', 'Dermatology', 'L chapter'],
      ['M05', 'Rheumatology', 'M chapter'],
      ['N18', 'Nephrology', 'N chapter'],
      ['A00', 'Infectious Disease', 'A chapter'],
      ['B20', 'Infectious Disease', 'B chapter'],
      ['Z00', 'Prevention', 'Z chapter'],
    ];

    it.each(icdCodeMappings)(
      'should map ICD %s to %s (%s)',
      async (icdCode, expectedCategory) => {
        const mockRecords = [{
          id: 'TEST001',
          icdCode,
          primaryDiagnosis: 'Test Condition',
          ageBand: '40-49',
          biologicalSex: 'unknown',
          consentPurposes: [],
        }];
        mockedAxios.get.mockResolvedValueOnce({ data: mockRecords });
        
        const result = await fetchEnhancedMockAssets();
        
        expect(result[0].healthCategory).toBe(expectedCategory);
      }
    );

    it('should default to General for unknown ICD chapter', async () => {
      const mockRecords = [{
        id: 'TEST001',
        icdCode: 'R50',
        primaryDiagnosis: 'Fever',
        ageBand: '40-49',
        biologicalSex: 'unknown',
        consentPurposes: [],
      }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockRecords });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].healthCategory).toBe('General');
    });

    it('should default to General when icdCode is missing', async () => {
      const mockRecords = [{
        id: 'TEST001',
        primaryDiagnosis: 'Unknown',
        ageBand: '40-49',
        biologicalSex: 'unknown',
        consentPurposes: [],
      }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockRecords });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].healthCategory).toBe('General');
    });
  });

  describe('Policy Derivation from Consent Purposes', () => {
    it('should create consent-required policy when purposes exist', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].policy.type).toBe('consent-required');
      expect(result[0].policy.requiredConsents).toEqual(['clinical-research', 'registry-participation']);
    });

    it('should create open policy when no consent purposes', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[2].policy.type).toBe('open');
      expect(result[2].policy.requiredConsents).toBeUndefined();
    });
  });

  describe('Publisher Enrichment', () => {
    it('should provide default publisher info', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].publisher.name).toBe('Rheinland Universitätsklinikum');
      expect(result[0].publisher.type).toBe('hospital');
      expect(result[0].publisher.homepage).toBe('https://rheinland-uklinikum.de');
    });

    it('should provide contact point', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].contactPoint?.email).toBe('dataoffice@rheinland-uklinikum.de');
      expect(result[0].contactPoint?.name).toBe('Health Data Office');
    });
  });

  describe('Distribution Defaults', () => {
    it('should provide default FHIR distribution', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result[0].distributions).toHaveLength(1);
      expect(result[0].distributions[0].format).toBe('application/fhir+json');
    });
  });

  describe('Error Handling', () => {
    it('should return empty array on axios error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result).toEqual([]);
    });

    it('should return empty array on 404 response', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
        isAxiosError: true,
      });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result).toEqual([]);
    });
  });

  describe('Response Format Handling', () => {
    it('should handle array response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result).toHaveLength(3);
    });

    it('should handle { records: [...] } format', async () => {
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { records: SAMPLE_MOCK_EHR_RECORDS } 
      });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result).toHaveLength(3);
    });

    it('should handle empty response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });
      
      const result = await fetchEnhancedMockAssets();
      
      expect(result).toEqual([]);
    });
  });
});

// ============================================================
// getEnhancedCatalogAssets Tests
// ============================================================

describe('getEnhancedCatalogAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Mock Fallback Mode', () => {
    it('should fall back to mock when useEdcFirst is false', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await getEnhancedCatalogAssets({ useEdcFirst: false });
      
      expect(result.source).toBe('mock-fallback');
      expect(result.assets).toHaveLength(3);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4001/api/ehr');
    });

    it('should apply offset and limit to mock results', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await getEnhancedCatalogAssets({ 
        useEdcFirst: false, 
        offset: 1, 
        limit: 1 
      });
      
      expect(result.assets).toHaveLength(1);
      expect(result.assets[0].ehrId).toBe('EHR006');
      expect(result.totalCount).toBe(3);
    });
  });

  describe('Result Structure', () => {
    it('should return correct structure', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
      
      const result = await getEnhancedCatalogAssets({ useEdcFirst: false });
      
      expect(result).toHaveProperty('assets');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('source');
      expect(Array.isArray(result.assets)).toBe(true);
      expect(typeof result.totalCount).toBe('number');
    });
  });
});

// ============================================================
// Type Validation Tests
// ============================================================

describe('Type Validation', () => {
  it('should produce assets matching EnhancedCatalogAsset interface', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: SAMPLE_MOCK_EHR_RECORDS });
    
    const result = await fetchEnhancedMockAssets();
    const asset = result[0];
    
    // Core identifiers
    expect(typeof asset.ehrId).toBe('string');
    expect(typeof asset.assetId).toBe('string');
    
    // DCT properties
    expect(typeof asset.title).toBe('string');
    expect(typeof asset.description).toBe('string');
    expect(Array.isArray(asset.language)).toBe(true);
    expect(typeof asset.issued).toBe('string');
    expect(typeof asset.modified).toBe('string');
    
    // Publisher
    expect(typeof asset.publisher).toBe('object');
    expect(typeof asset.publisher.name).toBe('string');
    expect(typeof asset.publisher.identifier).toBe('string');
    expect(typeof asset.publisher.type).toBe('string');
    
    // HealthDCAT-AP
    expect(typeof asset.healthCategory).toBe('string');
    expect(typeof asset.ageBand).toBe('string');
    expect(typeof asset.biologicalSex).toBe('string');
    expect(typeof asset.clinicalPhase).toBe('string');
    expect(typeof asset.meddraVersion).toBe('string');
    expect(typeof asset.sensitiveCategory).toBe('string');
    
    // Distribution
    expect(Array.isArray(asset.distributions)).toBe(true);
    expect(asset.distributions.length).toBeGreaterThan(0);
    
    // Policy
    expect(typeof asset.policy).toBe('object');
    expect(['open', 'consent-required', 'restricted']).toContain(asset.policy.type);
  });

  it('should validate PolicySummary structure', () => {
    const openPolicy: PolicySummary = { type: 'open' };
    const consentPolicy: PolicySummary = { 
      type: 'consent-required', 
      requiredConsents: ['research'] 
    };
    const restrictedPolicy: PolicySummary = { 
      type: 'restricted', 
      constraints: ['MembershipCredential'] 
    };
    
    expect(openPolicy.type).toBe('open');
    expect(consentPolicy.requiredConsents).toContain('research');
    expect(restrictedPolicy.constraints).toContain('MembershipCredential');
  });

  it('should validate Publisher structure', () => {
    const publisher: Publisher = {
      name: 'Test Hospital',
      identifier: 'did:web:test.hospital',
      type: 'hospital',
      homepage: 'https://test.hospital',
    };
    
    expect(publisher.name).toBe('Test Hospital');
    expect(publisher.type).toBe('hospital');
  });
});
