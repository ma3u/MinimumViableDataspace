/*
 *  Copyright (c) 2025 Health Dataspace Demo - EHR2EDC
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Clock, FileJson, Building2, Lock, Unlock, Eye } from 'lucide-react';
import type { CatalogAsset, PolicySummary, Distribution } from '../services/apiFactory';

// Medical category definitions
const medicalCategories: Record<string, { label: string; color: string; icon: string }> = {
  'genomics': { label: 'Genomics', color: 'bg-slate-100 text-slate-800', icon: '🧬' },
  'endocrine': { label: 'Endocrine/Metabolic', color: 'bg-amber-100 text-amber-800', icon: '🔬' },
  'cardiology': { label: 'Cardiology', color: 'bg-red-100 text-red-800', icon: '❤️' },
  'oncology': { label: 'Oncology', color: 'bg-pink-100 text-pink-800', icon: '🎗️' },
  'pulmonology': { label: 'Pulmonology', color: 'bg-sky-100 text-sky-800', icon: '🫁' },
  'rheumatology': { label: 'Rheumatology', color: 'bg-orange-100 text-orange-800', icon: '🦴' },
  'neurology': { label: 'Neurology', color: 'bg-purple-100 text-purple-800', icon: '🧠' },
  'nephrology': { label: 'Nephrology', color: 'bg-yellow-100 text-yellow-800', icon: '🫘' },
  'psychiatry': { label: 'Psychiatry', color: 'bg-indigo-100 text-indigo-800', icon: '🧠' },
  'gastroenterology': { label: 'Gastroenterology', color: 'bg-green-100 text-green-800', icon: '🔄' },
  'infectious': { label: 'Infectious Disease', color: 'bg-rose-100 text-rose-800', icon: '🦠' },
};

// Background images for medical categories
const categoryBackgrounds: Record<string, string> = {
  'genomics': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop',
  'endocrine': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
  'cardiology': 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=300&fit=crop',
  'oncology': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
  'pulmonology': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop',
  'rheumatology': 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=300&fit=crop',
  'neurology': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
  'nephrology': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
  'psychiatry': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
  'gastroenterology': 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop',
  'infectious': 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&h=300&fit=crop',
};

// Sponsor type display
const sponsorTypes: Record<string, { label: string; color: string; icon: string }> = {
  'commercial': { label: 'Commercial Sponsor', color: 'bg-blue-100 text-blue-700', icon: '🏢' },
  'academic': { label: 'Academic Sponsor', color: 'bg-purple-100 text-purple-700', icon: '🎓' },
  'non-profit': { label: 'Non-Profit Sponsor', color: 'bg-green-100 text-green-700', icon: '🏛️' },
};

interface CatalogCardProps {
  asset: CatalogAsset;
  isSelected: boolean;
  onSelect: (asset: CatalogAsset) => void;
  showEnhancedInfo?: boolean;
}

/**
 * PolicyBadge - Displays policy type with appropriate styling
 */
export const PolicyBadge: React.FC<{ policy?: PolicySummary }> = ({ policy }) => {
  if (!policy) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
        <Eye className="w-3 h-3" />
        Open Access
      </span>
    );
  }

  const policyType = policy.type ?? 'restricted';
  const constraintCount = policy.constraints?.length ?? 0;

  let colorClass = 'bg-gray-100 text-gray-600';
  let Icon = Eye;
  let label = 'Unknown';

  switch (policyType) {
    case 'open':
      colorClass = 'bg-green-100 text-green-700';
      Icon = Unlock;
      label = 'Open Access';
      break;
    case 'consent-required':
      colorClass = 'bg-yellow-100 text-yellow-700';
      Icon = Lock;
      label = 'Consent Required';
      break;
    case 'restricted':
      colorClass = 'bg-red-100 text-red-700';
      Icon = Shield;
      label = 'Restricted';
      break;
    default:
      label = policyType;
  }

  return (
    <span 
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorClass}`}
      title={constraintCount > 0 ? `${constraintCount} constraint(s)` : undefined}
    >
      <Icon className="w-3 h-3" />
      {label}
      {constraintCount > 0 && (
        <span className="ml-1 px-1 bg-white/50 rounded text-[10px]">{constraintCount}</span>
      )}
    </span>
  );
};

/**
 * DataFreshness - Shows when data was issued/modified
 */
export const DataFreshness: React.FC<{ issued?: string; modified?: string }> = ({ issued, modified }) => {
  const dateToShow = modified || issued;
  if (!dateToShow) return null;

  const date = new Date(dateToShow);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  let freshnessLabel = '';
  let freshnessColor = '';

  if (diffDays <= 7) {
    freshnessLabel = 'Fresh';
    freshnessColor = 'text-green-600';
  } else if (diffDays <= 30) {
    freshnessLabel = 'Recent';
    freshnessColor = 'text-blue-600';
  } else if (diffDays <= 90) {
    freshnessLabel = 'Aging';
    freshnessColor = 'text-yellow-600';
  } else {
    freshnessLabel = 'Stale';
    freshnessColor = 'text-orange-600';
  }

  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <span className={`flex items-center gap-1 text-xs ${freshnessColor}`} title={`${modified ? 'Modified' : 'Issued'}: ${formattedDate}`}>
      <Clock className="w-3 h-3" />
      {freshnessLabel} ({formattedDate})
    </span>
  );
};

/**
 * DistributionFormats - Shows available data formats
 */
export const DistributionFormats: React.FC<{ distributions?: Distribution[] }> = ({ distributions }) => {
  if (!distributions || distributions.length === 0) return null;

  const formats = distributions
    .map(d => d.format)
    .filter(Boolean)
    .slice(0, 3);

  if (formats.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <FileJson className="w-3 h-3 text-gray-500" />
      {formats.map((format, i) => (
        <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono uppercase">
          {format}
        </span>
      ))}
      {distributions.length > 3 && (
        <span className="text-[10px] text-gray-500">+{distributions.length - 3}</span>
      )}
    </div>
  );
};

/**
 * PublisherInfo - Shows dataset publisher information
 */
export const PublisherInfo: React.FC<{ publisher?: CatalogAsset['publisher'] }> = ({ publisher }) => {
  if (!publisher) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <Building2 className="w-3 h-3" />
      <span className="truncate" title={publisher.name}>{publisher.name}</span>
    </div>
  );
};

/**
 * SensitivityIndicator - Shows data sensitivity level
 */
export const SensitivityIndicator: React.FC<{ level?: string }> = ({ level }) => {
  if (!level || level === 'none') return null;

  const levelColors: Record<string, string> = {
    'genomics': 'text-red-600',
    'mental-health': 'text-purple-600',
    'reproductive': 'text-pink-600',
    'substance-use': 'text-orange-600',
    'hiv-status': 'text-rose-600',
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${levelColors[level] || 'text-amber-600'}`}>
      <Shield className="w-3 h-3" />
      <span className="capitalize">Sensitive: {level.replace('-', ' ')}</span>
    </div>
  );
};

/**
 * CatalogCard Component
 * 
 * Displays a catalog asset with full DCAT-AP metadata including:
 * - Publisher information
 * - Policy badge (open/consent-required/restricted)
 * - Data freshness indicator
 * - Distribution formats
 * - Sensitivity level
 */
export const CatalogCard: React.FC<CatalogCardProps> = ({ 
  asset, 
  isSelected, 
  onSelect, 
  showEnhancedInfo = true 
}) => {
  const category = medicalCategories[asset.healthCategory?.toLowerCase() ?? ''] 
    ?? medicalCategories[asset.healthCategory ?? ''];
  const bgImage = categoryBackgrounds[asset.healthCategory?.toLowerCase() ?? ''];

  // Extract sponsor info
  const sponsor = asset.sponsor;

  // Extract EU CT number
  const euCtNumber = asset.euCtNumber;

  // Extract health theme codes if available
  const healthTheme = asset.healthTheme;

  return (
    <div 
      className={`relative overflow-hidden border rounded-lg cursor-pointer transition-all group ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'hover:border-blue-300 hover:shadow-lg'
      }`}
      onClick={() => onSelect(asset)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(asset)}
    >
      {/* Background Image */}
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={bgImage} 
            alt="" 
            className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/70" />
        </div>
      )}
      
      <div className="relative z-10 p-4">
        {/* Header Row: Category Icon + ICD Code + Policy Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{category?.icon || '📋'}</span>
            {healthTheme && healthTheme.length > 0 && (
              <span className="font-mono text-xs text-gray-600 bg-white/80 px-1.5 py-0.5 rounded">
                {healthTheme[0]}
              </span>
            )}
          </div>
          {showEnhancedInfo && <PolicyBadge policy={asset.policy} />}
        </div>

        {/* Title and Description */}
        <h4 className="font-semibold text-gray-900 mb-1">{asset.title}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{asset.description}</p>

        {/* Publisher Info (Enhanced) */}
        {showEnhancedInfo && asset.publisher && (
          <div className="mb-2">
            <PublisherInfo publisher={asset.publisher} />
          </div>
        )}

        {/* Data Freshness (Enhanced) */}
        {showEnhancedInfo && (asset.issued || asset.modified) && (
          <div className="mb-2">
            <DataFreshness issued={asset.issued} modified={asset.modified} />
          </div>
        )}

        {/* Tags Row */}
        <div className="flex gap-2 flex-wrap mb-2">
          {category && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${category.color}`}>
              {category.label}
            </span>
          )}
          <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs">
            Age: {asset.ageBand}
          </span>
          <span className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded text-xs capitalize">
            {asset.biologicalSex}
          </span>
        </div>

        {/* Clinical Phase */}
        {asset.clinicalPhase && asset.clinicalPhase !== 'N/A' && (
          <div className="mb-2">
            <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs font-medium">
              📋 {asset.clinicalPhase}
            </span>
          </div>
        )}

        {/* EU CTR 536/2014 Fields */}
        {euCtNumber && (
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs font-mono">
              🇪🇺 {euCtNumber}
            </span>
            {sponsor && (
              <span className={`px-2 py-1 rounded text-xs ${
                sponsorTypes[sponsor.type]?.color || 'bg-gray-100 text-gray-700'
              }`}>
                {sponsorTypes[sponsor.type]?.icon} {sponsor.name}
              </span>
            )}
          </div>
        )}

        {/* Distribution Formats (Enhanced) */}
        {showEnhancedInfo && asset.distributions && asset.distributions.length > 0 && (
          <div className="mb-2">
            <DistributionFormats distributions={asset.distributions} />
          </div>
        )}

        {/* MedDRA Version */}
        {asset.meddraVersion && (
          <div className="text-xs text-gray-500 mb-2">
            MedDRA v{asset.meddraVersion}
          </div>
        )}

        {/* Sensitivity Indicator */}
        {asset.sensitiveCategory && asset.sensitiveCategory !== 'none' && (
          <div className="mt-2">
            <SensitivityIndicator level={asset.sensitiveCategory} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogCard;
