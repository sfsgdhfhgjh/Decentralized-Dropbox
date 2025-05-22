import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [uploads, setUploads] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://15.206.117.184:4000/api/uploads")
      .then(r => r.json())
      .then(data => setUploads(data));
  }, []);

  const filteredUploads = uploads.filter(
    entry =>
      entry.filename.toLowerCase().includes(search.toLowerCase()) ||
      entry.cid.toLowerCase().includes(search.toLowerCase()) ||
      entry.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      margin: "32px auto",
      padding: 24,
      maxWidth: 900,
      background: "rgba(245,245,245,0.96)",
      borderRadius: 12,
      boxShadow: "0 1px 22px #a5386030"
    }}>
      <h2 style={{ marginBottom: 20 }}>Admin File Upload History</h2>
      <div style={{ marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Search filename, CID or address"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 320,
            padding: 7,
            borderRadius: 7,
            border: "1px solid #d3acc7"
          }}
        />
      </div>
      <div style={{overflowX: "auto"}}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "white"
      }}>
        <thead>
          <tr style={{background: "#eee"}}>
            <th style={th}>Filename</th>
            <th style={th}>CID</th>
            <th style={th}>Wallet</th>
            <th style={th}>Date</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUploads.length === 0 &&
            <tr><td colSpan={5} style={{textAlign: "center", padding: 20, color: "#aaa"}}>No uploads found.</td></tr>}
          {filteredUploads.map((entry, idx) => (
            <tr key={entry.cid + idx} style={{borderBottom: "1px solid #f5e1ec"}}>
              <td style={td}>{entry.filename}</td>
              <td style={td}>
                <a href={`https://ipfs.io/ipfs/${entry.cid}`} target="_blank" rel="noopener noreferrer">
                  {entry.cid}
                </a>
              </td>
              <td style={td}>{entry.address}</td>
              <td style={td}>{new Date(entry.date).toLocaleString()}</td>
              <td style={td}>
                <button
                  style={copyBtn}
                  onClick={() => navigator.clipboard.writeText(entry.cid)}
                  title="Copy CID"
                >Copy CID</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

const th = {
  padding: "8px 6px",
  fontWeight: "bold",
  color: "#7f2350",
  fontSize: "1em",
  textAlign: "left"
};
const td = {
  padding: "7px 5px",
  fontSize: "0.97em",
  maxWidth: 230,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};
const copyBtn = {
  background: "#e2d1dc",
  color: "#a53860",
  border: "none",
  borderRadius: 5,
  padding: "2px 9px",
  cursor: "pointer"
};

