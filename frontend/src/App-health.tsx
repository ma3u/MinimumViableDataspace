/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Database, 
  ArrowRight,
  CheckCircle,
  Loader2,
  BookOpen,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Play,
  RotateCcw,
  Code,
  Shield,
  Send,
  Github,
  Lock,
  Stethoscope,
  Search,
  FileJson,
  AlertCircle
} from 'lucide-react';
import { EHRViewer } from './components/EHRViewer';
import { 
  mockEHRCatalogAssets, 
  mockEHRData, 
  healthDspPhases,
  healthDspMessages,
  healthParticipants,
  mockNegotiationFlow,
  mockTransferFlow,
  medicalCategories,
  categoryBackgrounds,
  consentPurposes,
  consentRestrictions,
  sponsorTypes,
  emaTherapeuticAreas,
  memberStateFlags
} from './services/mockData-health';
import { fetchEHRById, checkBackendHealth } from './services/ehrApi';
import type { ElectronicHealthRecord } from './types/health';

// GitHub repository URL
const GITHUB_REPO_URL = 'https://github.com/ma3u/MinimumViableDataspace/tree/health-demo';

type DemoPhase = 'intro' | 'catalog' | 'negotiation' | 'transfer' | 'complete';

interface MockEHRAsset {
  '@id': string;
  'dct:title': string;
  'dct:description': string;
  'health:icdCode': string;
  'health:diagnosis': string;
  'health:category': string;
  'health:ageBand': string;
  'health:biologicalSex': string;
  'health:consentStatus': string;
  'health:sensitiveCategory'?: string;
  'health:clinicalTrialPhase'?: string;
  // EU CTR 536/2014 Fields
  'health:euCtNumber'?: string;
  'health:sponsor'?: {
    name: string;
    type: 'commercial' | 'academic' | 'non-profit';
    country: string;
  };
  'health:therapeuticArea'?: {
    code: string;
    name: string;
  };
  'health:memberStatesConcerned'?: string[];
  'health:medDRA'?: {
    socCode: string;
    socName: string;
    ptCode: string;
    ptName: string;
  };
  'health:signalStatus'?: {
    hasActiveSignal: boolean;
    adrCount: number;
  };
  'health:consent'?: {
    purposes: string[];
    restrictions: string[];
    validUntil: string;
    grantor: string;
  };
}

function AppHealth() {
  const [phase, setPhase] = useState<DemoPhase>('intro');
  const [selectedAsset, setSelectedAsset] = useState<MockEHRAsset | null>(null);
  const [negotiationStep, setNegotiationStep] = useState(0);
  const [transferStep, setTransferStep] = useState(0);
  const [ehrData, setEhrData] = useState<ElectronicHealthRecord | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ageBandFilter, setAgeBandFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [medDRAFilter, setMedDRAFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFhirJson, setShowFhirJson] = useState(false);
  
  // Advanced EU CTR 536/2014 Filters (persist across demo phases)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sponsorTypeFilter, setSponsorTypeFilter] = useState<string>('all');
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all');

  // Filter assets based on category, age band, phase, MedDRA SOC, EU CTR fields, and search
  const filteredAssets = mockEHRCatalogAssets.filter(asset => {
    const matchesCategory = categoryFilter === 'all' || asset['health:category'] === categoryFilter;
    const matchesAgeBand = ageBandFilter === 'all' || asset['health:ageBand'] === ageBandFilter;
    const matchesPhase = phaseFilter === 'all' || asset['health:clinicalTrialPhase'] === phaseFilter;
    const matchesMedDRA = medDRAFilter === 'all' || asset['health:medDRA']?.socCode === medDRAFilter;
    const matchesSponsorType = sponsorTypeFilter === 'all' || asset['health:sponsor']?.type === sponsorTypeFilter;
    const matchesTherapeuticArea = therapeuticAreaFilter === 'all' || asset['health:therapeuticArea']?.code === therapeuticAreaFilter;
    const matchesSearch = searchTerm === '' || 
      asset['dct:title'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['health:icdCode'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['health:diagnosis'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['health:medDRA']?.socName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['health:medDRA']?.ptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['health:clinicalTrialPhase']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['health:euCtNumber']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['health:sponsor']?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset['health:therapeuticArea']?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesAgeBand && matchesPhase && matchesMedDRA && matchesSponsorType && matchesTherapeuticArea && matchesSearch;
  });

  // Check backend availability on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendAvailable);
  }, []);

  const resetDemo = () => {
    setPhase('intro');
    setSelectedAsset(null);
    setNegotiationStep(0);
    setTransferStep(0);
    setEhrData(null);
    setIsAnimating(false);
    setShowJson(false);
  };

  const simulateNegotiation = async () => {
    setIsAnimating(true);
    for (let i = 0; i < mockNegotiationFlow.length; i++) {
      setNegotiationStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setIsAnimating(false);
    setPhase('transfer');
  };

  const simulateTransfer = async () => {
    setIsAnimating(true);
    
    for (let i = 0; i < mockTransferFlow.length; i++) {
      setTransferStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Load the EHR data - try backend first, fall back to mock
    if (selectedAsset) {
      try {
        if (backendAvailable) {
          const data = await fetchEHRById(selectedAsset['@id']);
          setEhrData(data);
        } else {
          // Use mock data as fallback
          setEhrData(mockEHRData[selectedAsset['@id']]);
        }
      } catch (error) {
        console.warn('Backend fetch failed, using mock data:', error);
        setEhrData(mockEHRData[selectedAsset['@id']]);
      }
    }
    
    setIsAnimating(false);
    setPhase('complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Health Dataspace - EHR2EDC Demo
                </h1>
                <p className="text-sm text-gray-500">Electronic Health Records to Electronic Data Capture</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Backend Status Indicator */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                backendAvailable === null 
                  ? 'bg-gray-100 text-gray-600'
                  : backendAvailable 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  backendAvailable === null 
                    ? 'bg-gray-400'
                    : backendAvailable 
                      ? 'bg-green-500' 
                      : 'bg-yellow-500'
                }`} />
                {backendAvailable === null ? 'Checking...' : backendAvailable ? 'Backend Online' : 'Demo Mode'}
              </div>
              <a 
                href="https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                DSP 2025-1 Specification
                <ExternalLink className="w-3 h-3" />
              </a>
              {phase !== 'intro' && (
                <button
                  onClick={resetDemo}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Demo
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {phase !== 'intro' && (
        <div className="bg-white border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {[
                { id: 'catalog', label: 'EHR Catalog', icon: Database },
                { id: 'negotiation', label: 'Consent Verification', icon: Lock },
                { id: 'transfer', label: 'EHR Transfer', icon: Send },
                { id: 'complete', label: 'EDC Ready', icon: CheckCircle },
              ].map((step, i, arr) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    phase === step.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : arr.findIndex(x => x.id === phase) > i
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                    <span className="font-medium text-sm hidden md:block">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <ChevronRight className={`w-5 h-5 mx-2 ${
                      arr.findIndex(x => x.id === phase) > i ? 'text-green-500' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">
                  Sovereign Health Data Exchange via Dataspace Protocol
                </h2>
                <p className="text-blue-100 text-lg mb-6">
                  This demo illustrates how anonymized Electronic Health Records (EHR) can be securely 
                  exchanged between hospitals and research institutes using the Dataspace Protocol (DSP). 
                  It demonstrates consent-based data sharing compliant with GDPR, EHDS, and German health data regulations.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => setPhase('catalog')}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Demo
                  </button>
                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/30 rounded-lg font-semibold hover:bg-white/20 text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    View Code on GitHub
                  </a>
                  <a
                    href="https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 border border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                    EHDS Information
                  </a>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{healthParticipants.provider.logo}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{healthParticipants.provider.name}</h3>
                    <p className="text-blue-600 font-medium">{healthParticipants.provider.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{healthParticipants.provider.description}</p>
                <div className="bg-blue-50 rounded-lg p-3 font-mono text-sm text-blue-900">
                  DID: {healthParticipants.provider.did}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{healthParticipants.consumer.logo}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{healthParticipants.consumer.name}</h3>
                    <p className="text-indigo-600 font-medium">{healthParticipants.consumer.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{healthParticipants.consumer.description}</p>
                <div className="bg-indigo-50 rounded-lg p-3 font-mono text-sm text-indigo-900">
                  DID: {healthParticipants.consumer.did}
                </div>
              </div>
            </div>

            {/* Compliance Badges */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Compliance</h3>
              <div className="flex gap-4 flex-wrap">
                {[
                  { name: 'EU CTR 536/2014', desc: 'Clinical Trials Regulation' },
                  { name: 'GDPR', desc: 'General Data Protection Regulation' },
                  { name: 'EHDS', desc: 'European Health Data Space' },
                  { name: 'GDNG', desc: 'Gesundheitsdatennutzungsgesetz' },
                  { name: 'k-Anonymity', desc: 'De-identification Standard (k=5)' },
                ].map((badge) => (
                  <div key={badge.name} className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Shield className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">{badge.name}</div>
                      <div className="text-xs text-green-600">{badge.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Protocol Phases</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(healthDspPhases).map(([key, phaseData]) => (
                  <div key={key} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      {key === 'catalog' && <Database className="w-5 h-5 text-blue-600" />}
                      {key === 'negotiation' && <Lock className="w-5 h-5 text-purple-600" />}
                      {key === 'transfer' && <Send className="w-5 h-5 text-green-600" />}
                      <h4 className="font-semibold text-gray-900">{phaseData.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{phaseData.description.substring(0, 150)}...</p>
                    <a
                      href={phaseData.specLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View specification <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CATALOG PHASE */}
        {phase === 'catalog' && (
          <div className="space-y-6">
            <PhaseHeader 
              phase={healthDspPhases.catalog}
              icon={<Database className="w-6 h-6" />}
            />

            {/* Protocol Flow */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Protocol Flow</h3>
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg"
                >
                  <Code className="w-4 h-4" />
                  {showJson ? 'Hide' : 'Show'} JSON Messages
                </button>
              </div>
              
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">{healthParticipants.consumer.logo}</div>
                  <div className="font-medium text-sm">Research Institute</div>
                  <div className="text-xs text-gray-500">(Data Consumer)</div>
                </div>
                <div className="flex-1 px-4">
                  <div className="flex items-center justify-center gap-2 text-sm mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">CatalogRequestMessage</span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-600 rotate-180" />
                    <span className="bg-blue-100 text-teal-800 px-2 py-1 rounded">dcat:Catalog (EHR Datasets)</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">{healthParticipants.provider.logo}</div>
                  <div className="font-medium text-sm">Hospital</div>
                  <div className="text-xs text-gray-500">(Data Provider)</div>
                </div>
              </div>

              {showJson && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Request Message</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(healthDspMessages.catalogRequest, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Response (Catalog)</h4>
                    <pre className="bg-gray-900 text-teal-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(healthDspMessages.catalogResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="space-y-4">
                {/* Search and Filter Row */}
                <div className="flex flex-col lg:flex-row gap-3">
                  {/* Search */}
                  <div className="flex-[2]">
                    <label htmlFor="search-input" className="text-xs font-medium text-gray-600 mb-1 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="search-input"
                        type="text"
                        placeholder="diabetes, E11.9, Phase III, Cardiac disorders, 55-64..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap lg:flex-nowrap gap-3 flex-[3]">
                    {/* Category Filter */}
                    <div>
                    <label htmlFor="category-filter" className="text-xs font-medium text-gray-600 mb-1 block">Medical Category</label>
                    <select
                      id="category-filter"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All Categories ({mockEHRCatalogAssets.length})</option>
                      {Object.entries(medicalCategories).map(([key, cat]) => {
                        const count = mockEHRCatalogAssets.filter(a => a['health:category'] === key).length;
                        if (count === 0) return null;
                        return (
                          <option key={key} value={key}>
                            {cat.icon} {cat.label} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Age Band Filter */}
                  <div>
                    <label htmlFor="age-filter" className="text-xs font-medium text-gray-600 mb-1 block">Age Band</label>
                    <select
                      id="age-filter"
                      value={ageBandFilter}
                      onChange={(e) => setAgeBandFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All Ages</option>
                      {Array.from(new Set(mockEHRCatalogAssets.map(a => a['health:ageBand']))).sort().map(age => {
                        const count = mockEHRCatalogAssets.filter(a => a['health:ageBand'] === age).length;
                        return (
                          <option key={age} value={age}>
                            {age} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Study Phase Filter */}
                  <div>
                    <label htmlFor="phase-filter" className="text-xs font-medium text-gray-600 mb-1 block">Study Phase</label>
                    <select
                      id="phase-filter"
                      value={phaseFilter}
                      onChange={(e) => setPhaseFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All Phases</option>
                      {Array.from(new Set(mockEHRCatalogAssets.map(a => a['health:clinicalTrialPhase']).filter(Boolean))).sort().map(phase => {
                        const count = mockEHRCatalogAssets.filter(a => a['health:clinicalTrialPhase'] === phase).length;
                        const phaseName = phase === 'Phase I' ? 'Phase I - First-in-Human' :
                                        phase === 'Phase II' ? 'Phase II - Efficacy' :
                                        phase === 'Phase III' ? 'Phase III - Confirmation' :
                                        phase === 'Phase IV' ? 'Phase IV - Post-Marketing' : phase;
                        return (
                          <option key={phase} value={phase}>
                            {phaseName} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* MedDRA SOC Filter */}
                  <div>
                    <label htmlFor="meddra-filter" className="text-xs font-medium text-gray-600 mb-1 block">MedDRA SOC</label>
                    <select
                      id="meddra-filter"
                      value={medDRAFilter}
                      onChange={(e) => setMedDRAFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    >
                      <option value="all">All SOCs</option>
                      {Array.from(new Set(mockEHRCatalogAssets.map(a => a['health:medDRA']?.socCode).filter(Boolean))).sort().map(socCode => {
                        const asset = mockEHRCatalogAssets.find(a => a['health:medDRA']?.socCode === socCode);
                        const socName = asset?.['health:medDRA']?.socName;
                        const count = mockEHRCatalogAssets.filter(a => a['health:medDRA']?.socCode === socCode).length;
                        return (
                          <option key={socCode} value={socCode}>
                            {socName} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Advanced Filters Toggle - EU CTR 536/2014 */}
                <div>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAdvancedFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    EU CTR 536/2014 Filters
                  </button>
                  
                  {showAdvancedFilters && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex flex-wrap gap-3">
                        {/* Sponsor Type Filter */}
                        <div className="min-w-[180px]">
                          <label htmlFor="sponsor-type-filter" className="text-xs font-medium text-blue-800 mb-1 block">Sponsor Type</label>
                          <select
                            id="sponsor-type-filter"
                            value={sponsorTypeFilter}
                            onChange={(e) => setSponsorTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          >
                            <option value="all">All Types</option>
                            {Object.entries(sponsorTypes).map(([key, sponsor]) => {
                              const count = mockEHRCatalogAssets.filter(a => a['health:sponsor']?.type === key).length;
                              if (count === 0) return null;
                              return (
                                <option key={key} value={key}>
                                  {sponsor.icon} {sponsor.label} ({count})
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Therapeutic Area Filter */}
                        <div className="min-w-[220px]">
                          <label htmlFor="therapeutic-area-filter" className="text-xs font-medium text-blue-800 mb-1 block">EMA Therapeutic Area</label>
                          <select
                            id="therapeutic-area-filter"
                            value={therapeuticAreaFilter}
                            onChange={(e) => setTherapeuticAreaFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                          >
                            <option value="all">All Areas</option>
                            {Array.from(new Set(mockEHRCatalogAssets.map(a => a['health:therapeuticArea']?.code).filter(Boolean))).sort().map(code => {
                              const area = emaTherapeuticAreas[code as keyof typeof emaTherapeuticAreas];
                              const count = mockEHRCatalogAssets.filter(a => a['health:therapeuticArea']?.code === code).length;
                              return (
                                <option key={code} value={code}>
                                  {area?.name || code} ({count})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Filters Summary */}
                {(categoryFilter !== 'all' || ageBandFilter !== 'all' || phaseFilter !== 'all' || medDRAFilter !== 'all' || sponsorTypeFilter !== 'all' || therapeuticAreaFilter !== 'all' || searchTerm) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-600">Active filters:</span>
                    {categoryFilter !== 'all' && (
                      <button onClick={() => setCategoryFilter('all')} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1 hover:bg-blue-200">
                        {medicalCategories[categoryFilter as keyof typeof medicalCategories]?.label} ×
                      </button>
                    )}
                    {ageBandFilter !== 'all' && (
                      <button onClick={() => setAgeBandFilter('all')} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs flex items-center gap-1 hover:bg-purple-200">
                        Age: {ageBandFilter} ×
                      </button>
                    )}
                    {phaseFilter !== 'all' && (
                      <button onClick={() => setPhaseFilter('all')} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs flex items-center gap-1 hover:bg-indigo-200">
                        {phaseFilter} ×
                      </button>
                    )}
                    {medDRAFilter !== 'all' && (
                      <button onClick={() => setMedDRAFilter('all')} className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs flex items-center gap-1 hover:bg-pink-200">
                        {mockEHRCatalogAssets.find(a => a['health:medDRA']?.socCode === medDRAFilter)?.['health:medDRA']?.socName} ×
                      </button>
                    )}
                    {sponsorTypeFilter !== 'all' && (
                      <button onClick={() => setSponsorTypeFilter('all')} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex items-center gap-1 hover:bg-green-200">
                        {sponsorTypes[sponsorTypeFilter as keyof typeof sponsorTypes]?.icon} {sponsorTypes[sponsorTypeFilter as keyof typeof sponsorTypes]?.label} ×
                      </button>
                    )}
                    {therapeuticAreaFilter !== 'all' && (
                      <button onClick={() => setTherapeuticAreaFilter('all')} className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs flex items-center gap-1 hover:bg-teal-200">
                        {emaTherapeuticAreas[therapeuticAreaFilter as keyof typeof emaTherapeuticAreas]?.name} ×
                      </button>
                    )}
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs flex items-center gap-1 hover:bg-gray-200">
                        Search: "{searchTerm}" ×
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCategoryFilter('all');
                        setAgeBandFilter('all');
                        setPhaseFilter('all');
                        setMedDRAFilter('all');
                        setSponsorTypeFilter('all');
                        setTherapeuticAreaFilter('all');
                        setSearchTerm('');
                      }}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Catalog Results */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Available EHR Datasets (Anonymized)</h3>
                <span className="text-sm text-gray-500">{filteredAssets.length} records found</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map(asset => {
                  const category = medicalCategories[asset['health:category'] as keyof typeof medicalCategories];
                  const bgImage = categoryBackgrounds[asset['health:category']];
                  return (
                    <div 
                      key={asset['@id']}
                      className={`relative overflow-hidden border rounded-lg cursor-pointer transition-all group ${
                        selectedAsset?.['@id'] === asset['@id']
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'hover:border-blue-300 hover:shadow-lg'
                      }`}
                      onClick={() => setSelectedAsset(asset as MockEHRAsset)}
                    >
                      {/* Background Image */}
                      {bgImage && (
                        <div className="absolute inset-0 z-0">
                          <img 
                            src={bgImage} 
                            alt="" 
                            className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/70" />
                        </div>
                      )}
                      
                      <div className="relative z-10 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category?.icon || '📋'}</span>
                            <span className="font-mono text-xs text-gray-600 bg-white/80 px-1.5 py-0.5 rounded">{asset['health:icdCode']}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            asset['health:consentStatus'] === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Consent: {asset['health:consentStatus']}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{asset['dct:title']}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{asset['dct:description']}</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {category && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${category.color}`}>
                              {category.label}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs">
                            Age: {asset['health:ageBand']}
                          </span>
                          <span className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded text-xs capitalize">
                            {asset['health:biologicalSex']}
                          </span>
                        </div>
                        {asset['health:clinicalTrialPhase'] && (
                          <div className="mb-2">
                            <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs font-medium">
                              📋 {asset['health:clinicalTrialPhase']}
                            </span>
                          </div>
                        )}
                        {/* EU CTR 536/2014 Fields */}
                        {asset['health:euCtNumber'] && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs font-mono">
                              🇪🇺 {asset['health:euCtNumber']}
                            </span>
                            {asset['health:sponsor'] && (
                              <span className={`px-2 py-1 rounded text-xs ${
                                sponsorTypes[asset['health:sponsor'].type as keyof typeof sponsorTypes]?.color || 'bg-gray-100 text-gray-700'
                              }`}>
                                {sponsorTypes[asset['health:sponsor'].type as keyof typeof sponsorTypes]?.icon} {asset['health:sponsor'].name}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Member States - only show for multinational trials */}
                        {asset['health:memberStatesConcerned'] && asset['health:memberStatesConcerned'].length > 1 && (
                          <div className="mb-2 flex items-center gap-1 text-xs">
                            <span className="text-gray-500">Countries:</span>
                            {asset['health:memberStatesConcerned'].map(code => (
                              <span key={code} title={memberStateFlags[code]?.name}>
                                {memberStateFlags[code]?.flag}
                              </span>
                            ))}
                          </div>
                        )}
                        {asset['health:medDRA'] && (
                          <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                            <div className="flex items-center gap-1 text-gray-700">
                              <span className="font-semibold">MedDRA SOC:</span>
                              <span>{asset['health:medDRA'].socName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-semibold">PT:</span>
                              <span>{asset['health:medDRA'].ptName}</span>
                              <span className="font-mono ml-1 text-gray-500">({asset['health:medDRA'].ptCode})</span>
                            </div>
                          </div>
                        )}
                        {asset['health:signalStatus'] && asset['health:signalStatus'].adrCount > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-orange-700">
                            <AlertCircle className="w-3 h-3" />
                            <span>{asset['health:signalStatus'].adrCount} ADR(s) reported</span>
                          </div>
                        )}
                        {asset['health:sensitiveCategory'] && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                            <Shield className="w-3 h-3" />
                            <span>Sensitive: {asset['health:sensitiveCategory'].replace('-', ' ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredAssets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No EHR records match your filters. Try adjusting your search criteria.
                </div>
              )}
            </div>

            {/* Continue Button */}
            {selectedAsset && (
              <div className="flex justify-end">
                <button
                  onClick={() => setPhase('negotiation')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Request Consent Verification for "{selectedAsset['dct:title']}"
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          </div>
        )}

        {/* NEGOTIATION PHASE */}
        {phase === 'negotiation' && selectedAsset && (
          <div className="space-y-6">
            <PhaseHeader 
              phase={healthDspPhases.negotiation}
              icon={<Lock className="w-6 h-6" />}
            />

            {/* State Machine Visualization */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Contract Negotiation State Machine</h3>
              <div className="flex items-center justify-between overflow-x-auto pb-4">
                {mockNegotiationFlow.map((state, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all ${
                      i < negotiationStep 
                        ? 'bg-green-100 text-green-800'
                        : i === negotiationStep
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < negotiationStep ? (
                        <CheckCircle className="w-6 h-6 mb-1" />
                      ) : i === negotiationStep && isAnimating ? (
                        <Loader2 className="w-6 h-6 mb-1 animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 mb-1" />
                      )}
                      <span className="text-xs font-medium whitespace-nowrap">
                        {state['dspace:state']}
                      </span>
                    </div>
                    {i < mockNegotiationFlow.length - 1 && (
                      <ArrowRight className={`w-5 h-5 mx-1 ${
                        i < negotiationStep ? 'text-green-500' : 'text-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message Sequence */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Protocol Messages</h3>
              <div className="space-y-3">
                {healthDspPhases.negotiation.steps.map((step, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      i <= negotiationStep
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200 opacity-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i < negotiationStep
                        ? 'bg-green-500 text-white'
                        : i === negotiationStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {i < negotiationStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{step.name}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                    <div className="text-sm text-blue-600 font-mono">{step.direction}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Consent Display */}
            {selectedAsset['health:consent'] && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Patient Consent Declaration
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <div>
                        <div className="font-medium text-green-800">Consent Active</div>
                        <div className="text-sm text-green-600">Granted by: {selectedAsset['health:consent'].grantor}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Valid Until</div>
                      <div className="font-medium text-green-800">{selectedAsset['health:consent'].validUntil}</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Permitted Purposes */}
                  <div>
                    <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                      ✓ Permitted Data Use Purposes
                    </h4>
                    <div className="space-y-2">
                      {selectedAsset['health:consent'].purposes.map((purpose) => {
                        const purposeInfo = consentPurposes[purpose as keyof typeof consentPurposes];
                        return purposeInfo ? (
                          <div key={purpose} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <span className="text-xl">{purposeInfo.icon}</span>
                            <div>
                              <div className="font-medium text-green-800">{purposeInfo.label}</div>
                              <div className="text-xs text-green-600">{purposeInfo.description}</div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                      ✗ Consent Restrictions
                    </h4>
                    <div className="space-y-2">
                      {selectedAsset['health:consent'].restrictions.map((restriction) => {
                        const restrictionInfo = consentRestrictions[restriction as keyof typeof consentRestrictions];
                        return restrictionInfo ? (
                          <div key={restriction} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
                            <span className="text-xl">{restrictionInfo.icon}</span>
                            <div>
                              <div className="font-medium text-red-800">{restrictionInfo.label}</div>
                              <div className="text-xs text-red-600">{restrictionInfo.description}</div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Policy (ODRL) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                Technical Policy Enforcement (ODRL)
              </h3>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-purple-800 mb-2">Permission</h4>
                    <div className="bg-white rounded p-3 text-sm">
                      <code>MembershipCredential = active</code>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-800 mb-2">Obligation</h4>
                    <div className="bg-white rounded p-3 text-sm">
                      <code>DataAccess.level = processing</code>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-2">Prohibition</h4>
                    <div className="bg-white rounded p-3 text-sm border border-red-200">
                      <code>Re-identification = forbidden</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              {negotiationStep < mockNegotiationFlow.length - 1 ? (
                <button
                  onClick={simulateNegotiation}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isAnimating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying Consent...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run Consent Verification
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setPhase('transfer')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Consent Verified - Start Transfer
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* TRANSFER PHASE */}
        {phase === 'transfer' && selectedAsset && (
          <div className="space-y-6">
            <PhaseHeader 
              phase={healthDspPhases.transfer}
              icon={<Send className="w-6 h-6" />}
            />

            {/* Transfer State Machine */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Transfer Process State Machine</h3>
              <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4">
                {mockTransferFlow.map((state, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`flex flex-col items-center px-6 py-3 rounded-lg transition-all ${
                      i < transferStep 
                        ? 'bg-green-100 text-green-800'
                        : i === transferStep
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < transferStep ? (
                        <CheckCircle className="w-8 h-8 mb-1" />
                      ) : i === transferStep && isAnimating ? (
                        <Loader2 className="w-8 h-8 mb-1 animate-spin" />
                      ) : (
                        <Send className="w-8 h-8 mb-1" />
                      )}
                      <span className="text-sm font-medium whitespace-nowrap">
                        {state['dspace:state']}
                      </span>
                    </div>
                    {i < mockTransferFlow.length - 1 && (
                      <ArrowRight className={`w-6 h-6 mx-2 ${
                        i < transferStep ? 'text-green-500' : 'text-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Transfer Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Transfer Configuration</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Transfer Type</h4>
                  <div className="bg-white rounded p-3">
                    <code className="text-sm">HttpData-PULL (FHIR Bundle)</code>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Research institute pulls de-identified EHR from Hospital&apos;s data plane
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-teal-800 mb-2">Data Address</h4>
                  <div className="bg-white rounded p-3 font-mono text-xs break-all">
                    https://provider.rheinland-uklinikum.de/fhir/Bundle/{selectedAsset['@id'].split(':').pop()}
                  </div>
                </div>
              </div>
            </div>

            {/* De-identification Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Shield className="w-5 h-5" />
                <span className="font-medium">De-identification Applied</span>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Data is processed through k-anonymity (k=5) pipeline before transfer. 
                All direct identifiers removed, indirect identifiers generalized to ensure patient privacy.
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              {transferStep < mockTransferFlow.length - 1 ? (
                <button
                  onClick={simulateTransfer}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isAnimating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Transferring EHR...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Transfer
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        )}

        {/* COMPLETE PHASE */}
        {phase === 'complete' && selectedAsset && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold">EHR Transfer Complete!</h2>
                  <p className="text-green-100">
                    The de-identified Electronic Health Record has been successfully received and is ready for EDC integration.
                  </p>
                </div>
              </div>
            </div>

            {/* EHR Viewer - if detailed data available */}
            {ehrData ? (
              <EHRViewer ehr={ehrData} />
            ) : (
              /* Fallback: Show summary from catalog asset when detailed EHR data not available */
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">Electronic Health Record</h2>
                      <p className="text-blue-200 mt-1">FHIR Bundle - De-identified for Research</p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {selectedAsset['health:consentStatus']}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-200">Pseudonym ID:</span>
                      <span className="ml-2 font-mono">{selectedAsset['health:consent']?.grantor.match(/[A-Z0-9]+\)?$/)?.[0]?.replace(')', '') || 'ANON-' + selectedAsset['@id'].split(':').pop()}</span>
                    </div>
                    <div>
                      <span className="text-blue-200">Transfer Date:</span>
                      <span className="ml-2">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Consent Scope */}
                  {selectedAsset['health:consent'] && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Consent Scope</h3>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Permitted Purposes:</span>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {selectedAsset['health:consent'].purposes.map((purpose) => {
                                const purposeInfo = consentPurposes[purpose as keyof typeof consentPurposes];
                                return purposeInfo ? (
                                  <span key={purpose} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                    <CheckCircle className="w-3 h-3" />
                                    {purposeInfo.label}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Restrictions:</span>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {selectedAsset['health:consent'].restrictions.map((restriction) => {
                                const restrictionInfo = consentRestrictions[restriction as keyof typeof consentRestrictions];
                                return restrictionInfo ? (
                                  <span key={restriction} className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                                    {restrictionInfo.icon}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Valid Until:</span>
                            <div className="font-medium text-gray-900">{selectedAsset['health:consent'].validUntil}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Jurisdiction:</span>
                            <div className="font-medium text-gray-900">DE-NW (Germany)</div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Demographics */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Demographics (Anonymized)</h3>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-600">Age Band</div>
                        <div className="text-xl font-bold text-gray-900">{selectedAsset['health:ageBand']}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-600">Biological Sex</div>
                        <div className="text-xl font-bold text-gray-900 capitalize">{selectedAsset['health:biologicalSex']}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-600">Region</div>
                        <div className="font-medium text-gray-900">Nordrhein-Westfalen</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-600">Category</div>
                        <div className="font-medium text-gray-900 capitalize">
                          {medicalCategories[selectedAsset['health:category'] as keyof typeof medicalCategories]?.icon}{' '}
                          {medicalCategories[selectedAsset['health:category'] as keyof typeof medicalCategories]?.label}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Primary Diagnosis */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Primary Diagnosis (ICD-10-GM)</h3>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-800">Primary Diagnosis</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-mono">
                            {selectedAsset['health:icdCode']}
                          </span>
                        </div>
                        <div className="text-lg font-medium text-gray-900">
                          {selectedAsset['health:diagnosis']}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {selectedAsset['dct:description']}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Study Eligibility */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-lg font-semibold text-gray-900">EDC Integration Ready</h3>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        EHR-TO-EDC-{selectedAsset['health:category'].toUpperCase()}-2025
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        REGISTRY-{selectedAsset['health:icdCode'].split('.')[0]}-2025
                      </span>
                    </div>
                  </section>

                  {/* Data Provenance */}
                  <section className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-5 h-5 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-700">Data Provenance</h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Source System:</span>
                        <div className="font-medium text-gray-900">Rheinland-UK-EHR-v4</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Extraction Date:</span>
                        <div className="font-medium text-gray-900">{new Date().toISOString().slice(0, 7)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">De-identification:</span>
                        <div className="font-medium text-gray-900">k-anonymity (k=5)</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Quality Score:</span>
                        <div className="font-medium text-green-600">94%</div>
                      </div>
                    </div>
                  </section>

                  {/* Credential Info */}
                  <section className="border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Verifiable Credential issued by did:web:rheinland-uklinikum.de</span>
                    </div>
                    <div className="mt-2 text-xs font-mono text-gray-400 break-all">
                      ID: did:web:rheinland-uklinikum.de:ehr:{selectedAsset['@id'].split(':').pop()}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* Collapsible FHIR JSON Viewer */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <button
                onClick={() => setShowFhirJson(!showFhirJson)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileJson className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">FHIR Bundle (JSON-LD)</h3>
                    <p className="text-sm text-gray-500">View raw de-identified health record data</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showFhirJson ? 'rotate-180' : ''}`} />
              </button>
              
              {showFhirJson && (
                <div className="border-t">
                  <div className="p-4 bg-slate-900 overflow-auto max-h-[600px]">
                    <pre className="text-sm font-mono">
                      <FhirJsonHighlighter 
                        data={ehrData || generateFhirBundle(selectedAsset)} 
                      />
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Restart */}
            <div className="flex justify-center">
              <button
                onClick={resetDemo}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Try Another EHR
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              Demo based on Eclipse Dataspace Protocol 2025-1 | Compliant with GDPR, EHDS, and German health data regulations
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                DSP Specification <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://github.com/eclipse-edc/MinimumViableDataspace"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                EDC MVD
              </a>
              <a 
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                Health Dataspace Demo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Phase Header Component
interface PhaseHeaderProps {
  phase: {
    title: string;
    description: string;
    specLink: string;
  };
  icon: React.ReactNode;
}

function PhaseHeader({ phase, icon }: PhaseHeaderProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{phase.title}</h2>
            <p className="text-gray-600 max-w-2xl">{phase.description}</p>
          </div>
        </div>
        <a
          href={phase.specLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4" />
          View Spec
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// Generate FHIR Bundle from catalog asset when detailed data not available
function generateFhirBundle(asset: MockEHRAsset) {
  const pseudonymId = asset['health:consent']?.grantor.match(/[A-Z0-9]+\)?$/)?.[0]?.replace(')', '') || 'ANON-' + asset['@id'].split(':').pop();
  
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/ehds/ehr/v1',
      'http://hl7.org/fhir'
    ],
    id: `did:web:rheinland-uklinikum.de:ehr:${asset['@id'].split(':').pop()}`,
    type: ['VerifiableCredential', 'ElectronicHealthRecord', 'FHIRBundle'],
    issuer: 'did:web:rheinland-uklinikum.de',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: `did:web:rheinland-uklinikum.de:patient:pseudonym:${pseudonymId}`,
      resourceType: 'Bundle',
      studyEligibility: [
        `EHR-TO-EDC-${asset['health:category'].toUpperCase()}-2025`,
        `REGISTRY-${asset['health:icdCode'].split('.')[0]}-2025`
      ],
      consentScope: {
        purposes: asset['health:consent']?.purposes || ['clinical-research'],
        dataCategories: ['demographics', 'conditions', 'observations', 'medications'],
        retentionPeriod: '10-years',
        jurisdiction: 'DE-NW',
        restrictions: asset['health:consent']?.restrictions || ['no-reidentification'],
        validUntil: asset['health:consent']?.validUntil || '2027-12-31'
      },
      demographicsNode: {
        pseudonymId: pseudonymId,
        ageBand: asset['health:ageBand'],
        biologicalSex: asset['health:biologicalSex'],
        region: 'Nordrhein-Westfalen',
        enrollmentPeriod: '2024-Q4'
      },
      conditionsNode: {
        primaryDiagnosis: {
          code: asset['health:icdCode'],
          system: 'ICD-10-GM',
          display: asset['health:diagnosis'],
          clinicalStatus: 'active'
        },
        comorbidities: []
      },
      observationsNode: {
        latestVitals: {
          recordPeriod: new Date().toISOString().slice(0, 7).replace('-', '-Q'),
          bmiCategory: 'normal',
          bloodPressureCategory: 'normal'
        },
        labResults: []
      },
      medicationsNode: {
        activeTherapies: []
      },
      provenanceNode: {
        sourceSystem: 'Rheinland-UK-EHR-v4',
        extractionDate: new Date().toISOString().slice(0, 7),
        deIdentificationMethod: 'k-anonymity-k5',
        qualityScore: 0.94
      }
    }
  };
}

// FHIR JSON Syntax Highlighter Component
function FhirJsonHighlighter({ data }: { data: unknown }) {
  const colorize = (json: string): JSX.Element[] => {
    const lines = json.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Colorize the line - order matters!
      let coloredLine = line;
      
      // First: Escape any HTML in the content
      coloredLine = coloredLine.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      // Brackets and braces - make them bright
      coloredLine = coloredLine.replace(/([\[\]{}])/g, 
        '<span class="text-yellow-300">$1</span>');
      
      // Commas - subtle but visible
      coloredLine = coloredLine.replace(/,$/g, 
        '<span class="text-gray-400">,</span>');
      
      // String values in arrays (no colon before them)
      coloredLine = coloredLine.replace(/^(\s*)"([^"]+)"(?=[,\]]|$)/gm, 
        '$1<span class="text-emerald-300">"$2"</span>');
      
      // Keys (property names) - before colon
      coloredLine = coloredLine.replace(/"(@?[\w:]+)"(\s*:)/g, 
        '<span class="text-sky-300">"$1"</span><span class="text-gray-400">$2</span>');
      
      // String values (after colon)
      coloredLine = coloredLine.replace(/:(\s*)"([^"]*)"/g, 
        ':<span class="text-gray-400">$1</span><span class="text-emerald-300">"$2"</span>');
      
      // Numbers - bright orange
      coloredLine = coloredLine.replace(/:(\s*)(\d+\.?\d*)(?=[,\s\n\]}<]|$)/g, 
        ':<span class="text-gray-400">$1</span><span class="text-orange-300">$2</span>');
      
      // Booleans - purple
      coloredLine = coloredLine.replace(/:(\s*)(true|false)/g, 
        ':<span class="text-gray-400">$1</span><span class="text-violet-400">$2</span>');
      
      // null - gray
      coloredLine = coloredLine.replace(/:(\s*)(null)/g, 
        ':<span class="text-gray-400">$1</span><span class="text-gray-500">$2</span>');
      
      // Special FHIR/VC keywords highlighting - pink/magenta
      const specialKeys = ['@context', '@id', '@type', 'resourceType', 'credentialSubject', 'issuer', 'type', 'id'];
      specialKeys.forEach(key => {
        coloredLine = coloredLine.replace(
          new RegExp(`<span class="text-sky-300">"(${key})"</span>`, 'g'),
          '<span class="text-pink-300 font-medium">"$1"</span>'
        );
      });
      
      // Health-specific keys - bright blue bold
      const healthKeys = ['consentScope', 'demographicsNode', 'conditionsNode', 'observationsNode', 'medicationsNode', 'provenanceNode', 'studyEligibility'];
      healthKeys.forEach(key => {
        coloredLine = coloredLine.replace(
          new RegExp(`<span class="text-sky-300">"(${key})"</span>`, 'g'),
          '<span class="text-blue-300 font-bold">"$1"</span>'
        );
      });
      
      return (
        <div key={lineIndex} className="hover:bg-slate-700/50 px-2 -mx-2 leading-relaxed">
          <span className="text-slate-500 select-none w-10 inline-block text-right mr-4 text-xs">{lineIndex + 1}</span>
          <span dangerouslySetInnerHTML={{ __html: coloredLine }} />
        </div>
      );
    });
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  
  return <div className="text-slate-100">{colorize(jsonString)}</div>;
}

export default AppHealth;
