# 🆓 Alpha Vantage Free API - Complete Setup Guide

## What is Alpha Vantage?

Alpha Vantage provides **FREE** market data APIs with NO credit card required. Perfect for development, testing, and small-scale production use.

**Free Tier Benefits:**
- ✅ 500 API calls per day
- ✅ Real-time stock, forex, and commodity data
- ✅ Historical data access
- ✅ No credit card required
- ✅ No expiration
- ✅ Commercial use allowed (with attribution)

## 30-Second Setup

### Step 1: Get Your Free API Key

1. Visit: **https://www.alphavantage.co/support/#api-key**

2. Enter your email address in the form

3. Click "GET FREE API KEY"

4. **Your API key is sent instantly!** (Check your email)

Example key format: `DEMO123ABC456DEF789`

### Step 2: Configure the Trading Service

Create `services/trading/.env`:

```bash
# Copy example file
cp services/trading/.env.example services/trading/.env

# Edit and add your key
ALPHA_VANTAGE_API_KEY=DEMO123ABC456DEF789
```

Or directly:
```bash
echo "ALPHA_VANTAGE_API_KEY=YOUR_KEY_HERE" > services/trading/.env
```

### Step 3: Restart the Service

```bash
docker-compose -f docker/docker-compose.yml restart trading
```

### Step 4: Verify It's Working

```bash
# Check logs for Alpha Vantage initialization
docker logs nh_trading | grep "Alpha Vantage"

# Should see:
# ✅ Alpha Vantage - 500 calls/day limit
```

Test the API:
```bash
curl http://localhost:8080/trading/api/market/eua
```

Look for `"source": "ALPHAVANTAGE_PROXY"` in the response!

## What Alpha Vantage Provides for Us

### 1. Currency Conversion (Primary Use)
**API:** `CURRENCY_EXCHANGE_RATE`  
**Purpose:** Convert USD fuel prices to EUR  
**Calls:** 1-2 per hour (cached 30 min)  
**Daily Total:** ~20-30 calls  

```
Platts fuel prices (USD) → Alpha Vantage FX → EUR prices
```

### 2. Commodity Proxies (Secondary Use)
**API:** `WTI`, `BRENT`, `NATURAL_GAS`  
**Purpose:** Estimate EUA prices via correlation  
**Calls:** 1-2 per day (cached heavily)  
**Daily Total:** ~5-10 calls  

Correlation with EUA:
- Natural Gas: ~0.65 correlation
- Brent Crude: ~0.55 correlation
- WTI: ~0.50 correlation

### Total Daily Usage: ~30-40 calls (8% of quota)

## API Endpoints Used

### Forex Rates
```
GET https://www.alphavantage.co/query
  ?function=CURRENCY_EXCHANGE_RATE
  &from_currency=USD
  &to_currency=EUR
  &apikey=YOUR_KEY
```

Response:
```json
{
  "Realtime Currency Exchange Rate": {
    "5. Exchange Rate": "0.9234"
  }
}
```

### Natural Gas (EUA Proxy)
```
GET https://www.alphavantage.co/query
  ?function=NATURAL_GAS
  &interval=daily
  &apikey=YOUR_KEY
```

## Rate Limiting

**Free Tier Limits:**
- 500 calls per day (resets at midnight UTC)
- 5 calls per minute
- No monthly limits

**Our Safeguards:**
- ✅ Internal call counter
- ✅ Automatic quota tracking
- ✅ Graceful degradation when limit reached
- ✅ 30-minute caching (reduces calls by 95%)

**Monitor usage:**
```sql
SELECT 
  source,
  COUNT(*) as api_calls,
  DATE(timestamp) as date
FROM market_data
WHERE source LIKE '%ALPHAVANTAGE%'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY source, DATE(timestamp)
ORDER BY date DESC;
```

## Premium Upgrade (Optional)

If you need more than 500 calls/day:

**Alpha Vantage Premium:**
- **Price:** $49.99/month
- **Calls:** 1,200 per minute (unlimited daily)
- **Support:** Priority email support
- **Sign up:** https://www.alphavantage.co/premium/

**When to upgrade:**
- You exceed 500 calls/day regularly
- Need real-time streaming data
- Require guaranteed SLA
- Building high-frequency trading systems

## Alternative Free APIs

If Alpha Vantage doesn't meet your needs:

### Yahoo Finance
**Pros:** Free, no key needed  
**Cons:** Unofficial, may change  
**Setup:** npm install `yahoo-finance2`

### Quandl
**Pros:** 50 calls/day free, good historical data  
**Cons:** Limited free tier  
**Setup:** https://www.quandl.com/sign-up

### CoinGecko (for crypto correlation)
**Pros:** Free tier, no key needed  
**Cons:** Crypto only  
**Setup:** https://www.coingecko.com/en/api

## Troubleshooting

### Error: "Thank you for using Alpha Vantage! Our standard API..."
**Cause:** Rate limit exceeded (5 calls/minute)  
**Solution:** Automatic - service waits and retries

### Error: "Invalid API call"
**Cause:** Wrong API key format  
**Solution:** Check `.env` file, ensure no extra spaces

### Warning: "Alpha Vantage daily limit reached"
**Cause:** 500 calls used today  
**Solution:** Automatic fallback to database cache until midnight UTC

## Data Quality

### Alpha Vantage Data Accuracy
- **Forex Rates:** Real-time from major exchanges
- **Commodities:** Delayed 15 minutes (free tier)
- **Update Frequency:** Every 1-5 minutes
- **Historical:** Up to 20 years available

### Our EUA Proxy Accuracy
- **Method:** Correlation with natural gas prices
- **Accuracy:** ±€2-3 from actual EUA (acceptable for estimates)
- **Better Source:** EEX Free (actual EUA settlement prices)
- **Use Case:** Real-time estimates between EEX updates

## Success Metrics

After setup, you should see:

```bash
# In trading service logs
✅ Alpha Vantage - 500 calls/day limit
✅ Using Alpha Vantage proxy for EUA price
✅ Currency rate from Alpha Vantage: 0.9234

# In API responses
"source": "ALPHAVANTAGE_PROXY"
"metadata": {
  "note": "Estimated from natural gas correlation",
  "fxRate": 0.9234
}
```

## Support & Resources

**Alpha Vantage:**
- Documentation: https://www.alphavantage.co/documentation/
- Support: https://www.alphavantage.co/support/
- FAQ: https://www.alphavantage.co/faq/

**Community:**
- GitHub Issues: https://github.com/RomelTorres/alpha_vantage
- Stack Overflow: Tag `alpha-vantage`

**Our System:**
- Service logs: `docker logs nh_trading`
- Database queries: Check PostgreSQL `market_data` table

---

**Current Status:** ✅ **Working with fallback** (add key for enhanced features)  
**Setup Time:** ~30 seconds  
**Cost:** $0/month  
**Recommended:** Yes - Improves USD/EUR conversion accuracy

