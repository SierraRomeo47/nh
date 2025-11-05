import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChevronUpIcon, ChevronDownIcon } from '../components/common/Icons';
import { generateMarketAnalysis } from '../services/geminiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface TradingDataState {
  euaPrice: number;
  euaSource: string;
  opportunities: any[];
  portfolio: any[];
  loading: boolean;
}

const TradingOpportunities: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TradingDataState>({
    euaPrice: 76.0,
    euaSource: 'LOADING',
    opportunities: [],
    portfolio: [],
    loading: true,
  });
  const [lastEuaPrice, setLastEuaPrice] = useState(76.0);
  const [historicalData, setHistoricalData] = useState<Array<{date: string; price: number}>>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<string>('');
  const [analyzingMarket, setAnalyzingMarket] = useState(false);

  // Calculate futures price from spot (2.5% premium)
  const futuresPrice = data.euaPrice * 1.025;

  useEffect(() => {
    const fetchTradingData = async () => {
      try {
        // Fetch EUA price
        const euaResponse = await fetch(`${API_BASE_URL}/trading/api/market/eua`);
        const euaData = await euaResponse.json();
        
        // Fetch trading opportunities
        const opportunitiesResponse = await fetch(`${API_BASE_URL}/trading/api/opportunities`);
        const opportunitiesData = await opportunitiesResponse.json();
        
        // Fetch portfolio
        const portfolioResponse = await fetch(`${API_BASE_URL}/trading/api/portfolio`);
        const portfolioData = await portfolioResponse.json();

        // Fetch historical data
        const historyResponse = await fetch(`${API_BASE_URL}/trading/api/market/history?dataType=EUA&days=30`);
        const historyData = await historyResponse.json();

        const newPrice = parseFloat(euaData.data.price);
        setLastEuaPrice(data.euaPrice);
        
        setData({
          euaPrice: newPrice,
          euaSource: euaData.data.source,
          opportunities: opportunitiesData.data || [],
          portfolio: portfolioData.data || [],
          loading: false,
        });

        if (historyData.data && Array.isArray(historyData.data)) {
          setHistoricalData(
            historyData.data.map((item: any) => ({
              date: new Date(item.timestamp).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              }),
              price: parseFloat(item.price)
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching trading data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchTradingData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTradingData, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalPortfolioValue = data.portfolio.reduce((sum, item) => sum + parseFloat(item.current_value || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Trading Opportunities
        </h1>
        <p className="text-text-secondary">
          Real-time trading opportunities powered by free-tier market data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">EU ETS Market</h3>
            <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
              {data.euaSource}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Current Price</span>
              <span className="font-semibold text-primary">
                {data.loading ? '...' : `€${data.euaPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">24h Change</span>
              <span className="font-semibold text-success">+2.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Volume</span>
              <span className="font-semibold text-text-primary">1.2M tCO₂</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Our Exposure</span>
              <span className="font-semibold text-warning">2,739 tCO₂</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">FuelEU Pooling</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Pool Price Range</span>
              <span className="font-semibold text-text-primary">€0.040-0.050/g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Active RFQs</span>
              <span className="font-semibold text-text-primary">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Our Deficit</span>
              <span className="font-semibold text-error">-5.2M gCO₂e</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Available Surplus</span>
              <span className="font-semibold text-success">1.1M gCO₂e</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Portfolio Value</h3>
          <div className="space-y-4">
            {data.loading ? (
              <div className="text-center text-text-secondary">Loading portfolio...</div>
            ) : data.portfolio.length > 0 ? (
              <>
                {data.portfolio.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-text-secondary">{item.asset_type}</span>
                    <span className="font-semibold text-text-primary">
                      €{parseFloat(item.current_value || '0').toLocaleString('en-US', {maximumFractionDigits: 0})}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-subtle">
                  <span className="text-text-secondary font-semibold">Total Value</span>
                  <span className="font-semibold text-success">
                    €{totalPortfolioValue.toLocaleString('en-US', {maximumFractionDigits: 0})}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-text-secondary">No portfolio data</div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Active Trading Opportunities
          <span className="text-xs font-normal text-text-muted ml-2">
            ({data.opportunities.length} opportunities)
          </span>
        </h3>
        {/* Scrollable container with max height */}
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="space-y-3 pr-2">
            {data.loading ? (
              <div className="text-center text-text-secondary py-4">Loading opportunities...</div>
            ) : data.opportunities.length > 0 ? (
              data.opportunities.map((opp: any, idx: number) => {
                // Calculate expected savings based on opportunity type
                const calculateSavings = () => {
                  if (opp.opportunity_type === 'EUA_PURCHASE' && opp.volume_tco2) {
                    // Assume 5% discount for EUA purchases
                    return data.euaPrice * parseFloat(opp.volume_tco2) * 0.05;
                  } else if (opp.opportunity_type === 'FUELEU_POOL' && opp.volume_gco2e) {
                    // FuelEU pooling savings at €0.045/g average
                    return (parseFloat(opp.volume_gco2e) / 1e6) * 45;
                  }
                  return parseFloat(opp.expected_savings_eur || '0');
                };
                
                const expectedSavings = calculateSavings();
                
                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg hover:border-primary/30 transition-all">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded">
                          {opp.opportunity_type}
                        </span>
                        {opp.verified && (
                          <span className="text-xs text-success">✓ Verified</span>
                        )}
                      </div>
                      <div className="text-sm text-text-secondary line-clamp-2">{opp.description}</div>
                      {expectedSavings > 0 && (
                        <div className="text-sm text-success mt-2 font-semibold">
                          💰 Est. Savings: €{expectedSavings.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button 
                        onClick={() => {
                          // Execute trade - would integrate with trading service
                          console.log('Executing opportunity:', opp);
                          alert(`Executing ${opp.opportunity_type} - Integration with trading service pending`);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/80 transition-colors whitespace-nowrap"
                      >
                        Execute
                      </button>
                      <button 
                        onClick={() => {
                          // Show details - would open modal or navigate to details page
                          console.log('Viewing details:', opp);
                          navigate('/portfolio', { state: { opportunityId: opp.id } });
                        }}
                        className="px-4 py-2 bg-card border border-subtle text-text-primary rounded text-sm hover:bg-subtle transition-colors whitespace-nowrap"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-text-secondary py-8">
                <div className="text-4xl mb-2">📊</div>
                <p>No trading opportunities available at the moment</p>
                <p className="text-xs mt-2">Check back later for new opportunities</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Hedging & Offset Opportunities */}
      <Card title="Hedging & Offset Opportunities">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Live EUA Market */}
            <div className="bg-subtle p-4 rounded-lg flex flex-col justify-between">
                <div>
                    <h4 className="font-semibold text-text-secondary">Live EUA Market</h4>
                    <p className="text-xs text-text-muted">Continuous Futures</p>
                </div>
                <div className="text-center my-4">
                    <p className="text-3xl font-bold text-primary">€{data.euaPrice.toFixed(2)}</p>
                    <div className={`flex items-center justify-center text-sm ${data.euaPrice >= lastEuaPrice ? 'text-success' : 'text-error'}`}>
                         {data.euaPrice >= lastEuaPrice ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                        <span className="ml-1 font-semibold">{Math.abs(data.euaPrice - lastEuaPrice).toFixed(2)} ({(((data.euaPrice - lastEuaPrice)/lastEuaPrice)*100).toFixed(2)}%)</span>
                    </div>
                </div>
                <button 
                    onClick={() => {
                      // Navigate to RFQ Board for EUA trading
                      navigate('/rfq-board', { state: { assetType: 'EUA', price: data.euaPrice } });
                    }}
                    className="w-full bg-primary/20 text-primary hover:bg-primary/40 text-sm font-semibold py-2 px-3 rounded-md transition flex items-center justify-center space-x-1"
                >
                    <span>💹</span>
                    <span>Trade EUAs</span>
                </button>
            </div>
            
            {/* Tile 2: Hedging Instrument */}
            <div className="bg-subtle p-4 rounded-lg flex flex-col justify-between">
                <div>
                    <h4 className="font-semibold text-gray-300">EUA Futures</h4>
                    <p className="text-xs text-gray-500">Dec-25 Contract</p>
                </div>
                <div className="text-center my-4">
                    <p className="text-3xl font-bold text-accent-b">€{futuresPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">
                      Ask: €{(futuresPrice + 0.05).toFixed(2)} / Bid: €{(futuresPrice - 0.05).toFixed(2)}
                    </p>
                </div>
                <button 
                    onClick={() => {
                      // Navigate to Scenario Pad with futures price
                      navigate('/scenario-pad', { 
                        state: { 
                          hedgingMode: true, 
                          euaPrice: futuresPrice,
                          contract: 'Dec-25'
                        } 
                      });
                    }}
                    className="w-full bg-primary/20 text-primary hover:bg-primary/40 text-sm font-semibold py-2 px-3 rounded-md transition flex items-center justify-center space-x-1"
                >
                    <span>📊</span>
                    <span>Analyze Hedging</span>
                </button>
            </div>
            
            {/* Tile 3: Operational Offset */}
            <div className="bg-subtle p-4 rounded-lg flex flex-col justify-between">
                <div>
                    <h4 className="font-semibold text-gray-300">Op-Tech Offset</h4>
                    <p className="text-xs text-gray-500">Shaft Generator Motor</p>
                </div>
                <div className="my-2 flex-1">
                    <p className="text-sm text-gray-200 h-full flex items-center">
                        Retrofit on <b className="text-white mx-1">'MV Neptune'</b> could reduce annual CO₂ by ~250t.
                    </p>
                </div>
                <button 
                    onClick={() => {
                      // Navigate to Scenario Pad with SGM technology pre-selected
                      navigate('/scenario-pad', { 
                        state: { 
                          vesselName: 'MV Neptune',
                          technology: 'SGM',
                          estimatedReduction: 250
                        } 
                      });
                    }}
                    className="w-full bg-primary/20 text-primary hover:bg-primary/40 text-sm font-semibold py-2 px-3 rounded-md transition flex items-center justify-center space-x-1"
                >
                    <span>🔧</span>
                    <span>Model Impact</span>
                </button>
            </div>

            {/* Tile 4: Alternative Fuel */}
             <div className="bg-subtle p-4 rounded-lg flex flex-col justify-between">
                <div>
                    <h4 className="font-semibold text-gray-300">FuelEU Offset</h4>
                    <p className="text-xs text-gray-500">B30 Biofuel Blend</p>
                </div>
                <div className="my-2 flex-1">
                    <p className="text-sm text-gray-200 h-full flex items-center">
                        Using B30 on EU voyages can lower FuelEU deficit by <b className="text-white mx-1">~1.5%</b> and generate surplus.
                    </p>
                </div>
                <button 
                    onClick={() => {
                      // Navigate to Market Data page to explore fuel suppliers
                      navigate('/market-data', { 
                        state: { 
                          filter: 'FUEL_BIO_MGO',
                          blend: 'B30'
                        } 
                      });
                    }}
                    className="w-full bg-primary/20 text-primary hover:bg-primary/40 text-sm font-semibold py-2 px-3 rounded-md transition flex items-center justify-center space-x-1"
                >
                    <span>⛽</span>
                    <span>Explore Suppliers</span>
                </button>
            </div>
        </div>
      </Card>

      {/* EUA Price History Chart */}
      {historicalData.length > 0 && (
        <Card title="EUA Price History (30 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                tick={{ fill: '#9ca3af' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#9ca3af" 
                tick={{ fill: '#9ca3af' }}
                label={{ value: 'Price (€)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#FF6A00" 
                strokeWidth={2}
                dot={{ fill: '#FF6A00' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* AI-Powered Market Analysis */}
      <Card title="AI Market Analysis & Recommendations">
        <div className="space-y-4">
          {marketAnalysis ? (
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: marketAnalysis }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">
                Get AI-powered market analysis and trading recommendations based on current market conditions
              </p>
              <button
                onClick={async () => {
                  try {
                    setAnalyzingMarket(true);
                    const analysis = await generateMarketAnalysis({
                      currentPrice: data.euaPrice,
                      futuresPrice: futuresPrice,
                      historicalData: historicalData.slice(-7),
                      fleetExposure: data.opportunities.reduce((sum: number, opp: any) => 
                        sum + parseFloat(opp.expected_savings_eur || '0'), 0),
                      fueleuSurplus: data.portfolio.filter((item: any) => 
                        item.asset_type === 'FuelEU Surplus').length,
                      fueleuDeficit: data.portfolio.filter((item: any) => 
                        item.asset_type === 'FuelEU Deficit').length
                    });
                    setMarketAnalysis(analysis);
                  } catch (error) {
                    console.error('Failed to generate market analysis:', error);
                    setMarketAnalysis(`
                      <div class="bg-red-900/20 border border-red-700 rounded-lg p-4">
                        <h3 class="text-red-400 font-semibold mb-2">Analysis Error</h3>
                        <p class="text-red-300">Failed to generate market analysis. Please check your Gemini API configuration.</p>
                      </div>
                    `);
                  } finally {
                    setAnalyzingMarket(false);
                  }
                }}
                disabled={analyzingMarket}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzingMarket ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Market...</span>
                  </div>
                ) : (
                  'Generate AI Market Analysis'
                )}
              </button>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/rfq-board', { state: { createNew: true } })}
            className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex flex-col items-center space-y-1"
          >
            <span className="text-2xl">📄</span>
            <div className="font-medium">Create RFQ</div>
            <div className="text-sm opacity-80">Create new pooling RFQ</div>
          </button>
          <button 
            onClick={async () => {
              if (!marketAnalysis && !analyzingMarket) {
                try {
                  setAnalyzingMarket(true);
                  const analysis = await generateMarketAnalysis({
                    currentPrice: data.euaPrice,
                    futuresPrice: futuresPrice,
                    historicalData: historicalData.slice(-7),
                    fleetExposure: data.opportunities.reduce((sum: number, opp: any) => 
                      sum + parseFloat(opp.expected_savings_eur || '0'), 0),
                    fueleuSurplus: data.portfolio.filter((item: any) => 
                      item.asset_type === 'FuelEU Surplus').length,
                    fueleuDeficit: data.portfolio.filter((item: any) => 
                      item.asset_type === 'FuelEU Deficit').length
                  });
                  setMarketAnalysis(analysis);
                } catch (error) {
                  console.error('Failed to generate market analysis:', error);
                } finally {
                  setAnalyzingMarket(false);
                }
              }
              // Scroll to market analysis section
              document.querySelector('[title="AI Market Analysis & Recommendations"]')?.scrollIntoView({ behavior: 'smooth' });
            }}
            disabled={analyzingMarket}
            className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors disabled:opacity-50 flex flex-col items-center space-y-1"
          >
            <span className="text-2xl">🤖</span>
            <div className="font-medium">
              {analyzingMarket ? 'Analyzing...' : 'Market Analysis'}
            </div>
            <div className="text-sm text-text-secondary">Analyze market trends with AI</div>
          </button>
          <button 
            onClick={() => navigate('/portfolio', { state: { generateReport: true } })}
            className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors flex flex-col items-center space-y-1"
          >
            <span className="text-2xl">📊</span>
            <div className="font-medium">Portfolio Report</div>
            <div className="text-sm text-text-secondary">Generate portfolio report</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default TradingOpportunities;