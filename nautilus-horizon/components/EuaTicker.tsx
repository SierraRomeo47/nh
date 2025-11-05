import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface EuaTickerProps {
  className?: string;
  showTrend?: boolean;
  price?: number; // Accept price as prop
  source?: string; // Accept source as prop
}

const EuaTicker: React.FC<EuaTickerProps> = ({ 
  className = '', 
  showTrend = true,
  price: externalPrice,
  source: externalSource
}) => {
  const [price, setPrice] = useState(76.0);
  const [previousPrice, setPreviousPrice] = useState(76.0);
  const [source, setSource] = useState('');
  
  // When price is passed as prop, use it directly
  useEffect(() => {
    if (externalPrice !== undefined && externalPrice !== price) {
      setPreviousPrice(price);
      setPrice(externalPrice);
    }
  }, [externalPrice]);

  useEffect(() => {
    if (externalSource) {
      setSource(externalSource);
    }
  }, [externalSource]);
  
  const priceChange = price - previousPrice;
  const priceChangePct = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  
  const getTrendIcon = () => {
    if (Math.abs(priceChange) < 0.01) return '→';
    return isPositive ? '↗' : '↘';
  };
  
  const getTrendColor = () => {
    if (Math.abs(priceChange) < 0.01) return 'text-gray-400';
    return isPositive ? 'text-green-400' : 'text-red-400';
  };
  
  return (
    <div className={`bg-card rounded-lg px-4 py-3 border border-subtle ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            source.includes('FREE') || source.includes('ALPHAVANTAGE') 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-primary animate-pulse'
          }`}></div>
          <span className="text-sm font-medium text-gray-400">
            EUA Price {source && <span className="text-xs text-gray-500">({source})</span>}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold transition-colors duration-300 text-white">
            €{price.toFixed(2)}
          </span>
          
          {showTrend && Math.abs(priceChange) > 0.01 && (
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
              </span>
              <span className={`text-xs ${getTrendColor()}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}
              </span>
              <span className={`text-xs ${getTrendColor()}`}>
                ({isPositive ? '+' : ''}{priceChangePct.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          /tCO₂
        </div>
      </div>
    </div>
  );
};

export default EuaTicker;

