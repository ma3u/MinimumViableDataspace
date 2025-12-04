/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Plane, 
  Building2, 
  RefreshCw, 
  Database, 
  FileCheck, 
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  Package
} from 'lucide-react';
import { DPPViewer } from './components/DPPViewer';
import { 
  getCachedCatalog, 
  executeCompleteTransfer,
  getProviderAssets
} from './services/edcApi';
import type { UserRole, DigitalProductPassport, CatalogDataset, Asset } from './types';

type DemoStep = 'catalog' | 'select' | 'negotiate' | 'transfer' | 'view';

interface ProgressState {
  negotiation: string;
  transfer: string;
  data: string;
}

function App() {
  const [role, setRole] = useState<UserRole>('consumer');
  const [step, setStep] = useState<DemoStep>('catalog');
  const [catalog, setCatalog] = useState<unknown[]>([]);
  const [providerAssets, setProviderAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CatalogDataset | null>(null);
  const [dppData, setDppData] = useState<DigitalProductPassport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState>({
    negotiation: '',
    transfer: '',
    data: ''
  });

  // Load catalog on mount
  useEffect(() => {
    if (role === 'consumer') {
      loadCatalog();
    } else {
      loadProviderAssets();
    }
  }, [role]);

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCachedCatalog();
      setCatalog(data);
    } catch (err) {
      setError('Failed to load catalog. Make sure the MVD is running and seeded.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProviderAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const assets = await getProviderAssets();
      setProviderAssets(assets);
    } catch (err) {
      setError('Failed to load provider assets. Make sure the MVD is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelect = (asset: CatalogDataset) => {
    setSelectedAsset(asset);
    setStep('select');
  };

  const handleNegotiateAndTransfer = async () => {
    if (!selectedAsset) return;

    setStep('negotiate');
    setLoading(true);
    setError(null);
    setProgress({ negotiation: '', transfer: '', data: '' });

    try {
      const policy = selectedAsset['odrl:hasPolicy'];
      const obligation = policy['odrl:obligation'];

      const result = await executeCompleteTransfer(
        selectedAsset['@id'],
        policy['@id'],
        obligation,
        (stepName, status) => {
          setProgress(prev => ({ ...prev, [stepName]: status }));
          if (stepName === 'transfer' && status === 'initiated') {
            setStep('transfer');
          }
        }
      );

      setDppData(result.data);
      setStep('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetDemo = () => {
    setStep('catalog');
    setSelectedAsset(null);
    setDppData(null);
    setError(null);
    setProgress({ negotiation: '', transfer: '', data: '' });
    loadCatalog();
  };

  // Extract datasets from catalog
  const getDatasets = (): CatalogDataset[] => {
    if (!catalog.length) return [];
    
    try {
      // Navigate through the nested catalog structure
      const catalogs = catalog[0] as { 'dcat:catalog'?: unknown[] };
      if (!catalogs['dcat:catalog']) return [];
      
      const datasets: CatalogDataset[] = [];
      for (const cat of catalogs['dcat:catalog']) {
        const catObj = cat as { 'dcat:dataset'?: CatalogDataset[] };
        if (catObj['dcat:dataset']) {
          datasets.push(...catObj['dcat:dataset']);
        }
      }
      
      // Filter for aerospace DPP assets (using asset:dpp: prefix from seed-aerospace.sh)
      return datasets.filter(d => 
        d['@id']?.startsWith('asset:dpp:') ||
        d['@id']?.includes('RR0')
      );
    } catch {
      return [];
    }
  };

  const datasets = getDatasets();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Plane className="w-8 h-8 text-rr-blue" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Aerospace Digital Product Passport
                </h1>
                <p className="text-sm text-gray-500">Eclipse Dataspace Connector Demo</p>
              </div>
            </div>
            
            {/* Role Switcher */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">View as:</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  onClick={() => setRole('provider')}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                    role === 'provider' 
                      ? 'bg-rr-blue text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Rolls-Royce
                </button>
                <button
                  onClick={() => setRole('consumer')}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                    role === 'consumer' 
                      ? 'bg-airbus-blue text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  Airbus
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {role === 'provider' ? (
          /* Provider View */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Provider Dashboard - Rolls-Royce
              </h2>
              <button
                onClick={loadProviderAssets}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-rr-blue text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Assets
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid gap-4">
              {providerAssets.map(asset => (
                <div 
                  key={asset['@id']} 
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {asset.properties.name || asset['@id']}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {asset.properties.description}
                      </p>
                      <div className="mt-3 flex gap-2">
                        {asset.properties['aerospace:partType'] && (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {asset.properties['aerospace:partType']}
                          </span>
                        )}
                        {asset.properties['aerospace:serialNumber'] && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                            S/N: {asset.properties['aerospace:serialNumber']}
                          </span>
                        )}
                      </div>
                    </div>
                    <Package className="w-8 h-8 text-rr-blue" />
                  </div>
                </div>
              ))}
              {providerAssets.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  No assets found. Run the seed-aerospace.sh script to add DPP assets.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Consumer View */
          <div>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[
                  { id: 'catalog', label: 'Browse Catalog', icon: Database },
                  { id: 'select', label: 'Select Asset', icon: FileCheck },
                  { id: 'negotiate', label: 'Negotiate Contract', icon: ArrowRight },
                  { id: 'transfer', label: 'Transfer Data', icon: ArrowRight },
                  { id: 'view', label: 'View DPP', icon: CheckCircle },
                ].map((s, i, arr) => (
                  <div key={s.id} className="flex items-center">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      step === s.id 
                        ? 'bg-airbus-blue text-white' 
                        : arr.findIndex(x => x.id === step) > i
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      <s.icon className="w-5 h-5" />
                      <span className="font-medium">{s.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-gray-300 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Step Content */}
            {step === 'catalog' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Data Catalog - Available DPPs
                  </h2>
                  <button
                    onClick={loadCatalog}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-airbus-blue text-white rounded-lg hover:bg-blue-900 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Catalog
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-airbus-blue" />
                    <p className="mt-2 text-gray-600">Loading catalog...</p>
                  </div>
                ) : datasets.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {datasets.map(dataset => (
                      <div 
                        key={dataset['@id']}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
                        onClick={() => handleAssetSelect(dataset)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <Package className="w-10 h-10 text-rr-blue" />
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Available
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {dataset['@id']}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {dataset.description || 'Digital Product Passport'}
                        </p>
                        <button className="mt-4 w-full py-2 bg-airbus-cyan text-white rounded-lg hover:bg-cyan-600 transition-colors">
                          Request Access
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      No DPP assets found in the catalog.
                    </p>
                    <p className="text-sm text-gray-500">
                      Make sure the MVD is running, seeded, and the aerospace seed script has been executed.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 'select' && selectedAsset && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Confirm Data Request
                </h2>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-4">Asset Details</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Asset ID</dt>
                      <dd className="font-mono text-sm">{selectedAsset['@id']}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Provider</dt>
                      <dd>Rolls-Royce plc</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Policy</dt>
                      <dd className="text-sm">Membership Required + Data Processing Level</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Transfer Type</dt>
                      <dd>HTTP Pull (Synchronous)</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('catalog')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back to Catalog
                  </button>
                  <button
                    onClick={handleNegotiateAndTransfer}
                    className="flex-1 px-6 py-3 bg-airbus-blue text-white rounded-lg hover:bg-blue-900 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Initiate Contract Negotiation
                  </button>
                </div>
              </div>
            )}

            {(step === 'negotiate' || step === 'transfer') && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {step === 'negotiate' ? 'Contract Negotiation' : 'Data Transfer'}
                </h2>
                <div className="space-y-6">
                  <ProgressItem 
                    label="Contract Negotiation" 
                    status={progress.negotiation}
                    isActive={step === 'negotiate'}
                  />
                  <ProgressItem 
                    label="Data Transfer" 
                    status={progress.transfer}
                    isActive={step === 'transfer' && progress.transfer !== 'complete'}
                  />
                  <ProgressItem 
                    label="Fetch DPP Data" 
                    status={progress.data}
                    isActive={progress.data === 'fetching'}
                  />
                </div>
              </div>
            )}

            {step === 'view' && dppData && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Received Digital Product Passport
                  </h2>
                  <button
                    onClick={resetDemo}
                    className="flex items-center gap-2 px-4 py-2 bg-airbus-blue text-white rounded-lg hover:bg-blue-900"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start New Transfer
                  </button>
                </div>
                <DPPViewer dpp={dppData} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Eclipse Dataspace Connector - Minimum Viable Dataspace Demo
        </div>
      </footer>
    </div>
  );
}

function ProgressItem({ label, status, isActive }: { label: string; status: string; isActive: boolean }) {
  const getStatusIcon = () => {
    if (status === 'complete' || status === 'FINALIZED' || status === 'STARTED') {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (isActive || status) {
      return <Loader2 className="w-6 h-6 text-airbus-blue animate-spin" />;
    }
    return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className="flex items-center gap-4">
      {getStatusIcon()}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        {status && (
          <div className="text-sm text-gray-500">
            Status: {status}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
