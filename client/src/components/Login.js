import React, { useState } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react'; // Make sure you ran: npm install lucide-react

export default function Login({ setAuth }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
      
      if (isRegistering) {
        alert("Authority Account Created! Please Login.");
        setIsRegistering(false);
      } else {
        // Login Success: Save Token & Update App State
        localStorage.setItem('vault_token', res.data.token);
        localStorage.setItem('vault_user', res.data.username);
        setAuth(res.data.token, res.data.username);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Authentication Failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="card login-box">
        <div className="login-icon">
          <Shield size={40} />
        </div>
        <h2>{isRegistering ? "Register Authority" : "Secure Vault Access"}</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          {isRegistering ? "Create a new admin account" : "Enter credentials to decrypt"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>
          <div className="input-group">
            <label>Master Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            {isRegistering ? "Create Account" : "Access Vault"}
          </button>
        </form>

        <button className="toggle-link" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Already have an account? Login" : "New User? Register"}
        </button>
      </div>
    </div>
  );
}