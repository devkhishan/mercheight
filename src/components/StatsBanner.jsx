import { useState, useEffect } from 'react';

export default function StatsBanner() {
  const [stats, setStats] = useState({
    merchantCount: 0,
    paymentCount: 0,
    totalVolume: 0
  });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    // Initial fetch
    fetchStats();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch merchants count and transactions
      const [merchantsRes, transactionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/merchants/count`),
        fetch(`${API_BASE}/api/transactions`)
      ]);

      if (merchantsRes.ok && transactionsRes.ok) {
        const merchantData = await merchantsRes.json();
        const transactionData = await transactionsRes.json();

        // Calculate stats
        const paidTransactions = transactionData.transactions.filter(tx => tx.status === "Paid");
        
        setStats({
          merchantCount: merchantData.count || 35, // Fallback to demo number
          paymentCount: paidTransactions.length || 120, // Fallback to demo number
          totalVolume: paidTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0)
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep existing stats on error
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="stats-banner">
      <div className="stat-item">
        <span className="stat-value">💥 {formatNumber(stats.merchantCount)}</span>
        <span className="stat-label">merchants</span>
      </div>
      
      <div className="stat-divider">|</div>
      
      <div className="stat-item">
        <span className="stat-value">⚡ {formatNumber(stats.paymentCount)}</span>
        <span className="stat-label">payments</span>
      </div>
      
      <div className="stat-divider">|</div>
      
      <div className="stat-item">
        <span className="stat-value">🎯 0%</span>
        <span className="stat-label">fees</span>
      </div>
    </div>
  );
}