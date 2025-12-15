import React, { useState, useEffect } from 'react';
import { RFQ, Bid, BidStatus, CharterType, CargoType, VoyageEstimate } from '../types/charter';
import Chat from '../components/Chat';
import VoyageEstimator from '../components/VoyageEstimator';
import FloatingChatPanel from '../components/FloatingChatPanel';
import { useUser } from '../contexts/UserContext';

const BrokerDesk: React.FC = () => {
  const { user } = useUser();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showBidForm, setShowBidForm] = useState(false);
  const [showVoyageEstimator, setShowVoyageEstimator] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [tab, setTab] = useState<'MARKET' | 'MY_BIDS'>('MARKET');
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [selectedChatRfq, setSelectedChatRfq] = useState<RFQ | null>(null);

  useEffect(() => {
    loadMarketRfqs();
    loadMyBids();
  }, []);

  const loadMarketRfqs = () => {
    // Mock data - Replace with actual API call
    const mockRfqs: RFQ[] = [
      {
        id: '1',
        rfqNumber: 'RFQ-2024-001',
        charterer: 'Nautilus Shipping Co.',
        chartererId: 'user-123',
        createdAt: new Date('2024-01-15'),
        expiresAt: new Date('2024-02-01'),
        status: 'OPEN',
        charterType: CharterType.VOYAGE,
        cargo: {
          type: CargoType.DRY_BULK,
          quantity: 50000,
          tolerance: 10
        },
        laycan: {
          start: new Date('2024-02-10'),
          end: new Date('2024-02-20')
        },
        route: {
          loadPort: 'Rotterdam',
          loadPortCode: 'NLRTM',
          dischargePort: 'Singapore',
          dischargePortCode: 'SGSIN'
        },
        vesselRequirements: {
          minDwt: 45000,
          maxDwt: 55000,
          maxAge: 15,
          flags: ['NL', 'SG', 'MT', 'CY']
        },
        terms: {
          freightBasis: 'PER_TON',
          loadTerms: 'FILO',
          paymentTerms: 'Net 30 days',
          demurrage: 15000,
          despatch: 7500
        },
        bids: []
      },
      {
        id: '2',
        rfqNumber: 'RFQ-2024-002',
        charterer: 'Global Logistics Inc.',
        chartererId: 'user-456',
        createdAt: new Date('2024-01-18'),
        expiresAt: new Date('2024-02-05'),
        status: 'OPEN',
        charterType: CharterType.VOYAGE,
        cargo: {
          type: CargoType.CONTAINERS,
          quantity: 35000,
        },
        laycan: {
          start: new Date('2024-02-15'),
          end: new Date('2024-02-25')
        },
        route: {
          loadPort: 'Hamburg',
          loadPortCode: 'DEHAM',
          dischargePort: 'Shanghai',
          dischargePortCode: 'CNSGH'
        },
        vesselRequirements: {
          minDwt: 30000,
          maxDwt: 40000,
          maxAge: 12
        },
        terms: {
          freightBasis: 'LUMPSUM',
          loadTerms: 'FIO',
          paymentTerms: 'Net 30 days',
          demurrage: 12000,
          despatch: 6000
        },
        bids: []
      }
    ];
    setRfqs(mockRfqs);
  };

  const loadMyBids = () => {
    // Mock bids
    const mockBids: Bid[] = [
      {
        id: 'bid-1',
        bidNumber: 'BID-2024-001-A',
        rfqId: '1',
        brokerId: 'current-broker',
        brokerName: 'Current User',
        brokerCompany: 'Maritime Brokers Ltd',
        submittedAt: new Date('2024-01-16'),
        status: BidStatus.PENDING,
        vessel: {
          name: 'Aurora Spirit',
          imo: '9876543',
          flag: 'MT',
          built: 2015,
          dwt: 52000,
          loa: 189.5,
          beam: 32.26,
          draft: 12.2,
          grt: 29450,
          currentPosition: 'Rotterdam',
          eta: new Date('2024-02-08')
        },
        offer: {
          freightRate: 35.50,
          freightBasis: 'USD/MT',
          totalFreight: 1775000,
          demurrage: 15000,
          despatch: 7500,
          laytime: '72 hours loading, 48 hours discharge',
          validity: new Date('2024-01-25')
        },
        estimate: {} as any,
        messages: []
      }
    ];
    setMyBids(mockBids);
  };

  const handleSubmitBid = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setShowVoyageEstimator(true);
  };

  const handleBidComplete = (estimate: VoyageEstimate) => {
    console.log('Bid submitted with estimate:', estimate);
    setShowVoyageEstimator(false);
    setShowBidForm(false);
    setSelectedRfq(null);
    loadMyBids(); // Reload bids
  };

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
          Broker Desk
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          View charter opportunities and submit competitive bids
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
        {(['MARKET', 'MY_BIDS'] as const).map(tabName => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: tab === tabName ? '#FF6A00' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: tab === tabName ? '3px solid #FF6A00' : '3px solid transparent',
              fontWeight: tab === tabName ? '600' : '500',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '-2px'
            }}
          >
            {tabName === 'MARKET' ? 'Charter Market' : `My Bids (${myBids.length})`}
          </button>
        ))}
      </div>

      {/* Market Tab */}
      {tab === 'MARKET' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rfqs.map(rfq => (
            <div
              key={rfq.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                transition: 'all 0.2s ease'
              }}
            >
              {/* RFQ Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                      {rfq.rfqNumber}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: '#10B981',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      OPEN
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                    Charterer: {rfq.charterer} • Expires: {rfq.expiresAt.toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {rfq.cargo.quantity.toLocaleString()} MT
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {rfq.cargo.type.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>LOAD PORT</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {rfq.route.loadPort} ({rfq.route.loadPortCode})
                  </div>
                </div>
                <div style={{ fontSize: '24px', color: '#FF6A00' }}>→</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>DISCHARGE PORT</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {rfq.route.dischargePort} ({rfq.route.dischargePortCode})
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>LAYCAN</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {rfq.laycan.start.toLocaleDateString()} - {rfq.laycan.end.toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Vessel Requirements */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>DWT Range: </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    {rfq.vesselRequirements.minDwt.toLocaleString()} - {rfq.vesselRequirements.maxDwt.toLocaleString()} MT
                  </span>
                </div>
                {rfq.vesselRequirements.maxAge && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Max Age: </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      {rfq.vesselRequirements.maxAge} years
                    </span>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Freight: </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    {rfq.terms.freightBasis}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#FF6A00',
                    border: '2px solid #FF6A00',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📊 View Details
                </button>
                <button
                  onClick={() => handleSubmitBid(rfq)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#FF6A00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⚡</span>
                  <span>Submit Bid</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Bids Tab */}
      {tab === 'MY_BIDS' && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myBids.map(bid => (
            <div
              key={bid.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                      {bid.bidNumber}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: bid.status === BidStatus.PENDING ? '#FCD34D' : bid.status === BidStatus.ACCEPTED ? '#10B981' : '#EF4444',
                      color: bid.status === BidStatus.PENDING ? '#92400E' : 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {bid.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                    Submitted: {bid.submittedAt.toLocaleDateString()} • Valid until: {bid.offer.validity.toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                    ${bid.offer.freightRate} {bid.offer.freightBasis}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Total: ${bid.offer.totalFreight?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Vessel Info */}
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  🚢 {bid.vessel.name}
                </div>
                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <span>{bid.vessel.dwt.toLocaleString()} DWT</span>
                  <span>Built {bid.vessel.built}</span>
                  <span>Flag: {bid.vessel.flag}</span>
                  <span>IMO: {bid.vessel.imo}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSelectedBid(bid);
                    setShowChat(true);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>💬</span>
                  <span>Open Chat</span>
                </button>
                {bid.status === BidStatus.PENDING && (
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Withdraw Bid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voyage Estimator Modal */}
      {showVoyageEstimator && selectedRfq && (
        <VoyageEstimator
          rfq={selectedRfq}
          onComplete={handleBidComplete}
          onClose={() => {
            setShowVoyageEstimator(false);
            setSelectedRfq(null);
          }}
        />
      )}

      {/* Chat Modal */}
      {showChat && selectedBid && (
        <Chat
          bid={selectedBid}
          userRole="BROKER"
          onClose={() => {
            setShowChat(false);
            setSelectedBid(null);
          }}
        />
      )}

      {/* Floating Chat Panel */}
      {showFloatingChat && selectedChatRfq && user && (
        <FloatingChatPanel
          rfq={selectedChatRfq}
          currentUserId={user.id}
          currentUserName={`${user.firstName} ${user.lastName}`}
          currentUserRole="BROKER"
          onClose={() => setShowFloatingChat(false)}
          isMinimized={chatMinimized}
          onToggleMinimize={() => setChatMinimized(!chatMinimized)}
        />
      )}

      {/* Floating Chat Button */}
      {!showFloatingChat && (
        <button
          onClick={() => {
            setSelectedChatRfq(rfqs[0]);
            setShowFloatingChat(true);
            setChatMinimized(false);
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default BrokerDesk;

