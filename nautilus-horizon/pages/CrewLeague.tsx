import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import LeagueTable from '../components/LeagueTable';
import { LeagueStanding, ScoreEvent, EnergySavingsMetrics } from '../types/index';
import { mockLeagueStandings, fetchEnergySavingsMetrics, getEnvironmentalImpact } from '../services/mockApi';
import { useUser } from '../contexts/UserContext';

const CrewLeague: React.FC = () => {
  const { user } = useUser();
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentShipId] = useState('1'); // Mock current ship ID
  const [recentEvents, setRecentEvents] = useState<ScoreEvent[]>([]);
  const [energyMetrics, setEnergyMetrics] = useState<EnergySavingsMetrics[]>([]);
  const [environmentalImpact, setEnvironmentalImpact] = useState({
    totalCo2Saved: 0,
    totalFuelSaved: 0,
    environmentalScore: 0
  });

  useEffect(() => {
    const loadLeagueData = async () => {
      try {
        const standingsData = mockLeagueStandings;
        setStandings(standingsData);
        
        // Load energy savings metrics for all ships in standings
        const metricsPromises = standingsData.map(standing => 
          fetchEnergySavingsMetrics(standing.shipId)
        );
        const metricsResults = await Promise.all(metricsPromises);
        // Normalize and ensure all results match the EnergySavingsMetrics interface
        const allMetrics = metricsResults
          .map(m => {
            if (!m) return null;
            // Normalize property names: totalFuelSaved -> fuelSaved, totalCo2Saved -> co2Saved
            const normalized = Array.isArray(m) ? m : [m];
            return normalized.map((item: any) => ({
              ...item,
              fuelSaved: item.fuelSaved ?? item.totalFuelSaved ?? 0,
              co2Saved: item.co2Saved ?? item.totalCo2Saved ?? 0,
              userId: item.userId || 'unknown',
              role: item.role || 'CREW',
              period: item.period || 'WEEKLY',
              timestamp: item.timestamp || new Date().toISOString(),
              electricitySaved: item.electricitySaved ?? 0,
              waterSaved: item.waterSaved ?? 0,
            }));
          })
          .flat()
          .filter(Boolean);
        setEnergyMetrics(allMetrics);
        
        // Load environmental impact data
        const impact = await getEnvironmentalImpact(currentShipId);
        setEnvironmentalImpact(impact);
        
        // Mock recent score events with energy-saving focus
        setRecentEvents([
          {
            id: 'event-1',
            shipId: '1',
            userId: 'crew-1',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            points: 25,
            source: 'Waste Heat Recovery optimization completed'
          },
          {
            id: 'event-2',
            shipId: '2',
            userId: 'crew-2',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            points: 35,
            badge: 'Energy Saver',
            source: 'Shaft Generator Motor 90% uptime achieved'
          },
          {
            id: 'event-3',
            shipId: '6',
            userId: 'crew-6',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            points: 40,
            badge: 'Environmental Champion',
            source: 'Water conservation measures implemented'
          },
          {
            id: 'event-4',
            shipId: '3',
            userId: 'crew-3',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
            points: 15,
            source: 'Lights off protocol maintained 24h'
          }
        ]);
      } catch (error) {
        console.error('Failed to load league data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeagueData();
  }, [currentShipId]);

  const currentShip = standings.find(s => s.shipId === currentShipId);
  const nextSeasonReset = new Date();
  nextSeasonReset.setDate(nextSeasonReset.getDate() + (8 - nextSeasonReset.getDay()) % 7); // Next Monday
  nextSeasonReset.setHours(0, 0, 0, 0);

  const timeToReset = nextSeasonReset.getTime() - Date.now();
  const daysToReset = Math.floor(timeToReset / (1000 * 60 * 60 * 24));
  const hoursToReset = Math.floor((timeToReset % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Season Info */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Weekly League Season</h2>
            <p className="text-sm text-gray-400">
              Compete across the 7-ship fleet for energy efficiency excellence
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Season resets in</div>
            <div className="text-lg font-bold text-primary">
              {daysToReset}d {hoursToReset}h
            </div>
            <div className="text-xs text-gray-500">Monday 00:00 UTC</div>
          </div>
        </div>
      </Card>

      {/* Environmental Impact Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Fleet Environmental Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {environmentalImpact.totalCo2Saved.toFixed(1)}t
            </div>
            <div className="text-sm text-gray-400">CO₂ Saved This Week</div>
            <div className="text-xs text-gray-500 mt-1">Across all vessels</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {environmentalImpact.totalFuelSaved.toFixed(1)}t
            </div>
            <div className="text-sm text-gray-400">Fuel Saved This Week</div>
            <div className="text-xs text-gray-500 mt-1">Energy efficiency gains</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {environmentalImpact.environmentalScore}
            </div>
            <div className="text-sm text-gray-400">Environmental Score</div>
            <div className="text-xs text-gray-500 mt-1">0-100 scale</div>
          </div>
        </div>
      </Card>

      {/* Current Ship Performance */}
      {currentShip && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                #{currentShip.rank}
              </div>
              <div className="text-sm text-gray-400">Current Rank</div>
              <div className={`text-xs mt-1 ${
                currentShip.rank <= 3 ? 'text-green-400' : 
                currentShip.rank <= 5 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {currentShip.rank <= 3 ? 'Top 3!' : 
                 currentShip.rank <= 5 ? 'Mid-table' : 'Need improvement'}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {currentShip.weeklyPoints}
              </div>
              <div className="text-sm text-gray-400">Weekly Points</div>
              <div className="text-xs text-gray-500 mt-1">
                Total: {currentShip.totalPoints}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {currentShip.efficiencyScore}
              </div>
              <div className="text-sm text-gray-400">Efficiency Score</div>
              <div className="text-xs text-gray-500 mt-1">0-100 scale</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {currentShip.badges.length}
              </div>
              <div className="text-sm text-gray-400">Badges Earned</div>
              <div className="text-xs text-gray-500 mt-1">This season</div>
            </div>
          </Card>
        </div>
      )}

      {/* League Table */}
      <LeagueTable 
        standings={standings} 
        currentShipId={currentShipId}
        showBadges={true}
      />

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Fleet Activity</h3>
        <div className="space-y-3">
          {recentEvents.map(event => {
            const ship = standings.find(s => s.shipId === event.shipId);
            const isCurrentShip = event.shipId === currentShipId;
            
            return (
              <div 
                key={event.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isCurrentShip ? 'bg-primary/10 border border-primary/30' : 'bg-subtle/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {event.badge ? '🏆' : '⚡'}
                  </div>
                  <div>
                    <div className={`font-medium ${isCurrentShip ? 'text-primary' : 'text-white'}`}>
                      {ship?.shipName || 'Unknown Ship'}
                      {isCurrentShip && <span className="text-xs ml-2 text-primary/70">(Your vessel)</span>}
                    </div>
                    <div className="text-sm text-gray-400">{event.source}</div>
                    {event.badge && (
                      <div className="text-xs text-yellow-400 mt-1">
                        🏅 Badge earned: {event.badge}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    +{event.points} pts
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Badge Collection */}
      {currentShip && currentShip.badges.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Energy Efficiency Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentShip.badges.map((badge, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-subtle/30 rounded-lg">
                <div className="text-2xl">
                  {badge.includes('WHR') ? '♨️' : 
                   badge.includes('SGM') ? '⚡' :
                   badge.includes('Environmental') ? '🌱' :
                   badge.includes('Energy') ? '🔋' :
                   badge.includes('Water') ? '💧' :
                   badge.includes('Lights') ? '💡' : '🏅'}
                </div>
                <div>
                  <div className="font-medium text-white">{badge}</div>
                  <div className="text-xs text-gray-400">Energy efficiency achievement</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Energy Savings Leaderboard */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Energy Savings Leaders</h3>
        <div className="space-y-4">
          {standings.slice(0, 5).map((standing, index) => {
            const energyData = energyMetrics.find(m => m.shipId === standing.shipId);
            return (
              <div key={standing.shipId} className="flex items-center justify-between p-3 bg-subtle/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div>
                    <div className="font-medium text-white">{standing.shipName}</div>
                    <div className="text-sm text-gray-400">
                      {energyData ? `${energyData.fuelSaved.toFixed(1)}t fuel saved` : 'No data'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{standing.weeklyPoints} pts</div>
                  <div className="text-xs text-gray-500">
                    {energyData ? `${energyData.co2Saved.toFixed(1)}t CO₂` : 'No data'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Scoring Rules */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Energy Efficiency Scoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-300 mb-3">Point Sources</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Fuel Saved (per tonne)</span>
                <span className="text-white">10 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CO₂ Saved (per tonne)</span>
                <span className="text-white">5 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Waste Heat Recovery</span>
                <span className="text-white">15-45 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shaft Generator Motor</span>
                <span className="text-white">20-50 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Environmental Tasks</span>
                <span className="text-white">10-25 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Energy Efficiency Badges</span>
                <span className="text-white">25-100 points</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-300 mb-3">Task Categories</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Captain Tasks</span>
                <span className="text-white">Strategic oversight</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Engineer Tasks</span>
                <span className="text-white">Technical systems</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Crew Tasks</span>
                <span className="text-white">Environmental actions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">All Roles</span>
                <span className="text-white">Lights off, water saving</span>
              </div>
            </div>
            
            <h4 className="font-medium text-gray-300 mb-3 mt-4">Safety First</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• All tasks must pass safety checks</li>
              <li>• No points for unsafe operations</li>
              <li>• Environmental compliance required</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CrewLeague;

