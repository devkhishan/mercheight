import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from "recharts";
import BitcoinPriceChart from "../components/BitcoinPriceChart";

// Dummy data for offline demo
const DEMO_DATA = {
  merchantName: "Fatou's Shop",
  isOnline: true,
  metrics: {
    totalEarnings: 250000, // in sats
    paymentsToday: 12,
    pendingInvoices: 3,
    availableBalance: 180000 // in sats
  },
  recentTransactions: [
    { id: "tx1", date: new Date(), amount: 50000, status: "Paid", hash: "abc123" },
    { id: "tx2", date: new Date(), amount: 30000, status: "Pending", hash: "def456" },
    { id: "tx3", date: new Date(), amount: 75000, status: "Paid", hash: "ghi789" }
  ],
  weeklyData: [
    { day: "Mon", payments: 8 },
    { day: "Tue", payments: 12 },
    { day: "Wed", payments: 5 },
    { day: "Thu", payments: 15 },
    { day: "Fri", payments: 10 },
    { day: "Sat", payments: 20 },
    { day: "Sun", payments: 18 }
  ]
};

// Status badge component
const StatusBadge = ({ isOnline }) => (
  <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
    {isOnline ? '🟢 Online' : '🔴 Offline'}
  </span>
);

// Metric card component
const MetricCard = ({ title, value, icon, secondaryValue }) => (
  <div className="metric-card">
    <div className="metric-icon">{icon}</div>
    <div className="metric-content">
      <h3>{title}</h3>
      <div className="metric-value">{value}</div>
      {secondaryValue && (
        <div className="metric-secondary">{secondaryValue}</div>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const RATE_XOF = import.meta.env.VITE_DEFAULT_RATE_XOF_PER_BTC || 35000000;
  
  const [data, setData] = useState(DEMO_DATA);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Fetch recent transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/invoices`);
        const data = await response.json();
        if (data.success) {
          setTransactions(data.invoices);
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      }
    };

    fetchTransactions();
  }, []);

  // Format sats to XOF
  const satsToXOF = (sats) => {
    return Math.round((sats * RATE_XOF) / 100000000).toLocaleString() + " XOF";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [merchantProfileRes, transactionsRes] = await Promise.all([
          fetch(`${API_BASE}/api/merchants/profile`),
          fetch(`${API_BASE}/api/transactions`)
        ]);

        if (!merchantProfileRes.ok || !transactionsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const merchantData = await merchantProfileRes.json();
        const transactionsData = await transactionsRes.json();

        // Process the data
        const processedData = {
          merchantName: merchantData.profile.name,
          isOnline: merchantData.profile.isOnline,
          metrics: {
            totalEarnings: transactionsData.stats.totalEarnings,
            paymentsToday: transactionsData.stats.paymentsToday,
            pendingInvoices: transactionsData.stats.pendingInvoices,
            availableBalance: merchantData.profile.balance || 0
          },
          recentTransactions: transactionsData.transactions.slice(0, 5), // Show only last 5
          weeklyData: transactionsData.stats.weeklyData
        };

        setData(processedData);

        // Add notification for new transactions if any
        const newTransactions = transactionsData.transactions.filter(tx => 
          tx.status === "Paid" && new Date(tx.date) > new Date(Date.now() - 30000)
        );
        
        newTransactions.forEach(tx => {
          addNotification(`Payment received: ${tx.amount} sats`, 'success');
        });

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Using demo data for now.');
        // Keep using demo data on error
        setData(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchDashboardData();
    
    // Set up periodic refresh
    const interval = setInterval(fetchDashboardData, 30000);

    // Set up WebSocket connection for real-time updates (if available)
    const wsUrl = `ws://${API_BASE.replace('http://', '')}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'PAYMENT_RECEIVED') {
        addNotification(`New payment received: ${update.amount} sats`, 'success');
        fetchDashboardData(); // Refresh data
      }
    };

    ws.onerror = () => {
      console.log('WebSocket connection failed, falling back to polling');
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  // Add a notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">⚡</div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header Section */}
      <section className="dashboard-header">
        <div className="merchant-welcome">
          <h1>👋 Welcome back, {data.merchantName}!</h1>
          <StatusBadge isOnline={data.isOnline} />
        </div>
        <Link to="/create-invoice" className="create-invoice-btn">
          + Create Invoice
        </Link>
      </section>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <section className="metrics-grid">
        <MetricCard
          title="Total Earnings"
          value={`${data.metrics.totalEarnings.toLocaleString()} sats`}
          secondaryValue={satsToXOF(data.metrics.totalEarnings)}
          icon="💰"
        />
        <MetricCard
          title="Payments Today"
          value={data.metrics.paymentsToday}
          secondaryValue="transactions"
          icon="⚡"
        />
        <MetricCard
          title="Pending Invoices"
          value={data.metrics.pendingInvoices}
          secondaryValue="awaiting payment"
          icon="🧾"
        />
        <MetricCard
          title="Available Balance"
          value={`${data.metrics.availableBalance.toLocaleString()} sats`}
          secondaryValue={satsToXOF(data.metrics.availableBalance)}
          icon="🪙"
        />
      </section>

      {/* Recent Transactions */}
      <section className="transactions-section card">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Recent Transactions</h2>
          <Link to="/transactions" className="view-all-link" style={{ color: '#f7931a', textDecoration: 'none', fontSize: '0.9rem' }}>
            View All →
          </Link>
        </div>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map(tx => (
                <tr key={tx.id} className={`status-${tx.paid ? 'paid' : 'pending'}`}>
                  <td>{dayjs(tx.createdAt).format('MMM D, HH:mm')}</td>
                  <td>
                    <div>{tx.amount.toLocaleString()} sats</div>
                    <div className="secondary-text">
                      {satsToXOF(tx.amount)}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${tx.paid ? 'paid' : 'pending'}`}>
                      {tx.paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <code className="hash" onClick={() => {
                      navigator.clipboard.writeText(tx.id);
                      addNotification('Transaction ID copied to clipboard!');
                    }}>
                      {tx.id.substring(0, 8)}...
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        {/* Bitcoin Price Chart */}
        <BitcoinPriceChart currency="xof" />

        {/* Weekly Activity */}
        <div className="chart-card card">
          <h3>Weekly Activity</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="payments" fill="#f7931a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions card">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/withdraw" className="action-button">
            💸 Withdraw Funds
          </Link>
          <Link to="/settings" className="action-button">
            ⚙️ Settings
          </Link>
          <button onClick={() => addNotification('Tutorial coming soon!')} className="action-button">
            📘 View Tutorial
          </button>
        </div>
      </section>
    </div>
  );
}
