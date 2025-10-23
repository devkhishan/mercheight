import { useState } from "react";

export default function Withdraw() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const [bolt11, setBolt11] = useState("");
  const [message, setMessage] = useState("");

  const handleWithdraw = async () => {
    const res = await fetch(`${API_BASE}/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bolt11 }),
    });
    const data = await res.json();
    setMessage(data.success ? "Payment sent!" : "Error: " + data.error);
  };

  return (
    <div className="card page">
      <h1>Withdraw / Pay Invoice</h1>
      <input
        type="text"
        placeholder="Bolt11 Invoice"
        value={bolt11}
        onChange={e => setBolt11(e.target.value)}
      />
      <button onClick={handleWithdraw}>Send Payment</button>
      {message && <p>{message}</p>}
    </div>
  );
}
