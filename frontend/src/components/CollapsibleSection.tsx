import { ChevronDown } from 'lucide-react';
import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  className?: string;
}

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  icon,
  className = ''
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between hover:bg-gray-50 px-0 py-0 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-600">{icon}</span>}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};
