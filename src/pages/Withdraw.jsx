export default function Withdraw() {
  return (
    <div className="card">
      <h2>Withdraw Funds</h2>
      <p>Send your BTC balance to your wallet or bank-linked service.</p>
      <input type="text" placeholder="Destination BTC Address" />
      <button>Withdraw</button>
    </div>
  );
}
