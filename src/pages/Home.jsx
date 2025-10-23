import { useState } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";

export default function Home() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ amount: parseInt(amount), memo: "Payment" }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create invoice');
      }

      const data = await res.json();
      if (data.success) {
        setInvoice(data.invoice);
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
      <h1>Generate Lightning Invoice ⚡</h1>
      
      {error && (
        <div className="error" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="number"
          placeholder="Amount in satoshis"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <button 
          onClick={createInvoice} 
          disabled={loading}
          style={{ marginLeft: '0.5rem' }}
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>

      {invoice && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p>Invoice ID: {invoice.id}</p>
          <QRCode value={invoice.bolt11} size={200} />
          <p style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
            {invoice.bolt11}
          </p>
        </div>
      )}
    </div>
  );
}
