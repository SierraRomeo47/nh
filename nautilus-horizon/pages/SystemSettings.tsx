import React from 'react';
import Card from '../components/Card';

const SystemSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          System Settings
        </h1>
        <p className="text-text-secondary">
          Configure system settings, preferences, and administrative options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Database</span>
              <span className="font-semibold text-success">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">API Services</span>
              <span className="font-semibold text-success">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Data Sync</span>
              <span className="font-semibold text-success">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Backup Status</span>
              <span className="font-semibold text-success">Up to Date</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">System Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">CPU Usage</span>
              <span className="font-semibold text-text-primary">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Memory Usage</span>
              <span className="font-semibold text-text-primary">62%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Disk Space</span>
              <span className="font-semibold text-text-primary">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Active Sessions</span>
              <span className="font-semibold text-primary">8</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Configuration</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Theme</span>
              <span className="font-semibold text-text-primary">Dark</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Language</span>
              <span className="font-semibold text-text-primary">English</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Timezone</span>
              <span className="font-semibold text-text-primary">UTC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Notifications</span>
              <span className="font-semibold text-success">Enabled</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">System Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start p-4 bg-info/20 border border-info/30 rounded-lg">
            <div className="text-2xl mr-3">ℹ️</div>
            <div>
              <div className="font-semibold text-info">System Update Available</div>
              <div className="text-sm text-text-secondary">Version 2.1.3 is available for installation</div>
            </div>
          </div>
          <div className="flex items-start p-4 bg-warning/20 border border-warning/30 rounded-lg">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <div className="font-semibold text-warning">Disk Space Warning</div>
              <div className="text-sm text-text-secondary">Disk usage is at 78%. Consider cleanup.</div>
            </div>
          </div>
          <div className="flex items-start p-4 bg-success/20 border border-success/30 rounded-lg">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <div className="font-semibold text-success">Backup Completed</div>
              <div className="text-sm text-text-secondary">Daily backup completed successfully</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Administrative Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">System Backup</div>
            <div className="text-sm opacity-80">Create system backup</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Update System</div>
            <div className="text-sm text-text-secondary">Install system updates</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">System Logs</div>
            <div className="text-sm text-text-secondary">View system logs</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default SystemSettings;