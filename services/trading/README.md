# Trading Service - External Market Data Integration

This service integrates with multiple external market data providers to fetch real-time pricing for:
- **EUA (European Union Allowances)** - Carbon credits
- **Marine Fuels** - VLSFO, MGO, LNG, Biofuels, E-Methanol
- **Trading Opportunities** - RFQs, Offers, Portfolio management

## Supported Data Providers

### 1. ICE (Intercontinental Exchange) - Primary EUA Source
**Provider:** ICE Futures Europe  
**Coverage:** EUA carbon credit futures and options  
**Website:** https://www.theice.com/market-data  

**Features:**
- Real-time EUA futures prices (DEC25, MAR26, etc.)
- Historical price data
- Volume and open interest
- Bid/Ask spreads

**API Access:**
1. Register for ICE Market Data account
2. Subscribe to Environmental Markets feed
3. Obtain API credentials
4. Add `ICE_API_KEY` to `.env` file

### 2. EEX (European Energy Exchange) - Secondary EUA Source
**Provider:** EEX Power Derivatives  
**Coverage:** EUA spot and futures markets  
**Website:** https://www.eex.com/en/market-data  

**Features:**
- EUA spot prices
- Futures contracts
- Auction results
- Delivery periods

**API Access:**
1. Register on EEX Transparency Platform
2. Request API credentials
3. Add `EEX_API_KEY` to `.env` file

### 3. Platts (S&P Global) - Marine Fuel Benchmarks
**Provider:** S&P Global Commodity Insights  
**Coverage:** Global marine fuel prices  
**Website:** https://www.spglobal.com/commodityinsights  

**Features:**
- VLSFO prices (Singapore, Rotterdam, Houston)
- MGO/MDO distillate prices
- LNG bunker prices (JKM index)
- Biofuel and alternative fuel assessments

**API Access:**
1. Contact S&P Global sales team
2. Subscribe to Marine & Shipping bundle
3. Obtain API key (appkey)
4. Add `PLATTS_API_KEY` to `.env` file

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
```env
# ICE Configuration
ICE_API_KEY=your_ice_api_key_here
ICE_API_URL=https://www.theice.com/marketdata/reports

# EEX Configuration  
EEX_API_KEY=your_eex_api_key_here
EEX_API_URL=https://www.eex.com/api/v1

# Platts Configuration
PLATTS_API_KEY=your_platts_api_key_here
PLATTS_API_URL=https://api.platts.com/v1
```

## API Endpoints

### Market Data

**GET** `/api/market/eua`  
Fetch current EUA price from ICE or EEX

Response:
```json
{
  "code": "SUCCESS",
  "data": {
    "price": "74.25",
    "timestamp": "2025-11-03T16:00:00Z",
    "source": "ICE_FUTURES",
    "metadata": {
      "contract": "DEC25",
      "volume": 285000,
      "change": -1.75,
      "changePercent": -2.3,
      "bid": 74.10,
      "ask": 74.40
    }
  }
}
```

**GET** `/api/market/fuel`  
Fetch current marine fuel prices from Platts

Response:
```json
{
  "code": "SUCCESS",
  "data": [
    {
      "dataType": "FUEL_VLSFO",
      "price": 650.00,
      "currency": "USD",
      "source": "PLATTS",
      "metadata": {
        "port": "SINGAPORE",
        "grade": "0.5%S"
      }
    }
  ]
}
```

**GET** `/api/market/history?dataType=EUA&days=30`  
Fetch historical market data

## Data Flow & Fallback Strategy

The service implements a **3-tier fallback mechanism**:

1. **Primary:** External API (ICE/EEX/Platts)
   - Real-time data with authentication
   - 5-15 minute cache to reduce API calls
   
2. **Secondary:** Database cache
   - Previously fetched data stored in PostgreSQL
   - Used when API is temporarily unavailable
   
3. **Tertiary:** Synthetic data generator
   - Realistic simulated data based on market ranges
   - Ensures service always returns data

```
Request → ICE API → Success? → Return & Cache → Database
                  ↓ Failure
                  EEX API → Success? → Return & Cache → Database
                          ↓ Failure
                          Database Cache → Found? → Return
                                         ↓ Not Found
                                         Synthetic Generator → Return
```

## Data Refresh Schedule

Market data is automatically refreshed:
- **EUA Prices:** Every 5 minutes (during market hours)
- **Fuel Prices:** Every 15 minutes
- **Historical Data:** Daily batch update

## Error Handling

All adapters include:
- ✅ Connection timeout (10s)
- ✅ Automatic retry with exponential backoff
- ✅ Graceful degradation to fallback sources
- ✅ Detailed error logging
- ✅ Cache invalidation on error

## Testing Without API Keys

The service works **without API keys** by using:
1. Database-cached data (if available)
2. Realistic synthetic data generator

This allows development and testing without requiring paid API subscriptions.

## Cost Considerations

### ICE Market Data
- **Pricing:** $1,500 - $3,000/month for real-time feed
- **Alternative:** End-of-day data (~$500/month)
- **Trial:** 30-day free trial available

### Platts
- **Pricing:** Custom pricing, typically $2,000 - $5,000/month
- **Bundle:** Marine & Shipping bundle recommended
- **Trial:** Contact sales for demo access

### EEX
- **Pricing:** Free for basic data, premium for real-time
- **API Access:** Registration required

## Free/Open Alternatives

If commercial APIs are not feasible, consider:

1. **Yahoo Finance** - Free, limited EUA data
2. **Alpha Vantage** - Free tier available (500 calls/day)
3. **Quandl** - Free datasets for historical data
4. **European Commission** - Free EUA auction data

## Implementation Status

✅ ICE Adapter - Implemented with fallback  
✅ EEX Adapter - Implemented with fallback  
✅ Platts Adapter - Implemented with fallback  
✅ Market Data Service - Unified interface  
✅ Controller Integration - Active  
✅ Database Caching - Active  
✅ Error Handling - Comprehensive  

## Monitoring & Alerts

Monitor adapter health:
```sql
-- Check last successful API fetch
SELECT source, MAX(timestamp) as last_update
FROM market_data
GROUP BY source
ORDER BY last_update DESC;

-- Check data freshness
SELECT data_type, timestamp, source
FROM market_data
WHERE timestamp < NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

## Security Best Practices

⚠️ **Never commit API keys to version control**

- Use environment variables only
- Rotate keys regularly (quarterly)
- Monitor API usage for anomalies
- Use read-only credentials where possible
- Implement rate limiting to prevent abuse

## Support

For issues with external data providers:
- ICE Support: https://www.theice.com/support
- Platts Support: https://www.spglobal.com/commodityinsights/en/support
- EEX Support: https://www.eex.com/en/about/contact

For service issues, check logs:
```bash
docker logs nh_trading --tail 50
```

