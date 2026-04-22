import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Lock, Unlock, Upload, Trash2, FileText, Shield, LogOut, Key, User, AlertTriangle, ArrowRight } from 'lucide-react';

/* --- 1. BUILT-IN CSS STYLES (Guarantees the Look) --- */
const styles = `
/* --- RESET & BASICS --- */
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 0;
  background-color: #020617; /* Very Dark Navy */
  color: #e2e8f0;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

/* --- ANIMATIONS --- */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulseGlow { 0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.2); } 50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); } 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.2); } }

/* --- LOGIN SCREEN --- */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1e293b 0%, #020617 100%);
  padding: 20px;
}

.login-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 16px;
  border: 1px solid #334155;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: fadeIn 0.6s ease-out;
}

.login-header { margin-bottom: 30px; }
.login-header h2 { margin: 10px 0 5px; color: white; font-size: 1.8rem; }
.login-header p { color: #64748b; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; }

.icon-circle {
  background: rgba(15, 23, 42, 0.8);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 1px solid #1e293b;
  color: #3b82f6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
}

.form-group { margin-bottom: 20px; text-align: left; }
.form-label { display: block; color: #94a3b8; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; margin-left: 4px; }
.input-wrapper { position: relative; }
.input-icon { position: absolute; left: 12px; top: 12px; color: #64748b; }

.styled-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: #020617;
  border: 1px solid #334155;
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}
.styled-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: bold;
  border-radius: 8px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
.btn-primary:disabled { opacity: 0.7; cursor: wait; }

.text-btn { background: none; color: #64748b; margin-top: 20px; font-size: 0.9rem; }
.text-btn:hover { color: #3b82f6; text-decoration: underline; }

.error-banner { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; padding: 10px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

/* --- DASHBOARD --- */
.dashboard-container { min-height: 100vh; background-color: #020617; padding-bottom: 50px; }

.navbar {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #1e293b;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo { display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 1.2rem; }
.pro-badge { background: #2563eb; color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; vertical-align: middle; }

.nav-user { display: flex; align-items: center; gap: 20px; }
.user-info { text-align: right; }
.user-label { display: block; font-size: 0.65rem; color: #64748b; text-transform: uppercase; font-weight: bold; }
.user-name { color: #3b82f6; font-weight: bold; font-size: 0.9rem; }

.btn-logout { background: transparent; color: #94a3b8; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 6px; border: 1px solid transparent; }
.btn-logout:hover { color: #ef4444; border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.1); }

.content-area { max-width: 1100px; margin: 0 auto; padding: 30px 20px; }

.upload-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}
.upload-glow { position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(37, 99, 235, 0.1); filter: blur(60px); border-radius: 50%; pointer-events: none; }

.section-title { font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: white; }
.icon-box { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 8px; border-radius: 8px; }

.upload-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 20px; align-items: end; }
@media (max-width: 768px) { .upload-grid { grid-template-columns: 1fr; } }

.file-input-label {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #020617;
  border: 1px dashed #334155;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
}
.file-input-label:hover { border-color: #3b82f6; color: #3b82f6; }

.btn-encrypt { background: #059669; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; }
.btn-encrypt:hover { background: #047857; }

.files-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #1e293b; padding-bottom: 10px; }
.files-title { font-size: 0.8rem; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }

.file-list { display: flex; flex-direction: column; gap: 12px; }

.file-row {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
}
.file-row:hover { border-color: #3b82f6; transform: translateX(5px); }

.file-left { display: flex; align-items: center; gap: 15px; }
.file-icon-bg { background: #020617; padding: 10px; border-radius: 8px; border: 1px solid #1e293b; color: #64748b; }
.file-name { font-weight: bold; color: #e2e8f0; font-size: 1rem; }
.file-details { display: flex; gap: 10px; font-size: 0.8rem; color: #64748b; margin-top: 4px; }
.tag { background: #1e293b; padding: 2px 6px; border-radius: 4px; border: 1px solid #334155; font-size: 0.7rem; font-weight: bold; }

.file-actions { display: flex; align-items: center; gap: 10px; }

.decrypt-group { display: flex; align-items: center; gap: 6px; background: #020617; padding: 4px; border-radius: 6px; border: 1px solid #334155; animation: fadeIn 0.3s; }
.mini-input { background: transparent; border: none; color: white; font-size: 0.85rem; width: 100px; outline: none; padding-left: 5px; }
.btn-mini-action { background: #2563eb; color: white; padding: 6px; border-radius: 4px; display: flex; }
.btn-mini-close { color: #64748b; padding: 0 8px; font-size: 0.9rem; }
.btn-mini-close:hover { color: white; }

.btn-decrypt-trigger { background: #1e293b; border: 1px solid #334155; color: #94a3b8; padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; }
.btn-decrypt-trigger:hover { border-color: #3b82f6; color: #3b82f6; }

.btn-trash { color: #64748b; padding: 8px; border-radius: 6px; }
.btn-trash:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.empty-state { text-align: center; padding: 60px 0; color: #64748b; border: 2px dashed #1e293b; border-radius: 12px; }
`;

// --- MAIN APP COMPONENT ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('vault_token'));
  const [username, setUsername] = useState(localStorage.getItem('vault_user'));
  const [view, setView] = useState('login'); 

  useEffect(() => {
    if (token && username) setView('dashboard');
  }, [token, username]);

  const setAuth = (newToken, newUser) => {
    localStorage.setItem('vault_token', newToken);
    localStorage.setItem('vault_user', newUser);
    setToken(newToken);
    setUsername(newUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_user');
    setToken(null);
    setUsername(null);
    setView('login');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-root">
        {view === 'login' ? (
          <Login setAuth={setAuth} />
        ) : (
          <Dashboard token={token} username={username} handleLogout={handleLogout} />
        )}
      </div>
    </>
  );
}

// --- LOGIN COMPONENT ---
function Login({ setAuth }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    try {
      const res = await axios.post(`http://localhost:5000/api${endpoint}`, formData);
      if (isRegistering) {
        alert("Account Created! Login now.");
        setIsRegistering(false);
      } else {
        setAuth(res.data.token, res.data.username);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Connection Failed. Is Server Running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="icon-circle">
          <Shield size={36} />
        </div>
        <div className="login-header">
          <h2>Secure Vault</h2>
          <p>Restricted Access</p>
        </div>

        {error && (
          <div className="error-banner">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Identity</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                name="username" type="text" required placeholder="Username"
                className="styled-input"
                value={formData.username} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Master Key</label>
            <div className="input-wrapper">
              <Key className="input-icon" size={18} />
              <input 
                name="password" type="password" required placeholder="••••••••"
                className="styled-input"
                value={formData.password} onChange={handleChange}
              />
            </div>
          </div>

          <button disabled={loading} className="btn-primary">
            {loading ? "Processing..." : (isRegistering ? "Initialize Account" : "Access Vault")}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <button className="text-btn" onClick={() => { setError(''); setIsRegistering(!isRegistering); }}>
          {isRegistering ? "Return to Login" : "New User? Register Authority"}
        </button>
      </div>
    </div>
  );
}

// --- DASHBOARD COMPONENT ---
function Dashboard({ token, username, handleLogout }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePassword, setFilePassword] = useState('');
  const [downloadPassword, setDownloadPassword] = useState('');
  const [activeFileId, setActiveFileId] = useState(null);
  const [loading, setLoading] = useState(false);

  const api = useMemo(() => axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  useEffect(() => { fetchFiles(); }, []); // eslint-disable-line

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) { if(err.response?.status === 403) handleLogout(); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !filePassword) return alert("File & Password required");
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('password', filePassword);
    setLoading(true);
    try {
      await api.post('/upload', formData);
      setSelectedFile(null);
      setFilePassword('');
      fetchFiles();
    } catch (err) { alert("Upload Failed"); } 
    finally { setLoading(false); }
  };

  const handleDownload = async (fileId, name) => {
    if (!downloadPassword) return;
    try {
      const res = await api.post('/download', { fileId, password: downloadPassword }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      setActiveFileId(null);
      setDownloadPassword('');
    } catch (err) { alert("Decryption Failed: Invalid Password"); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Permanently destroy this file?")) {
      await api.delete(`/files/${id}`);
      fetchFiles();
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-logo">
          <Shield size={24} color="#3b82f6" />
          <span>Secure Vault <span className="pro-badge">PRO</span></span>
        </div>
        <div className="nav-user">
          <div className="user-info">
            <span className="user-label">Operator</span>
            <span className="user-name">{username}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} /> Disconnect
          </button>
        </div>
      </nav>

      <div className="content-area">
        {/* Upload Section */}
        <div className="upload-card">
          <div className="upload-glow"></div>
          <div className="section-title">
            <span className="icon-box"><Lock size={20} /></span>
            Encrypt New Asset
          </div>
          
          <form onSubmit={handleUpload} className="upload-grid">
            <div className="form-group">
              <label className="form-label">Source File</label>
              <label className="file-input-label">
                <input type="file" style={{display:'none'}} onChange={e => setSelectedFile(e.target.files[0])} />
                {selectedFile ? selectedFile.name : "Click to Select File..."}
              </label>
            </div>
            <div className="form-group">
              <label className="form-label">Encryption Key</label>
              <input 
                type="password" placeholder="Set Secret Key..." className="styled-input" style={{paddingLeft: '12px'}}
                value={filePassword} onChange={e => setFilePassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <button disabled={loading} className="btn-encrypt">
                {loading ? "Encrypting..." : <><Upload size={18} /> Encrypt</>}
              </button>
            </div>
          </form>
        </div>

        {/* File List */}
        <div className="files-header">
          <span className="files-title">Vault Storage ({files.length})</span>
        </div>

        <div className="file-list">
          {files.map(file => (
            <div key={file._id} className="file-row">
              <div className="file-left">
                <div className="file-icon-bg"><FileText size={24} /></div>
                <div>
                  <div className="file-name">{file.originalName}</div>
                  <div className="file-details">
                    <span className="tag">AES-256</span>
                    <span>{(file.size/1024).toFixed(1)} KB</span>
                    <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="file-actions">
                {activeFileId === file._id ? (
                  <div className="decrypt-group">
                    <input 
                      type="password" placeholder="Key..." autoFocus className="mini-input"
                      value={downloadPassword} onChange={e => setDownloadPassword(e.target.value)}
                    />
                    <button onClick={() => handleDownload(file._id, file.originalName)} className="btn-mini-action"><Unlock size={14} /></button>
                    <button onClick={() => setActiveFileId(null)} className="text-btn btn-mini-close" style={{margin:0}}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => { setActiveFileId(file._id); setDownloadPassword(''); }} className="btn-decrypt-trigger">
                    <Lock size={14} /> Decrypt
                  </button>
                )}
                <button onClick={() => handleDelete(file._id)} className="btn-trash"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="empty-state">
              <Shield size={40} style={{marginBottom:'10px', opacity: 0.5}} />
              <p>Vault is Empty. Secure your first file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}