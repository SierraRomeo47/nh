import React, { useState, useEffect, useRef } from 'react';
import { Bid, ChatMessage, BidStatus } from '../types/charter';

interface ChatProps {
  bid: Bid;
  userRole: 'CHARTERER' | 'BROKER';
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ bid, userRole, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(bid.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [counterOfferRate, setCounterOfferRate] = useState<string>(bid.offer.freightRate.toString());
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: userRole === 'CHARTERER' ? 'charterer-1' : 'broker-1',
      senderName: userRole === 'CHARTERER' ? 'Charterer' : 'Broker',
      senderRole: userRole,
      message: newMessage,
      timestamp: new Date(),
      type: 'MESSAGE'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleCounterOffer = () => {
    const rate = parseFloat(counterOfferRate);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid rate');
      return;
    }

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: userRole === 'CHARTERER' ? 'charterer-1' : 'broker-1',
      senderName: userRole === 'CHARTERER' ? 'Charterer' : 'Broker',
      senderRole: userRole,
      message: `Counter offer: $${rate} ${bid.offer.freightBasis}`,
      timestamp: new Date(),
      type: 'COUNTER_OFFER',
      bidData: {
        rate,
        basis: bid.offer.freightBasis
      }
    };

    setMessages([...messages, message]);
    setShowCounterOffer(false);
    setCounterOfferRate('');
  };

  const handleAcceptBid = () => {
    if (userRole !== 'CHARTERER') return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'charterer-1',
      senderName: 'Charterer',
      senderRole: 'CHARTERER',
      message: 'Bid accepted! Let\'s proceed with the fixture.',
      timestamp: new Date(),
      type: 'BID_ACCEPT',
      bidData: {
        rate: bid.offer.freightRate,
        basis: bid.offer.freightBasis
      }
    };

    setMessages([...messages, message]);
    // Would call API to update bid status
  };

  const handleRejectBid = () => {
    if (userRole !== 'CHARTERER') return;

    if (!confirm('Are you sure you want to reject this bid?')) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'charterer-1',
      senderName: 'Charterer',
      senderRole: 'CHARTERER',
      message: 'Bid rejected. Thank you for your offer.',
      timestamp: new Date(),
      type: 'BID_REJECT'
    };

    setMessages([...messages, message]);
    // Would call API to update bid status
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '800px',
        maxHeight: '80vh',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              💬 Negotiation Chat
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {bid.bidNumber} • {bid.vessel.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            ×
          </button>
        </div>

        {/* Bid Summary */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CURRENT BID</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981', marginTop: '4px' }}>
              ${bid.offer.freightRate} {bid.offer.freightBasis}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TOTAL FREIGHT</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              ${bid.offer.totalFreight?.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{
              padding: '6px 16px',
              backgroundColor: bid.status === BidStatus.PENDING ? '#FCD34D' : bid.status === BidStatus.ACCEPTED ? '#10B981' : '#EF4444',
              color: bid.status === BidStatus.PENDING ? '#92400E' : 'white',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {bid.status}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((msg) => {
            const isOwnMessage = (msg.senderRole === userRole);
            const isSystemMessage = msg.type !== 'MESSAGE';

            if (isSystemMessage) {
              return (
                <div key={msg.id} style={{
                  padding: '12px',
                  backgroundColor: msg.type === 'BID_ACCEPT' ? '#D1FAE5' : msg.type === 'BID_REJECT' ? '#FEE2E2' : '#FEF3C7',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: msg.type === 'BID_ACCEPT' ? '#065F46' : msg.type === 'BID_REJECT' ? '#991B1B' : '#92400E'
                }}>
                  {msg.type === 'COUNTER_OFFER' && '🔄 '}
                  {msg.type === 'BID_ACCEPT' && '✅ '}
                  {msg.type === 'BID_REJECT' && '❌ '}
                  {msg.message}
                </div>
              );
            }

            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  backgroundColor: isOwnMessage ? '#FF6A00' : 'var(--bg-card)',
                  color: isOwnMessage ? 'white' : 'var(--text-primary)',
                  borderRadius: '12px',
                  border: isOwnMessage ? 'none' : '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', opacity: 0.8 }}>
                    {msg.senderName}
                  </div>
                  <div style={{ fontSize: '14px' }}>{msg.message}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {userRole === 'CHARTERER' && bid.status === BidStatus.PENDING && (
          <div style={{
            padding: '16px 24px',
            backgroundColor: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => setShowCounterOffer(!showCounterOffer)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Counter Offer
            </button>
            <button
              onClick={handleAcceptBid}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✅ Accept Bid
            </button>
            <button
              onClick={handleRejectBid}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ❌ Reject
            </button>
          </div>
        )}

        {/* Counter Offer Form */}
        {showCounterOffer && (
          <div style={{
            padding: '16px 24px',
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Counter Rate:</span>
            <input
              type="number"
              step="0.01"
              value={counterOfferRate}
              onChange={(e) => setCounterOfferRate(e.target.value)}
              placeholder="Enter rate"
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{bid.offer.freightBasis}</span>
            <button
              onClick={handleCounterOffer}
              style={{
                padding: '10px 24px',
                backgroundColor: '#FF6A00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Send Counter
            </button>
          </div>
        )}

        {/* Message Input */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: '12px 24px',
              backgroundColor: '#FF6A00',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

