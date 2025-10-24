import { useState, useRef } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { Link } from "react-router-dom";
import StatsBanner from "../components/StatsBanner";

export default function Home() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const demoSectionRef = useRef(null);
  const tutorialSectionRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section card">
        <h1>Accept Bitcoin in Seconds</h1>
        <p className="hero-tagline">
          Empowering local merchants to accept Bitcoin & Lightning payments instantly — no bank, no fees, no borders.
        </p>
        <p className="hero-subtext">
          A lightweight POS wallet for small businesses. Works offline. Built on Bitcoin ⚡
        </p>
        <div className="hero-buttons">
          <button onClick={() => scrollToSection(demoSectionRef)} className="primary-btn">
            Generate Lightning Invoice
          </button>
          <button onClick={() => scrollToSection(tutorialSectionRef)} className="secondary-btn">
            Learn How It Works
          </button>
          <Link to="/dashboard" className="tertiary-btn">
            Open Dashboard
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works card">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-icon">💰</div>
            <h3>Enter Amount</h3>
            <p>Set your price in local currency or satoshis</p>
          </div>
          <div className="step">
            <div className="step-icon">📱</div>
            <h3>Share QR Code</h3>
            <p>Show the generated QR code to your customer</p>
          </div>
          <div className="step">
            <div className="step-icon">⚡</div>
            <h3>Instant Payment</h3>
            <p>Customer pays via Bitcoin Lightning Network</p>
          </div>
          <div className="step">
            <div className="step-icon">✅</div>
            <h3>Confirmation</h3>
            <p>Get instant confirmation and track in Dashboard</p>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="why-it-matters card">
        <h2>Why It Matters</h2>
        <div className="impact-container">
          <div className="impact-story">
            <h3>Why We Built This</h3>
            <ul>
              <li>High mobile money fees eating into profits</li>
              <li>Local currency inflation affecting savings</li>
              <li>Unreliable internet limiting payment options</li>
            </ul>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <h4>💸 90% Cheaper</h4>
              <p>Than traditional mobile money transfers</p>
            </div>
            <div className="stat-card">
              <h4>🌍 Works Offline</h4>
              <p>Reliable in low-connectivity areas</p>
            </div>
            <div className="stat-card">
              <h4>🔐 Secure & Free</h4>
              <p>Open-source, Bitcoin-secure platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tutorial Section */}
      <section ref={tutorialSectionRef} className="tutorial card">
        <h2>Quick Start Guide</h2>
        <div className="tutorial-steps">
          <div className="tutorial-step">
            <h3>Step 1</h3>
            <p>Enter the amount and create an invoice</p>
          </div>
          <div className="tutorial-step">
            <h3>Step 2</h3>
            <p>Customer scans QR code with their Bitcoin wallet</p>
          </div>
          <div className="tutorial-step">
            <h3>Step 3</h3>
            <p>Receive instant payment confirmation</p>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section ref={demoSectionRef} className="demo-section card">
        <h2>Try It Now ⚡</h2>
        <p>Create a test invoice to see how it works</p>
        
        {error && (
          <div className="error" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <div className="invoice-generator">
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
            className="primary-btn"
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>

        {invoice && (
          <div className="invoice-display">
            <p>Invoice ID: {invoice.id}</p>
            <QRCode value={invoice.bolt11} size={200} />
            <p className="invoice-text">
              {invoice.bolt11}
            </p>
          </div>
        )}
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Start Accepting Bitcoin Today</h2>
          <p>It's fast, free, and secure.</p>
          <div className="cta-buttons">
            <Link to="/dashboard" className="primary-btn">
              Sign In as Merchant
            </Link>
            <a href="https://github.com/devkhishan/mercheight" 
               target="_blank" 
               rel="noopener noreferrer"
               className="secondary-btn">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <StatsBanner />

      {/* Footer */}
      <footer className="home-footer">
        <nav>
          <a href="#about">About</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
          <a href="https://github.com/devkhishan/mercheight">GitHub</a>
          <a href="https://bitcoin.org">Bitcoin.org</a>
        </nav>
      </footer>
    </div>
  );
}
