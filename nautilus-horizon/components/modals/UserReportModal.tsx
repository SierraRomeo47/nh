import React, { useState, useEffect } from 'react';

interface UserReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserReportModal: React.FC<UserReportModalProps> = ({ isOpen, onClose }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:8080/auth/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
          }
        }),
        fetch('http://localhost:8080/auth/api/users/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
          }
        })
      ]);

      if (usersResponse.ok && statsResponse.ok) {
        const users = await usersResponse.json();
        const stats = await statsResponse.json();
        setReportData({ users: users.data, stats: stats.data });
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;

    const csv = [
      ['Name', 'Email', 'Role', 'Position', 'Status', 'Last Login'].join(','),
      ...reportData.users.map((u: any) => [
        `${u.first_name} ${u.last_name}`,
        u.email,
        u.role,
        u.position || 'N/A',
        u.is_active ? 'Active' : 'Inactive',
        u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-subtle rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">User Activity Report</h2>
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
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-subtle rounded-lg">
                <div className="text-text-secondary text-sm">Total Users</div>
                <div className="text-2xl font-bold text-text-primary">{reportData.stats.total_users}</div>
              </div>
              <div className="p-4 bg-subtle rounded-lg">
                <div className="text-text-secondary text-sm">Active Users</div>
                <div className="text-2xl font-bold text-success">{reportData.stats.active_users}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Role Distribution</h3>
              <div className="space-y-2">
                {Object.entries(reportData.stats.role_distribution).map(([role, count]: [string, any]) => (
                  <div key={role} className="flex justify-between p-2 bg-subtle rounded">
                    <span className="text-text-secondary">{role}</span>
                    <span className="font-semibold text-text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">User List</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reportData.users.map((u: any) => (
                  <div key={u.id} className="p-3 bg-subtle rounded-lg text-sm">
                    <div className="font-medium text-text-primary">{u.first_name} {u.last_name}</div>
                    <div className="text-text-secondary">{u.email} • {u.role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={downloadCSV}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Download CSV
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-text-secondary text-center py-8">Failed to generate report</div>
        )}
      </div>
    </div>
  );
};

export default UserReportModal;

