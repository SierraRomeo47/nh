// Sync Configuration Modal - Configure automated sync schedule
import React, { useState } from 'react';
import { configureSyncSchedule } from '../../services/ovdService';
import { OVDSyncConfig } from '../../types/ovd';

interface SyncConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (config: OVDSyncConfig) => void;
}

const SyncConfigModal: React.FC<SyncConfigModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [configName, setConfigName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [syncDirection, setSyncDirection] = useState<'IMPORT_ONLY' | 'EXPORT_ONLY' | 'BIDIRECTIONAL'>('EXPORT_ONLY');
  const [scheduleFrequency, setScheduleFrequency] = useState<'HOURLY' | 'DAILY' | 'WEEKLY'>('DAILY');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notifyOnError, setNotifyOnError] = useState(true);
  const [notifyOnSuccess, setNotifyOnSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleSave = async () => {
    if (!configName.trim()) {
      setError('Configuration name is required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const config = await configureSyncSchedule({
        configName,
        enabled,
        syncDirection,
        scheduleFrequency,
        notificationEmails: notificationEmail ? [notificationEmail] : [],
        notifyOnError,
        notifyOnSuccess,
        autoApprove: false
      } as Partial<OVDSyncConfig>);
      
      if (onSuccess) {
        onSuccess(config);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border border-subtle rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">Configure Automated Sync</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Form */}
          <div className="space-y-4">
            {/* Configuration Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Configuration Name *
              </label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="e.g., Daily OVD Export"
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Enabled Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary border-subtle rounded"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-text-primary">
                Enable automatic sync immediately
              </label>
            </div>
            
            {/* Sync Direction */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Sync Direction *
              </label>
              <select
                value={syncDirection}
                onChange={(e) => setSyncDirection(e.target.value as any)}
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="EXPORT_ONLY">Export Only</option>
                <option value="IMPORT_ONLY">Import Only</option>
                <option value="BIDIRECTIONAL">Bidirectional</option>
              </select>
            </div>
            
            {/* Schedule Frequency */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Schedule Frequency *
              </label>
              <select
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value as any)}
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily (2 AM)</option>
                <option value="WEEKLY">Weekly (Sunday 2 AM)</option>
              </select>
            </div>
            
            {/* Notification Email */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Notification Email
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            {/* Notification Settings */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notifyOnError"
                  checked={notifyOnError}
                  onChange={(e) => setNotifyOnError(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary border-subtle rounded"
                />
                <label htmlFor="notifyOnError" className="text-sm text-text-primary">
                  Notify on sync errors
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notifyOnSuccess"
                  checked={notifyOnSuccess}
                  onChange={(e) => setNotifyOnSuccess(e.target.checked)}
                  className="w-4 h-4 text-primary focus:ring-primary border-subtle rounded"
                />
                <label htmlFor="notifyOnSuccess" className="text-sm text-text-primary">
                  Notify on successful sync
                </label>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-error/10 border border-error rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-subtle rounded-lg text-text-primary hover:bg-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSaving
                  ? 'bg-subtle text-text-muted cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncConfigModal;

