import { useState, useEffect } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";

export default function CreateInvoice() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const [invoice, setInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [xofAmount, setXofAmount] = useState("");
  const BTC_RATE_XOF = 35000000; // 35M XOF per BTC

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/invoices`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  };
  
  // Convert XOF to satoshis
  const xofToSats = (xof) => {
    return Math.round((xof / BTC_RATE_XOF) * 100000000);
  };

  // Convert satoshis to XOF
  const satsToXof = (sats) => {
    return Math.round((sats * BTC_RATE_XOF) / 100000000);
  };

  const handleXofChange = (value) => {
    setXofAmount(value);
    if (value) {
      const sats = xofToSats(parseFloat(value));
      setAmount(sats.toString());
    } else {
      setAmount("");
    }
  };

  const createInvoice = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/invoices/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: parseInt(amount), 
          memo: `Payment of ${xofAmount} XOF` 
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create invoice');
      }

      const data = await res.json();
      if (data.success) {
        setInvoice(data.invoice);
        // Refresh the invoices list
        await fetchInvoices();
      } else {
        setError(data.message || 'Failed to create invoice');
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Failed to create invoice. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card page">
      <h2>Create Invoice</h2>
      <p>Generate a Lightning payment QR for your customer.</p>
      
      {error && (
        <div className="error" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <input
            type="number"
            placeholder="Enter amount in XOF"
            value={xofAmount}
            onChange={(e) => handleXofChange(e.target.value)}
            disabled={loading}
            style={{ marginBottom: '0.5rem' }}
          />
          <div className="conversion-info" style={{ fontSize: '0.9rem', color: '#666' }}>
            ≈ {amount} sats
          </div>
        </div>
        
        <button 
          onClick={createInvoice} 
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>

      {invoice && (
        <div className="invoice-display" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div className="invoice-details" style={{ marginBottom: '1rem' }}>
            <p><strong>Amount:</strong> {xofAmount} XOF (≈ {amount} sats)</p>
            <p><strong>Invoice ID:</strong> {invoice.id}</p>
          </div>
          
          <div className="qr-container" style={{ 
            background: '#fff', 
            padding: '1rem',
            borderRadius: '8px',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            <QRCode value={invoice.bolt11} size={200} />
          </div>
          
          <div className="bolt11" style={{ 
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            wordBreak: 'break-all',
            fontSize: '0.8rem',
            fontFamily: 'monospace'
          }}>
            {invoice.bolt11}
          </div>
        </div>
      )}

      {/* Recent Invoices List */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Recent Invoices</h3>
        <div className="invoices-list">
          {invoices.map(inv => (
            <div key={inv.id} className="invoice-item" style={{
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              <div><strong>Amount:</strong> {inv.amount} sats ({satsToXof(inv.amount)} XOF)</div>
              <div><strong>Status:</strong> {inv.paid ? 'Paid' : 'Pending'}</div>
              <div><strong>Created:</strong> {new Date(inv.createdAt).toLocaleString()}</div>
              <div><strong>Memo:</strong> {inv.memo}</div>
              <div style={{ wordBreak: 'break-all' }}><strong>Invoice:</strong> {inv.bolt11}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
