import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <nav>
        <NavLink to="/" end style={{ margin: "0 1rem", color: "#fff" }}>Home</NavLink>
        <NavLink to="/dashboard" style={{ margin: "0 1rem", color: "#fff" }}>Dashboard</NavLink>
        <NavLink to="/create-invoice" style={{ margin: "0 1rem", color: "#fff" }}>Create Invoice</NavLink>
        <NavLink to="/transactions" style={{ margin: "0 1rem", color: "#fff" }}>Transactions</NavLink>
        <NavLink to="/withdraw" style={{ margin: "0 1rem", color: "#fff" }}>Withdraw</NavLink>
        <NavLink to="/settings" style={{ margin: "0 1rem", color: "#fff" }}>Settings</NavLink>
      </nav>
    </header>
  );
}
