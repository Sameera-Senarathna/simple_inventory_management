import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { page, pageHeader, pageTitle, field, fieldLabel, fieldInput, formCard, formSubtitle, formActions, btnPrimary, btnPrimarySm, btnGhost, btnDangerSm, alertError, badge, badgeAdmin, loading as loadingCls } from "../ui";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const newUser = await api.createUser({ name, email, password, is_admin: isAdmin });
      setUsers((prev) => [newUser, ...prev]);
      setShowForm(false);
      setName(""); setEmail(""); setPassword(""); setIsAdmin(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try {
      await api.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className={page}>
      <div className={pageHeader}>
        <h2 className={pageTitle}>Users</h2>
        <button className={btnPrimarySm} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New User"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className={`${formCard} mb-4`}>
          <h3 className={formSubtitle}>Create User</h3>
          {formError && <div className={alertError}>{formError}</div>}

          <div className={field}>
            <label className={fieldLabel}>Full Name</label>
            <input
              type="text"
              className={fieldInput}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={field}>
            <label className={fieldLabel}>Email</label>
            <input
              type="email"
              className={fieldInput}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={field}>
            <label className={fieldLabel}>Password</label>
            <input
              type="password"
              className={fieldInput}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="flex flex-row items-center">
            <label className="flex items-center gap-2.5 text-[15px] cursor-pointer text-ink">
              <input
                type="checkbox"
                className="w-[18px] h-[18px] cursor-pointer accent-primary"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <span>Admin user</span>
            </label>
          </div>

          <div className={formActions}>
            <button type="button" className={btnGhost} onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      )}

      {error && <div className={alertError}>{error}</div>}

      {loading ? (
        <div className={loadingCls}>Loading…</div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between bg-surface border border-line rounded-[10px] px-4 py-[15px] gap-3 shadow-[0_4px_14px_-10px_rgba(13,83,14,.3)] transition hover:border-primary hover:shadow-[0_6px_18px_-10px_rgba(13,83,14,.4)] animate-rise">
              <div className="flex flex-col gap-[3px] min-w-0">
                <span className="text-[15px] font-bold text-ink">{u.name}</span>
                <span className="font-mono text-xs text-muted whitespace-nowrap overflow-hidden text-ellipsis">{u.email}</span>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {u.is_admin ? <span className={badgeAdmin}>Admin</span> : <span className={badge}>User</span>}
                {u.id !== currentUser.id && (
                  <button className={btnDangerSm} onClick={() => handleDelete(u)}>
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
