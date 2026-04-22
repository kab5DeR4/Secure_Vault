import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Unlock, Upload, Trash2, FileText, Shield, LogOut } from 'lucide-react';

export default function Dashboard({ token, username, handleLogout }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePassword, setFilePassword] = useState('');
  const [downloadPassword, setDownloadPassword] = useState('');
  const [activeFileId, setActiveFileId] = useState(null);

  // Setup Axios with Token
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  // Fetch Files on Load
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  // Upload Logic
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !filePassword) return alert("Please select a file and set a password");

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', filePassword);

    try {
      await api.post('/upload', formData);
      alert("File Encrypted Successfully");
      setSelectedFile(null);
      setFilePassword('');
      fetchFiles();
    } catch (err) {
      alert("Upload Failed");
    }
  };

  // Download/Decrypt Logic
  const handleDownload = async (fileId, name) => {
    if (!downloadPassword) return alert("Password required");
    try {
      const res = await api.post('/download', { fileId, password: downloadPassword }, { responseType: 'blob' });
      // Create Download Link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      setActiveFileId(null);
      setDownloadPassword('');
    } catch (err) {
      alert("Decryption Failed: Wrong Password");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Destroy this file?")) {
      await api.delete(`/files/${id}`);
      fetchFiles();
    }
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          <Shield color="#3b82f6" /> Secure Vault <span style={{fontSize: '0.8rem', opacity: 0.7}}>PRO</span>
        </div>
        <div className="nav-user">
          <span>Operator: <strong>{username}</strong></span>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} style={{marginRight: '5px'}}/> Logout
          </button>
        </div>
      </nav>

      <div className="container">
        {/* UPLOAD CARD */}
        <div className="card upload-section">
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '10px', color: '#94a3b8'}}>Select File</label>
            <input 
              type="file" 
              className="input-field" 
              onChange={e => setSelectedFile(e.target.files[0])}
            />
          </div>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '10px', color: '#94a3b8'}}>Set Encryption Key</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Secret Password..."
              value={filePassword}
              onChange={e => setFilePassword(e.target.value)}
            />
          </div>
          <button className="btn-primary" style={{width: 'auto'}} onClick={handleUpload}>
            <Upload size={18} style={{marginRight: '8px'}}/> Encrypt & Store
          </button>
        </div>

        {/* FILE LIST */}
        <h3 style={{color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '10px'}}>Secured Assets</h3>
        <div className="file-list">
          {files.map(file => (
            <div key={file._id} className="file-item">
              <div className="file-info">
                <FileText size={32} color="#475569" />
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{file.originalName}</div>
                  <div className="file-meta">
                    <span className="badge">AES-256</span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                    <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="actions">
                {activeFileId === file._id ? (
                  <div className="decrypt-box">
                    <input 
                      type="password" 
                      className="decrypt-input" 
                      placeholder="Enter Key" 
                      autoFocus
                      value={downloadPassword}
                      onChange={e => setDownloadPassword(e.target.value)}
                    />
                    <button className="btn-decrypt" onClick={() => handleDownload(file._id, file.originalName)}>
                      <Unlock size={16} />
                    </button>
                  </div>
                ) : (
                  <button className="btn-primary" style={{background: '#1e293b', border: '1px solid #3b82f6'}} onClick={() => setActiveFileId(file._id)}>
                    <Lock size={16} style={{marginRight: '5px'}}/> Decrypt
                  </button>
                )}
                
                <button className="btn-delete" onClick={() => handleDelete(file._id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {files.length === 0 && <div style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>Vault is empty.</div>}
        </div>
      </div>
    </div>
  );
}