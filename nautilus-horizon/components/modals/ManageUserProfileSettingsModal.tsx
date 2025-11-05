import React, { useState, useEffect } from 'react';

interface UserSettings {
  dashboardLayout: 'grid' | 'list' | 'compact';
  columns: number;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  showFinancialData: boolean;
  showComplianceData: boolean;
  showCrewData: boolean;
  showTechnicalData: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    maintenance: boolean;
    compliance: boolean;
    safety: boolean;
  };
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  ship_id: string | null;
  ship_name: string | null;
  position: string;
  is_active: boolean;
  custom_position?: string;
}

interface ManageUserProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUserId?: string;
}

const ManageUserProfileSettingsModal: React.FC<ManageUserProfileSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  selectedUserId 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(selectedUserId || null);
  const [settings, setSettings] = useState<UserSettings>({
    dashboardLayout: 'grid',
    columns: 3,
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    showFinancialData: false,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    notifications: {
      email: true,
      push: true,
      maintenance: true,
      compliance: true,
      safety: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUserId) {
      setEditingUserId(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (editingUserId) {
      loadUserSettings(editingUserId);
    }
  }, [editingUserId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/auth/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const loadUserSettings = async (userId: string) => {
    try {
      setLoading(true);
      // In a real app, this would fetch from the backend
      // For now, we'll try to load from localStorage or use defaults
      const savedSettings = localStorage.getItem(`userSettings_${userId}`);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
        } catch (e) {
          console.error('Failed to parse saved settings', e);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingUserId) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // In a real app, this would save to the backend
      // For now, we'll save to localStorage with user ID prefix
      localStorage.setItem(`userSettings_${editingUserId}`, JSON.stringify(settings));
      
      // Also update in the main userSettings for the current user if it's their settings
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId === editingUserId) {
        localStorage.setItem('userSettings', JSON.stringify(settings));
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationChange = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-subtle rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">Manage User Profile Settings</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-subtle rounded-lg"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-error/20 border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-success/20 border border-success rounded-lg text-success text-sm">
            Settings saved successfully!
          </div>
        )}

        {/* User Selection */}
        <div className="mb-6">
          <label className="block text-text-secondary text-sm mb-2">Select User</label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-subtle rounded-lg p-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setEditingUserId(user.id)}
                className={`w-full p-3 rounded-lg transition-colors text-left ${
                  editingUserId === user.id
                    ? 'bg-primary/20 border border-primary'
                    : 'hover:bg-subtle'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">{user.first_name} {user.last_name}</div>
                    <div className="text-xs text-text-secondary">{user.email} • {user.role}</div>
                  </div>
                  {editingUserId === user.id && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Editor */}
        {editingUserId && (
          <div className="space-y-6">
            {/* Dashboard Customization */}
            <div className="border border-subtle rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Dashboard Customization</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Layout Style</label>
                  <select
                    value={settings.dashboardLayout}
                    onChange={(e) => handleSettingChange('dashboardLayout', e.target.value)}
                    className="w-full p-3 bg-background border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="grid">Grid Layout</option>
                    <option value="list">List Layout</option>
                    <option value="compact">Compact Layout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Columns</label>
                  <select
                    value={settings.columns}
                    onChange={(e) => handleSettingChange('columns', parseInt(e.target.value))}
                    className="w-full p-3 bg-background border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value={1}>1 Column</option>
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                    <option value={4}>4 Columns</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full p-3 bg-background border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>

              {/* Data Visibility */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-text-primary mb-3">Data Visibility</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showFinancialData}
                      onChange={(e) => handleSettingChange('showFinancialData', e.target.checked)}
                      className="rounded border-subtle text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary">Financial Data</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showComplianceData}
                      onChange={(e) => handleSettingChange('showComplianceData', e.target.checked)}
                      className="rounded border-subtle text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary">Compliance Data</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showCrewData}
                      onChange={(e) => handleSettingChange('showCrewData', e.target.checked)}
                      className="rounded border-subtle text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary">Crew Data</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showTechnicalData}
                      onChange={(e) => handleSettingChange('showTechnicalData', e.target.checked)}
                      className="rounded border-subtle text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary">Technical Data</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="border border-subtle rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Regional Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full p-3 bg-background border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full p-3 bg-background border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="GMT">GMT</option>
                    <option value="CET">CET (Central European Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="border border-subtle rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Notifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleNotificationChange(key as keyof UserSettings['notifications'], e.target.checked)}
                      className="rounded border-subtle text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium text-text-primary capitalize">
                        {key === 'push' ? 'Push Notifications' : key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'push' && 'Browser push notifications'}
                        {key === 'maintenance' && 'Equipment maintenance reminders'}
                        {key === 'compliance' && 'Regulatory compliance notifications'}
                        {key === 'safety' && 'Safety-related notifications'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUserProfileSettingsModal;

