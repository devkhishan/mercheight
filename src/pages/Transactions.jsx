import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function Transactions() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/transactions`)
      .then(res => res.json())
      .then(d => d.success && setTransactions(d.transactions));
  }, []);

  return (
    <div className="card page">
      <h1>Transactions Ledger</h1>
      {transactions.length === 0 && <p>No transactions yet.</p>}
      {transactions.map(tx => (
        <div key={tx.id} style={{ marginBottom: "1rem" }}>
          <p><strong>Amount:</strong> {tx.amount} sats</p>
          <p><strong>Status:</strong> {tx.status}</p>
          <p><strong>Date:</strong> {dayjs(tx.date.toDate ? tx.date.toDate() : tx.date).format("DD/MM/YYYY HH:mm")}</p>
          {tx.invoice && <p>Invoice: {tx.invoice}</p>}
          <hr />
        </div>
      ))}
    </div>
  );
}
