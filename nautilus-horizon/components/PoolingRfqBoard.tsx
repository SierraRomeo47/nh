import React, { useState } from 'react';
import { PoolRFQ, PoolOffer, RfqStatus, OfferStatus } from '../types/index';

interface PoolingRfqBoardProps {
  rfqs: PoolRFQ[];
  onCreateRfq?: (rfq: Omit<PoolRFQ, 'id' | 'offers'>) => void;
  onAcceptOffer?: (rfqId: string, offerId: string) => void;
  onDeclineOffer?: (rfqId: string, offerId: string) => void;
  className?: string;
}

const PoolingRfqBoard: React.FC<PoolingRfqBoardProps> = ({ 
  rfqs, 
  onCreateRfq, 
  onAcceptOffer,
  onDeclineOffer,
  className = ''
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    year: 2025,
    needGco2e: 0,
    notes: '',
    priceRange: { min: 0.040, max: 0.060 }
  });
  
  const getStatusColor = (status: RfqStatus) => {
    switch (status) {
      case RfqStatus.OPEN: return 'bg-green-600 text-white';
      case RfqStatus.FILLED: return 'bg-blue-600 text-white';
      case RfqStatus.CLOSED: return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  
  const getOfferStatusColor = (status: OfferStatus) => {
    switch (status) {
      case OfferStatus.PENDING: return 'text-yellow-400';
      case OfferStatus.ACCEPTED: return 'text-green-400';
      case OfferStatus.DECLINED: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const formatGco2e = (value: number) => {
    return `${(value / 1e6).toFixed(1)}M gCO₂e`;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateRfq) {
      onCreateRfq({
        orgId: '1', // Mock org ID
        year: formData.year,
        needGco2e: formData.needGco2e,
        notes: formData.notes,
        status: RfqStatus.OPEN,
        priceRange: formData.priceRange
      });
    }
    setShowCreateForm(false);
    setFormData({
      year: 2025,
      needGco2e: 0,
      notes: '',
      priceRange: { min: 0.040, max: 0.060 }
    });
  };
  
  return (
    <div className={`bg-card rounded-lg border border-subtle ${className}`}>
      <div className="px-6 py-4 border-b border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">FuelEU Pooling RFQ Board</h3>
            <p className="text-sm text-gray-400 mt-1">
              Request for quotes on FuelEU Maritime compliance units
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors text-sm font-medium"
          >
            Create RFQ
          </button>
        </div>
      </div>
      
      {showCreateForm && (
        <div className="px-6 py-4 border-b border-subtle bg-subtle/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Compliance Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-card border border-subtle rounded-md text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Need (gCO₂e)
                </label>
                <input
                  type="number"
                  value={formData.needGco2e}
                  onChange={(e) => setFormData({ ...formData, needGco2e: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-card border border-subtle rounded-md text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., 5200000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-subtle rounded-md text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Describe your compliance deficit and requirements..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Price (€/gCO₂e)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.priceRange.min}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    priceRange: { ...formData.priceRange, min: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-card border border-subtle rounded-md text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Price (€/gCO₂e)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.priceRange.max}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    priceRange: { ...formData.priceRange, max: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-card border border-subtle rounded-md text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
              >
                Create RFQ
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="divide-y divide-subtle">
        {rfqs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            <div className="text-4xl mb-4">📋</div>
            <p>No active RFQs</p>
            <p className="text-sm mt-1">Create your first RFQ to start pooling</p>
          </div>
        ) : (
          rfqs.map((rfq) => (
            <div key={rfq.id} className="px-6 py-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-white">
                      {rfq.needGco2e > 0 ? 'Seeking' : 'Offering'} {formatGco2e(Math.abs(rfq.needGco2e))}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{rfq.notes}</p>
                  <div className="text-xs text-gray-400">
                    Year: {rfq.year} • 
                    Price Range: €{rfq.priceRange?.min.toFixed(3)} - €{rfq.priceRange?.max.toFixed(3)}/gCO₂e
                  </div>
                </div>
              </div>
              
              {rfq.offers.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-300">Offers ({rfq.offers.length})</h5>
                  {rfq.offers.map((offer) => (
                    <div 
                      key={offer.id}
                      className="bg-subtle/30 rounded-lg p-4 border border-subtle/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium text-white">{offer.counterparty}</span>
                            <span className={`text-sm ${getOfferStatusColor(offer.status)}`}>
                              {offer.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Quantity:</span>
                              <div className="text-white">{formatGco2e(offer.offeredGco2e)}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Price:</span>
                              <div className="text-white">€{offer.priceEurPerGco2e.toFixed(3)}/gCO₂e</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Total:</span>
                              <div className="text-white">
                                €{((offer.offeredGco2e * offer.priceEurPerGco2e) / 1000).toFixed(0)}K
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Valid until: {new Date(offer.validUntilTs).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {offer.status === OfferStatus.PENDING && onAcceptOffer && (
                          <div className="ml-4 flex space-x-2">
                            <button
                              onClick={() => onAcceptOffer(rfq.id, offer.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            {onDeclineOffer && (
                              <button
                                onClick={() => onDeclineOffer(rfq.id, offer.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Decline
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {rfq.offers.length === 0 && rfq.status === RfqStatus.OPEN && (
                <div className="text-sm text-gray-400 italic">
                  No offers yet. Waiting for counterparties...
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="px-6 py-3 bg-subtle/30 text-xs text-gray-400 border-t border-subtle">
        <p>⚠️ One pool per period per ship. Pool must net positive to avoid penalties.</p>
      </div>
    </div>
  );
};

export default PoolingRfqBoard;

