import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

interface MarketDataState {
  euaPrice: number;
  euaSource: string;
  euaMetadata: any;
  fuelPrices: any[];
  loading: boolean;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

const MarketData: React.FC = () => {
  const [data, setData] = useState<MarketDataState>({
    euaPrice: 76.0,
    euaSource: 'LOADING',
    euaMetadata: {},
    fuelPrices: [],
    loading: true,
  });
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  // Map port codes to full names
  const getPortFullName = (portCode: string): string => {
    const portNames: { [key: string]: string } = {
      'JKM': 'JKM (Japan-Korea Marker)',
      'SINGAPORE': 'Singapore',
      'ROTTERDAM': 'Rotterdam',
      'HOUSTON': 'Houston',
      'FUJAIRAH': 'Fujairah',
      'ANTWERP': 'Antwerp'
    };
    return portNames[portCode] || portCode;
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch EUA price
        const euaResponse = await fetch(`${API_BASE_URL}/trading/api/market/eua`);
        const euaData = await euaResponse.json();
        
        // Fetch ALL fuel prices (we'll filter client-side)
        const fuelResponse = await fetch(`${API_BASE_URL}/trading/api/market/fuel`);
        const fuelData = await fuelResponse.json();

        // Extract unique ports from fuel price data
        const allFuelPrices = fuelData.data || [];
        const portsSet = new Set<string>();
        
        allFuelPrices.forEach((fuel: any) => {
          const port = fuel.metadata?.port || fuel.metadata?.index || 'UNKNOWN';
          portsSet.add(port);
        });

        const ports = Array.from(portsSet).sort();
        
        // Set available ports and select first one if none selected
        setAvailablePorts(ports);
        if (!selectedPort && ports.length > 0) {
          setSelectedPort(ports[0]);
        }

        // Filter fuel prices by selected port (or show all if no port selected)
        const portFilteredPrices = selectedPort 
          ? allFuelPrices.filter((fuel: any) => {
              const fuelPort = fuel.metadata?.port || fuel.metadata?.index || 'UNKNOWN';
              return fuelPort === selectedPort;
            })
          : allFuelPrices;

        setData({
          euaPrice: parseFloat(euaData.data.price),
          euaSource: euaData.data.source,
          euaMetadata: euaData.data.metadata,
          fuelPrices: portFilteredPrices,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching market data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMarketData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, [selectedPort]);

  // Fetch marine market news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (!NEWS_API_KEY) {
          console.warn('⚠️ NEWS_API_KEY not configured. Please add VITE_NEWS_API_KEY to your .env file');
          console.info('Get a free API key at: https://newsapi.org/register');
          setNewsItems([]);
          return;
        }

        // Fetch LIVE news from NewsAPI - Multiple queries for comprehensive maritime coverage
        const queries = [
          'shipping carbon emissions',
          'maritime fuel market',
          'EUA futures trading',
          'bunker fuel prices',
          'FuelEU maritime regulation',
          'IMO emissions regulations'
        ];

        let allArticles: any[] = [];
        
        // Fetch from each query to get diverse maritime/trading news
        for (const query of queries) {
          try {
            const response = await fetch(
              `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`
            );
            
            if (!response.ok) {
              console.error(`NewsAPI HTTP error: ${response.status}`);
              continue;
            }

            const newsData = await response.json();
            
            if (newsData.status === 'error') {
              console.error('NewsAPI error:', newsData.message);
              if (newsData.code === 'apiKeyInvalid') {
                console.error('Invalid API key. Please check your VITE_NEWS_API_KEY in .env');
              }
              continue;
            }

            if (newsData.articles && newsData.articles.length > 0) {
              allArticles = [...allArticles, ...newsData.articles];
            }
          } catch (err) {
            console.error(`Error fetching news for query "${query}":`, err);
          }
        }

        // Remove duplicates based on URL
        const uniqueArticles = allArticles.filter((article, index, self) =>
          index === self.findIndex(a => a.url === article.url)
        );

        // Sort by date (most recent first) and take top 8
        const sortedArticles = uniqueArticles
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 8);

        if (sortedArticles.length > 0) {
          setNewsItems(
            sortedArticles.map((article: any) => ({
              title: article.title,
              description: article.description || article.content?.substring(0, 200) + '...' || 'Read more at source',
              url: article.url,
              publishedAt: article.publishedAt,
              source: article.source.name
            }))
          );
          console.log(`✅ Loaded ${sortedArticles.length} live maritime news articles`);
        } else {
          console.warn('No maritime news articles found from NewsAPI');
          setNewsItems([]);
        }
      } catch (error) {
        console.error('Error fetching live news:', error);
        setNewsItems([]);
      }
    };

    fetchNews();
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 1800000);
    return () => clearInterval(interval);
  }, []);

  const getSourceBadgeColor = (source: string) => {
    if (source.includes('FREE') || source.includes('ALPHAVANTAGE')) return 'bg-green-500';
    if (source.includes('CACHE') || source.includes('MARKET_BASED')) return 'bg-yellow-500';
    if (source.includes('FALLBACK')) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Market Data
        </h1>
        <p className="text-text-secondary">
          Real-time market data from free-tier APIs: EEX Free & Alpha Vantage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">EU ETS Market</h3>
            <span className={`text-xs px-2 py-1 rounded ${getSourceBadgeColor(data.euaSource)} text-white`}>
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
              <span className="font-semibold text-success">
                {data.euaMetadata?.change ? `${data.euaMetadata.change > 0 ? '+' : ''}${data.euaMetadata.change.toFixed(2)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Volume</span>
              <span className="font-semibold text-text-primary">
                {data.euaMetadata?.volume ? `${(data.euaMetadata.volume / 1000).toFixed(1)}K tCO₂` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Contract</span>
              <span className="font-semibold text-text-primary">
                {data.euaMetadata?.contract || data.euaMetadata?.product || 'Spot'}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-text-primary">Marine Fuel Prices</h3>
              <span className={`text-xs px-2 py-1 rounded ${getSourceBadgeColor(data.fuelPrices.length > 0 ? data.fuelPrices[0]?.source : '')} text-white`}>
                {data.fuelPrices.length > 0 ? data.fuelPrices[0]?.source : 'LOADING'}
              </span>
            </div>
            {/* Port Selection Dropdown - Only showing ports with available data */}
            <div className="mb-3">
              <label className="text-xs text-text-muted mb-1 block">
                Bunkering Port ({availablePorts.length} available)
              </label>
              <select
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-subtle text-text-primary rounded-md focus:outline-none focus:border-primary transition-colors"
                disabled={availablePorts.length === 0}
              >
                {availablePorts.length === 0 ? (
                  <option value="">Loading ports...</option>
                ) : (
                  availablePorts.map((port) => (
                    <option key={port} value={port}>
                      {getPortFullName(port)}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {data.loading ? (
              <div className="text-center text-text-secondary">Loading fuel prices...</div>
            ) : data.fuelPrices.length === 0 ? (
              <div className="text-center text-text-secondary py-4">
                No fuel prices available for {selectedPort}
              </div>
            ) : (
              data.fuelPrices.map((fuel: any, idx: number) => {
                const fuelPort = fuel.metadata?.port || fuel.metadata?.index || selectedPort;
                return (
                  <div key={idx} className="flex justify-between items-center p-2 bg-subtle/30 rounded">
                    <div className="flex flex-col">
                      <span className="text-text-secondary text-sm font-medium">
                        {fuel.dataType.replace('FUEL_', '').replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-text-muted">
                        📍 {getPortFullName(fuelPort)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {fuel.currency === 'EUR' ? '€' : '$'}{fuel.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-text-muted">/tonne</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Market Trends</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">EU ETS Trend</span>
              <span className="font-semibold text-success">Bullish</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">FuelEU Trend</span>
              <span className="font-semibold text-warning">Neutral</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Volatility</span>
              <span className="font-semibold text-text-primary">Medium</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Liquidity</span>
              <span className="font-semibold text-success">High</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Market Sentiment</span>
              <span className="font-semibold text-success">Positive</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Live Data Sources</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-subtle rounded-lg">
              <div className="text-2xl font-bold text-primary">€{data.euaPrice.toFixed(2)}</div>
              <div className="text-sm text-text-secondary">Current EUA Price</div>
            </div>
            <div className="text-center p-4 bg-subtle rounded-lg">
              <div className="text-2xl font-bold text-success">
                {data.fuelPrices.length}
              </div>
              <div className="text-sm text-text-secondary">Fuel Types</div>
            </div>
            <div className="text-center p-4 bg-subtle rounded-lg">
              <div className="text-2xl font-bold text-green-500">FREE</div>
              <div className="text-sm text-text-secondary">API Tier</div>
            </div>
          </div>
          <div className="text-sm text-text-secondary text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>EEX Free (Public CSV)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Alpha Vantage (500/day)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Market News</h3>
          <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
            {NEWS_API_KEY ? 'NewsAPI' : 'Curated'}
          </span>
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {newsItems.length > 0 ? (
            newsItems.map((news, idx) => {
              const icon = idx === 0 ? '📈' : idx === 1 ? '⚖️' : idx === 2 ? '🔄' : idx === 3 ? '🌊' : '📰';
              const timeSince = (publishedAt: string) => {
                const now = new Date().getTime();
                const published = new Date(publishedAt).getTime();
                const diff = Math.floor((now - published) / 1000); // seconds
                
                if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
                return `${Math.floor(diff / 86400)} days ago`;
              };
              
              return (
                <a
                  key={idx}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start p-4 bg-card border border-subtle rounded-lg hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="text-2xl mr-3 flex-shrink-0">{icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                      {news.title}
                    </div>
                    {news.description && (
                      <div className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {news.description}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-text-muted">{timeSince(news.publishedAt)}</span>
                      <span className="text-xs px-2 py-0.5 bg-subtle rounded text-text-muted">
                        {news.source}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 text-text-muted group-hover:text-primary transition-colors">
                    →
                  </div>
                </a>
              );
            })
          ) : (
            <div className="text-center text-text-secondary py-8">
              <div className="text-4xl mb-4">📰</div>
              {NEWS_API_KEY ? (
                <>
                  <p className="font-medium">No maritime news available at the moment</p>
                  <p className="text-xs mt-2 text-text-muted">News will refresh every 30 minutes</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-yellow-400">News API Not Configured</p>
                  <p className="text-xs mt-2 text-text-muted">Add VITE_NEWS_API_KEY to your .env file</p>
                  <a 
                    href="https://newsapi.org/register" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded transition-colors"
                  >
                    Get Free API Key →
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">Market Analysis</div>
            <div className="text-sm opacity-80">Analyze market trends</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Price Alerts</div>
            <div className="text-sm text-text-secondary">Set price alerts</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Market Report</div>
            <div className="text-sm text-text-secondary">Generate market report</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default MarketData;