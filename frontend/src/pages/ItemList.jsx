import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { page, pageHeader, pageTitle, fieldInput, btnPrimarySm, alertError, badge, loading as loadingCls } from "../ui";

const STORES = ["Store A", "Store B", "Store C", "Store D & E"];

const iconBtn = "inline-flex items-center justify-center w-[34px] h-[34px] rounded-md border border-transparent transition flex-shrink-0 disabled:opacity-40 disabled:pointer-events-none";
const iconBtnEdit = `${iconBtn} text-primary hover:bg-primary/10 hover:border-primary`;
const iconBtnDelete = `${iconBtn} text-take hover:bg-take/10 hover:border-take/35`;

function qtyClass(q) {
  if (q < 0) return "text-take";
  if (q === 0) return "text-faint";
  return "text-primary";
}

export default function ItemList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadItems();
  }, [storeFilter]);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getItems(storeFilter || null);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    if (item.quantity !== 0) {
      alert(
        `Cannot delete "${item.item_name}" — it still has ${item.quantity} in inventory. ` +
          `Take out the remaining quantity first.`
      );
      return;
    }
    if (!confirm(`Delete "${item.item_name}"? This cannot be undone.`)) return;
    setDeleting(item.id);
    try {
      await api.deleteItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = items
    .filter((i) => i.item_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.quantity - b.quantity);

  return (
    <div className={page}>
      <div className={pageHeader}>
        <h2 className={pageTitle}>Items</h2>
        <button className={btnPrimarySm} onClick={() => navigate("/items/new")}>
          + New
        </button>
      </div>

      <div className="flex gap-2.5 mb-4">
        <input
          type="search"
          className={`${fieldInput} flex-1`}
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`${fieldInput} flex-1`}
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
        >
          <option value="">All Stores</option>
          {STORES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <div className={alertError}>{error}</div>}

      {loading ? (
        <div className={loadingCls}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 px-5 text-muted flex flex-col items-center gap-4 border border-dashed border-line rounded-[10px] bg-surface2/50">
          <p>No items found.</p>
          <button className={btnPrimarySm} onClick={() => navigate("/items/new")}>
            Create your first item
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-line border-t-[3px] border-t-primary rounded-[10px] overflow-hidden shadow-[0_10px_30px_-14px_rgba(13,83,14,.28)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-bg2 border-b border-line">
                <th className="px-3.5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[.6px] text-faint text-left whitespace-nowrap">Item Name</th>
                <th className="px-3.5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[.6px] text-faint text-left whitespace-nowrap">Store</th>
                <th className="px-3.5 py-3 pr-8 font-mono text-[10.5px] font-bold uppercase tracking-[.6px] text-faint text-right whitespace-nowrap">Qty</th>
                <th className="px-3.5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[.6px] text-faint text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer border-b border-line-soft last:border-b-0 transition hover:bg-primary/8 hover:shadow-[inset_3px_0_0_var(--color-primary)]"
                  onClick={() => navigate(`/fill-take/${item.id}`)}
                >
                  <td className="px-3.5 py-[13px] text-sm align-middle font-semibold text-ink">{item.item_name}</td>
                  <td className="px-3.5 py-[13px] text-sm align-middle"><span className={badge}>{item.store}</span></td>
                  <td className="px-3.5 py-[13px] pr-8 text-right align-middle font-mono text-lg font-bold w-16">
                    <span className={qtyClass(item.quantity)}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-3.5 py-[13px] align-middle text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex justify-end gap-1.5 items-center">
                      <button
                        className={iconBtnEdit}
                        title="Edit"
                        onClick={() => navigate(`/items/${item.id}/edit`)}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className={iconBtnDelete}
                        title={item.quantity !== 0 ? "Empty the inventory before deleting" : "Delete"}
                        onClick={() => handleDelete(item)}
                        disabled={deleting === item.id || item.quantity !== 0}
                      >
                        {deleting === item.id
                          ? <span className="text-sm">…</span>
                          : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
