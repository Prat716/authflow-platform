import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail ?? "Something went wrong");
        return;
      }

      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <div style={styles.container}>
        <p style={styles.success}>Logged in successfully.</p>
        <p style={styles.sub}>Token stored in localStorage.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>AuthFlow Platform</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={{...styles.button, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Register"}
        </button>
      </form>

      <button style={styles.toggle} onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "No account? Register" : "Have an account? Log in"}
      </button>
    </div>
  );
}

const styles = {
  container: { maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" },
  title: { textAlign: "center", marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "10px 14px", fontSize: 14, borderRadius: 6, border: "1px solid #ccc" },
  button: { padding: "10px 14px", fontSize: 14, background: "#1a73e8", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  toggle: { marginTop: 16, background: "none", border: "none", color: "#1a73e8", cursor: "pointer", width: "100%", textAlign: "center" },
  error: { color: "#d93025", fontSize: 13 },
  success: { color: "#188038", fontWeight: 600 },
  sub: { color: "#666", fontSize: 13 },
};
