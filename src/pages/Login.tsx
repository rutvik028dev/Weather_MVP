import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error: authError } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate("/");
  }

  return (
    <div className="max-w-sm mx-auto mt-20 px-4">
      <h2 className="text-xl font-semibold mb-1">{mode === "sign-in" ? "Sign in" : "Create an account"}</h2>
      <p className="text-sm text-[var(--mist)] mb-6">
        An account lets you track your report history and, if granted admin access, review the verification
        queue.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[var(--panel-raised)] border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--teal)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[var(--panel-raised)] border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--teal)]"
          />
        </label>

        {error && <p className="text-sm text-[var(--coral)]">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 px-4 py-2 bg-[var(--teal)] text-[var(--ink)] font-medium text-sm hover:brightness-110 transition disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="text-xs text-[var(--mist)] hover:text-[var(--paper)] transition-colors mt-1"
        >
          {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
