/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { 
  Shield, 
  Leaf, 
  Settings, 
  Cpu, 
  Building2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { DigitalProductPassport } from '../types';

interface DPPViewerProps {
  dpp: DigitalProductPassport;
}

export function DPPViewer({ dpp }: DPPViewerProps) {
  const subject = dpp.credentialSubject;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-green-100 text-green-800';
      case 'OVERHAULED': return 'bg-blue-100 text-blue-800';
      case 'SERVICEABLE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rr-blue to-blue-800 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Digital Product Passport</h2>
            <p className="text-blue-200 mt-1">{subject.partType}</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subject.airworthinessNode.status)}`}>
              {subject.airworthinessNode.status}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-200">SKU:</span>
            <span className="ml-2 font-mono">{subject.sku}</span>
          </div>
          <div>
            <span className="text-blue-200">Issued:</span>
            <span className="ml-2">{new Date(dpp.issuanceDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Identity Node */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-rr-blue" />
            <h3 className="text-lg font-semibold text-gray-900">Identity Information</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <InfoItem label="Manufacturer" value={subject.identityNode.manufacturerName} />
            <InfoItem label="CAGE Code" value={subject.identityNode.cageCode} />
            <InfoItem label="Part Number" value={subject.identityNode.partNumber} />
            <InfoItem label="Serial Number" value={subject.identityNode.serialNumber} highlight />
            {subject.identityNode.batchNumber && (
              <InfoItem label="Batch Number" value={subject.identityNode.batchNumber} />
            )}
            {subject.identityNode.manufacturingDate && (
              <InfoItem label="Manufacturing Date" value={subject.identityNode.manufacturingDate} />
            )}
            {subject.identityNode.manufacturingLocation && (
              <InfoItem label="Location" value={subject.identityNode.manufacturingLocation} />
            )}
          </div>
        </section>

        {/* Airworthiness Node */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Airworthiness Certification</h3>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Form Type" value={subject.airworthinessNode.formType} />
              <InfoItem label="Tracking Number" value={subject.airworthinessNode.formTrackingNumber} />
              {subject.airworthinessNode.certificationAuthority && (
                <InfoItem label="Authority" value={subject.airworthinessNode.certificationAuthority} />
              )}
              {subject.airworthinessNode.approvalDate && (
                <InfoItem label="Approval Date" value={subject.airworthinessNode.approvalDate} />
              )}
              {subject.airworthinessNode.expiryDate && (
                <InfoItem label="Expiry Date" value={subject.airworthinessNode.expiryDate} />
              )}
            </div>
            {subject.airworthinessNode.qualityStandards && (
              <div className="mt-4">
                <span className="text-sm text-gray-600">Quality Standards:</span>
                <div className="flex gap-2 mt-2">
                  {subject.airworthinessNode.qualityStandards.map((std, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      <CheckCircle className="w-3 h-3" />
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sustainability Node */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sustainability Metrics</h3>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-emerald-600">
                  {subject.sustainabilityNode.pcfValue}
                </div>
                <div className="text-sm text-gray-600">
                  {subject.sustainabilityNode.pcfUnit}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Carbon Footprint ({subject.sustainabilityNode.scope})
                </div>
              </div>
              {subject.sustainabilityNode.recyclableContent && (
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-emerald-600">
                    {subject.sustainabilityNode.recyclableContent}%
                  </div>
                  <div className="text-sm text-gray-600">Recyclable Content</div>
                </div>
              )}
              {subject.sustainabilityNode.energyConsumption && (
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-emerald-600">
                    {subject.sustainabilityNode.energyConsumption.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {subject.sustainabilityNode.energyConsumption.unit}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Energy Used</div>
                </div>
              )}
            </div>
            {subject.sustainabilityNode.materialComposition && (
              <div>
                <span className="text-sm text-gray-600">Material Composition:</span>
                <div className="mt-2 space-y-2">
                  {subject.sustainabilityNode.materialComposition.map((mat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-emerald-500 h-4 rounded-full" 
                          style={{ width: `${mat.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-32">{mat.material}</span>
                      <span className="text-sm font-medium w-12 text-right">{mat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Operational Node */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Operational Data</h3>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <MetricCard 
              label="Time Since New" 
              value={subject.operationalNode.timeSinceNew} 
              unit="hours"
              max={subject.operationalNode.maximumOperatingHours}
            />
            <MetricCard 
              label="Cycles Since New" 
              value={subject.operationalNode.cyclesSinceNew} 
              unit="cycles"
              max={subject.operationalNode.maximumCycles}
            />
            {subject.operationalNode.timeSinceOverhaul !== undefined && (
              <MetricCard 
                label="Time Since Overhaul" 
                value={subject.operationalNode.timeSinceOverhaul} 
                unit="hours"
              />
            )}
            {subject.operationalNode.cyclesSinceOverhaul !== undefined && (
              <MetricCard 
                label="Cycles Since Overhaul" 
                value={subject.operationalNode.cyclesSinceOverhaul} 
                unit="cycles"
              />
            )}
          </div>
        </section>

        {/* Technical Specifications */}
        {subject.technicalSpecifications && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <InfoItem label="Engine Model" value={subject.technicalSpecifications.engineModel} />
              <InfoItem label="Stage" value={subject.technicalSpecifications.stage} />
              {subject.technicalSpecifications.weight && (
                <InfoItem 
                  label="Weight" 
                  value={`${subject.technicalSpecifications.weight.value} ${subject.technicalSpecifications.weight.unit}`} 
                />
              )}
              {subject.technicalSpecifications.operatingTemperature && (
                <InfoItem 
                  label="Max Operating Temp" 
                  value={`${subject.technicalSpecifications.operatingTemperature.max}${subject.technicalSpecifications.operatingTemperature.unit}`} 
                />
              )}
              {subject.technicalSpecifications.dimensions && (
                <InfoItem 
                  label="Dimensions (L×W×H)" 
                  value={`${subject.technicalSpecifications.dimensions.length}×${subject.technicalSpecifications.dimensions.width}×${subject.technicalSpecifications.dimensions.height} ${subject.technicalSpecifications.dimensions.unit}`} 
                />
              )}
            </div>
          </section>
        )}

        {/* Credential Info */}
        <section className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span>Verifiable Credential issued by {dpp.issuer}</span>
          </div>
          <div className="mt-2 text-xs font-mono text-gray-400 break-all">
            ID: {dpp.id}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-sm text-gray-600">{label}</span>
      <div className={`font-medium ${highlight ? 'text-rr-blue font-mono' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, max }: { label: string; value: number; unit: string; max?: number }) {
  const percentage = max ? (value / max) * 100 : 0;
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500">{unit}</div>
      {max && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Usage</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">Max: {max.toLocaleString()} {unit}</div>
        </div>
      )}
    </div>
  );
}
