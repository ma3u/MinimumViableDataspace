/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Database, 
  ArrowRight,
  ArrowLeftRight,
  CheckCircle,
  Loader2,
  Package,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Play,
  RotateCcw,
  Code,
  Shield,
  FileCheck2,
  Send,
  Github
} from 'lucide-react';
import { DPPViewer } from './components/DPPViewer';
import hpTurbineBladeImg from './images/HP_TURBO_BLADE.png';
import hpCompressorBladeImg from './images/HP_COMPRESSOR_BLADE.png';
import combustorLinerImg from './images/HP_COMBUSTER_LINER.png';
import fanBladeImg from './images/DPP_FAN_BLADE.png';
import { 
  mockCatalogAssets, 
  mockDPPData, 
  dspPhases,
  dspMessages,
  participants,
  mockNegotiationFlow,
  mockTransferFlow
} from './services/mockData';
import type { DigitalProductPassport } from './types';

type DemoPhase = 'intro' | 'catalog' | 'negotiation' | 'transfer' | 'complete';

interface MockAsset {
  '@id': string;
  'dct:title': string;
  'dct:description': string;
  'aerospace:partType': string;
  'aerospace:serialNumber': string;
  'aerospace:status': string;
  'odrl:hasPolicy': {
    '@id': string;
  };
}

function App() {
  const [phase, setPhase] = useState<DemoPhase>('intro');
  const [selectedAsset, setSelectedAsset] = useState<MockAsset | null>(null);
  const [negotiationStep, setNegotiationStep] = useState(0);
  const [transferStep, setTransferStep] = useState(0);
  const [dppData, setDppData] = useState<DigitalProductPassport | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const assetImages: Record<string, string> = {
    'asset:dpp:RR001': hpTurbineBladeImg,
    'asset:dpp:RR002': hpCompressorBladeImg,
    'asset:dpp:RR003': combustorLinerImg,
    'asset:dpp:RR004': fanBladeImg,
  };

  const resetDemo = () => {
    setPhase('intro');
    setSelectedAsset(null);
    setNegotiationStep(0);
    setTransferStep(0);
    setDppData(null);
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
    // Load the DPP data
    if (selectedAsset) {
      setDppData(mockDPPData[selectedAsset['@id']]);
    }
    setIsAnimating(false);
    setPhase('complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <ArrowLeftRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Aerospace Supply Chain - Digital Passport (DPP) Demo
                </h1>
                <p className="text-sm text-gray-500">Digital Product Passport Exchange</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {[
                { id: 'catalog', label: 'Catalog Protocol', icon: Database },
                { id: 'negotiation', label: 'Contract Negotiation', icon: FileCheck2 },
                { id: 'transfer', label: 'Transfer Process', icon: Send },
                { id: 'complete', label: 'Data Received', icon: CheckCircle },
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
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold mb-4">
                  Sovereign Data Exchange via Dataspace Protocol
                </h2>
                <p className="text-blue-100 text-lg mb-6">
                  This interactive demo illustrates the secure exchange of Digital Product Passports (DPP) 
                  using the Dataspace Protocol (DSP). It demonstrates how organizations can maintain data sovereignty 
                  while sharing critical aerospace data through a standardized, federated infrastructure.
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
                    href="https://github.com/ma3u/MinimumViableDataspace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 border border-white/30 rounded-lg font-semibold hover:bg-blue-500/30 text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    View Code on GitHub
                  </a>
                  <a
                    href="https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 border border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                    Read Specification
                  </a>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{participants.provider.logo}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{participants.provider.name}</h3>
                    <p className="text-blue-600 font-medium">{participants.provider.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{participants.provider.description}</p>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-600">
                  DID: {participants.provider.did}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{participants.consumer.logo}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{participants.consumer.name}</h3>
                    <p className="text-green-600 font-medium">{participants.consumer.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{participants.consumer.description}</p>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-600">
                  DID: {participants.consumer.did}
                </div>
              </div>
            </div>

            {/* Protocol Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Protocol Phases</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(dspPhases).map(([key, phaseData]) => (
                  <div key={key} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      {key === 'catalog' && <Database className="w-5 h-5 text-blue-600" />}
                      {key === 'negotiation' && <FileCheck2 className="w-5 h-5 text-purple-600" />}
                      {key === 'transfer' && <Send className="w-5 h-5 text-green-600" />}
                      <h4 className="font-semibold text-gray-900">{phaseData.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{phaseData.description}</p>
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
              phase={dspPhases.catalog}
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
              
              <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">{participants.consumer.logo}</div>
                  <div className="font-medium text-sm">Consumer</div>
                </div>
                <div className="flex-1 px-4">
                  <div className="flex items-center justify-center gap-2 text-sm mb-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">CatalogRequestMessage</span>
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-600 rotate-180" />
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">dcat:Catalog</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">{participants.provider.logo}</div>
                  <div className="font-medium text-sm">Provider</div>
                </div>
              </div>

              {showJson && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Request Message</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(dspMessages.catalogRequest, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Response (Catalog)</h4>
                    <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(dspMessages.catalogResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Catalog Results */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Available Datasets (dcat:Dataset)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {mockCatalogAssets.map(asset => (
                  <div 
                    key={asset['@id']}
                    className={`relative overflow-hidden border rounded-lg p-4 cursor-pointer transition-all group ${
                      selectedAsset?.['@id'] === asset['@id']
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'hover:border-blue-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedAsset(asset as MockAsset)}
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={assetImages[asset['@id']]} 
                        alt="" 
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40 group-hover:from-white/90 group-hover:via-white/70 group-hover:to-white/20 transition-all" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div /> {/* Spacer for removed icon */}
                        <span className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm shadow-sm ${
                          asset['aerospace:status'] === 'NEW' 
                            ? 'bg-green-100/90 text-green-800'
                            : 'bg-yellow-100/90 text-yellow-800'
                        }`}>
                          {asset['aerospace:status']}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-lg">{asset['dct:title']}</h4>
                      <p className="text-sm text-gray-600 mb-3 font-medium">{asset['dct:description']}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-white/80 backdrop-blur-sm border text-gray-700 rounded text-xs">
                          {asset['aerospace:partType']}
                        </span>
                        <span className="px-2 py-1 bg-white/80 backdrop-blur-sm border text-gray-700 rounded text-xs font-mono">
                          {asset['aerospace:serialNumber']}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            {selectedAsset && (
              <div className="flex justify-end">
                <button
                  onClick={() => setPhase('negotiation')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Request Contract for "{selectedAsset['dct:title']}"
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* NEGOTIATION PHASE */}
        {phase === 'negotiation' && selectedAsset && (
          <div className="space-y-6">
            <PhaseHeader 
              phase={dspPhases.negotiation}
              icon={<FileCheck2 className="w-6 h-6" />}
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
                {dspPhases.negotiation.steps.map((step, i) => (
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

            {/* Policy Display */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Usage Policy (ODRL)
              </h3>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                      Negotiating...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run Negotiation
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setPhase('transfer')}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Contract Agreed - Start Transfer
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
              phase={dspPhases.transfer}
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
                    <code className="text-sm">HttpData-PULL</code>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Consumer pulls data from Provider&apos;s data plane endpoint
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Data Address</h4>
                  <div className="bg-white rounded p-3 font-mono text-xs break-all">
                    https://provider.apexpropulsion.com/public/data/{selectedAsset['@id'].split(':').pop()}
                  </div>
                </div>
              </div>
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
                      Transferring...
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
        {phase === 'complete' && dppData && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold">Data Transfer Complete!</h2>
                  <p className="text-green-100">
                    The Digital Product Passport has been successfully received via the Dataspace Protocol.
                  </p>
                </div>
              </div>
            </div>


            {/* DPP Viewer */}
            <DPPViewer 
              dpp={dppData} 
              imageUrl={selectedAsset ? assetImages[selectedAsset['@id']] : undefined}
            />

            {/* Restart */}
            <div className="flex justify-center">
              <button
                onClick={resetDemo}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Try Another Asset
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
              Demo based on Eclipse Dataspace Protocol 2025-1 Specification and Eclipse Dataspace Components
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
                href="https://github.com/ma3u/MinimumViableDataspace"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                Aerospace Supply Chain Demo
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

export default App;
