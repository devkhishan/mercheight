import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
  const RATE_XOF = import.meta.env.VITE_DEFAULT_RATE_XOF_PER_BTC || 35000000;
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invoicesRes, transactionsRes] = await Promise.all([
          fetch(`${API_BASE}/api/invoices`),
          fetch(`${API_BASE}/api/transactions`)
        ]);

        if (!invoicesRes.ok || !transactionsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const invoicesData = await invoicesRes.json();
        const transactionsData = await transactionsRes.json();

        if (invoicesData.success) setInvoices(invoicesData.invoices);
        if (transactionsData.success) setTransactions(transactionsData.transactions);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load dashboard data. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalReceived = transactions.filter(t => t.status === "Paid").reduce((acc, t) => acc + t.amount, 0);

  if (loading) {
    return (
      <div className="page">
        <div className="card">
          <h2>Loading dashboard data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Total Received: {totalReceived} sats</h2>
        <p>≈ {(totalReceived * RATE_XOF / 100000000).toLocaleString()} XOF</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Recent Invoices</h2>
          <Link to="/create-invoice" className="button" style={{ textDecoration: 'none' }}>
            Create Invoice
          </Link>
        </div>
        
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p>No invoices yet. Create your first invoice to get started!</p>
          </div>
        ) : (
          <div className="invoice-list">
            {invoices.map(inv => (
              <div key={inv.id} className="invoice-item" style={{ 
                padding: '1rem',
                marginTop: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <div><strong>ID:</strong> {inv.id}</div>
                <div><strong>Amount:</strong> {inv.amount} sats</div>
                <div>
                  <strong>Status:</strong> 
                  <span style={{ 
                    color: inv.paid ? '#2ecc71' : '#e67e22',
                    fontWeight: 'bold'
                  }}>
                    {inv.paid ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
