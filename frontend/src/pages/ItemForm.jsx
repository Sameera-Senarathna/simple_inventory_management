import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { page, pageHeader, pageTitle, field, fieldLabel, fieldInput, formCard, formActions, btnGhost, btnGhostSm, btnPrimary, alertError, loading as loadingCls } from "../ui";

const STORES = ["Store A", "Store B", "Store C", "Store D & E"];

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [itemName, setItemName] = useState("");
  const [store, setStore] = useState(STORES[0]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api.getItems()
      .then((items) => {
        const found = items.find((i) => i.id === parseInt(id));
        if (found) {
          setItemName(found.item_name);
          setStore(found.store);
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await api.updateItem(id, { item_name: itemName, store });
      } else {
        await api.createItem({ item_name: itemName, store });
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className={loadingCls}>Loading…</div>;

  return (
    <div className={page}>
      <div className={pageHeader}>
        <button className={btnGhostSm} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2 className={pageTitle}>{isEdit ? "Edit Item" : "New Item"}</h2>
      </div>

      <form onSubmit={handleSubmit} className={formCard}>
        {error && <div className={alertError}>{error}</div>}

        <div className={field}>
          <label className={fieldLabel} htmlFor="item-name">Item Name</label>
          <input
            id="item-name"
            type="text"
            className={fieldInput}
            placeholder="e.g. Surgical Gloves"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className={field}>
          <label className={fieldLabel} htmlFor="store">Source Store</label>
          <select
            id="store"
            className={fieldInput}
            value={store}
            onChange={(e) => setStore(e.target.value)}
          >
            {STORES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={formActions}>
          <button type="button" className={btnGhost} onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
