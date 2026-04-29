import React, { useState } from "react";

/**
 * Login – displays a username/password form and exchanges credentials for a JWT.
 *
 * @param {object}   props
 * @param {Function} [props.onSuccess] - Called with the JWT string after a
 *                                       successful login.
 */
export default function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      if (onSuccess) onSuccess(data.token);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      <h1>Sign In</h1>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
