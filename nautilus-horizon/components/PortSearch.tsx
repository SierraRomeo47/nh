import React, { useState, useEffect, useRef } from 'react';
import { searchPorts, Port } from '../services/portService';

interface PortSearchProps {
  label: string;
  value: string;
  onChange: (portName: string, port?: Port) => void;
  placeholder?: string;
}

const PortSearch: React.FC<PortSearchProps> = ({ label, value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [results, setResults] = useState<Port[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync searchTerm with value prop when it changes from parent
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for ports when user types
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsLoading(true);
        try {
          const ports = await searchPorts(searchTerm, 10);
          setResults(ports);
          setIsOpen(ports.length > 0);
        } catch (error) {
          console.error('Port search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (port: Port) => {
    const displayValue = `${port.name} (${port.unlocode})`;
    setSearchTerm(displayValue);
    onChange(port.name, port);
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    // If user clears the input or types manually, just update with the raw value
    if (!value || value.length < 2) {
      onChange(value);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="w-full p-3 bg-background border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none pr-10"
          placeholder={placeholder || 'Search ports...'}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-subtle rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {results.map((port) => (
              <button
                key={port.unlocode}
                onClick={() => handleSelect(port)}
                className="w-full text-left px-4 py-3 hover:bg-subtle transition-colors border-b border-subtle last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-text-primary">
                      {port.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {port.unlocode} • {port.country_code}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {parseFloat(port.latitude).toFixed(2)}°, {parseFloat(port.longitude).toFixed(2)}°
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {isOpen && !isLoading && searchTerm.length >= 2 && results.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-subtle rounded-lg shadow-lg p-4 text-center text-gray-400">
            No ports found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default PortSearch;

