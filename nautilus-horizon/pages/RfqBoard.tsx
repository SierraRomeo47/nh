import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/Card';
import PoolingRfqBoard from '../components/PoolingRfqBoard';
import { PoolRFQ, PoolOffer, RfqStatus, OfferStatus, FuelEUCompliancePosition } from '../types/index';
import { mockRFQs, createPoolRFQ, acceptPoolOffer } from '../services/mockApi';
import { InformationCircleIcon } from '../components/common/Icons';

const getStatusChipClass = (status: RfqStatus | OfferStatus) => {
  switch (status) {
    case RfqStatus.OPEN:
    case OfferStatus.PENDING:
      return 'bg-blue-500/20 text-blue-300';
    case RfqStatus.FILLED:
    case OfferStatus.ACCEPTED:
      return 'bg-green-500/20 text-green-300';
    case RfqStatus.CLOSED:
    case OfferStatus.DECLINED:
      return 'bg-red-500/20 text-red-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

type BankingModalMode = 'bank' | 'useBank' | 'borrow';

const BankingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    mode: BankingModalMode;
    position: FuelEUCompliancePosition;
    onCommit: (amount: number, mode: BankingModalMode) => void;
}> = ({ isOpen, onClose, mode, position, onCommit }) => {
    const [amount, setAmount] = useState(0);

    const config = useMemo(() => {
        const { currentYearNetBalanceGco2e, bankedSurplusGco2e, borrowedDeficitGco2e, borrowingLimitGco2e } = position;
        const remainingDeficit = Math.abs(currentYearNetBalanceGco2e);
        const availableToBorrow = borrowingLimitGco2e - borrowedDeficitGco2e;

        switch (mode) {
            case 'bank':
                return {
                    title: 'Bank Surplus',
                    description: 'Transfer your current year surplus to the bank for future compliance periods.',
                    maxAmount: currentYearNetBalanceGco2e,
                    buttonText: 'Bank Amount',
                };
            case 'useBank':
                return {
                    title: 'Use Banked Surplus',
                    description: 'Use your banked surplus to cover the current compliance deficit.',
                    maxAmount: Math.min(remainingDeficit, bankedSurplusGco2e),
                    buttonText: 'Use from Bank',
                };
            case 'borrow':
                return {
                    title: 'Borrow from Future Allowance',
                    description: 'Borrow against your next year\'s allowance to cover the current deficit.',
                    maxAmount: Math.min(remainingDeficit, availableToBorrow),
                    buttonText: 'Borrow Amount',
                };
            default:
                return { title: '', description: '', maxAmount: 0, buttonText: '' };
        }
    }, [mode, position]);

    React.useEffect(() => {
        setAmount(0); // Reset amount when modal opens or mode changes
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const handleCommit = () => {
        if (amount > 0 && amount <= config.maxAmount) {
            onCommit(amount, mode);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-soft shadow-lg w-full max-w-lg p-6 animate-fade-in-up">
                <h2 className="text-xl font-bold mb-2">{config.title}</h2>
                <p className="text-sm text-gray-400 mb-4">{config.description}</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-gray-400">
                            <span>Amount (gCO₂e)</span>
                            <span className="font-semibold text-gray-300">Max: {config.maxAmount.toLocaleString()}</span>
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                            max={config.maxAmount}
                            className="w-full bg-subtle rounded p-2 mt-1 text-white border border-transparent focus:border-primary focus:ring-0 text-lg"
                        />
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={config.maxAmount}
                        step={1000}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full h-2 bg-subtle rounded-lg appearance-none cursor-pointer range-lg accent-primary"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={onClose} className="bg-subtle hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button
                        onClick={handleCommit}
                        disabled={amount <= 0 || amount > config.maxAmount}
                        className="bg-primary hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {config.buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ComplianceBalanceCard: React.FC<{
    position: FuelEUCompliancePosition;
    onOpenModal: (mode: BankingModalMode) => void;
}> = ({ position, onOpenModal }) => {
    const { currentYearNetBalanceGco2e, bankedSurplusGco2e, borrowedDeficitGco2e, borrowingLimitGco2e } = position;
    const finalPosition = currentYearNetBalanceGco2e + bankedSurplusGco2e - borrowedDeficitGco2e;

    const canBank = currentYearNetBalanceGco2e > 0;
    const canUseBank = currentYearNetBalanceGco2e < 0 && bankedSurplusGco2e > 0;
    const canBorrow = currentYearNetBalanceGco2e < 0 && (borrowingLimitGco2e - borrowedDeficitGco2e > 0);

    const Metric: React.FC<{ label: string; value: number; color?: string; helpText?: string }> = ({ label, value, color, helpText }) => (
        <div className="flex flex-col items-center justify-center p-3 bg-subtle/50 rounded-lg">
            <div className="flex items-center">
                <span className="text-sm text-gray-400">{label}</span>
                {helpText && <InformationCircleIcon className="w-4 h-4 ml-1 text-gray-500" title={helpText} />}
            </div>
            <span className={`text-xl font-bold ${color || 'text-white'}`}>{value.toLocaleString()}</span>
        </div>
    );

    return (
        <Card>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 bg-subtle rounded-lg">
                     <span className="text-md font-semibold text-gray-300">Final Compliance Position</span>
                     <span className={`text-3xl font-bold ${finalPosition >= 0 ? 'text-green-400' : 'text-accent-a'}`}>
                        {finalPosition.toLocaleString()}
                     </span>
                </div>
                <Metric label="Yearly Net Balance" value={currentYearNetBalanceGco2e} color={currentYearNetBalanceGco2e >= 0 ? 'text-green-400' : 'text-accent-a'} helpText="Net balance from all voyages this year." />
                <Metric label="Banked Surplus" value={bankedSurplusGco2e} color="text-blue-400" helpText="Surplus saved from previous years." />
                <Metric label="Borrowed Deficit" value={borrowedDeficitGco2e} color={borrowedDeficitGco2e > 0 ? 'text-yellow-400' : 'text-white'} helpText="Amount borrowed from next year's allowance." />
            </div>
             <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button onClick={() => onOpenModal('useBank')} disabled={!canUseBank} className="bg-blue-600/80 hover:bg-blue-700/80 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition">Use Banked Surplus</button>
                <button onClick={() => onOpenModal('bank')} disabled={!canBank} className="bg-green-600/80 hover:bg-green-700/80 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition">Bank Surplus</button>
                <button onClick={() => onOpenModal('borrow')} disabled={!canBorrow} className="bg-yellow-600/80 hover:bg-yellow-700/80 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition">Borrow</button>
            </div>
        </Card>
    );
};


const CreateRfqModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (rfqData: Omit<PoolRFQ, 'id' | 'orgId' | 'status' | 'offers'>) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [type, setType] = useState<'need' | 'surplus'>('need');
    const [amount, setAmount] = useState(1000);
    const [year, setYear] = useState(new Date().getFullYear() + 1);
    const [priceMin, setPriceMin] = useState(0.0010);
    const [priceMax, setPriceMax] = useState(0.0020);
    const [counterparties, setCounterparties] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            year,
            needGco2e: type === 'need' ? amount : -amount,
            notes,
            priceRange: { min: priceMin, max: priceMax },
            preferredCounterpartyTypes: counterparties.split(',').map(s => s.trim()).filter(Boolean),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-soft shadow-lg w-full max-w-lg p-6 animate-fade-in-up">
                <h2 className="text-xl font-bold mb-4">Create New RFQ</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Requirement</label>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setType('need')} className={`w-full py-2 rounded ${type === 'need' ? 'bg-primary text-white' : 'bg-subtle'}`}>Need</button>
                            <button type="button" onClick={() => setType('surplus')} className={`w-full py-2 rounded ${type === 'surplus' ? 'bg-primary text-white' : 'bg-subtle'}`}>Surplus</button>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Amount (gCO₂e)</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-subtle rounded p-2 mt-1 text-white border border-transparent focus:border-primary focus:ring-0" />
                        </div>
                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-400">Compliance Year</label>
                            <input type="number" id="year" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-subtle rounded p-2 mt-1 text-white border border-transparent focus:border-primary focus:ring-0" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="priceMin" className="block text-sm font-medium text-gray-400">Min Price (€/g)</label>
                            <input type="number" step="0.0001" id="priceMin" value={priceMin} onChange={e => setPriceMin(Number(e.target.value))} className="w-full bg-subtle rounded p-2 mt-1 text-white border border-transparent focus:border-primary focus:ring-0" />
                        </div>
                        <div>
                            <label htmlFor="priceMax" className="block text-sm font-medium text-gray-400">Max Price (€/g)</label>
                            <input type="number" step="0.0001" id="priceMax" value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="w-full bg-subtle rounded p-2 mt-1 text-white border border-transparent focus:border-primary focus:ring-0" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="counterparties" className="block text-sm font-medium text-gray-400">Preferred Counterparties (comma-separated)</label>
                        <input type="text" id="counterparties" value={counterparties} onChange={e => setCounterparties(e.target.value)} placeholder="e.g. Tanker Pool, Bulker Operator" className="w-full bg-subtle rounded p-2 mt-1 text-white border border-transparent focus:border-primary focus:ring-0" />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-400">Notes</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-subtle rounded p-2 mt-1 text-white border border-transparent focus:border-primary focus:ring-0"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-subtle hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg">Create RFQ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const OfferCard: React.FC<{ offer: PoolOffer; onAccept: () => void; onDecline: () => void; rfqIsOpen: boolean; }> = ({ offer, onAccept, onDecline, rfqIsOpen }) => (
    <div className="bg-subtle p-3 rounded-lg flex justify-between items-center">
        <div>
            <p className="font-semibold">{offer.counterparty}</p>
            <p className="text-sm text-gray-400">
                {offer.offeredGco2e.toLocaleString()} gCO₂e @ €{offer.priceEurPerGco2e.toFixed(4)}/g
            </p>
        </div>
        <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(offer.status)}`}>
                {offer.status}
            </span>
            {offer.status === OfferStatus.PENDING && (
                <>
                    <button 
                      onClick={onAccept} 
                      disabled={!rfqIsOpen}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                      Accept
                    </button>
                    <button 
                      onClick={onDecline} 
                      disabled={!rfqIsOpen}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                      Decline
                    </button>
                </>
            )}
        </div>
    </div>
);

const RfqCard: React.FC<{
    rfq: PoolRFQ;
    onAcceptOffer: (offerId: string) => void;
    onDeclineOffer: (offerId: string) => void;
}> = ({ rfq, onAcceptOffer, onDeclineOffer }) => (
    <Card className="w-full flex flex-col">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold">
                    {rfq.needGco2e > 0 ? 'Need' : 'Surplus'}: {Math.abs(rfq.needGco2e).toLocaleString()} gCO₂e
                </h3>
                <p className="text-sm text-gray-400">For Compliance Year {rfq.year}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChipClass(rfq.status)}`}>
                {rfq.status}
            </span>
        </div>

        <div className="my-3 text-xs space-y-1 text-gray-500">
            {rfq.priceRange && (
                <p>Price Range: <span className="font-mono text-gray-400">€{rfq.priceRange.min.toFixed(4)} - €{rfq.priceRange.max.toFixed(4)}</span></p>
            )}
            {rfq.preferredCounterpartyTypes && rfq.preferredCounterpartyTypes.length > 0 && (
                <p>Prefers: <span className="text-gray-400">{rfq.preferredCounterpartyTypes.join(', ')}</span></p>
            )}
        </div>
        
        <p className="text-sm my-4 text-gray-300 flex-grow">{rfq.notes}</p>
        
        <div className="space-y-3 mt-auto">
            <h4 className="font-semibold text-gray-200 border-t border-subtle pt-3">Offers ({rfq.offers.length})</h4>
            {rfq.offers.length > 0 ? (
                rfq.offers.map(offer => (
                    <OfferCard
                        key={offer.id}
                        offer={offer}
                        onAccept={() => onAcceptOffer(offer.id)}
                        onDecline={() => onDeclineOffer(offer.id)}
                        rfqIsOpen={rfq.status === RfqStatus.OPEN}
                    />
                ))
            ) : (
                <p className="text-sm text-gray-500 italic">No offers received yet.</p>
            )}
        </div>
    </Card>
);

const RfqBoard: React.FC = () => {
  const [rfqs, setRfqs] = useState<PoolRFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [compliancePosition, setCompliancePosition] = useState<FuelEUCompliancePosition>({
    currentYearNetBalanceGco2e: -5200000,
    bankedSurplusGco2e: 1100000,
    borrowedDeficitGco2e: 0,
    borrowingLimitGco2e: 2000000
  });
  const [isBankingModalOpen, setIsBankingModalOpen] = useState(false);
  const [bankingModalMode, setBankingModalMode] = useState<BankingModalMode>('bank');

  useEffect(() => {
    // Load initial RFQ data
    setRfqs(mockRFQs);
    setLoading(false);
  }, []);

  
  const handleCreateRfq = async (rfqData: Omit<PoolRFQ, 'id' | 'offers'>) => {
    try {
      const newRfq = await createPoolRFQ(rfqData);
      setRfqs(prevRfqs => [newRfq, ...prevRfqs]);
    } catch (error) {
      console.error('Failed to create RFQ:', error);
    }
  };

  const handleAcceptOffer = async (rfqId: string, offerId: string) => {
    try {
      await acceptPoolOffer(rfqId, offerId);
      
      // Update local state
      setRfqs(currentRfqs => {
        const rfqToUpdate = currentRfqs.find(r => r.id === rfqId);
        
        if (!rfqToUpdate || rfqToUpdate.status !== RfqStatus.OPEN) {
          return currentRfqs;
        }

        let acceptedOfferAmount = 0;
        const acceptedOffer = rfqToUpdate.offers.find(o => o.id === offerId);
        if (acceptedOffer) {
          acceptedOfferAmount = rfqToUpdate.needGco2e > 0 ? acceptedOffer.offeredGco2e : -acceptedOffer.offeredGco2e;
        }

        const updatedOffers = rfqToUpdate.offers.map(offer => {
          if (offer.id === offerId) return { ...offer, status: OfferStatus.ACCEPTED };
          if (offer.status === OfferStatus.PENDING) return { ...offer, status: OfferStatus.DECLINED };
          return offer;
        });

        const updatedRfq = { ...rfqToUpdate, status: RfqStatus.FILLED, offers: updatedOffers };
        
        // Update compliance position after trade
        if (acceptedOfferAmount !== 0) {
          setCompliancePosition(prev => ({
            ...prev,
            currentYearNetBalanceGco2e: prev.currentYearNetBalanceGco2e + acceptedOfferAmount
          }));
        }

        return currentRfqs.map(r => r.id === rfqId ? updatedRfq : r);
      });
    } catch (error) {
      console.error('Failed to accept offer:', error);
    }
  };
  
  const handleDeclineOffer = (rfqId: string, offerId: string) => {
      setRfqs(currentRfqs => currentRfqs.map(rfq => {
          if (rfq.id === rfqId && rfq.status === RfqStatus.OPEN) {
              const updatedOffers = rfq.offers.map(offer => {
                  if (offer.id === offerId) return { ...offer, status: OfferStatus.DECLINED };
                  return offer;
              });
              return { ...rfq, offers: updatedOffers };
          }
          return rfq;
      }));
  };
  
  const handleOpenBankingModal = (mode: BankingModalMode) => {
    setBankingModalMode(mode);
    setIsBankingModalOpen(true);
  };

  const handleCommitTransaction = (amount: number, mode: BankingModalMode) => {
    setCompliancePosition(prev => {
        switch (mode) {
            case 'bank':
                return {
                    ...prev,
                    currentYearNetBalanceGco2e: prev.currentYearNetBalanceGco2e - amount,
                    bankedSurplusGco2e: prev.bankedSurplusGco2e + amount,
                };
            case 'useBank':
                return {
                    ...prev,
                    currentYearNetBalanceGco2e: prev.currentYearNetBalanceGco2e + amount,
                    bankedSurplusGco2e: prev.bankedSurplusGco2e - amount,
                };
            case 'borrow':
                 return {
                    ...prev,
                    currentYearNetBalanceGco2e: prev.currentYearNetBalanceGco2e + amount,
                    borrowedDeficitGco2e: prev.borrowedDeficitGco2e + amount,
                };
            default:
                return prev;
        }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ComplianceBalanceCard position={compliancePosition} onOpenModal={handleOpenBankingModal} />
      
      <PoolingRfqBoard 
        rfqs={rfqs}
        onCreateRfq={handleCreateRfq}
        onAcceptOffer={handleAcceptOffer}
        onDeclineOffer={handleDeclineOffer}
      />
      
      <BankingModal
        isOpen={isBankingModalOpen}
        onClose={() => setIsBankingModalOpen(false)}
        mode={bankingModalMode}
        position={compliancePosition}
        onCommit={handleCommitTransaction}
      />
    </div>
  );
};

export default RfqBoard;