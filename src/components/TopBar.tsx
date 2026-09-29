import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabaseClient";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 text-sm transition-colors ${
    isActive ? "text-[var(--paper)] border-b border-[var(--teal)]" : "text-[var(--mist)] hover:text-[var(--paper)]"
  }`;

export function TopBar() {
  const { session, profile, isAdmin } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--panel)] px-5 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-baseline gap-2">
          <span className="display text-lg font-semibold tracking-tight">Varsha</span>
          <span className="text-xs text-[var(--mist)]">National Weather Intelligence</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/report" className={navLinkClass}>Report Weather</NavLink>
          {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {session ? (
          <>
            <span className="text-[var(--mist)]">{profile?.display_name ?? session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-3 py-1 border border-[var(--line)] text-[var(--mist)] hover:text-[var(--paper)] hover:border-[var(--mist)] transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <NavLink to="/login" className="px-3 py-1 border border-[var(--line)] hover:border-[var(--mist)] transition-colors">
            Sign in
          </NavLink>
        )}
      </div>
    </header>
  );
}
