import makeBlockie from 'ethereum-blockies-base64';
import './WalletLogin.css';
import FileUploader from "./FileUploader";
import React, { useState } from "react";
import { ethers } from "ethers";
function shortenAddress(addr) {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}
const WalletLogin = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [signature, setSignature] = useState("");
  const [message] = useState("Authenticate to Decentralized Dropbox");

  const logWalletToBackend = async (address) => {
    await fetch("https://c4a4-2406-da1a-4c4-9b00-7e74-571-a8a3-3475.ngrok-free.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
  };
    const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask or wallet extension not found!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setError(""); 

      const signedMessage = await signer.signMessage(message);
      setSignature(signedMessage);
      await logWalletToBackend(address);
    } catch (err) {
      setError("User denied wallet connection or signature.");
    }
  };

  return (
    <div className="wallet-login-bg">
      <div className="wallet-login-wrapper">
        <h1>Wallet Sign-In</h1>
        {/* Tagline */}
        <div>Your files, your wallet. All decentralized.</div>
        {/* Only show "What’s this?" if NOT connected */}
        {!account && (
          <span
            style={{
              color: '#ef88adcc',
              fontSize: '0.98rem',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginBottom: '1.15rem',
              display: 'inline-block'
            }}
            onClick={() => alert(
              "Connect your Ethereum wallet to access and manage files stored on decentralized networks like IPFS. Only you control your data."
            )}
          >
            <span style={{ fontSize: '1.2em' }}>ℹ️</span> What’s this?
          </span>
        )}
        {/* Wallet connect/connected UI */}
        {!account ? (
          <button className="wallet-login-btn" onClick={connectWallet}>
            Connect Wallet & Sign Message
          </button>
        ) : (
          <div>
            {/* Logo, centered */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg"
              alt="Ethereum Wallet Logo"
              style={{
                width: 48,
                height: 48,
                marginBottom: 18,
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                borderRadius: '50%',
                background: '#fff',
                padding: '7px',
                objectFit: 'contain'
              }}
            />
            {/* Big Connected line */}
            <div
              style={{
                fontWeight: 900,
                fontSize: '1.28rem',
                color: '#ef88ad',
                letterSpacing: '1px',
                marginBottom: 6,
                marginTop: 2,
                textShadow: "0 1.5px 10px #a5386066"
              }}
            >
              Wallet Connected!
            </div>
            {account && (
  <FileUploader account={account} />
)}
            {/* Short address, pill, copy */}
            <div
  style={{
    wordBreak: 'break-all',
    color: '#fff',
    fontFamily: 'monospace',
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  {account && (
    <img
      src={makeBlockie(account)}
      alt="Wallet identicon"
      style={{
        width: 28,
        height: 28,
        borderRadius: "7px",
        marginRight: "9px",
        boxShadow: "0 1.5px 7px #3a051930",
        border: "1.5px solid #ef88ad88",
        background: "#fff"
      }}
    />
  )}
  <span
    style={{
      background: '#a53860',
      borderRadius: '8px',
      padding: '7px 16px',
      fontSize: '1.06em',
      fontWeight: 700,
      display: "inline-block"
    }}
  >
    {shortenAddress(account)}
  </span>
  
</div>

            {/* Mini signature for devs */}
            {signature && (
              <div style={{
                fontSize: '0.73em',
                color: '#ef88ad99',
                marginTop: 18,
                wordBreak: 'break-all',
                background: '#3a05192c',
                borderRadius: '7px',
                padding: '8px',
                maxWidth: 380,
                marginLeft: "auto",
                marginRight: "auto"
              }}>
                <span style={{ opacity: .7 }}>Signed:</span><br />
                {signature.substring(0, 12)}...{signature.substring(signature.length - 8)}
              </div>
            )}
          </div>
        )}

        {error && <div className="wallet-login-error">{error}</div>}
      </div>
    </div>
  );
};
export default WalletLogin;
