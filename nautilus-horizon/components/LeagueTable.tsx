import React from 'react';
import { LeagueStanding } from '../types/index';

interface LeagueTableProps {
  standings: LeagueStanding[];
  currentShipId?: string;
  showBadges?: boolean;
}

const LeagueTable: React.FC<LeagueTableProps> = ({ 
  standings, 
  currentShipId,
  showBadges = true 
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400'; // Gold
      case 2: return 'text-gray-300';   // Silver  
      case 3: return 'text-orange-400'; // Bronze
      default: return 'text-gray-400';
    }
  };
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };
  
  const getEfficiencyColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 65) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getBadgeIcon = (badge: string) => {
    if (badge.includes('SGM')) return '⚡';
    if (badge.includes('Trim')) return '📐';
    if (badge.includes('RPM')) return '🎯';
    return '🏆';
  };
  
  return (
    <div className="bg-card rounded-lg border border-subtle overflow-hidden">
      <div className="px-6 py-4 border-b border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Weekly League</h3>
          <div className="text-sm text-gray-400">7-Ship Fleet</div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Season resets Monday 00:00 UTC
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-subtle">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Vessel
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Weekly
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Efficiency
              </th>
              {showBadges && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Badges
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {standings.map((standing) => {
              const isCurrentShip = standing.shipId === currentShipId;
              
              return (
                <tr 
                  key={standing.shipId}
                  className={`hover:bg-subtle/50 transition-colors ${
                    isCurrentShip ? 'bg-primary/10 border-l-4 border-primary' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getRankColor(standing.rank)}`}>
                        {getRankIcon(standing.rank)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${isCurrentShip ? 'text-primary' : 'text-white'}`}>
                        {standing.shipName}
                      </div>
                      {isCurrentShip && (
                        <div className="text-xs text-primary/70">Your vessel</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-white">
                      {standing.weeklyPoints}
                    </div>
                    <div className="text-xs text-gray-400">pts</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-white">
                      {standing.totalPoints}
                    </div>
                    <div className="text-xs text-gray-400">pts</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className={`text-sm font-medium ${getEfficiencyColor(standing.efficiencyScore)}`}>
                      {standing.efficiencyScore}
                    </div>
                    <div className="text-xs text-gray-400">score</div>
                  </td>
                  
                  {showBadges && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {standing.badges.length > 0 ? (
                          standing.badges.slice(0, 3).map((badge, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-primary/20 text-primary"
                              title={badge}
                            >
                              <span>{getBadgeIcon(badge)}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                        {standing.badges.length > 3 && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                            +{standing.badges.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-subtle/30 text-xs text-gray-400">
        Points = Verified ΔFuel (t) × 10 + Verified ΔCO₂ (t) × 5 + Quest bonuses
      </div>
    </div>
  );
};

export default LeagueTable;

