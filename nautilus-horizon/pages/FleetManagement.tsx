import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { useUser } from '../contexts/UserContext';
import VesselModal from '../components/modals/VesselModal';
import AssignVoyageModal from '../components/modals/AssignVoyageModal';

interface Vessel {
  id: string;
  imo_number: string;
  name: string;
  ship_type: string;
  gross_tonnage: number;
  deadweight_tonnage: number;
  engine_power_kw: number;
  flag_state: string;
  year_built: number;
  classification_society: string;
}

interface FleetOverview {
  total_vessels: number;
  active_voyages: number;
  in_port: number;
}

const FleetManagement: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [fleetOverview, setFleetOverview] = useState<FleetOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVesselModal, setShowVesselModal] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [showVoyageModal, setShowVoyageModal] = useState(false);

  const fetchVessels = async () => {
    try {
      setLoading(true);
      // Fetch vessels from backend
      const response = await fetch('http://localhost:8080/vessels/api/vessels', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVessels(data.data || []);
      } else {
        console.error('Failed to fetch vessels:', response.statusText);
      }
      
      // Fetch fleet overview
      const overviewResponse = await fetch('http://localhost:8080/vessels/api/vessels/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setFleetOverview(overviewData.data);
      }
    } catch (error) {
      console.error('Error fetching vessels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleCreateVessel = () => {
    setEditingVessel(null);
    setShowVesselModal(true);
  };

  const handleEditVessel = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setShowVesselModal(true);
  };

  const handleModalClose = () => {
    setShowVesselModal(false);
    setEditingVessel(null);
  };

  const handleModalSuccess = () => {
    fetchVessels();
  };

  const handleAssignVoyage = () => {
    if (vessels.length === 0) {
      alert('No vessels available. Please create a vessel first.');
      return;
    }
    setShowVoyageModal(true);
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      // Generate fleet report data
      const reportData = {
        generated_at: new Date().toISOString(),
        fleet_summary: {
          total_vessels: vessels.length,
          active_voyages: fleetOverview?.active_voyages || 0,
          in_port: fleetOverview?.in_port || 0,
          total_gross_tonnage: vessels.reduce((sum, v) => sum + (v.gross_tonnage || 0), 0),
          total_deadweight: vessels.reduce((sum, v) => sum + (v.deadweight_tonnage || 0), 0),
        },
        vessels: vessels.map(v => ({
          name: v.name,
          imo: v.imo_number,
          type: v.ship_type,
          flag: v.flag_state,
          gross_tonnage: v.gross_tonnage,
          deadweight: v.deadweight_tonnage,
          engine_power: v.engine_power_kw,
          year_built: v.year_built,
          classification: v.classification_society,
          status: 'Operational'
        })),
        performance: {
          average_efficiency: '94.2%',
          fuel_consumption: '45.2 t/day',
          compliance_rate: '98.5%',
          on_time_performance: '96.8%'
        }
      };

      // Convert to JSON and download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleet-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate fleet report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaintenance = () => {
    navigate('/maintenance');
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Fleet Management
        </h1>
        <p className="text-text-secondary">
          Manage your fleet operations, vessel assignments, and operational oversight.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Active Vessels ({vessels.length})</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {vessels.length === 0 ? (
                <div className="text-text-secondary text-center py-4">No vessels found</div>
              ) : (
                vessels.map((vessel) => (
                  <div key={vessel.id} className="flex justify-between items-center p-3 bg-subtle rounded-lg hover:bg-subtle/80 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{vessel.name}</div>
                      <div className="text-sm text-text-secondary">{vessel.ship_type} • IMO: {vessel.imo_number}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-success">Operational</div>
                      <button
                        onClick={() => handleEditVessel(vessel)}
                        className="px-3 py-1 text-xs bg-card border border-subtle text-text-primary rounded hover:bg-subtle transition-colors"
                        title="Edit vessel"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Fleet Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Average Efficiency</span>
                <span className="font-semibold text-success">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Fuel Consumption</span>
                <span className="font-semibold text-text-primary">45.2 t/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Compliance Rate</span>
                <span className="font-semibold text-success">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">On-time Performance</span>
                <span className="font-semibold text-success">96.8%</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleCreateVessel}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-left"
              >
                <div className="font-medium">Create New Vessel</div>
                <div className="text-sm opacity-80">Add a new vessel to the fleet</div>
              </button>
              <button 
                onClick={handleAssignVoyage}
                className="w-full px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors text-left"
              >
                <div className="font-medium">Assign New Voyage</div>
                <div className="text-sm text-text-secondary">Create and assign voyage to vessel</div>
              </button>
              <button 
                onClick={handleGenerateReport}
                disabled={loading || vessels.length === 0}
                className="w-full px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium">Fleet Report</div>
                <div className="text-sm text-text-secondary">Generate fleet performance report</div>
              </button>
              <button 
                onClick={handleViewMaintenance}
                className="w-full px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors text-left"
              >
                <div className="font-medium">Maintenance Schedule</div>
                <div className="text-sm text-text-secondary">View upcoming maintenance</div>
              </button>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Fleet Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{fleetOverview?.total_vessels || vessels.length}</div>
            <div className="text-sm text-text-secondary">Total Vessels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">{fleetOverview?.active_voyages || 0}</div>
            <div className="text-sm text-text-secondary">Active Voyages</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning">{fleetOverview?.in_port || 0}</div>
            <div className="text-sm text-text-secondary">In Port</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-info">€2.1M</div>
            <div className="text-sm text-text-secondary">Monthly Revenue</div>
          </div>
        </div>
      </Card>

      <VesselModal
        isOpen={showVesselModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        vessel={editingVessel}
      />

      <AssignVoyageModal
        isOpen={showVoyageModal}
        onClose={() => setShowVoyageModal(false)}
        onSuccess={() => {
          setShowVoyageModal(false);
          fetchVessels(); // Refresh to update active voyages count
        }}
        vessels={vessels}
      />
    </div>
  );
};

export default FleetManagement;
