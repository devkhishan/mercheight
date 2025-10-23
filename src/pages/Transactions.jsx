import dayjs from "dayjs";

export default function Transactions() {
  const sampleTx = [
    { id: 1, amount: "1500 XOF", date: "2025-10-23", status: "Paid" },
    { id: 2, amount: "2500 XOF", date: "2025-10-22", status: "Pending" },
  ];

  return (
    <div className="card">
      <h2>Transactions</h2>
      {sampleTx.map((tx) => (
        <div key={tx.id} style={{ margin: "0.5rem 0" }}>
          <strong>{tx.amount}</strong> — {tx.status} on{" "}
          {dayjs(tx.date).format("DD MMM YYYY")}
        </div>
      ))}
    </div>
  );
}
