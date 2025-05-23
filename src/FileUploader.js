import React, { useState } from "react";

export default function FileUploader() {
  const [status, setStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    return JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
  });

  const handleChange = e => {
    setSelectedFile(e.target.files[0]);
    setStatus("");
    setIpfsUrl("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus("Please select a file.");
      return;
    }

    try {
      setStatus("Connecting to MetaMask…");
      const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
      const message = "Please sign to upload file";
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("address", address);
      formData.append("message", message);
      formData.append("signature", signature);

      setStatus("Uploading…");
      const res = await fetch("https://69a3-2406-da1a-4c4-9b00-7e74-571-a8a3-3475.ngrok-free.app", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (res.ok && json.ipfs_url && json.cid) {
        setStatus("Upload successful!");
        setIpfsUrl(json.ipfs_url);

        const newFile = {
          url: json.ipfs_url,
          cid: json.cid,
          date: new Date().toISOString()
        };

        setUploadedFiles(prevFiles => {
          const files = [newFile, ...prevFiles].slice(0, 10);
          localStorage.setItem('uploadedFiles', JSON.stringify(files));
          return files;
        });
      } else {
        setStatus(`Error: ${json.error || "Unknown error"}`);
        setIpfsUrl("");
      }
    } catch (err) {
      console.error(err);
      setStatus("Upload failed.");
      setIpfsUrl("");
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('uploadedFiles');
    setUploadedFiles([]);
  };

  return (
    <div style={{
      marginTop: 24,
      background: 'rgba(58,5,25,0.13)',
      borderRadius: 14,
      padding: 18,
      boxShadow: '0 2px 18px #a5386044'
    }}>
      <h3>Upload to Your Cloud</h3>
      <input type="file" onChange={handleChange} />
      <button
        onClick={handleUpload}
        disabled={!selectedFile}
        style={{
          marginLeft: 12,
          background: '#a53860',
          color: '#fff',
          borderRadius: 8,
          border: 'none',
          padding: '7px 18px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Upload
      </button>

      {status && (
        <div style={{
          marginTop: 8,
          fontSize: '0.95em',
          color: status.startsWith("Error") ? "crimson" : "#ef88ad"
        }}>
          {status}
        </div>
      )}

      {/* Clickable link after successful upload */}
      {ipfsUrl && (
        <div style={{
          marginTop: 12,
          fontSize: "0.97em",
          wordBreak: "break-all"
        }}>
          <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
            View on IPFS: {ipfsUrl}
          </a>
        </div>
      )}

      {/* Scrollable upload history */}
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4>
            Previously Uploaded Files{" "}
            <button
              onClick={clearHistory}
              style={{
                marginLeft: '1em',
                background: 'transparent',
                color: '#a53860',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9em',
                textDecoration: 'underline'
              }}
            >
              Clear History
            </button>
          </h4>
          <div style={{
            maxHeight: 220,
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 8,
            background: "rgba(255,255,255,0.06)"
          }}>
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {uploadedFiles.map((f, idx) => (
                <li key={f.cid + idx} style={{ marginBottom: 7, wordBreak: 'break-all' }}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.cid}
                  </a>
                  <span style={{
                    marginLeft: 8,
                    fontSize: "0.8em",
                    color: "#aaa"
                  }}>
                    {new Date(f.date).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
