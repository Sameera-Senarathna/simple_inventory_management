import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import { btnGhost } from "../ui";

const linkBase =
  "flex items-center gap-3 px-4 py-3 font-body text-[15px] font-semibold transition-colors border-l-[3px]";
const linkInactive = "border-transparent text-muted hover:text-primary-dim hover:bg-primary/5";
const linkActive = "border-primary text-primary-dim bg-primary/8";
const linkClass = ({ isActive }) =>
  `${linkBase} ${isActive ? linkActive : linkInactive}`;

const iconClass = "w-[19px] h-[19px] flex-shrink-0";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login");
  }

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-[100] h-[58px] bg-bg/80 backdrop-blur-md backdrop-saturate-150 border-b border-line">
      <div className="flex items-center justify-between h-full max-w-[640px] mx-auto px-[18px]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center w-9 h-9 -ml-1.5 rounded-md text-primary-dim transition-colors hover:bg-primary/10"
          >
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Surgical Inventory"
            className="w-8 h-8"
          />
          <span className="font-display text-[19px] font-semibold tracking-[-.3px] text-primary-dim">Surgical Inventory</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11.5px] text-muted tracking-tight max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
            {user?.name}
          </span>
          <button className={btnGhost} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {open && (
        <>
          {/* click-away backdrop */}
          <div className="fixed inset-0 top-[58px] z-[90] bg-ink/20" onClick={close} />
          <div className="absolute top-[58px] left-0 right-0 z-[95] max-w-[640px] mx-auto px-[18px]">
            <nav className="overflow-hidden rounded-b-xl border border-t-0 border-line bg-surface shadow-[0_18px_40px_-18px_rgba(13,83,14,.4)] animate-rise flex flex-col py-1.5">
              <NavLink to="/" end className={linkClass} onClick={close}>
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
                </svg>
                Items
              </NavLink>

              <NavLink to="/fill-take" className={linkClass} onClick={close}>
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Fill / Take
              </NavLink>

              {user?.is_admin && (
                <NavLink to="/users" className={linkClass} onClick={close}>
                  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  Users
                </NavLink>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
