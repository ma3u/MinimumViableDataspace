/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { 
  Shield, 
  User, 
  Activity, 
  Pill,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Lock,
  Database,
  ExternalLink
} from 'lucide-react';
import type { ElectronicHealthRecord } from '../types/health';

interface EHRViewerProps {
  ehr: ElectronicHealthRecord;
}

export function EHRViewer({ ehr }: EHRViewerProps) {
  const subject = ehr.credentialSubject;
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'remission': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterpretationColor = (interpretation: string) => {
    switch (interpretation) {
      case 'normal': return 'text-green-600';
      case 'elevated': 
      case 'high':
      case 'borderline-high':
        return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Electronic Health Record</h2>
            <p className="text-teal-200 mt-1">FHIR Bundle - De-identified for Research</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subject.conditionsNode.primaryDiagnosis.clinicalStatus)}`}>
              {subject.conditionsNode.primaryDiagnosis.clinicalStatus || 'active'}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-teal-200">Pseudonym ID:</span>
            <span className="ml-2 font-mono">{subject.demographicsNode.pseudonymId}</span>
          </div>
          <div>
            <span className="text-teal-200">Issued:</span>
            <span className="ml-2">{new Date(ehr.issuanceDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Consent Scope - Most Important for Healthcare */}
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
                  {subject.consentScope.purposes.map((purpose, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      <CheckCircle className="w-3 h-3" />
                      {purpose.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Data Categories:</span>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {subject.consentScope.dataCategories.map((cat, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white text-gray-700 rounded text-sm border">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <InfoItem label="Retention Period" value={subject.consentScope.retentionPeriod.replace(/-/g, ' ')} />
              </div>
              <div>
                <InfoItem label="Jurisdiction" value={subject.consentScope.jurisdiction} />
              </div>
            </div>
            {subject.consentScope.sensitiveCategories && subject.consentScope.sensitiveCategories.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Sensitive Categories (Special Protection Required):
                </div>
                <div className="flex gap-2 mt-2">
                  {subject.consentScope.sensitiveCategories.map((cat, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                      {cat.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Demographics Node */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Demographics (Anonymized)</h3>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-600">Age Band</div>
              <div className="text-xl font-bold text-gray-900">{subject.demographicsNode.ageBand}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm text-gray-600">Biological Sex</div>
              <div className="text-xl font-bold text-gray-900 capitalize">{subject.demographicsNode.biologicalSex}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Region</div>
                <div className="font-medium text-gray-900">{subject.demographicsNode.region}</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Enrollment</div>
                <div className="font-medium text-gray-900">{subject.demographicsNode.enrollmentPeriod}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Conditions Node */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Diagnoses (ICD-10-GM)</h3>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            {/* Primary Diagnosis */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Primary Diagnosis</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-mono">
                  {subject.conditionsNode.primaryDiagnosis.code}
                </span>
              </div>
              <div className="text-lg font-medium text-gray-900">
                {subject.conditionsNode.primaryDiagnosis.display}
              </div>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                {subject.conditionsNode.primaryDiagnosis.onsetPeriod && (
                  <span>Onset: {subject.conditionsNode.primaryDiagnosis.onsetPeriod}</span>
                )}
                {subject.conditionsNode.primaryDiagnosis.clinicalStatus && (
                  <span className={`font-medium ${getStatusColor(subject.conditionsNode.primaryDiagnosis.clinicalStatus)} px-2 py-0.5 rounded`}>
                    {subject.conditionsNode.primaryDiagnosis.clinicalStatus}
                  </span>
                )}
              </div>
            </div>
            
            {/* Comorbidities */}
            {subject.conditionsNode.comorbidities.length > 0 && (
              <div>
                <span className="text-sm text-gray-600 mb-2 block">Comorbidities:</span>
                <div className="grid md:grid-cols-2 gap-2">
                  {subject.conditionsNode.comorbidities.map((condition, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
                      <span className="text-gray-900">{condition.display}</span>
                      <span className="text-xs font-mono text-gray-500">{condition.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Observations Node */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Clinical Observations</h3>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            {/* Vitals */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <VitalCard 
                label="BMI Category" 
                value={subject.observationsNode.latestVitals.bmiCategory.replace(/-/g, ' ')} 
              />
              <VitalCard 
                label="Blood Pressure" 
                value={subject.observationsNode.latestVitals.bloodPressureCategory.replace(/-/g, ' ')} 
              />
              {subject.observationsNode.latestVitals.hba1cRange && (
                <VitalCard label="HbA1c" value={subject.observationsNode.latestVitals.hba1cRange} />
              )}
              {subject.observationsNode.latestVitals.ejectionFractionRange && (
                <VitalCard label="Ejection Fraction" value={subject.observationsNode.latestVitals.ejectionFractionRange} />
              )}
              {subject.observationsNode.latestVitals.edssScore && (
                <VitalCard label="EDSS Score" value={subject.observationsNode.latestVitals.edssScore} />
              )}
            </div>
            
            {/* Lab Results */}
            {subject.observationsNode.labResults.length > 0 && (
              <div>
                <span className="text-sm text-gray-600 mb-2 block">Lab Results (Ranges):</span>
                <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Test</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Value Range</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subject.observationsNode.labResults.map((lab, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2 text-gray-900">{lab.display}</td>
                          <td className="px-4 py-2 font-mono text-gray-700">{lab.valueRange}</td>
                          <td className={`px-4 py-2 font-medium capitalize ${getInterpretationColor(lab.interpretation)}`}>
                            {lab.interpretation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Procedures Node (if present) */}
        {subject.proceduresNode && subject.proceduresNode.historicalProcedures.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Procedures History</h3>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="space-y-2">
                {subject.proceduresNode.historicalProcedures.map((proc, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-gray-900 font-medium">{proc.display}</span>
                      {proc.code && <span className="ml-2 text-xs font-mono text-gray-500">{proc.code}</span>}
                    </div>
                    <span className="text-sm text-gray-600">{proc.periodPerformed}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Medications Node */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Pill className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Active Medications (ATC)</h3>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-3">
              {subject.medicationsNode.activeTherapies.map((med, i) => (
                <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{med.display}</span>
                    <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      {med.code}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Duration: {med.durationCategory.replace(/-/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clinical Trial Information */}
        {subject.clinicalTrialNode && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Clinical Trial Information</h3>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 space-y-3">
              {/* EU CTR 536/2014 Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  🇪🇺 EU CTR 536/2014 Compliant
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-sm text-gray-600">Study Phase</span>
                  <div className="text-lg font-bold text-indigo-700">{subject.clinicalTrialNode.phase}</div>
                  <div className="text-xs text-gray-500 mt-1">Code: {subject.clinicalTrialNode.phaseCode}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-sm text-gray-600">Study Type</span>
                  <div className="text-lg font-medium text-gray-900 capitalize">{subject.clinicalTrialNode.studyType.replace(/-/g, ' ')}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-sm text-gray-600">Intervention Model</span>
                  <div className="font-medium text-gray-900 capitalize">{subject.clinicalTrialNode.interventionModel}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-sm text-gray-600">EU CT Number (CTIS)</span>
                  <a 
                    href={`https://euclinicaltrials.eu/ctis-public/search#searchCriteria={"containAll":"${subject.clinicalTrialNode.euCtNumber}","containAny":"","containNot":""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-blue-600 hover:underline flex items-center gap-1"
                    title="Demo trial - not in CTIS"
                  >
                    {subject.clinicalTrialNode.euCtNumber}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              {/* Sponsor Information */}
              {subject.clinicalTrialNode.sponsor && (
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-sm text-gray-600">Sponsor</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      subject.clinicalTrialNode.sponsor.type === 'commercial' ? 'bg-blue-100 text-blue-800' :
                      subject.clinicalTrialNode.sponsor.type === 'academic' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {subject.clinicalTrialNode.sponsor.type === 'commercial' ? '🏢' :
                       subject.clinicalTrialNode.sponsor.type === 'academic' ? '🎓' : '🏛️'}
                      {' '}{subject.clinicalTrialNode.sponsor.type}
                    </span>
                    <span className="font-medium text-gray-900">{subject.clinicalTrialNode.sponsor.name}</span>
                  </div>
                </div>
              )}
              {/* Therapeutic Area */}
              {subject.clinicalTrialNode.therapeuticArea && (
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-sm text-gray-600">EMA Therapeutic Area</span>
                  <div className="font-medium text-gray-900 mt-1">{subject.clinicalTrialNode.therapeuticArea.name}</div>
                  <div className="text-xs text-gray-500">Code: {subject.clinicalTrialNode.therapeuticArea.code}</div>
                </div>
              )}
              {/* Member States Concerned */}
              {subject.clinicalTrialNode.memberStatesConcerned && subject.clinicalTrialNode.memberStatesConcerned.length > 0 && (
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-sm text-gray-600">Member States Concerned</span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {subject.clinicalTrialNode.memberStatesConcerned.map(code => {
                      const flagMap: Record<string, { flag: string; name: string }> = {
                        'DE': { flag: '🇩🇪', name: 'Germany' },
                        'FR': { flag: '🇫🇷', name: 'France' },
                        'NL': { flag: '🇳🇱', name: 'Netherlands' },
                        'ES': { flag: '🇪🇸', name: 'Spain' },
                        'IT': { flag: '🇮🇹', name: 'Italy' },
                        'BE': { flag: '🇧🇪', name: 'Belgium' },
                        'AT': { flag: '🇦🇹', name: 'Austria' },
                      };
                      const country = flagMap[code];
                      return (
                        <span key={code} className="px-2 py-1 bg-gray-100 rounded text-sm" title={country?.name || code}>
                          {country?.flag || ''} {code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <span className="text-sm text-gray-600">Primary Endpoint</span>
                <div className="font-medium text-gray-900 mt-1">{subject.clinicalTrialNode.primaryEndpoint}</div>
              </div>
            </div>
          </section>
        )}

        {/* MedDRA Classification */}
        {subject.medDRANode && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">MedDRA Classification (v{subject.medDRANode.version})</h3>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">System Organ Class (SOC)</div>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg text-gray-900">{subject.medDRANode.primarySOC.name}</div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded font-mono text-sm">{subject.medDRANode.primarySOC.code}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">Abbreviation: {subject.medDRANode.primarySOC.abbreviation}</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-2">Preferred Term (PT)</div>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">{subject.medDRANode.preferredTerm.name}</div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded font-mono text-sm">{subject.medDRANode.preferredTerm.code}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">HLT Code: {subject.medDRANode.preferredTerm.hltCode}</div>
              </div>
            </div>
          </section>
        )}

        {/* Signal Verification & Adverse Events */}
        {subject.signalVerificationNode && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Signal Verification & Adverse Events</h3>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                <div>
                  <span className="text-sm text-gray-600">Signal Status</span>
                  <div className="font-medium text-gray-900 capitalize mt-1">{subject.signalVerificationNode.signalStatus.signalCategory?.replace(/-/g, ' ') ?? 'Unknown'}</div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subject.signalVerificationNode.signalStatus.hasActiveSignal
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {subject.signalVerificationNode.signalStatus.hasActiveSignal ? '⚠️ Active Signal' : '✓ No Active Signals'}
                  </span>
                </div>
              </div>
              
              {subject.signalVerificationNode.adverseEvents && subject.signalVerificationNode.adverseEvents.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Reported Adverse Events (ADRs):</div>
                  {subject.signalVerificationNode.adverseEvents.map((ae: any, i: number) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{ae.medDRAPT}</div>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-mono">{ae.medDRACode}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Severity:</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                            ae.severity === 'mild' ? 'bg-green-100 text-green-800' :
                            ae.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>{ae.severity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Relatedness:</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                            ae.relatedness === 'certain' || ae.relatedness === 'probable' ? 'bg-red-100 text-red-800' :
                            ae.relatedness === 'possible' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>{ae.relatedness}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Outcome:</span>
                          <span className="ml-2 text-gray-900">{ae.outcome.replace(/-/g, ' ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Action Taken:</span>
                          <span className="ml-2 text-gray-900">{ae.actionTaken.replace(/-/g, ' ')}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Suspected Drug: {ae.suspectedDrug} • Onset: {ae.onsetPeriod}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-gray-600">Last Review Date</span>
                  <div className="font-medium text-gray-900 mt-1">{subject.signalVerificationNode.signalStatus.lastReviewDate}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <span className="text-gray-600">Reporting Status</span>
                  <div className="font-medium text-gray-900 mt-1 capitalize">{subject.signalVerificationNode.reportingStatus.replace(/-/g, ' ')}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Anamnesis (Medical History) */}
        {subject.anamnesisNode && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Anamnesis (Medical History)</h3>
            </div>
            <div className="bg-teal-50 rounded-lg p-4 space-y-3">
              {Object.entries(subject.anamnesisNode).map(([key, step]: [string, any]) => (
                <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm font-bold">
                      {step.stepNumber}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">{step.stepName}</div>
                      <div className="text-xs text-gray-500">{step.stepNameDE}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{step.summary}</p>
                  {step.relevantFindings && step.relevantFindings.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {step.relevantFindings.map((finding: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs">
                          • {finding}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Clinical Significance: <span className={`font-medium ${
                      step.clinicalSignificance === 'high' ? 'text-red-600' :
                      step.clinicalSignificance === 'moderate' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>{step.clinicalSignificance}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Study Eligibility */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-semibold text-gray-900">Study Eligibility</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {subject.studyEligibility.map((study, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {study}
              </span>
            ))}
          </div>
        </section>

        {/* Provenance Node */}
        <section className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">Data Provenance</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Source System:</span>
              <div className="font-medium text-gray-900">{subject.provenanceNode.sourceSystem}</div>
            </div>
            <div>
              <span className="text-gray-500">Extraction Date:</span>
              <div className="font-medium text-gray-900">{subject.provenanceNode.extractionDate}</div>
            </div>
            <div>
              <span className="text-gray-500">De-identification:</span>
              <div className="font-medium text-gray-900">{subject.provenanceNode.deIdentificationMethod}</div>
            </div>
            <div>
              <span className="text-gray-500">Quality Score:</span>
              <div className="font-medium text-gray-900">
                <span className={subject.provenanceNode.qualityScore >= 0.9 ? 'text-green-600' : 'text-yellow-600'}>
                  {(subject.provenanceNode.qualityScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Credential Info */}
        <section className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span>Verifiable Credential issued by {ehr.issuer}</span>
          </div>
          <div className="mt-2 text-xs font-mono text-gray-400 break-all">
            ID: {ehr.id}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-gray-600">{label}</span>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function VitalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-lg font-bold text-gray-900 capitalize">{value}</div>
    </div>
  );
}
