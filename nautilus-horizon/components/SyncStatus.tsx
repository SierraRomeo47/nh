// Sync Status Component - Display sync operations history
import React, { useState, useEffect } from 'react';
import { getSyncStatus, triggerManualSync } from '../services/ovdService';
import { OVDSyncStatus } from '../types/ovd';

const SyncStatus: React.FC = () => {
  const [syncHistory, setSyncHistory] = useState<OVDSyncStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadSyncStatus();
  }, []);
  
  const loadSyncStatus = async () => {
    try {
      setIsLoading(true);
      const history = await getSyncStatus(10);
      setSyncHistory(history);
    } catch (err: any) {
      setError(err.message || 'Failed to load sync status');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleManualSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      await triggerManualSync('EXPORT');
      await loadSyncStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to trigger sync');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-success';
      case 'FAILED':
        return 'text-error';
      case 'PARTIAL_SUCCESS':
        return 'text-warning';
      case 'IN_PROGRESS':
        return 'text-primary';
      default:
        return 'text-text-secondary';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'PARTIAL_SUCCESS':
        return '⚠️';
      case 'IN_PROGRESS':
        return '⏳';
      default:
        return '❓';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }
  
  const lastSync = syncHistory[0];
  
  return (
    <div className="space-y-4">
      {/* Last Sync Summary */}
      {lastSync && (
        <div className="p-4 bg-card border border-subtle rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text-primary">Last Sync</h3>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                isSyncing
                  ? 'bg-subtle text-text-muted cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              {isSyncing ? 'Syncing...' : '🔄 Manual Sync'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-text-secondary">Status</p>
              <p className={`font-medium flex items-center space-x-1 ${getStatusColor(lastSync.status)}`}>
                <span>{getStatusIcon(lastSync.status)}</span>
                <span>{lastSync.status.replace('_', ' ')}</span>
              </p>
            </div>
            
            <div>
              <p className="text-text-secondary">Type</p>
              <p className="font-medium text-text-primary">{lastSync.syncType}</p>
            </div>
            
            <div>
              <p className="text-text-secondary">Records</p>
              <p className="font-medium text-text-primary">
                {lastSync.recordsImported + lastSync.recordsExported}
              </p>
            </div>
            
            <div>
              <p className="text-text-secondary">Time</p>
              <p className="font-medium text-text-primary">
                {formatDate(lastSync.initiatedAt)}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}
      
      {/* Sync History */}
      <div className="space-y-2">
        <h3 className="font-semibold text-text-primary">Recent Sync Operations</h3>
        
        {syncHistory.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <p>No sync operations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {syncHistory.map((sync) => (
              <div
                key={sync.id}
                className="p-3 bg-card border border-subtle rounded-lg hover:bg-subtle/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">{getStatusIcon(sync.status)}</span>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-text-primary text-sm">
                          {sync.operation}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-subtle rounded text-text-secondary">
                          {sync.syncType}
                        </span>
                      </div>
                      
                      <p className="text-xs text-text-secondary mt-0.5">
                        {formatDate(sync.initiatedAt)}
                        {sync.fileName && ` • ${sync.fileName}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <p className={`font-medium ${getStatusColor(sync.status)}`}>
                      {sync.status.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {sync.recordsImported > 0 && `↓ ${sync.recordsImported}`}
                      {sync.recordsExported > 0 && ` ↑ ${sync.recordsExported}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;

