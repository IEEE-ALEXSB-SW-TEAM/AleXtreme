import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/login.css';
import { AuthContext } from '../context/AuthContext';
import api from "../api";

export const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post(
        '/auth/login',
        { name, password },
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        login('contestant');
        navigate('/');
      } else {
        setError('Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        'An error occurred while logging in. Please try again.'
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-branding">
          <h1 className="branding-main">
            IEEE <span style={{ color: "#4682A9" , fontWeight: "bold" ,  fontSize: "2.5rem" }}>AlexSB</span>
          </h1>
          <h3 className="branding-sub">Alextreme</h3>
        </div>

        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              autoComplete="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <p className="login-footer">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};
