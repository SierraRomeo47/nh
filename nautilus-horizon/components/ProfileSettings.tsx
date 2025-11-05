// Profile Settings Component with Customization Options

import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole, WidgetType, Permission } from '../types/user';
import Card from './Card';
import { DashboardConfig, DashboardWidget } from '../types/user';

interface CustomizationSettings {
  dashboardLayout: 'grid' | 'list' | 'compact';
  columns: number;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  showFinancialData: boolean;
  showComplianceData: boolean;
  showCrewData: boolean;
  showTechnicalData: boolean;
  customWidgets: DashboardWidget[];
  notifications: {
    email: boolean;
    push: boolean;
    maintenance: boolean;
    compliance: boolean;
    safety: boolean;
  };
}

const ProfileSettings: React.FC = () => {
  const { user, updatePreferences } = useUser();
  const [settings, setSettings] = useState<CustomizationSettings>({
    dashboardLayout: 'grid',
    columns: 3,
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    showFinancialData: false,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    customWidgets: [],
    notifications: {
      email: true,
      push: true,
      maintenance: true,
      compliance: true,
      safety: true
    }
  });

  const [availableWidgets, setAvailableWidgets] = useState<WidgetType[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      // Load user-specific available widgets based on role and permissions
      loadAvailableWidgets();
      // Load saved settings
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse saved settings', e);
        }
      }
    }
  }, [user]);

  const loadAvailableWidgets = () => {
    if (!user) return;

    const baseWidgets = [
      WidgetType.MY_TASKS,
      WidgetType.CREW_LEAGUE,
      WidgetType.FUEL_CONSUMPTION,
      WidgetType.SAFETY_METRICS
    ];

    const roleSpecificWidgets: Record<UserRole, WidgetType[]> = {
      [UserRole.CREW]: [
        ...baseWidgets,
        WidgetType.PERFORMANCE_METRICS,
        WidgetType.SCHEDULE
      ],
      [UserRole.OFFICER]: [
        ...baseWidgets,
        WidgetType.FLEET_OVERVIEW,
        WidgetType.ACTIVE_VOYAGES,
        WidgetType.NAVIGATION_STATUS,
        WidgetType.MARINE_WEATHER,
        WidgetType.COMPLIANCE_STATUS
      ],
      [UserRole.ENGINEER]: [
        ...baseWidgets,
        WidgetType.ENGINE_STATUS,
        WidgetType.WASTE_HEAT_RECOVERY,
        WidgetType.EMISSIONS_MONITORING,
        WidgetType.EFFICIENCY_METRICS,
        WidgetType.MAINTENANCE_ALERTS,
        WidgetType.TECHNICAL_PERFORMANCE
      ],
      [UserRole.CAPTAIN]: [
        ...baseWidgets,
        WidgetType.FLEET_OVERVIEW,
        WidgetType.ACTIVE_VOYAGES,
        WidgetType.NAVIGATION_STATUS,
        WidgetType.MARINE_WEATHER,
        WidgetType.SAFETY_METRICS,
        WidgetType.COMPLIANCE_STATUS,
        WidgetType.REGULATIONS_COMPLIANCE
      ],
      [UserRole.CHIEF_ENGINEER]: [
        ...baseWidgets,
        WidgetType.ENGINE_STATUS,
        WidgetType.WASTE_HEAT_RECOVERY,
        WidgetType.EMISSIONS_MONITORING,
        WidgetType.EFFICIENCY_METRICS,
        WidgetType.MAINTENANCE_ALERTS,
        WidgetType.TECHNICAL_PERFORMANCE,
        WidgetType.REGULATIONS_COMPLIANCE
      ],
      [UserRole.MANAGER]: [
        ...baseWidgets,
        WidgetType.FLEET_OVERVIEW,
        WidgetType.TCC_METER,
        WidgetType.FINANCIAL_SUMMARY,
        WidgetType.COMPLIANCE_ALERTS,
        WidgetType.RFQ_BOARD
      ],
      [UserRole.COMPLIANCE_OFFICER]: [
        WidgetType.COMPLIANCE_STATUS,
        WidgetType.EUA_PRICE,
        WidgetType.REGULATIONS_COMPLIANCE,
        WidgetType.COMPLIANCE_ALERTS,
        WidgetType.VERIFICATION_STATUS,
        WidgetType.REGULATORY_DEADLINES
      ],
      [UserRole.TRADER]: [
        WidgetType.RFQ_BOARD,
        WidgetType.TRADING_OPPORTUNITIES,
        WidgetType.MARKET_DATA,
        WidgetType.TCC_METER,
        WidgetType.EUA_PRICE
      ],
      [UserRole.TECHNICAL_SUPERINTENDENT]: [
        ...baseWidgets,
        WidgetType.FLEET_OVERVIEW,
        WidgetType.TECHNICAL_PERFORMANCE,
        WidgetType.WASTE_HEAT_RECOVERY,
        WidgetType.EMISSIONS_MONITORING,
        WidgetType.REGULATIONS_COMPLIANCE,
        WidgetType.MAINTENANCE_ALERTS
      ],
      [UserRole.ADMIN]: Object.values(WidgetType),
      [UserRole.GUEST]: [WidgetType.FLEET_OVERVIEW]
    };

    setAvailableWidgets(roleSpecificWidgets[user.role] || baseWidgets);
  };

  const handleSettingChange = (key: keyof CustomizationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  const handleNotificationChange = (key: keyof CustomizationSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    setSaved(false);
  };

  const addCustomWidget = (widgetType: WidgetType) => {
    const newWidget: DashboardWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: getWidgetTitle(widgetType),
      position: { x: 0, y: 0, w: 1, h: 1 },
      config: {},
      isVisible: true
    };

    setSettings(prev => ({
      ...prev,
      customWidgets: [...prev.customWidgets, newWidget]
    }));
    setSaved(false);
  };

  const removeCustomWidget = (widgetId: string) => {
    setSettings(prev => ({
      ...prev,
      customWidgets: prev.customWidgets.filter(w => w.id !== widgetId)
    }));
    setSaved(false);
  };

  const getWidgetTitle = (widgetType: WidgetType): string => {
    const titles: Record<WidgetType, string> = {
      [WidgetType.FLEET_OVERVIEW]: 'Fleet Overview',
      [WidgetType.ACTIVE_VOYAGES]: 'Active Voyages',
      [WidgetType.COMPLIANCE_STATUS]: 'Compliance Status',
      [WidgetType.TCC_METER]: 'TCC Meter',
      [WidgetType.EUA_PRICE]: 'EUA Price',
      [WidgetType.FUEL_COSTS]: 'Fuel Costs',
      [WidgetType.FINANCIAL_SUMMARY]: 'Financial Summary',
      [WidgetType.MY_TASKS]: 'My Tasks',
      [WidgetType.CREW_LEAGUE]: 'Crew League',
      [WidgetType.PERFORMANCE_METRICS]: 'Performance Metrics',
      [WidgetType.SCHEDULE]: 'Schedule',
      [WidgetType.ENGINE_STATUS]: 'Engine Status',
      [WidgetType.FUEL_CONSUMPTION]: 'Fuel Consumption',
      [WidgetType.EFFICIENCY_METRICS]: 'Efficiency Metrics',
      [WidgetType.MAINTENANCE_ALERTS]: 'Maintenance Alerts',
      [WidgetType.COMPLIANCE_ALERTS]: 'Compliance Alerts',
      [WidgetType.VERIFICATION_STATUS]: 'Verification Status',
      [WidgetType.REGULATORY_DEADLINES]: 'Regulatory Deadlines',
      [WidgetType.RFQ_BOARD]: 'RFQ Board',
      [WidgetType.TRADING_OPPORTUNITIES]: 'Trading Opportunities',
      [WidgetType.MARKET_DATA]: 'Market Data',
      [WidgetType.WASTE_HEAT_RECOVERY]: 'Waste Heat Recovery',
      [WidgetType.EMISSIONS_MONITORING]: 'Emissions Monitoring',
      [WidgetType.REGULATIONS_COMPLIANCE]: 'Regulations Compliance',
      [WidgetType.TECHNICAL_PERFORMANCE]: 'Technical Performance',
      [WidgetType.SAFETY_METRICS]: 'Safety Metrics',
      [WidgetType.MARINE_WEATHER]: 'Marine Weather',
      [WidgetType.NAVIGATION_STATUS]: 'Navigation Status',
      [WidgetType.CARGO_MANAGEMENT]: 'Cargo Management',
      [WidgetType.CUSTOM_WIDGET]: 'Custom Widget',
      [WidgetType.PROFILE_SETTINGS]: 'Profile Settings'
    };
    return titles[widgetType] || widgetType;
  };

  const saveSettings = () => {
    // Update preferences in context
    updatePreferences({
      theme: settings.theme !== 'auto' ? settings.theme : undefined,
      language: settings.language,
      timezone: settings.timezone
    });
    
    // Also save to localStorage as backup
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('userSettingsChanged'));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Profile Settings & Customization
        </h1>
        <p className="text-text-secondary">
          Customize your dashboard, notifications, and preferences based on your role and responsibilities.
        </p>
      </div>

      {/* Basic Profile Information */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Name
            </label>
            <div className="text-text-primary font-medium">
              {user.firstName} {user.lastName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Role
            </label>
            <div className="text-text-primary font-medium">
              {user.role} {user.rank && `(${user.rank})`}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email
            </label>
            <div className="text-text-primary font-medium">
              {user.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Ship/Organization
            </label>
            <div className="text-text-primary font-medium">
              {user.shipId || user.organizationId}
            </div>
          </div>
        </div>
      </Card>

      {/* Dashboard Customization */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Dashboard Customization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Layout Style
            </label>
            <select
              value={settings.dashboardLayout}
              onChange={(e) => handleSettingChange('dashboardLayout', e.target.value)}
              className="w-full p-3 bg-card border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="grid">Grid Layout</option>
              <option value="list">List Layout</option>
              <option value="compact">Compact Layout</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Columns
            </label>
            <select
              value={settings.columns}
              onChange={(e) => handleSettingChange('columns', parseInt(e.target.value))}
              className="w-full p-3 bg-card border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full p-3 bg-card border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        {/* Data Visibility Settings */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-text-primary mb-4">Data Visibility</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showFinancialData}
                onChange={(e) => handleSettingChange('showFinancialData', e.target.checked)}
                className="rounded border-subtle text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">Financial Data</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showComplianceData}
                onChange={(e) => handleSettingChange('showComplianceData', e.target.checked)}
                className="rounded border-subtle text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">Compliance Data</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showCrewData}
                onChange={(e) => handleSettingChange('showCrewData', e.target.checked)}
                className="rounded border-subtle text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-secondary">Crew Data</span>
            </label>
            
            <label className="flex items-center space-x-2">
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

        {/* Custom Widgets */}
        <div>
          <h4 className="text-md font-semibold text-text-primary mb-4">Available Widgets</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableWidgets.map(widgetType => (
              <button
                key={widgetType}
                onClick={() => addCustomWidget(widgetType)}
                className="p-3 bg-card border border-subtle rounded-lg text-text-primary hover:bg-subtle transition-colors text-sm text-left"
              >
                {getWidgetTitle(widgetType)}
              </button>
            ))}
          </div>
        </div>

        {/* Current Custom Widgets */}
        {settings.customWidgets.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-text-primary mb-4">Custom Widgets</h4>
            <div className="space-y-2">
              {settings.customWidgets.map(widget => (
                <div key={widget.id} className="flex items-center justify-between p-3 bg-subtle rounded-lg">
                  <span className="text-text-primary">{widget.title}</span>
                  <button
                    onClick={() => removeCustomWidget(widget.id)}
                    className="text-error hover:text-error/80 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
              className="rounded border-subtle text-primary focus:ring-primary"
            />
            <div>
              <div className="font-medium text-text-primary">Email Notifications</div>
              <div className="text-sm text-text-secondary">Receive notifications via email</div>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={(e) => handleNotificationChange('push', e.target.checked)}
              className="rounded border-subtle text-primary focus:ring-primary"
            />
            <div>
              <div className="font-medium text-text-primary">Push Notifications</div>
              <div className="text-sm text-text-secondary">Browser push notifications</div>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.maintenance}
              onChange={(e) => handleNotificationChange('maintenance', e.target.checked)}
              className="rounded border-subtle text-primary focus:ring-primary"
            />
            <div>
              <div className="font-medium text-text-primary">Maintenance Alerts</div>
              <div className="text-sm text-text-secondary">Equipment maintenance reminders</div>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.compliance}
              onChange={(e) => handleNotificationChange('compliance', e.target.checked)}
              className="rounded border-subtle text-primary focus:ring-primary"
            />
            <div>
              <div className="font-medium text-text-primary">Compliance Alerts</div>
              <div className="text-sm text-text-secondary">Regulatory compliance notifications</div>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.safety}
              onChange={(e) => handleNotificationChange('safety', e.target.checked)}
              className="rounded border-subtle text-primary focus:ring-primary"
            />
            <div>
              <div className="font-medium text-text-primary">Safety Alerts</div>
              <div className="text-sm text-text-secondary">Safety-related notifications</div>
            </div>
          </label>
        </div>
      </Card>

      {/* Language and Timezone */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full p-3 bg-card border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
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
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full p-3 bg-card border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="UTC">UTC</option>
              <option value="GMT">GMT</option>
              <option value="CET">CET (Central European Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-success text-white'
              : 'bg-primary text-white hover:bg-primary/80'
          }`}
        >
          {saved ? '✓ Settings Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
