import React, { useState } from "react";
import WalletLogin from "./WalletLogin";
import FileUploader from "./FileUploader";
import AdminDashboard from "./AdminDashboard";
import './App.css';
function App() {
  const [account, setAccount] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false); // <-- toggle state here

  return (
    <div className = "main-container">
      <h2>🦊 Decentralized Cloud</h2>
      <WalletLogin onLogin={setAccount} />
      {account && (
        <>
          <p style={{ color: "#888" }}>Connected wallet: {account}</p>
          <FileUploader account={account} />
        </>
      )}
      <button
        onClick={() => setShowAdmin(a => !a)}
        style={{
          marginTop: 36,
          background: "#a53860",
          color: "#fff",
          borderRadius: 7,
          border: "none",
          padding: "9px 22px",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "1em"
        }}
      >
        {showAdmin ? "Hide" : "Show"} Admin Dashboard
      </button>
      {showAdmin && <AdminDashboard />}
    </div>
  );
}

export default App;
