import { useState, useRef, useEffect } from "react";
import { fieldInput } from "../ui";

/**
 * Accessible, dependency-free searchable dropdown (combobox).
 * Props:
 *   items     – array of option objects
 *   value     – currently selected value
 *   onChange  – (value) => void
 *   getValue  – (item) => value         (default: item.id)
 *   getLabel  – (item) => string        (default: String(item))
 *   placeholder, id
 */
export default function SearchableSelect({
  items = [],
  value,
  onChange,
  getValue = (i) => i.id,
  getLabel = (i) => String(i),
  placeholder = "Select…",
  id,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = items.find((i) => String(getValue(i)) === String(value));
  const selectedLabel = selected ? getLabel(selected) : "";

  const filtered = query.trim()
    ? items.filter((i) => getLabel(i).toLowerCase().includes(query.trim().toLowerCase()))
    : items;

  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // keep active option in view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[active];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function openMenu() {
    setOpen(true);
    setQuery("");
    setActive(Math.max(0, filtered.findIndex((i) => String(getValue(i)) === String(value))));
  }

  function pick(item) {
    onChange(getValue(item));
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        className={`${fieldInput} cursor-pointer`}
        placeholder={placeholder}
        value={open ? query : selectedLabel}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          if (!open) setOpen(true);
        }}
        onFocus={openMenu}
        onClick={() => !open && openMenu()}
        onKeyDown={onKeyDown}
      />
      {/* chevron */}
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-primary transition-transform" style={{ transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </span>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 max-h-[240px] overflow-y-auto rounded-md border border-line bg-surface shadow-[0_18px_40px_-18px_rgba(13,83,14,.4)] py-1 animate-rise"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-3 text-[13px] text-faint">No matches</li>
          ) : (
            filtered.map((item, idx) => {
              const isSel = String(getValue(item)) === String(value);
              const isActive = idx === active;
              return (
                <li
                  key={getValue(item)}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(idx)}
                  onMouseDown={(e) => { e.preventDefault(); pick(item); }}
                  className={`px-3.5 py-2.5 text-[14px] cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                    isActive ? "bg-primary/10 text-primary-dim" : "text-ink"
                  } ${isSel ? "font-bold" : ""}`}
                >
                  <span className="min-w-0 truncate">{getLabel(item)}</span>
                  {isSel && (
                    <svg className="w-4 h-4 flex-shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
