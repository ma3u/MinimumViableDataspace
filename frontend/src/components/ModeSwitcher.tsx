/**
 * Mode Switcher Component
 * 
 * Displays and allows switching between API modes:
 * - mock: Uses backend-mock directly
 * - hybrid: Uses backend-edc with mock data + EDC metadata
 * - full: Uses backend-edc with complete EDC data flow
 */

import { useState, useEffect } from 'react';
import { Settings, Database, Cloud, Cpu, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { api, getApiMode, type ApiMode } from '../services/apiFactory';

interface ModeInfo {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const modes: Record<ApiMode, ModeInfo> = {
  mock: {
    name: 'Mock',
    description: 'Direct mock data (no EDC)',
    icon: Database,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  hybrid: {
    name: 'Hybrid',
    description: 'EDC catalog + mock data',
    icon: Cloud,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  full: {
    name: 'Full EDC',
    description: 'Complete EDC data flow',
    icon: Cpu,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
};

interface ModeSwitcherProps {
  onModeChange?: (mode: ApiMode) => void;
  showDropdown?: boolean;
}

export function ModeSwitcher({ onModeChange, showDropdown = true }: ModeSwitcherProps) {
  const [currentMode, setCurrentMode] = useState<ApiMode>(getApiMode());
  const [isOpen, setIsOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'healthy' | 'error'>('unknown');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    checkBackend();
  }, [currentMode]);

  const checkBackend = async () => {
    try {
      const health = await api.health();
      setBackendStatus('healthy');
      setStatusMessage(health.status === 'healthy' ? '' : health.status);
    } catch (error) {
      setBackendStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  const handleModeSelect = (mode: ApiMode) => {
    setCurrentMode(mode);
    setIsOpen(false);
    
    // Note: Mode is controlled via VITE_API_MODE env variable
    // This component shows the current mode but cannot change it at runtime
    // In a real app, you'd need to refresh with different env or use a backend-driven mode
    
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  const modeInfo = modes[currentMode];
  const ModeIcon = modeInfo.icon;

  return (
    <div className="relative">
      <button
        onClick={() => showDropdown && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${modeInfo.bgColor} ${modeInfo.color} ${showDropdown ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
      >
        <ModeIcon className="w-4 h-4" />
        <span>{modeInfo.name}</span>
        
        {/* Status indicator */}
        <div className={`w-2 h-2 rounded-full ${
          backendStatus === 'healthy' ? 'bg-green-500' :
          backendStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
        }`} />
        
        {showDropdown && <ChevronDown className="w-3 h-3 ml-1" />}
      </button>

      {/* Dropdown menu */}
      {isOpen && showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Settings className="w-4 h-4" />
                API Mode Configuration
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set via VITE_API_MODE environment variable
              </p>
            </div>
            
            <div className="py-1">
              {(Object.keys(modes) as ApiMode[]).map((mode) => {
                const info = modes[mode];
                const Icon = info.icon;
                const isActive = mode === currentMode;
                
                return (
                  <button
                    key={mode}
                    onClick={() => handleModeSelect(mode)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${info.bgColor}`}>
                      <Icon className={`w-4 h-4 ${info.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{info.name}</span>
                        {isActive && <Check className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Status section */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <div className="flex items-center gap-2">
                {backendStatus === 'healthy' ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-700">Backend connected</span>
                  </>
                ) : backendStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600">{statusMessage}</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    <span className="text-xs text-gray-500">Checking connection...</span>
                  </>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  checkBackend();
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Refresh status
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact mode indicator (no dropdown)
 */
export function ModeIndicator() {
  const currentMode = getApiMode();
  const modeInfo = modes[currentMode];
  const ModeIcon = modeInfo.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${modeInfo.bgColor} ${modeInfo.color}`}>
      <ModeIcon className="w-3 h-3" />
      <span>{modeInfo.name}</span>
    </div>
  );
}
