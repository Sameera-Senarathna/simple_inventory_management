import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { page, pageHeader, pageTitle, field, fieldLabel, fieldInput, formCard, btnFillFull, btnTakeFull, alertError, alertSuccess, sectionTitle, loading as loadingCls } from "../ui";
import SearchableSelect from "../components/SearchableSelect";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const toggleBase = "flex-1 py-[11px] rounded font-body text-[14.5px] font-bold transition text-muted";
const toggleFill = "bg-primary/12 text-primary-dim shadow-[inset_0_0_0_1px_rgba(48,109,41,.45),0_4px_12px_-6px_rgba(13,83,14,.35)]";
const toggleTake = "bg-take/12 text-take shadow-[inset_0_0_0_1px_rgba(176,83,46,.45),0_4px_12px_-6px_rgba(176,83,46,.32)]";

const txItemBase = "flex items-start justify-between bg-surface border border-line-soft rounded-md px-3.5 py-[13px] gap-2.5 transition hover:translate-x-0.5 animate-rise";
const txBadgeBase = "inline-flex items-center px-2.5 py-[3px] rounded-[5px] font-mono text-[10.5px] font-bold whitespace-nowrap flex-shrink-0";

export default function FillTake() {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(itemId || "");
  const [txType, setTxType] = useState("fill");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    api.getItems().then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedItemId) return;
    setHistoryLoading(true);
    api.getTransactions(selectedItemId)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [selectedItemId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedItemId) {
      setError("Please select an item");
      return;
    }
    setLoading(true);
    try {
      await api.createTransaction({
        item_id: parseInt(selectedItemId),
        transaction_type: txType,
        quantity: parseInt(quantity),
        date,
        note: note || null,
      });
      setSuccess(`Successfully recorded ${txType === "fill" ? "filled" : "taken"} quantity.`);
      setQuantity("");
      setNote("");
      setDate(todayStr());

      const [updatedItems, updatedHistory] = await Promise.all([
        api.getItems(),
        api.getTransactions(selectedItemId),
      ]);
      setItems(updatedItems);
      setHistory(updatedHistory);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedItem = items.find((i) => i.id === parseInt(selectedItemId));

  return (
    <div className={page}>
      <div className={pageHeader}>
        <h2 className={pageTitle}>Fill / Take</h2>
      </div>

      <form onSubmit={handleSubmit} className={formCard}>
        {error && <div className={alertError}>{error}</div>}
        {success && <div className={alertSuccess}>{success}</div>}

        <div className="flex gap-1.5 p-1.5 bg-bg2 border border-line rounded-md">
          <button
            type="button"
            className={`${toggleBase} ${txType === "fill" ? toggleFill : ""}`}
            onClick={() => setTxType("fill")}
          >
            Fill In
          </button>
          <button
            type="button"
            className={`${toggleBase} ${txType === "take" ? toggleTake : ""}`}
            onClick={() => setTxType("take")}
          >
            Take Out
          </button>
        </div>

        <div className={field}>
          <label className={fieldLabel} htmlFor="item-select">Item</label>
          <SearchableSelect
            id="item-select"
            items={items}
            value={selectedItemId}
            onChange={(id) => {
              setSelectedItemId(id);
              setError("");
              setSuccess("");
            }}
            getValue={(item) => item.id}
            getLabel={(item) => `${item.item_name} — ${item.store} (Qty: ${item.quantity})`}
            placeholder="Search an item…"
          />
        </div>

        <div className={field}>
          <label className={fieldLabel} htmlFor="qty">Quantity</label>
          <input
            id="qty"
            type="number"
            className={fieldInput}
            min="1"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className={field}>
          <label className={fieldLabel} htmlFor="tx-date">Date</label>
          <input
            id="tx-date"
            type="date"
            className={fieldInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className={field}>
          <label className={fieldLabel} htmlFor="note">Note (optional)</label>
          <textarea
            id="note"
            className={`${fieldInput} resize-y min-h-[72px]`}
            rows="2"
            placeholder="Additional notes…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button type="submit" className={txType === "fill" ? btnFillFull : btnTakeFull} disabled={loading}>
          {loading ? "Saving…" : txType === "fill" ? "Fill Inventory" : "Take from Inventory"}
        </button>
      </form>

      {selectedItemId && (
        <div className="mt-7 animate-fade">
          <h3 className={sectionTitle}>Transaction History</h3>
          {selectedItem && (
            <div className="bg-primary/10 text-primary-dim border border-primary/25 rounded-md px-3.5 py-[11px] text-sm mb-3.5">
              Current quantity: <strong className="font-mono text-base">{selectedItem.quantity}</strong>
            </div>
          )}
          {historyLoading ? (
            <div className={loadingCls}>Loading history…</div>
          ) : history.length === 0 ? (
            <div className="text-center py-6 px-5 text-muted text-sm">No transactions yet.</div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {history.map((tx) => (
                <li
                  key={tx.id}
                  className={`${txItemBase} border-l-[3px] ${tx.transaction_type === "fill" ? "border-l-primary" : "border-l-take"}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className={`${txBadgeBase} ${tx.transaction_type === "fill" ? "bg-primary/12 text-primary-dim" : "bg-take/12 text-take"}`}>
                      {tx.transaction_type === "fill" ? "▲ Fill" : "▼ Take"}
                    </span>
                    <div className="flex flex-col gap-[5px] min-w-0">
                      <span className="font-mono text-[13px] font-bold text-ink">{tx.date}</span>
                      {tx.note && <span className="text-[12.5px] text-muted whitespace-nowrap overflow-hidden text-ellipsis">{tx.note}</span>}
                      <span className="text-[12px] text-muted font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {tx.user_name || "Unknown user"}
                      </span>
                    </div>
                  </div>
                  <span className={`font-mono text-[19px] font-bold flex-shrink-0 ${tx.transaction_type === "fill" ? "text-primary" : "text-take"}`}>
                    {tx.transaction_type === "fill" ? "+" : "-"}{tx.quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
