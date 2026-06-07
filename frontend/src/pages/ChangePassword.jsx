import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  page,
  pageHeader,
  pageTitle,
  formCard,
  formSubtitle,
  formActions,
  field,
  fieldLabel,
  fieldInput,
  btnPrimary,
  btnGhost,
  alertError,
  alertSuccess,
} from "../ui";

export default function ChangePassword() {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const forced = user?.must_change_password;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={page}>
      <div className={pageHeader}>
        <h1 className={pageTitle}>Change Password</h1>
      </div>

      {forced && (
        <div className={`${alertError} mb-4`}>
          For security, please set a new password before continuing.
        </div>
      )}

      <form onSubmit={handleSubmit} className={formCard}>
        <h2 className={formSubtitle}>Update your password</h2>

        {error && <div className={alertError}>{error}</div>}
        {success && <div className={alertSuccess}>{success}</div>}

        <div className={field}>
          <label className={fieldLabel} htmlFor="current">Current Password</label>
          <input
            id="current"
            type="password"
            className={fieldInput}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className={field}>
          <label className={fieldLabel} htmlFor="new">New Password</label>
          <input
            id="new"
            type="password"
            className={fieldInput}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className={field}>
          <label className={fieldLabel} htmlFor="confirm">Confirm New Password</label>
          <input
            id="confirm"
            type="password"
            className={fieldInput}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className={formActions}>
          {!forced && (
            <button type="button" className={btnGhost} onClick={() => navigate("/")}>
              Cancel
            </button>
          )}
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Saving…" : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
