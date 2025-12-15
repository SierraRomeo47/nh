import React, { useState, useEffect } from 'react';
import { RFQ, Bid, BidStatus, CharterType, CargoType } from '../types/charter';
import Chat from '../components/Chat';
import FloatingChatPanel from '../components/FloatingChatPanel';
import { useUser } from '../contexts/UserContext';

const CharterMarket: React.FC = () => {
  const { user } = useUser();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showNewRfqModal, setShowNewRfqModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'AWARDED'>('ALL');
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [selectedChatRfq, setSelectedChatRfq] = useState<RFQ | null>(null);

  useEffect(() => {
    loadRfqs();
  }, []);

  const loadRfqs = () => {
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
          dischargePortCode: 'SGSIN',
          alternativeDischarge: ['Port Klang', 'Hong Kong']
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
        bids: [
          {
            id: 'bid-1',
            bidNumber: 'BID-2024-001-A',
            rfqId: '1',
            brokerId: 'broker-456',
            brokerName: 'John Smith',
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
            estimate: {} as any, // Would contain full voyage estimate
            messages: []
          }
        ]
      }
    ];
    setRfqs(mockRfqs);
  };

  const handleAcceptBid = (bid: Bid) => {
    // Open chat to finalize details
    setSelectedBid(bid);
    setShowChat(true);
  };

  const handleRejectBid = (bidId: string) => {
    if (confirm('Are you sure you want to reject this bid?')) {
      console.log('Rejecting bid:', bidId);
      // API call to reject bid
    }
  };

  const handleCounterOffer = (bid: Bid) => {
    setSelectedBid(bid);
    setShowChat(true);
  };

  const filteredRfqs = filter === 'ALL' ? rfqs : rfqs.filter(rfq => rfq.status === filter);

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Charter Market
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Manage your charter RFQs and receive bids from brokers
          </p>
        </div>
        <button
          onClick={() => setShowNewRfqModal(true)}
          style={{
            padding: '12px 24px',
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
          <span>📝</span>
          <span>Create New RFQ</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
        {(['ALL', 'OPEN', 'CLOSED', 'AWARDED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: filter === tab ? '#FF6A00' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: filter === tab ? '3px solid #FF6A00' : '3px solid transparent',
              fontWeight: filter === tab ? '600' : '500',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '-2px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* RFQ List */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRfqs.map(rfq => (
          <div
            key={rfq.id}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setSelectedRfq(selectedRfq?.id === rfq.id ? null : rfq)}
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
                    backgroundColor: rfq.status === 'OPEN' ? '#10B981' : rfq.status === 'AWARDED' ? '#3B82F6' : '#6B7280',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {rfq.status}
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: '#FF6A00',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {rfq.bids.length} BIDS
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                  Created: {rfq.createdAt.toLocaleDateString()} • Expires: {rfq.expiresAt.toLocaleDateString()}
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

            {/* Expanded Details - Bids */}
            {selectedRfq?.id === rfq.id && rfq.bids.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Received Bids ({rfq.bids.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rfq.bids.map(bid => (
                    <div
                      key={bid.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: '#10B981' }}>
                            ${bid.offer.freightRate} {bid.offer.freightBasis}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: bid.status === BidStatus.PENDING ? '#FCD34D' : '#10B981',
                            color: bid.status === BidStatus.PENDING ? '#92400E' : 'white',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {bid.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          🚢 <strong>{bid.vessel.name}</strong> • {bid.vessel.dwt.toLocaleString()} DWT • Built {bid.vessel.built}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          Broker: {bid.brokerName} ({bid.brokerCompany}) • Submitted: {bid.submittedAt.toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleCounterOffer(bid)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          💬 Counter
                        </button>
                        <button
                          onClick={() => handleAcceptBid(bid)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleRejectBid(bid.id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Modal */}
      {showChat && selectedBid && (
        <Chat
          bid={selectedBid}
          userRole="CHARTERER"
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
          currentUserRole="CHARTERER"
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
            backgroundColor: '#FF6A00',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 106, 0, 0.4)',
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

export default CharterMarket;

