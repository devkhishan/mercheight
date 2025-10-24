import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import dayjs from 'dayjs';

export default function BitcoinPriceChart({ currency = 'usd' }) {
  // Convert USD prices to XOF (1 USD ≈ 600 XOF)
  const USD_TO_XOF_RATE = 600;
  const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp'];
  
  const getApiCurrency = (curr) => {
    // Always fetch in USD if currency is not supported
    return SUPPORTED_CURRENCIES.includes(curr.toLowerCase()) ? curr : 'usd';
  };

  const convertPrice = (price, fromCurrency, toCurrency) => {
    if (fromCurrency === 'usd' && toCurrency === 'xof') {
      return price * USD_TO_XOF_RATE;
    }
    return price;
  };
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [error, setError] = useState(null);

  const fetchPriceData = async () => {
    try {
      const apiCurrency = getApiCurrency(currency);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${apiCurrency}&days=7&interval=daily`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }

      const data = await response.json();
      
      // Transform the data for Recharts
      const formattedData = data.prices.map(([timestamp, price]) => ({
        date: dayjs(timestamp).format('MMM D'),
        price: Math.round(price),
        timestamp
      }));

      setPriceData(formattedData);
      setCurrentPrice(formattedData[formattedData.length - 1].price);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Bitcoin price:', err);
      setError('Unable to load price data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
    // Refresh price data every 5 minutes
    const interval = setInterval(fetchPriceData, 300000);
    return () => clearInterval(interval);
  }, [currency]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="price-chart-loading">
        Loading price data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="price-chart-error">
        {error}
      </div>
    );
  }

  return (
    <div className="bitcoin-price-chart card">
      <div className="chart-header">
        <div>
          <h3>📈 Bitcoin Price Trend (Last 7 Days)</h3>
          {currentPrice && (
            <div className="current-price">
              Current Price: {formatPrice(currentPrice)}
            </div>
          )}
        </div>
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value)}
          className="currency-selector"
        >
          <option value="usd">USD</option>
          <option value="xof">XOF</option>
          <option value="ngn">NGN</option>
        </select>
      </div>

      <div className="chart-container" style={{ width: '100%', height: '300px', minWidth: '0', minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={priceData}
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#666"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatPrice(value)}
            />
            <Tooltip 
              formatter={(value) => [formatPrice(value), "Price"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#f7931a" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}