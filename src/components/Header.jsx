import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <h2>KassoLightning ⚡</h2>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/create-invoice">Create Invoice</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/withdraw">Withdraw</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </header>
  );
}
