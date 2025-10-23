export default function CreateInvoice() {
  return (
    <div className="card">
      <h2>Create Invoice</h2>
      <p>Generate a Lightning payment QR for your customer.</p>
      <input type="number" placeholder="Enter amount in XOF" />
      <button>Create</button>
    </div>
  );
}
