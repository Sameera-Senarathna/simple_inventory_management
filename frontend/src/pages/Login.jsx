import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { field, fieldLabel, fieldInput, btnPrimaryFull, alertError } from "../ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 relative overflow-hidden after:content-[''] after:absolute after:inset-x-0 after:h-[40%] after:bg-gradient-to-b after:from-transparent after:via-primary/8 after:to-transparent after:animate-scan after:pointer-events-none">
      <div className="relative z-10 w-full max-w-[400px] bg-gradient-to-b from-surface to-surface2 rounded-2xl px-[30px] py-10 shadow-[0_30px_70px_-24px_rgba(13,83,14,.4)] border border-line border-t-[3px] border-t-primary animate-rise">
        <div className="text-center mb-[30px]">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Surgical Inventory"
            className="block w-[72px] h-[72px] mx-auto mb-3.5 animate-emblem"
          />
          <h1 className="font-display text-[30px] font-semibold tracking-[-.4px] text-primary-dim">Surgical Inventory</h1>
          <p className="font-mono text-xs tracking-[.5px] uppercase text-muted mt-[7px]">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[17px]">
          {error && <div className={alertError}>{error}</div>}

          <div className={field}>
            <label className={fieldLabel} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={fieldInput}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={field}>
            <label className={fieldLabel} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={fieldInput}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={btnPrimaryFull} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
