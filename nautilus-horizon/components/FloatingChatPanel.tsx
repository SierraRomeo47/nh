import React, { useState, useEffect, useRef } from 'react';
import { RFQ, ChatMessage } from '../types/charter';

interface FloatingChatPanelProps {
  rfq: RFQ;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'CHARTERER' | 'BROKER';
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface Participant {
  id: string;
  name: string;
  role: 'CHARTERER' | 'BROKER';
  company: string;
  avatar: string;
  online: boolean;
}

const FloatingChatPanel: React.FC<FloatingChatPanelProps> = ({
  rfq,
  currentUserId,
  currentUserName,
  currentUserRole,
  onClose,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showBidInput, setShowBidInput] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'charterer-1',
      name: 'John Charter',
      role: 'CHARTERER',
      company: 'Nautilus Shipping Co.',
      avatar: 'JC',
      online: true
    },
    {
      id: 'broker-1',
      name: 'Sarah Broker',
      role: 'BROKER',
      company: 'Maritime Brokers Ltd',
      avatar: 'SB',
      online: true
    },
    {
      id: 'broker-2',
      name: 'Mike Smith',
      role: 'BROKER',
      company: 'Ocean Brokers Inc',
      avatar: 'MS',
      online: true
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with some mock messages
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        senderId: 'charterer-1',
        senderName: 'John Charter',
        senderRole: 'CHARTERER',
        message: 'Looking for competitive bids for 50,000 MT DRY BULK from Rotterdam to Singapore',
        timestamp: new Date(Date.now() - 3600000),
        type: 'MESSAGE'
      },
      {
        id: '2',
        senderId: 'broker-1',
        senderName: 'Sarah Broker',
        senderRole: 'BROKER',
        message: 'I can offer $35.50 per MT with the Aurora Spirit. Vessel is ready and available.',
        timestamp: new Date(Date.now() - 3000000),
        type: 'MESSAGE'
      },
      {
        id: '3',
        senderId: 'broker-1',
        senderName: 'Sarah Broker',
        senderRole: 'BROKER',
        message: 'Bid submitted',
        timestamp: new Date(Date.now() - 2900000),
        type: 'BID_SUBMIT',
        bidData: {
          rate: 35.50,
          basis: 'USD/MT'
        }
      }
    ];
    setMessages(initialMessages);
  }, []);

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
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      message: newMessage,
      timestamp: new Date(),
      type: 'MESSAGE'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handlePlaceBid = () => {
    const rate = parseFloat(bidAmount);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    const bidMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      message: `Bid placed: $${rate} ${rfq.terms.freightBasis}`,
      timestamp: new Date(),
      type: 'BID_SUBMIT',
      bidData: {
        rate,
        basis: rfq.terms.freightBasis
      }
    };

    setMessages([...messages, bidMessage]);
    setBidAmount('');
    setShowBidInput(false);
  };

  const getMessageStyle = (senderId: string) => {
    const isOwnMessage = senderId === currentUserId;
    return {
      alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
      backgroundColor: isOwnMessage ? '#FF6A00' : 'var(--bg-card)',
      color: isOwnMessage ? 'white' : 'var(--text-primary)',
      maxWidth: '75%'
    };
  };

  const getParticipantInfo = (senderId: string) => {
    return participants.find(p => p.id === senderId);
  };

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '280px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        cursor: 'pointer'
      }}
      onClick={onToggleMinimize}>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FF6A00',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💬</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
                RFQ Chat
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                {participants.filter(p => p.online).length} online
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {messages.length > 0 && (
              <span style={{ 
                padding: '2px 8px', 
                backgroundColor: '#10B981', 
                borderRadius: '10px', 
                fontSize: '11px',
                fontWeight: '700',
                color: 'white'
              }}>
                {messages.length}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: '#FF6A00',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>
            💬 RFQ Marketplace Chat
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', marginTop: '2px' }}>
            {rfq.rfqNumber} • {participants.filter(p => p.online).length} online
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onToggleMinimize}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            −
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Participants Bar */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto'
      }}>
        {participants.map(participant => (
          <div
            key={participant.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '20px',
              fontSize: '12px',
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: participant.role === 'CHARTERER' ? '#3B82F6' : '#10B981',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              position: 'relative'
            }}>
              {participant.avatar}
              {participant.online && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10B981',
                  border: '2px solid var(--bg-card)',
                  borderRadius: '50%'
                }} />
              )}
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              {participant.name.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg) => {
          const participant = getParticipantInfo(msg.senderId);
          const isOwnMessage = msg.senderId === currentUserId;

          if (msg.type === 'BID_SUBMIT' || msg.type === 'COUNTER_OFFER') {
            return (
              <div key={msg.id} style={{
                padding: '12px',
                backgroundColor: '#FEF3C7',
                border: '1px solid #FCD34D',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
                  {msg.senderName} placed a bid
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#D97706' }}>
                  ${msg.bidData?.rate} {msg.bidData?.basis}
                </div>
                <div style={{ fontSize: '11px', color: '#92400E', marginTop: '4px' }}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: 'column',
              ...getMessageStyle(msg.senderId)
            }}>
              {!isOwnMessage && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginBottom: '4px',
                  fontSize: '11px',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: participant?.role === 'CHARTERER' ? '#3B82F6' : '#10B981',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: '700'
                  }}>
                    {participant?.avatar}
                  </div>
                  <span style={{ fontWeight: '600' }}>{msg.senderName}</span>
                  <span>• {participant?.company}</span>
                </div>
              )}
              <div style={{
                padding: '10px 14px',
                borderRadius: isOwnMessage ? '12px 12px 0 12px' : '12px 12px 12px 0',
                backgroundColor: isOwnMessage ? '#FF6A00' : 'var(--bg-card)',
                color: isOwnMessage ? 'white' : 'var(--text-primary)',
                border: isOwnMessage ? 'none' : '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '14px' }}>{msg.message}</div>
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: 'var(--text-muted)', 
                marginTop: '2px',
                textAlign: isOwnMessage ? 'right' : 'left'
              }}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {currentUserRole === 'BROKER' && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setShowBidInput(!showBidInput)}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: showBidInput ? '#10B981' : '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>💰</span>
            <span>{showBidInput ? 'Cancel Bid' : 'Place Bid'}</span>
          </button>
        </div>
      )}

      {/* Bid Input */}
      {showBidInput && currentUserRole === 'BROKER' && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FEF3C7',
          borderTop: '1px solid #FCD34D',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400E' }}>$</span>
          <input
            type="number"
            step="0.01"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid rate"
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #FCD34D',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#92400E',
              fontWeight: '600'
            }}
          />
          <span style={{ fontSize: '12px', color: '#92400E', fontWeight: '600' }}>
            {rfq.terms.freightBasis}
          </span>
          <button
            onClick={handlePlaceBid}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </div>
      )}

      {/* Message Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '10px 16px',
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
  );
};

export default FloatingChatPanel;

